import React, { useEffect, useRef } from 'react';

const TimeAndSales = ({ trades }) => {
  const scrollContainerRef = useRef(null);

  // This effect runs every time the 'trades' array changes
  useEffect(() => {
    // Auto-scroll to the bottom to show the latest trade
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [trades]);

  const getRowColor = (side) => {
    return side === 'buy' ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Time & Sales</h2>
      <div 
        ref={scrollContainerRef} 
        className="h-48 overflow-y-auto bg-gray-900 rounded-md border border-gray-700 p-2 font-mono text-sm"
      >
        <table className="w-full">
          <tbody>
            {trades.map(trade => (
              <tr key={trade.trade_id} className={getRowColor(trade.side)}>
                <td className="pr-4">{new Date(trade.timestamp * 1000).toLocaleTimeString()}</td>
                <td className="pr-4 font-bold">{trade.price.toFixed(2)}</td>
                <td>{trade.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimeAndSales;