# TripBuddy AI

A multi-agent travel planner. A supervisor agent reads your trip request, calls
the specialist agents that are actually needed (flights, hotels, weather,
budget), and pauses for your review before producing the final plan.

Built with **LangGraph**, **Model Context Protocol (MCP)**, **FastAPI**, and
**Next.js**.

---

## Architecture

```
                        ┌──────────────┐
   "Plan 7 days in  ───►│  supervisor  │  input guardrail + agent routing
    Tokyo from Bengaluru│              │
                        └──────┬───────┘
                     guardrail  │  (sequential, whitelist-enforced)
                     blocked    ▼
                    ┌──────────────────────────────┐
                    │ flight → hotel → weather →    │  each may be skipped
                    │ budget                        │
                    └──────────────┬───────────────┘
                                   ▼
                         ┌───────────────────┐
                         │ itinerary_agent   │  integrates the results
                         └─────────┬─────────┘
                                   ▼
                         ┌───────────────────┐
                         │  human_approval   │  ⏸ graph interrupt
                         └─────────┬─────────┘
                          approve  │  revise + feedback
                                   ▼
                           ┌─────────────┐
                           │ final_agent │────► final plan
                           └─────────────┘
```

Only agents the supervisor selects run, and they always run in the order above
(`backend.py:AGENT_ORDER`), which also acts as a whitelist — the graph can never
route to an unknown node, and a cycle is unreachable.

### Agents

| Agent | Data source | Notes |
| --- | --- | --- |
| `supervisor_agent` | OpenAI | Input guardrail, then agent selection and constraint extraction. Fails open. |
| `flight_agent` | AviationStack MCP | Resolves the origin/destination to IATA codes from the live airport catalogue, then looks up scheduled flights. |
| `hotel_agent` | Tavily MCP | Web search for accommodation and neighbourhoods. |
| `weather_agent` | OpenWeather MCP | Current conditions and a 5-day / 3-hour forecast. |
| `budget_agent` | — | Feasibility analysis across the collected results. |
| `itinerary_agent` | — | Produces the draft that you review. |
| `final_agent` | — | Polishes the draft, applying your feedback. |

Every specialist degrades gracefully: if a tool is unreachable, the agent states
that the data is unavailable rather than failing the request, and the model is
instructed to label estimates as estimates instead of inventing prices.

---

## Project layout

```
.
├── app.py                        FastAPI HTTP layer, CORS, rate limiting
├── backend.py                    LangGraph state, agents, routing, checkpointer
├── mcp_client.py                 MCP servers + Tavily / AviationStack / weather helpers
├── custom_weather_mcp_server.py  Local stdio MCP server for OpenWeather
├── requirements.txt
├── Dockerfile                    Multi-stage, non-root, bakes in `uvx`
├── templates/  static/           Minimal server-rendered fallback UI
└── frontend/                     Next.js 15 static export
    ├── app/                      App Router routes (export `metadata`)
    ├── src/screens/              Page bodies
    ├── src/components/           Landing, layout, planner components
    ├── src/services/api.js       The only place that calls the backend
    └── src/lib/                  metadata + hash-navigation helpers
```

---

## Getting started

### 1. Backend

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

The flight agent launches its MCP server through `uvx`, so install
[uv](https://docs.astral.sh/uv/) and confirm `uvx --version` works.

### 2. Configure

```bash
cp .env.example .env
```

Then fill in:

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | yes | Every LLM call |
| `OPENAI_MODEL` | no | Defaults to `gpt-4o-mini` |
| `TAVILY_API_KEY` | yes for hotels | Web search via the Tavily MCP server |
| `AVIATION_STACK_API_KEY` | yes for flights | Airport and schedule data |
| `OPENWEATHER_API_KEY` | yes for weather | Current conditions and forecast |
| `DATABASE_URL` | no | Checkpoint store; omit to run fully in memory |
| `SITE_URL` | no | Absolute URL used in `robots.txt` / `sitemap.xml` / `llms.txt` |
| `EXTRA_ALLOWED_ORIGINS` | no | Extra CORS origins, comma-separated |
| `RATE_LIMIT_REQUESTS` / `RATE_LIMIT_WINDOW_SECONDS` | no | Per-client limit, default 10 per 5 min |
| `TRUST_PROXY` | no | Set `true` only when a proxy sets `X-Forwarded-For` |
| `FORCE_HTTPS` | no | Set `true` in production |

Verify every tool server independently:

```bash
python mcp_client.py
```

Each server reports `OK` with its tool list, or `FAILED` with a reason — one
broken server does not affect the others.

### 3. Run

```bash
python app.py
```

The API listens on `http://127.0.0.1:8000`. Interactive docs are at `/docs`.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

The site is at `http://localhost:3000` and proxies API calls to
`http://127.0.0.1:8000` by default. To point at a deployed backend, set
`NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.production`.

```bash
npm run build   # static export to frontend/dist/
npm run start   # optional: serve dist/ locally to check the exported output
npm run lint
```

`npm run start` uses `serve dist` rather than `next start`, because `next start`
does not work with an `output: 'export'` project.

---

## API

The planner is a two-step flow: the first call returns a **draft** that pauses
for review, the second resumes the same graph thread.

### `POST /api/travel`

```json
{ "message": "Plan a 7-day Tokyo trip from Bengaluru", "thread_id": null }
```

Returns `success: true` plus `requires_approval: true` and the draft `itinerary`.
Save the returned `thread_id`.

### `POST /api/travel/approve`

```json
{ "thread_id": "user_…", "approved": true, "feedback": "" }
```

Rejects with a 400 when `approved` is `false` and `feedback` is empty. Returns
the final plan.

### `GET /health`

Liveness probe. Returns `success`, `status`, and the feature list.

### Other routes

`/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/favicon.ico`, and a minimal
server-rendered page at `/` for clients that do not run JavaScript.

---

## Deployment

### Backend (Render Web Service / Docker)

```bash
docker build -t tripbuddy .
docker run -p 8000:8000 --env-file .env tripbuddy
```

The image is multi-stage (build tools stay in the builder layer), runs as a
non-root user, installs `uvx` for the AviationStack MCP server, excludes `.env`
via `.dockerignore`, and honours `$PORT` with a `/health` healthcheck.

### Frontend (Render Static Site)

`npm run build` emits a fully static `frontend/dist/`. Configure the build
command as `npm run build` and the publish directory as `dist`.

### Checkpoint storage

Set `DATABASE_URL` to keep in-progress drafts across restarts. Without it the
app falls back to `MemorySaver`, which means a draft is lost whenever the
server restarts — noticeable on a free-tier host that spins down when idle.

---

## Security notes

- CORS uses an explicit origin allowlist. Do **not** add a wildcard or a broad
  regex such as `https://.*\.onrender\.com` — that would let any tenant on the
  platform make credentialed calls to the API.
- `/api/travel` is rate limited per client because one request fans out to
  several LLM calls plus MCP subprocesses. Put a real limiter at the edge if
  you run more than one replica.
- Tool output (Tavily search results, MCP payloads) is wrapped in explicit
  `<TAG>` delimiters and flagged as untrusted data, and the model is told never
  to follow instructions found inside it. This limits indirect prompt injection
  from attacker-authored web content.
- API keys in error messages are redacted before logging.
- `.env` is excluded by both `.gitignore` and `.dockerignore`. Only
  `.env.example` should ever be committed.

---

## License

MIT — see [LICENSE](LICENSE).
