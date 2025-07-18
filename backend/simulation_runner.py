import random
import matplotlib.pyplot as plt
from simulation.order_book import OrderBook
from simulation.matching_engine import MatchingEngine
from simulation.agents import NoiseTrader, MarketTaker, LiquidityProvider

def main():
    # 1. Setup the market
    order_book = OrderBook()
    matching_engine = MatchingEngine(order_book)
    
    agents = [
        LiquidityProvider(agent_id=1),
        NoiseTrader(agent_id=2),
        NoiseTrader(agent_id=3),
        MarketTaker(agent_id=4),
        MarketTaker(agent_id=5)
    ]
    
    num_ticks = 1000
    all_trades = []

    # 2. Run the simulation loop
    print("--- Starting Market Simulation ---")
    for tick in range(num_ticks):
        agent = random.choice(agents)
        order = agent.act(order_book)
        if order:
            trades = matching_engine.process_order(order)
            if trades:
                all_trades.extend(trades)
    
    print(f"--- Simulation Complete: {len(all_trades)} trades executed. ---\n")

    # 3. Generate and show the price chart
    if all_trades:
        print("--- Generating Price Chart... ---")
        # Sort trades by time just in case
        all_trades.sort(key=lambda x: x.timestamp)
        trade_times = [trade.timestamp for trade in all_trades]
        trade_prices = [trade.price for trade in all_trades]

        plt.figure(figsize=(14, 7))
        plt.plot(trade_times, trade_prices, linestyle='-', marker='o', markersize=3, alpha=0.7)
        plt.title("Market Price History")
        plt.xlabel("Time (Timestamp)")
        plt.ylabel("Price")
        plt.grid(True)
        plt.show() # This will open a pop-up window with the chart

    # 4. Display text results
    print("\n--- All Trades ---")
    if not all_trades:
        print("No trades were executed.")
    else:
        for trade in all_trades:
            print(trade)

    print("\n--- Final Order Book State ---")
    print(f"Bids: {len(order_book.bids)} levels")
    for order in order_book.bids[:5]:
        print(f"  Price: {order.price:.2f}, Qty: {order.quantity}")

    print(f"\nAsks: {len(order_book.asks)} levels")
    for order in order_book.asks[:5]:
        print(f"  Price: {order.price:.2f}, Qty: {order.quantity}")


if __name__ == "__main__":
    main()