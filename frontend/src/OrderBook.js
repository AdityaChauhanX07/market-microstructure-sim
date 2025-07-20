import React from 'react';

const OrderBook = ({ bids, asks, onCancel, lastPrice, priceDirection }) => {
  
  const getPriceColor = () => {
    switch (priceDirection) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="flex justify-between">
      {/* Bids Table */}
      <div className="w-5/12">
        <h2 className="text-xl font-semibold mb-2 text-center text-green-400">Bids</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-1">Price</th>
              <th className="text-right p-1">Quantity</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bids.map(order => (
              <tr key={order.order_id} className="text-green-500">
                <td className="text-left p-1">{order.price.toFixed(2)}</td>
                <td className="text-right p-1">{order.quantity}</td>
                <td className="text-center">
                  <button onClick={() => onCancel(order.order_id)} className="text-gray-500 hover:text-red-500 transition-colors">
                    &times;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Last Price Display */}
      <div className="w-2/12 flex flex-col items-center justify-center border-l border-r border-gray-700">
        <div className="text-xs text-gray-400">Last Price</div>
        <div className={`text-2xl font-bold transition-colors duration-300 ${getPriceColor()}`}>
          {lastPrice.toFixed(2)}
        </div>
      </div>

      {/* Asks Table */}
      <div className="w-5/12">
        <h2 className="text-xl font-semibold mb-2 text-center text-red-400">Asks</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-1">Price</th>
              <th className="text-right p-1">Quantity</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {asks.map(order => (
              <tr key={order.order_id} className="text-red-500">
                <td className="text-left p-1">{order.price.toFixed(2)}</td>
                <td className="text-right p-1">{order.quantity}</td>
                <td className="text-center">
                  <button onClick={() => onCancel(order.order_id)} className="text-gray-500 hover:text-red-500 transition-colors">
                    &times;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderBook;
