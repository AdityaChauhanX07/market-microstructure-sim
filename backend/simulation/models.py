import time
import itertools
from dataclasses import dataclass, field
from typing import Literal

order_id_counter = itertools.count(1)
OrderType = Literal["market", "limit"]
Side = Literal["buy", "sell"]

@dataclass
class Order:
    """Represents a single order in the market."""
    side: Side
    quantity: int
    order_type: OrderType
    agent_id: int
    price: float | None = None
    order_id: int = field(init=False, default_factory=lambda: next(order_id_counter))
    timestamp: float = field(init=False, default_factory=time.time)

    def __post_init__(self):
        if self.order_type == "limit" and self.price is None:
            raise ValueError("Limit orders must have a price.")
        if self.order_type == "market" and self.price is not None:
            raise ValueError("Market orders should not have a price.")
        if self.quantity <= 0:
            raise ValueError("Order quantity must be positive.")

trade_id_counter = itertools.count(1)

@dataclass
class Trade:
    """Represents a single executed trade."""
    price: float
    quantity: int
    aggressor_order_id: int
    resting_order_id: int
    aggressor_agent_id: int # New
    resting_agent_id: int  # New
    side: Side
    trade_id: int = field(init=False, default_factory=lambda: next(trade_id_counter))
    timestamp: float = field(init=False, default_factory=time.time)