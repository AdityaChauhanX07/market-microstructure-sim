import time
import itertools
from dataclasses import dataclass, field
from typing import Literal

# Create a unique, auto-incrementing ID for each order
order_id_counter = itertools.count(1)

# Define valid types for order properties for better code safety
OrderType = Literal["market", "limit"]
Side = Literal["buy", "sell"]

@dataclass
class Order:
    """Represents a single order in the market."""
    # --- Fields specified by the agent ---
    side: Side
    quantity: int
    order_type: OrderType
    agent_id: int
    price: float | None = None  # Price is optional (None for market orders)

    # --- Fields set automatically by the system ---
    order_id: int = field(init=False, default_factory=lambda: next(order_id_counter))
    timestamp: float = field(init=False, default_factory=time.time)

    def __post_init__(self):
        """Perform validation after the object is initialized."""
        if self.order_type == "limit" and self.price is None:
            raise ValueError("Limit orders must have a price.")
        if self.order_type == "market" and self.price is not None:
            raise ValueError("Market orders should not have a price.")
        if self.quantity <= 0:
            raise ValueError("Order quantity must be positive.")

# Create a unique, auto-incrementing ID for each trade
trade_id_counter = itertools.count(1)

@dataclass
class Trade:
    """Represents a single executed trade."""
    price: float
    quantity: int
    aggressor_order_id: int
    resting_order_id: int
    side: Side

    # --- Fields set automatically by the system ---
    trade_id: int = field(init=False, default_factory=lambda: next(trade_id_counter))
    timestamp: float = field(init=False, default_factory=time.time)