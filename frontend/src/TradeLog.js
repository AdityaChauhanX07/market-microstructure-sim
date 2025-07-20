import React from 'react';

const TradeLog = ({ trades, latestTradeId }) => {
  return (
    <div>
      <h2>Trade Log</h2>
      <div className="h-48 overflow-y-scroll border border-gray-700 p-2 rounded-md bg-gray-900">
        {trades.slice(0).reverse().map(trade => (
          <div 
            key={trade.trade_id} 
            className={trade.trade_id === latestTradeId ? 'trade-glow' : ''}
            style={{ color: trade.side === 'buy' ? '#4CAF50' : '#F44336', padding: '2px' }}
          >
            {`[${new Date(trade.timestamp * 1000).toLocaleTimeString()}] Price: ${trade.price.toFixed(2)}, Qty: ${trade.quantity}`}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeLog;