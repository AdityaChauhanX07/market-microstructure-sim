import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PriceChart = ({ data }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Price History</h2>
      <ResponsiveContainer width="95%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tickFormatter={(unixTime) => new Date(unixTime * 1000).toLocaleTimeString()}
            domain={['dataMin', 'dataMax']}
            type="number"
            stroke="#ccc"
          />
          <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#ccc"/>
          <Tooltip 
            contentStyle={{ backgroundColor: '#333', border: '1px solid #555' }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;