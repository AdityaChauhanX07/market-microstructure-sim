import random
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import our simulation components
from simulation.order_book import OrderBook
from simulation.matching_engine import MatchingEngine
from simulation.agents import NoiseTrader, MarketTaker, LiquidityProvider

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

# --- CORS (Cross-Origin Resource Sharing) ---
# This allows our React frontend (running on localhost:3000)
# to make requests to our Python backend (running on localhost:8000).
origins = [
    "http://localhost:3000",
]
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
    """A simple endpoint to check if the API is running."""
    return {"status": "ok", "message": "Welcome to the Market Simulator API!"}

@app.post("/simulation/reset")
def reset_simulation():
    """Resets the simulation to its initial state."""
    global order_book, matching_engine, trades_log
    order_book = OrderBook()
    matching_engine = MatchingEngine(order_book)
    trades_log = []
    return {"message": "Simulation reset successfully."}

@app.get("/data/book")
def get_order_book():
    """Returns the current state of the order book."""
    return {"bids": order_book.bids, "asks": order_book.asks}

@app.get("/data/trades")
def get_trades_log():
    """Returns a log of all trades that have been executed."""
    return trades_log

@app.get("/data/price-history")
def get_price_history():
    """Returns a simplified list of {time, price} for charting."""
    return [{"time": trade.timestamp, "price": trade.price} for trade in trades_log]

@app.post("/simulation/step")
def run_simulation_step():
    """Runs a single step of the simulation."""
    agent = random.choice(agents)
    order = agent.act(order_book)
    if not order:
        return {"message": f"Agent {agent.agent_id} decided not to act."}
    trades = matching_engine.process_order(order)
    if trades:
        trades_log.extend(trades)
    return {"message": f"Agent {agent.agent_id} placed an order.", "order_placed": order, "trades_executed": trades}