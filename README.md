# ✈️ TripBuddy AI — A Multi-Agent Travel Planner with LangGraph

An open-source AI travel planner that turns a natural-language trip request into a practical travel plan with flight suggestions, hotel ideas, and a day-by-day itinerary. The project uses a multi-agent workflow built with LangGraph, LangChain, and FastAPI.

## Why this project?

Planning a trip usually means jumping between multiple websites, tools, and spreadsheets. This project brings that flow into one experience by combining:

- a flight-search agent,
- a hotel-research agent,
- an itinerary-planning agent, and
- a final response agent,

all coordinated through a LangGraph workflow with MCP-based tool integrations.
## Features

- ✈️ Flight research using AviationStack
- 🏨 Hotel suggestions using Tavily search
- 🌤 Weather lookup via a custom MCP tool
- 🧠 Multi-agent orchestration with LangGraph
- 📝 Structured travel itinerary generation
- 🌐 FastAPI backend with a simple web interface
- 💾 Conversation state persistence using PostgreSQL
- ⚡ LLM-powered responses with OpenAI

## Tech Stack

- Python 3.10+
- FastAPI
- React + Vite frontend in `frontend/`
- LangGraph
- LangChain
- OpenAI models
- PostgreSQL
- Tavily API
- AviationStack API
- MCP via langchain-mcp-adapters and mcp

## State and MCP Integration
This project integrates MCP in several places:
- Tavily search uses a remote MCP endpoint at https://mcp.tavily.com/mcp/
- AviationStack uses a local stdio MCP command: uvx aviationstack-mcp
- Weather is implemented with a custom local MCP server in custom_weather_mcp_server.py

The MCP client is defined in mcp_client.py, which exposes async helper functions for:
- tavily_mcp_search
- aviation_mcp_call
- weather_mcp_search
- forecast_mcp_search
- extract_destination
- The main travel workflow in backend.py calls these helpers from the flight, hotel, and weather agents.

## Project Structure

```text
.
├── app.py                      # FastAPI backend entry point
├── backend.py                  # LangGraph travel workflow
├── mcp_client.py               # MCP client and tool integration
├── custom_weather_mcp_server.py# Local weather MCP server
├── frontend/                   # React + Vite redesign
├── static/                     # Legacy static assets
├── templates/                  # Legacy HTML templates
├── requirements.txt            # Python dependencies
├── .env.example                # Example environment variables
├── .env                       # Local secrets (not committed)
└── tools/                      # Flight and web search integrations
```

## Prerequisites

Before running the project locally, make sure you have:

- Python 3.10 or newer installed
- PostgreSQL running and accessible
- API keys for:
  - OpenAI
  - Tavily
  - AviationStack
  - Openweather 
  uvx available for local aviationstack-mcp usage (or adjust mcp_client.py accordingly)

## Environment Variables

Create a local `.env` file in the project root using the example below:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/travel_db
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
AVIATIONSTACK_API_KEY=your_aviationstack_api_key
TAVILY_API_KEY=your_tavily_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
DEFAULT_ORIGIN_IATA=BLR
```

Use the included `.env.example` as the template.

## Installation

```bash
python -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Running the App

### Backend

```bash
python app.py
```

Then open the API at:

```text
http://127.0.0.1:8000/health
```

### Frontend

In a second terminal:

```bash
cd frontend
npm install
$env:VITE_API_BASE_URL="http://127.0.0.1:8000"
npm run dev -- --host 0.0.0.0
```

Then open:

```text
http://localhost:5173
```

> The React UX is the redesigned frontend. The FastAPI backend remains the source of truth for the AI workflow.

## API Endpoints

- GET /health - Health check
- POST /api/travel - Submit a travel request

Example request:

```bash
curl -X POST http://127.0.0.1:8000/api/travel \
  -H "Content-Type: application/json" \
  -d '{"message":"Plan a 3-day trip to Tokyo with a budget of $1200"}'
```

## How the Workflow Works

1. The user submits a travel request.
2. The flight agent uses MCP-backed AviationStack data.
3. The hotel agent uses a remote Tavily MCP search.
4. The weather agent calls the custom weather MCP server.
5. The itinerary agent creates a practical travel plan.
6. The final response is returned through the web API.


## Acknowledgments

This project is built with the help of modern LLM tooling and travel APIs, and it is intended as a practical example of combining LangGraph agents with real-world applications.
