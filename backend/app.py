import random
import statistics
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from collections import defaultdict

from simulation.order_book import OrderBook
from simulation.matching_engine import MatchingEngine
from simulation.agents import NoiseTrader, MarketTaker, LiquidityProvider

# --- Pydantic Models ---
class AgentConfig(BaseModel):
    agent_type: str
    count: int = 1

class StepConfig(BaseModel):
    count: int = 1

# --- Global Simulation State & initialize_simulation() function ---
current_tick = 0
order_queue = [] 
order_book = OrderBook()
matching_engine = MatchingEngine(order_book)
agents = []
trades_log = []

def initialize_simulation():
    global order_book, matching_engine, trades_log, agents, current_tick, order_queue
    current_tick = 0
    order_queue = []
    order_book = OrderBook()
    matching_engine = MatchingEngine(order_book)
    trades_log = []
    agents = [
        LiquidityProvider(agent_id=1),
        NoiseTrader(agent_id=2),
        MarketTaker(agent_id=3),
    ]

initialize_simulation()

# --- FastAPI App & CORS ---
app = FastAPI(
    title="Market Microstructure Simulator API",
    version="0.1.0",
)
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"status": "ok"}

@app.post("/simulation/reset")
def reset_simulation():
    initialize_simulation()
    return {"message": "Simulation reset successfully."}

@app.post("/simulation/step")
def run_simulation_step(config: StepConfig):
    global current_tick
    newly_queued_orders = [] 
    for _ in range(config.count):
        due_orders = [item for item in order_queue if item[0] <= current_tick]
        agent_map = {agent.agent_id: agent for agent in agents}
        for process_tick, order in due_orders:
            trades = matching_engine.process_order(order)
            if trades:
                for trade in trades:
                    aggressor_agent = agent_map.get(trade.aggressor_agent_id)
                    resting_agent = agent_map.get(trade.resting_agent_id)
                    if trade.side == 'buy':
                        buyer, seller = aggressor_agent, resting_agent
                    else:
                        seller, buyer = aggressor_agent, resting_agent
                    trade_value = trade.price * trade.quantity
                    if buyer and seller:
                        buyer.portfolio['cash'] -= trade_value
                        buyer.portfolio['shares'] += trade.quantity
                        seller.portfolio['cash'] += trade_value
                        seller.portfolio['shares'] -= trade.quantity
                trades_log.extend(trades)
        order_queue[:] = [item for item in order_queue if item[0] > current_tick]
        if agents:
            agent = random.choice(agents)
            new_order = agent.act(order_book)
            if new_order:
                process_at_tick = current_tick + agent.latency
                order_queue.append((process_at_tick, new_order))
                newly_queued_orders.append(new_order)
        current_tick += 1
    return {
        "message": f"Ran {config.count} simulation steps. Current tick is {current_tick}.",
        "newly_queued_orders": newly_queued_orders
    }

@app.get("/data/market-metrics")
def get_market_metrics():
    total_volume = sum(trade.quantity for trade in trades_log)
    volatility = 0
    if len(trades_log) > 1:
        prices = [trade.price for trade in trades_log]
        volatility = statistics.stdev(prices)
    return {
        "total_volume": total_volume,
        "volatility": volatility,
        "trade_count": len(trades_log)
    }
    
@app.get("/agents")
def get_agents():
    return [{"agent_id": agent.agent_id, "type": type(agent).__name__, "latency": agent.latency} for agent in agents]

@app.get("/agents/pnl")
def get_pnl():
    last_trade_price = trades_log[-1].price if trades_log else 100.0
    pnl_data = []
    for agent in agents:
        portfolio_value = agent.portfolio['cash'] + (agent.portfolio['shares'] * last_trade_price)
        pnl = portfolio_value - 100000.0
        pnl_data.append({
            "agent_id": agent.agent_id, "type": type(agent).__name__, "portfolio": agent.portfolio,
            "portfolio_value": portfolio_value, "pnl": pnl
        })
    return pnl_data

@app.post("/agents")
def add_agents(config: AgentConfig):
    last_id = max([agent.agent_id for agent in agents]) if agents else 0
    for i in range(config.count):
        new_id = last_id + i + 1
        agent_map = {"NoiseTrader": NoiseTrader, "MarketTaker": MarketTaker, "LiquidityProvider": LiquidityProvider}
        agent_class = agent_map.get(config.agent_type)
        if agent_class:
            agents.append(agent_class(agent_id=new_id))
        else:
            return {"error": f"Invalid agent type: {config.agent_type}"}
    return {"message": f"Added {config.count} {config.agent_type}(s)"}

@app.delete("/agents/{agent_id}")
def remove_agent(agent_id: int):
    global agents
    initial_agent_count = len(agents)
    agents = [agent for agent in agents if agent.agent_id != agent_id]
    if len(agents) == initial_agent_count:
        raise HTTPException(status_code=404, detail=f"Agent with ID {agent_id} not found.")
    return {"message": f"Agent with ID {agent_id} removed."}

@app.delete("/orders/{order_id}")
def remove_order(order_id: int):
    if order_book.cancel_order(order_id):
        return {"message": f"Order {order_id} cancelled."}
    initial_queue_size = len(order_queue)
    order_queue[:] = [item for item in order_queue if item[1].order_id != order_id]
    if len(order_queue) < initial_queue_size:
        return {"message": f"Order {order_id} cancelled from queue."}
    raise HTTPException(status_code=404, detail=f"Order with ID {order_id} not found in book or queue.")

@app.get("/data/book")
def get_order_book():
    return {"bids": order_book.bids, "asks": order_book.asks}

@app.get("/data/book/depth")
def get_book_depth():
    bid_depth = defaultdict(int)
    for order in order_book.bids:
        bid_depth[order.price] += order.quantity
    ask_depth = defaultdict(int)
    for order in order_book.asks:
        ask_depth[order.price] += order.quantity
    sorted_bids = sorted(
        [{"price": p, "volume": v} for p, v in bid_depth.items()],
        key=lambda x: x['price'], reverse=True
    )
    sorted_asks = sorted(
        [{"price": p, "volume": v} for p, v in ask_depth.items()],
        key=lambda x: x['price']
    )
    return {"bids": sorted_bids, "asks": sorted_asks}

@app.get("/data/agent-interactions")
def get_agent_interactions():
    nodes = [{"id": agent.agent_id, "type": type(agent).__name__} for agent in agents]
    link_volumes = defaultdict(int)
    for trade in trades_log:
        source_id = trade.aggressor_agent_id
        target_id = trade.resting_agent_id
        if source_id == target_id: continue
        key = tuple(sorted((source_id, target_id)))
        link_volumes[key] += trade.quantity
    links = [{"source": k[0], "target": k[1], "value": v} for k, v in link_volumes.items()]
    return {"nodes": nodes, "links": links}
    
@app.get("/data/candlestick")
def get_candlestick_data(timeframe: int = 10):
    if not trades_log:
        return []
    candles = []
    chunk_size = timeframe
    for i in range(0, len(trades_log), chunk_size):
        chunk = trades_log[i:i + chunk_size]
        if not chunk: continue
        prices = [trade.price for trade in chunk]
        candle = {
            "time": chunk[0].timestamp, "open": chunk[0].price, "high": max(prices),
            "low": min(prices), "close": chunk[-1].price, "volume": sum(trade.quantity for trade in chunk)
        }
        candles.append(candle)
    return candles

@app.get("/data/indicators/sma")
def get_sma_data(period: int = 20):
    if len(trades_log) < period:
        return []
    prices = np.array([trade.price for trade in trades_log])
    weights = np.repeat(1.0, period) / period
    sma = np.convolve(prices, weights, 'valid')
    sma_data = []
    for i in range(len(sma)):
        timestamp = trades_log[i + period - 1].timestamp
        sma_data.append({"time": timestamp, "sma": sma[i]})
    return sma_data

@app.get("/data/indicators/bbands")
def get_bbands_data(period: int = 20, std_dev: int = 2):
    """Calculates Bollinger Bands for the trade prices."""
    if len(trades_log) < period:
        return []
    
    prices = np.array([trade.price for trade in trades_log])
    
    # Calculate middle band (SMA)
    middle_band = np.convolve(prices, np.repeat(1.0, period) / period, 'valid')
    
    # Calculate standard deviation for each window
    rolling_std = [np.std(prices[i:i+period]) for i in range(len(prices) - period + 1)]
    
    upper_band = middle_band + (np.array(rolling_std) * std_dev)
    lower_band = middle_band - (np.array(rolling_std) * std_dev)
    
    bbands_data = []
    for i in range(len(middle_band)):
        timestamp = trades_log[i + period - 1].timestamp
        bbands_data.append({
            "time": timestamp,
            "upper": upper_band[i],
            "middle": middle_band[i],
            "lower": lower_band[i]
        })
        
    return bbands_data

@app.get("/data/trades")
def get_trades_log():
    return trades_log

@app.get("/data/price-history")
def get_price_history():
    return [{"time": trade.timestamp, "price": trade.price} for trade in trades_log]