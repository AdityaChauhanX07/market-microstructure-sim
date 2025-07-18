import random
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import our simulation components
from simulation.order_book import OrderBook
from simulation.matching_engine import MatchingEngine
from simulation.agents import NoiseTrader, MarketTaker, LiquidityProvider

# --- Pydantic Model for Request Body ---
class AgentConfig(BaseModel):
    agent_type: str
    count: int = 1

# --- Global Simulation State ---
order_book = OrderBook()
matching_engine = MatchingEngine(order_book)
agents = [
    LiquidityProvider(agent_id=1),
    NoiseTrader(agent_id=2),
    MarketTaker(agent_id=3),
]
trades_log = []
# --- End of Global State ---


app = FastAPI(
    title="Market Microstructure Simulator API",
    description="An API to control and get data from a market simulation.",
    version="0.1.0",
)

# --- CORS Middleware ---
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- End of CORS ---


@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to the Market Simulator API!"}

@app.post("/simulation/reset")
def reset_simulation():
    global order_book, matching_engine, trades_log, agents
    order_book = OrderBook()
    matching_engine = MatchingEngine(order_book)
    trades_log = []
    # Reset to a default set of agents
    agents = [
        LiquidityProvider(agent_id=1),
        NoiseTrader(agent_id=2),
        MarketTaker(agent_id=3),
    ]
    return {"message": "Simulation reset successfully."}
    
@app.get("/agents")
def get_agents():
    """Returns the current list of agents in the simulation."""
    return [{"agent_id": agent.agent_id, "type": type(agent).__name__} for agent in agents]

@app.post("/agents")
def add_agents(config: AgentConfig):
    """Adds one or more new agents to the simulation."""
    last_id = max([agent.agent_id for agent in agents]) if agents else 0
    for i in range(config.count):
        new_id = last_id + i + 1
        if config.agent_type == "NoiseTrader":
            agents.append(NoiseTrader(agent_id=new_id))
        elif config.agent_type == "MarketTaker":
            agents.append(MarketTaker(agent_id=new_id))
        elif config.agent_type == "LiquidityProvider":
            agents.append(LiquidityProvider(agent_id=new_id))
        else:
            return {"error": f"Invalid agent type: {config.agent_type}"}
    return {"message": f"Added {config.count} {config.agent_type}(s)"}

@app.delete("/agents/{agent_id}")
def remove_agent(agent_id: int):
    """Removes a specific agent from the simulation."""
    global agents
    initial_agent_count = len(agents)
    # Create a new list containing all agents except the one with the specified ID
    agents = [agent for agent in agents if agent.agent_id != agent_id]
    
    # If the list length hasn't changed, the agent wasn't found
    if len(agents) == initial_agent_count:
        raise HTTPException(status_code=404, detail=f"Agent with ID {agent_id} not found.")
        
    return {"message": f"Agent with ID {agent_id} removed."}