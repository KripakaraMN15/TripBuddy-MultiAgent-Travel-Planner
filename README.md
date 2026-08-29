<div align="center">

# ✈️ TripBuddy AI — Multi-Agent Travel Planner

**An open-source AI travel planner that turns a natural-language trip request into a practical travel plan — flights, hotels, weather, and a day-by-day itinerary.**

Built with a multi-agent workflow using LangGraph, LangChain, and FastAPI, with live data pulled in through MCP (Model Context Protocol).

[![Live Demo](https://img.shields.io/badge/Live%20Demo-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://tripbuddy-multiagent-travel-planner-1.onrender.com/)
[![Python](https://img.shields.io/badge/Python%203.10+-3776AB?style=flat-square&logo=python&logoColor=white)](#)
[![LangGraph](https://img.shields.io/badge/LangGraph-1C3C3C?style=flat-square&logo=langchain&logoColor=white)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](#)

</div>

---

## 🔗 Live App

**[tripbuddy-multiagent-travel-planner-1.onrender.com](https://tripbuddy-multiagent-travel-planner-1.onrender.com/)**

> ⚠️ Hosted on Render's free tier — the first request after a period of inactivity may take 30-60 seconds to wake the server up. This is normal, not a bug.

## 🖥️ Why This Project

Planning a trip usually means jumping between multiple websites, tools, and spreadsheets. TripBuddy brings that flow into one experience by coordinating a team of specialized agents:

- ✈️ a **flight-search agent**
- 🏨 a **hotel-research agent**
- 🌤 a **weather-lookup agent**
- 🧠 an **itinerary-planning agent**
- 📝 a **final response agent**

— all orchestrated through a single LangGraph workflow with MCP-based tool integrations.

## ✨ Features

- 🧠 **Multi-agent orchestration** with LangGraph coordinating flight, hotel, weather, and itinerary agents
- ✈️ **Flight research** via AviationStack
- 🏨 **Hotel suggestions** via Tavily search
- 🌤 **Weather lookup** via a custom MCP tool
- 📝 **Structured itinerary generation** — a day-by-day plan, not just a list of options
- 🌐 **FastAPI backend** with a React + Vite frontend
- 💾 **Conversation state persistence** using PostgreSQL
- ⚡ **LLM-powered responses** via OpenAI models

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.10+, FastAPI |
| **Frontend** | React + Vite (`frontend/`) |
| **Agent Orchestration** | LangGraph, LangChain |
| **LLM** | OpenAI |
| **Database** | PostgreSQL |
| **Live Data** | Tavily API, AviationStack API, OpenWeather |
| **Tool Protocol** | MCP (via `langchain-mcp-adapters` and `mcp`) |

## 🔌 MCP Integration

This project integrates MCP (Model Context Protocol) in three distinct ways — a nice reference point if you're exploring how MCP fits into a multi-agent system:

| Integration | Type | Detail |
|---|---|---|
| **Tavily search** | Remote MCP | `https://mcp.tavily.com/mcp/` |
| **AviationStack** | Local stdio MCP | `uvx aviationstack-mcp` |
| **Weather** | Custom local MCP server | `custom_weather_mcp_server.py` |

The MCP client (`mcp_client.py`) exposes async helper functions:
- `tavily_mcp_search`
- `aviation_mcp_call`
- `weather_mcp_search`
- `forecast_mcp_search`
- `extract_destination`

The main travel workflow in `backend.py` calls these helpers from the flight, hotel, and weather agents.

## 📁 Project Structure

```text
.
├── app.py                       # FastAPI backend entry point
├── backend.py                   # LangGraph travel workflow
├── mcp_client.py                # MCP client and tool integration
├── custom_weather_mcp_server.py # Local weather MCP server
├── frontend/                    # React + Vite frontend
├── static/                      # Legacy static assets
├── templates/                   # Legacy HTML templates
├── requirements.txt             # Python dependencies
├── .env.example                 # Example environment variables
├── .env                         # Local secrets (not committed)
└── tools/                       # Flight and web search integrations
```

## ⚙️ Prerequisites

- Python 3.10 or newer
- PostgreSQL running and accessible
- API keys for OpenAI, Tavily, AviationStack, and OpenWeather
- `uvx` available for local `aviationstack-mcp` usage (or adjust `mcp_client.py` accordingly)

## 🔑 Environment Variables

Create a local `.env` file in the project root (use `.env.example` as a template):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/travel_db
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
AVIATIONSTACK_API_KEY=your_aviationstack_api_key
TAVILY_API_KEY=your_tavily_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
DEFAULT_ORIGIN_IATA=BLR
```

## 🚀 Installation

```bash
python -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## ▶️ Running the App

**Backend**
```bash
python app.py
```
Health check available at `http://127.0.0.1:8000/health`

**Frontend** (in a second terminal)
```bash
cd frontend
npm install
$env:VITE_API_BASE_URL="http://127.0.0.1:8000"
npm run dev -- --host 0.0.0.0
```
Then open `http://localhost:5173`

> The React UI is the redesigned frontend. The FastAPI backend remains the source of truth for the AI workflow.

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/travel` | Submit a travel request |

**Example request:**
```bash
curl -X POST http://127.0.0.1:8000/api/travel \
  -H "Content-Type: application/json" \
  -d '{"message":"Plan a 3-day trip to Tokyo with a budget of $1200"}'
```

## 🔄 How the Workflow Works

1. The user submits a travel request.
2. The **flight agent** pulls live data via MCP-backed AviationStack.
3. The **hotel agent** searches via remote Tavily MCP.
4. The **weather agent** calls the custom weather MCP server.
5. The **itinerary agent** assembles a practical, day-by-day travel plan.
6. The **final response agent** returns the result through the web API.

## 🙏 Acknowledgments

Built with modern LLM tooling and real-world travel APIs, as a practical example of combining LangGraph agents with production-style, tool-augmented workflows.

---

<div align="center">

Built by [Kripakara M. N.](https://github.com/KripakaraMN15) · [LinkedIn](https://linkedin.com/in/kripakaramn)

</div>
