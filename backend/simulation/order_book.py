from .models import Order

class OrderBook:
    """A class to represent the order book for a single asset."""

    def __init__(self):
        """Initializes empty lists for bids and asks."""
        # Bids: list of buy orders
        self.bids: list[Order] = []
        # Asks: list of sell orders
        self.asks: list[Order] = []

    def add_order(self, order: Order):
        """Adds a limit order to the book and sorts it by price-time priority."""
        if order.side == "buy":
            self.bids.append(order)
            # Sort bids: highest price first, then earliest time first
            self.bids.sort(key=lambda o: (-o.price, o.timestamp))
        else:  # 'sell'
            self.asks.append(order)
            # Sort asks: lowest price first, then earliest time first
            self.asks.sort(key=lambda o: (o.price, o.timestamp))

    def get_best_bid(self) -> float | None:
        """Returns the highest bid price, or None if no bids exist."""
        return self.bids[0].price if self.bids else None

    def get_best_ask(self) -> float | None:
        """Returns the lowest ask price, or None if no asks exist."""
        return self.asks[0].price if self.asks else None

    def get_spread(self) -> float | None:
        """Returns the difference between the best ask and best bid."""
        best_bid = self.get_best_bid()
        best_ask = self.get_best_ask()
        if best_bid is not None and best_ask is not None:
            return best_ask - best_bid
        return None