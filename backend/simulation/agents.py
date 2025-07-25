import abc
import random
from .models import Order
from .order_book import OrderBook

class Agent(abc.ABC):
    """An abstract base class for all trading agents."""
    def __init__(self, agent_id: int, latency: int = 1):
        self.agent_id = agent_id
        self.latency = latency
        self.portfolio = {'cash': 100000.0, 'shares': 0}

    @abc.abstractmethod
    def act(self, order_book: OrderBook) -> Order | None:
        """The agent's logic to decide what order to place, if any."""
        pass

class NoiseTrader(Agent):
    """A trader that places random orders to create market noise."""
    def __init__(self, agent_id: int):
        super().__init__(agent_id, latency=5)

    def act(self, order_book: OrderBook) -> Order | None:
        if random.random() < 0.5:
            return None
        side = random.choice(["buy", "sell"])
        quantity = random.randint(1, 10)
        order_type = random.choice(["market", "limit"])
        price = None
        if order_type == "limit":
            best_bid = order_book.get_best_bid() or 100
            best_ask = order_book.get_best_ask() or 100
            if side == "buy":
                price = round(random.uniform(best_bid * 0.95, best_bid * 1.05), 2)
            else:
                price = round(random.uniform(best_ask * 0.95, best_ask * 1.05), 2)
        return Order(
            agent_id=self.agent_id, side=side, quantity=quantity, order_type=order_type, price=price
        )

class MarketTaker(Agent):
    """An agent that only takes liquidity by placing market orders."""
    def __init__(self, agent_id: int):
        super().__init__(agent_id, latency=2)

    def act(self, order_book: OrderBook) -> Order | None:
        if random.random() < 0.8:
            return None
        side = random.choice(["buy", "sell"])
        quantity = random.randint(5, 20)
        return Order(agent_id=self.agent_id, side=side, quantity=quantity, order_type="market")

class LiquidityProvider(Agent):
    """An agent that provides liquidity by placing limit orders on both sides."""
    def __init__(self, agent_id: int):
        super().__init__(agent_id, latency=1)

    def act(self, order_book: OrderBook) -> Order | None:
        best_bid = order_book.get_best_bid() or 99.9
        best_ask = order_book.get_best_ask() or 100.1
        bid_price = round(best_bid - 0.01, 2)
        ask_price = round(best_ask + 0.01, 2)
        if random.random() < 0.5:
             return Order(
                agent_id=self.agent_id, side="buy", quantity=10, order_type="limit", price=bid_price
            )
        else:
             return Order(
                agent_id=self.agent_id, side="sell", quantity=10, order_type="limit", price=ask_price
            )