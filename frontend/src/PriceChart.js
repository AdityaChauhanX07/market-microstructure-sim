import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';

// A custom component to render the glowing dot for the last price
const CustomizedDot = (props) => {
  const { cx, cy, stroke, payload, value, data, priceDirection } = props;
  const lastDataPoint = data[data.length - 1];

  if (payload.time === lastDataPoint.time) {
    let glowColor;
    switch (priceDirection) {
      case 'up':
        glowColor = '#4CAF50'; // Green
        break;
      case 'down':
        glowColor = '#F44336'; // Red
        break;
      default:
        glowColor = '#8884d8'; // Default purple
    }

    return (
      <g>
        <circle cx={cx} cy={cy} r={8} stroke={glowColor} strokeWidth={2} fill={glowColor} fillOpacity={0.5} />
        <circle cx={cx} cy={cy} r={4} fill={stroke} />
        <style>{`
          @keyframes pulse {
            0% { r: 8; opacity: 0.5; }
            50% { r: 12; opacity: 0.2; }
            100% { r: 8; opacity: 0.5; }
          }
          circle[r="8"] {
            animation: pulse 1.5s infinite;
          }
        `}</style>
      </g>
    );
  }

  return null;
};


const PriceChart = ({ data, priceDirection }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Price History</h2>
      <ResponsiveContainer width="95%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis 
            dataKey="time" 
            tickFormatter={(unixTime) => new Date(unixTime * 1000).toLocaleTimeString()}
            domain={['dataMin', 'dataMax']}
            type="number"
            stroke="#ccc"
          />
          <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#ccc"/>
          <Tooltip 
            contentStyle={{ backgroundColor: '#222', border: '1px solid #555' }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#8884d8" 
            strokeWidth={2} 
            dot={<CustomizedDot data={data} priceDirection={priceDirection} />}
            activeDot={{ r: 6 }}
          />
          {/* --- Add the Brush component for the minimap --- */}
          <Brush dataKey="time" height={30} stroke="#8884d8" fill="#1f2937" tickFormatter={(unixTime) => new Date(unixTime * 1000).toLocaleTimeString()} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;