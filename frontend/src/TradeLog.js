import React from 'react';

const TradeLog = ({ trades }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Trade Log</h2>
      <div style={{ height: '200px', overflowY: 'scroll', border: '1px solid grey', padding: '10px' }}>
        {trades.slice(0).reverse().map(trade => (
          <div key={trade.trade_id} style={{ color: trade.side === 'buy' ? '#4CAF50' : '#F44336' }}>
            {`[${new Date(trade.timestamp * 1000).toLocaleTimeString()}] Price: ${trade.price.toFixed(2)}, Qty: ${trade.quantity}`}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeLog;