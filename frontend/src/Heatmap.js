import React, { useMemo } from 'react';

const Heatmap = ({ trades }) => {
  // useMemo will re-calculate only when the trades array changes
  const heatmapData = useMemo(() => {
    if (!trades || trades.length === 0) {
      return { bins: [], maxVolume: 0 };
    }

    const bins = new Map();
    let maxVolume = 0;

    // Group trades into price bins (e.g., rounding to nearest 0.50)
    trades.forEach(trade => {
      const priceBin = Math.round(trade.price * 2) / 2;
      const currentVolume = bins.get(priceBin) || 0;
      const newVolume = currentVolume + trade.quantity;
      bins.set(priceBin, newVolume);
      if (newVolume > maxVolume) {
        maxVolume = newVolume;
      }
    });

    // Convert map to a sorted array
    const sortedBins = Array.from(bins.entries())
      .map(([price, volume]) => ({ price, volume }))
      .sort((a, b) => b.price - a.price); // Sort from highest price to lowest

    return { bins: sortedBins, maxVolume };
  }, [trades]);

  const getColor = (volume) => {
    if (heatmapData.maxVolume === 0) return 'bg-gray-800';
    const intensity = Math.sqrt(volume / heatmapData.maxVolume); // Use square root for better visual scale
    // Interpolate from blue (cold) to red (hot)
    const hue = 240 * (1 - intensity); // 240 is blue, 0 is red
    return `hsl(${hue}, 100%, 50%)`;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Trade Volume Heat Map</h2>
      <div className="h-48 overflow-y-auto p-2 rounded-md bg-gray-900 border border-gray-700">
        {heatmapData.bins.map(({ price, volume }) => (
          <div key={price} className="flex items-center justify-between text-sm mb-1">
            <span className="w-1/3 text-gray-400">{price.toFixed(2)}</span>
            <div className="w-2/3 h-6 flex items-center rounded" style={{ backgroundColor: getColor(volume) }}>
              <span className="ml-2 font-mono text-white mix-blend-difference">{volume}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Heatmap;