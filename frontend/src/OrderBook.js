import React from 'react';

const OrderBook = ({ bids, asks }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <div>
        <h2>Bids (Buy Orders)</h2>
        <table style={{ width: '300px', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Price</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {bids.map(order => (
              <tr key={order.order_id} style={{ color: '#4CAF50' }}>
                <td>{order.price.toFixed(2)}</td>
                <td>{order.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h2>Asks (Sell Orders)</h2>
        <table style={{ width: '300px', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Price</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {asks.map(order => (
              <tr key={order.order_id} style={{ color: '#F44336' }}>
                <td>{order.price.toFixed(2)}</td>
                <td>{order.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderBook;