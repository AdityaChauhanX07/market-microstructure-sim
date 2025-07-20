import React from 'react';
import GaugeChart from 'react-gauge-chart';

const MetricsDashboard = ({ metrics }) => {
  // Normalize volatility for the gauge (0 to 1). We'll assume a max volatility of 2 for the display.
  const volatilityPercent = metrics.volatility ? Math.min(metrics.volatility / 2, 1) : 0;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Market Metrics</h2>
      <div className="flex justify-around items-center text-center">
        <div>
          <GaugeChart 
            id="volume-gauge"
            nrOfLevels={20}
            percent={metrics.total_volume / 10000} // Assume max 10,000 volume for display
            colors={['#8884d8', '#60a5fa']}
            textColor="#e5e7eb"
            needleColor="#555"
            needleBaseColor="#555"
          />
          <p className="font-bold text-lg">{metrics.total_volume}</p>
          <p className="text-sm text-gray-400">Total Volume</p>
        </div>
        <div>
          <GaugeChart 
            id="volatility-gauge"
            nrOfLevels={20}
            percent={volatilityPercent}
            colors={['#8884d8', '#a78bfa']}
            textColor="#e5e7eb"
            needleColor="#555"
            needleBaseColor="#555"
          />
          <p className="font-bold text-lg">{metrics.volatility.toFixed(4)}</p>
          <p className="text-sm text-gray-400">Volatility (Std Dev)</p>
        </div>
        <div>
          <GaugeChart 
            id="trades-gauge"
            nrOfLevels={20}
            percent={metrics.trade_count / 1000} // Assume max 1,000 trades for display
            colors={['#8884d8', '#f472b6']}
            textColor="#e5e7eb"
            needleColor="#555"
            needleBaseColor="#555"
          />
          <p className="font-bold text-lg">{metrics.trade_count}</p>
          <p className="text-sm text-gray-400">Trade Count</p>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;