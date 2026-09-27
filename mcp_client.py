"""MCP integration layer for TripBuddy AI.

Exposes small, fault-isolated helpers on top of three MCP servers:

- ``tavily``       remote HTTP server used for web search (hotels, research)
- ``aviationstack`` stdio server providing live airport/airline/flight data
- ``weather``      local stdio server wrapping the OpenWeather API

Each server is loaded lazily and independently so a broken or unconfigured
server degrades a single agent instead of the whole request.
"""

import asyncio
import json
import os
import shutil
import sys
from pathlib import Path
from typing import Any, Optional

import certifi
from dotenv import load_dotenv
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI


# ==========================================
# Environment configuration
# ==========================================

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

# Support both environment-variable spellings.
AVIATION_STACK_API_KEY = (
    os.getenv("AVIATION_STACK_API_KEY")
    or os.getenv("AVIATIONSTACK_API_KEY")
)

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

WEATHER_SERVER_PATH = BASE_DIR / "custom_weather_mcp_server.py"

TAVILY_MCP_URL = (
    f"https://mcp.tavily.com/mcp/?tavilyApiKey={TAVILY_API_KEY}"
    if TAVILY_API_KEY
    else "https://mcp.tavily.com/mcp/"
)

# Secrets that must never reach a log line or an exception message.
_SECRET_KEYS = (
    "TAVILY_API_KEY",
    "AVIATIONSTACK_API_KEY",
    "AVIATION_STACK_API_KEY",
    "OPENWEATHER_API_KEY",
    "OPENAI_API_KEY",
)


def _redact(value: Any) -> str:
    """Strip known secrets out of text before it is surfaced to logs or users."""
    text = str(value)
    for name in _SECRET_KEYS:
        secret = os.getenv(name)
        if secret and len(secret) > 6:
            text = text.replace(secret, f"***{name}***")
    return text


def _safe_print(message: str) -> None:
    """Print without raising on a console that cannot encode the message."""
    encoding = getattr(sys.stdout, "encoding", None) or "utf-8"
    try:
        print(message, flush=True)
    except UnicodeEncodeError:
        try:
            print(message.encode(encoding, errors="replace").decode(encoding), flush=True)
        except Exception:
            print("<log encoding failed>", flush=True)


def _require_env(name: str, value: Optional[str]) -> str:
    """Return an environment value or raise a readable setup error."""
    if not value:
        raise RuntimeError(
            f"{name} is missing. "
            f"Add {name}=your_key to the project .env file."
        )
    return value


def _subprocess_env(**updates: Optional[str]) -> dict[str, str]:
    """Preserve the current Windows/Conda environment and add MCP API keys."""
    env = os.environ.copy()
    for key, value in updates.items():
        if value:
            env[key] = value
    return env


# ==========================================
# LLM (created lazily so importing this module never requires a key)
# ==========================================

_llm: Optional[ChatOpenAI] = None


def get_llm() -> ChatOpenAI:
    """Return the shared ChatOpenAI client, constructing it on first use."""
    global _llm

    if _llm is None:
        _require_env("OPENAI_API_KEY", OPENAI_API_KEY)
        _llm = ChatOpenAI(
            model=OPENAI_MODEL,
            api_key=OPENAI_API_KEY,
            temperature=0.7,
        )

    return _llm


# ==========================================
# MCP client configuration
# ==========================================

client = MultiServerMCPClient(
    {
        "tavily": {
            "transport": "streamable_http",
            # Tavily's remote MCP endpoint authenticates via a query parameter.
            # This URL is therefore treated as a secret: never log it, and rely
            # on _redact() whenever a transport error is surfaced.
            "url": TAVILY_MCP_URL,
        },

        "aviationstack": {
            "transport": "stdio",
            "command": "uvx",
            "args": [
                "--with",
                "mcp==1.10.1",
                "aviationstack-mcp",
            ],
            "env": _subprocess_env(
                AVIATION_STACK_API_KEY=AVIATION_STACK_API_KEY,
            ),
        },

        "weather": {
            "transport": "stdio",
            # Reuse the interpreter running the app so the local server sees
            # the same installed packages.
            "command": sys.executable,
            "args": [str(WEATHER_SERVER_PATH)],
            "env": _subprocess_env(
                OPENWEATHER_API_KEY=OPENWEATHER_API_KEY,
            ),
        },
    }
)


def _preflight(server_name: str) -> None:
    """Fail fast with an actionable message when a server cannot be used."""
    if server_name == "tavily":
        _require_env("TAVILY_API_KEY", TAVILY_API_KEY)

    elif server_name == "aviationstack":
        _require_env("AVIATION_STACK_API_KEY", AVIATION_STACK_API_KEY)

        if shutil.which("uvx") is None:
            raise RuntimeError(
                "uvx was not found on PATH. Install uv "
                "(https://docs.astral.sh/uv/) and ensure `uvx` is callable."
            )

    elif server_name == "weather":
        _require_env("OPENWEATHER_API_KEY", OPENWEATHER_API_KEY)

        if not WEATHER_SERVER_PATH.is_file():
            raise FileNotFoundError(
                f"Weather MCP server not found: {WEATHER_SERVER_PATH}"
            )


async def get_server_tools(server_name: str) -> list:
    """Load every tool exposed by a single MCP server.

    Loading one server at a time is what keeps a broken weather or AviationStack
    server from taking down an unrelated Tavily request.
    """
    _preflight(server_name)
    return list(await client.get_tools(server_name=server_name))


async def get_tool_names(server_name: str) -> list[str]:
    """Return the sorted tool names a server exposes."""
    tools = await get_server_tools(server_name)
    return sorted(tool.name for tool in tools)


async def _get_server_tool(server_name: str, tool_name: str):
    """Resolve a single tool by name from a single MCP server."""
    tools = await get_server_tools(server_name)

    tool = next((item for item in tools if item.name == tool_name), None)

    if tool is None:
        raise RuntimeError(
            f"MCP tool '{tool_name}' was not found on server "
            f"'{server_name}'. Available tools: "
            f"{', '.join(sorted(item.name for item in tools)) or 'none'}"
        )

    return tool


async def _first_available_tool(server_name: str, candidates: tuple[str, ...]):
    """Return the first candidate tool that the server actually exposes.

    MCP server packages rename or add tools between releases, so callers pass an
    ordered list of acceptable names instead of hard-coding a single string.
    """
    tools = await get_server_tools(server_name)
    by_name = {tool.name: tool for tool in tools}

    for candidate in candidates:
        if candidate in by_name:
            return by_name[candidate], candidate

    raise RuntimeError(
        f"Server '{server_name}' exposes none of {list(candidates)}. "
        f"Available tools: {', '.join(sorted(by_name)) or 'none'}"
    )


# ==========================================
# Diagnostic helper
# ==========================================

async def get_all_tools() -> None:
    """Test every MCP server independently; one failure does not stop the rest."""
    for server_name in ("tavily", "aviationstack", "weather"):
        try:
            names = await get_tool_names(server_name)
            _safe_print(f"{server_name}: OK -> {', '.join(names) or 'no tools'}")
        except Exception as exc:
            _safe_print(
                f"{server_name}: FAILED -> {type(exc).__name__}: {_redact(exc)}"
            )


# =========================================================
# Tavily MCP
# =========================================================

async def tavily_mcp_search(query: str, max_results: int = 6):
    """Run a Tavily web search and return the raw MCP payload."""
    tool, _ = await _first_available_tool(
        "tavily",
        ("tavily_search", "search", "tavily-search"),
    )
    return await tool.ainvoke({"query": query, "max_results": max_results})


# =========================================================
# AviationStack MCP
# =========================================================

# Tool names used by aviationstack-mcp across releases.
_AIRPORT_TOOL_CANDIDATES = ("list_airports", "get_airports", "airports")
_AIRLINE_TOOL_CANDIDATES = ("list_airlines", "get_airlines", "airlines")
_FLIGHT_TOOL_CANDIDATES = (
    "search_flights",
    "get_flights",
    "flights",
    "flight_search",
)

# Cached lookup tables so a single request does not refetch whole catalogues.
_airport_records: Optional[list[dict[str, Any]]] = None
_airline_records: Optional[list[dict[str, Any]]] = None


def _unwrap_text_blocks(payload: Any) -> Any:
    """Collapse an MCP ``content`` list of text blocks into plain text.

    Servers may return ``[{"type": "text", "text": "<json>"}]``. Anything that is
    not purely text blocks is returned untouched.
    """
    if not isinstance(payload, list) or not payload:
        return payload

    if not all(
        isinstance(item, dict) and item.get("type") == "text" and "text" in item
        for item in payload
    ):
        return payload

    return "\n".join(str(item["text"]) for item in payload)


def _as_list(payload: Any) -> list[dict[str, Any]]:
    """Normalise an MCP payload into a flat list of dict records."""
    data = _unwrap_text_blocks(payload)

    if isinstance(data, str):
        try:
            data = json.loads(data)
        except (TypeError, ValueError):
            return []

    if isinstance(data, dict):
        for key in (
            "data", "results", "items", "records",
            "airports", "airlines", "flights", "departures",
        ):
            if isinstance(data.get(key), list):
                return [item for item in data[key] if isinstance(item, dict)]
        return [data]

    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]

    return []


def _norm(value: Any) -> str:
    return str(value or "").strip().lower()


def _looks_like_iata(value: str) -> bool:
    return len(value) == 3 and value.isalpha() and value.isupper()


async def aviation_airports() -> list[dict[str, Any]]:
    """Return the cached airport catalogue from the AviationStack MCP server."""
    global _airport_records

    if _airport_records is None:
        tool, _ = await _first_available_tool(
            "aviationstack", _AIRPORT_TOOL_CANDIDATES
        )
        _airport_records = _as_list(await tool.ainvoke({}))

    return _airport_records


async def aviation_airlines() -> list[dict[str, Any]]:
    """Return the cached airline catalogue from the AviationStack MCP server."""
    global _airline_records

    if _airline_records is None:
        tool, _ = await _first_available_tool(
            "aviationstack", _AIRLINE_TOOL_CANDIDATES
        )
        _airline_records = _as_list(await tool.ainvoke({}))

    return _airline_records


def resolve_iata(place: str, airports: list[dict[str, Any]]) -> Optional[str]:
    """Map free-form place text to an IATA code using the airport catalogue.

    Returns ``None`` when no airport matches confidently, so callers can skip
    lookups instead of guessing a code.
    """
    needle = _norm(place)
    if not needle:
        return None

    exact: Optional[str] = None
    partial: Optional[str] = None

    for record in airports:
        code = str(
            record.get("iata_code")
            or record.get("IATA")
            or record.get("iata")
            or ""
        ).strip()
        if not _looks_like_iata(code):
            continue

        fields = {
            _norm(record.get("name")),
            _norm(record.get("city")),
            _norm(record.get("municipality")),
            _norm(record.get("country_name") or record.get("country")),
        }
        fields.discard("")

        if needle in fields:
            # A direct hit on a short name is more trustworthy than a substring.
            if len(needle) >= 3 and exact is None:
                exact = code
            elif partial is None:
                partial = code
        else:
            for field in fields:
                if field and (needle in field or field in needle):
                    if partial is None:
                        partial = code
                    break

        if exact:
            return exact

    return exact or partial


async def aviation_flight_search(
    origin_iata: str,
    destination_iata: str,
) -> dict[str, Any]:
    """Look up live flight options for a resolved IATA pair.

    Returns a dict with ``ok``, ``flights`` and ``note`` keys. A failure is
    reported in ``note`` rather than raised, because the flight agent should
    still be able to describe the route with the airport data it has.
    """
    try:
        tool, tool_name = await _first_available_tool(
            "aviationstack", _FLIGHT_TOOL_CANDIDATES
        )
    except Exception as exc:
        return {
            "ok": False,
            "flights": [],
            "note": (
                "Live flight search is unavailable: "
                f"{_redact(exc)}"
            ),
            "tool": None,
        }

    args: dict[str, Any] = {
        "dep_iata": origin_iata,
        "arr_iata": destination_iata,
    }

    try:
        payload = await tool.ainvoke(args)
    except TypeError:
        # Older builds use a different parameter spelling.
        payload = await tool.ainvoke(
            {
                "origin": origin_iata,
                "destination": destination_iata,
            }
        )
    except Exception as exc:
        return {
            "ok": False,
            "flights": [],
            "note": f"Live flight search failed: {_redact(exc)}",
            "tool": tool_name,
        }

    flights = _as_list(payload)
    return {
        "ok": bool(flights),
        "flights": flights[:20],
        "note": (
            ""
            if flights
            else "The live flight feed returned no scheduled flights for this route."
        ),
        "tool": tool_name,
    }


async def aviation_mcp_call(
    tool_name: str,
    tool_args: dict[str, Any] | None = None,
):
    """Call any tool on the AviationStack MCP server by name."""
    tool = await _get_server_tool("aviationstack", tool_name)
    return await tool.ainvoke(tool_args or {})


# =========================================================
# Weather MCP
# =========================================================

async def weather_mcp_search(city: str):
    tool = await _get_server_tool("weather", "get_current_weather")
    return await tool.ainvoke({"city": city})


async def forecast_mcp_search(city: str):
    tool = await _get_server_tool("weather", "get_forecast")
    return await tool.ainvoke({"city": city})


# =========================================================
# Destination extractor
# =========================================================

def extract_destination(query: str) -> str:
    """Ask the model for the destination city or country in the request.

    Raises ``ValueError`` when nothing usable is returned so the caller can
    decide how to degrade.
    """
    response = get_llm().invoke(
        [
            SystemMessage(
                content=(
                    "You are a travel destination extractor. "
                    "Return only the destination name."
                )
            ),
            HumanMessage(
                content=(
                    "Extract only the destination city or country from the "
                    f"travel request.\n\nTravel request:\n{query}\n\n"
                    "Return only the destination name. "
                    "Do not add any explanation."
                )
            ),
        ]
    )

    destination = str(
        response.content if hasattr(response, "content") else response
    ).strip()

    if not destination:
        raise ValueError("The destination could not be extracted.")

    return destination


if __name__ == "__main__":
    # Diagnostic: verify each MCP server independently.
    #   python mcp_client.py
    asyncio.run(get_all_tools())
