from .models import Order, Trade
from .order_book import OrderBook

class MatchingEngine:
    """The engine that matches incoming orders against the order book."""

    def __init__(self, order_book: OrderBook):
        self.order_book = order_book

    def process_order(self, order: Order) -> list[Trade]:
        """Processes a new order and returns a list of trades executed."""
        trades = []
        if order.side == "buy":
            trades = self._match_order(order, self.order_book.asks, self.order_book.bids)
        else:  # 'sell'
            trades = self._match_order(order, self.order_book.bids, self.order_book.asks)

        # If a limit order is not fully filled, add it to the book
        if order.order_type == "limit" and order.quantity > 0:
            self.order_book.add_order(order)

        return trades

    def _match_order(self, order: Order, opposite_side_book: list[Order], same_side_book: list[Order]) -> list[Trade]:
        """Generic matching logic for both buy and sell orders."""
        trades = []
        while order.quantity > 0 and opposite_side_book:
            best_match = opposite_side_book[0]

            # Check if the prices match for a trade to occur
            can_match = False
            if order.side == "buy" and (order.order_type == "market" or order.price >= best_match.price):
                can_match = True
            elif order.side == "sell" and (order.order_type == "market" or order.price <= best_match.price):
                can_match = True

            if not can_match:
                break # No more matches possible at this price

            trade_quantity = min(order.quantity, best_match.quantity)
            trade_price = best_match.price

            trades.append(Trade(
                price=trade_price,
                quantity=trade_quantity,
                aggressor_order_id=order.order_id,
                resting_order_id=best_match.order_id,
                side=order.side
            ))

            order.quantity -= trade_quantity
            best_match.quantity -= trade_quantity

            if best_match.quantity == 0:
                opposite_side_book.pop(0)

        return trades