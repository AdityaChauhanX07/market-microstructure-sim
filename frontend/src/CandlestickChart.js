import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';

const ChartButton = ({ value, label, activeValue, onClick }) => (
  <button
    onClick={() => onClick(value)}
    className={`px-3 py-1 text-xs rounded-md transition-colors ${
      activeValue === value
        ? 'bg-purple-600 text-white'
        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
    }`}
  >
    {label}
  </button>
);

const CandlestickChart = () => {
  const [series, setSeries] = useState([{ data: [] }]);
  const [volumeSeries, setVolumeSeries] = useState([{ data: [] }]);
  const [timeframe, setTimeframe] = useState(10);
  const [indicator, setIndicator] = useState('sma'); // 'sma' or 'bbands'
  const [indicatorPeriod, setIndicatorPeriod] = useState(20);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const candleRes = await axios.get(`http://localhost:8000/data/candlestick?timeframe=${timeframe}`);
        
        let indicatorData = [];
        if (indicator === 'sma') {
          const smaRes = await axios.get(`http://localhost:8000/data/indicators/sma?period=${indicatorPeriod}`);
          indicatorData = smaRes.data.map(point => ({ x: new Date(point.time * 1000), y: point.sma }));
          setSeries([
            { name: 'Candles', type: 'candlestick', data: candleRes.data.map(c => ({ x: new Date(c.time * 1000), y: [c.open, c.high, c.low, c.close] })) },
            { name: `SMA(${indicatorPeriod})`, type: 'line', data: indicatorData }
          ]);
        } else if (indicator === 'bbands') {
          const bbandsRes = await axios.get(`http://localhost:8000/data/indicators/bbands?period=${indicatorPeriod}`);
          const upperBand = bbandsRes.data.map(p => ({ x: new Date(p.time * 1000), y: p.upper }));
          const middleBand = bbandsRes.data.map(p => ({ x: new Date(p.time * 1000), y: p.middle }));
          const lowerBand = bbandsRes.data.map(p => ({ x: new Date(p.time * 1000), y: p.lower }));
          setSeries([
            { name: 'Candles', type: 'candlestick', data: candleRes.data.map(c => ({ x: new Date(c.time * 1000), y: [c.open, c.high, c.low, c.close] })) },
            { name: 'Upper Band', type: 'line', data: upperBand },
            { name: 'Middle Band', type: 'line', data: middleBand },
            { name: 'Lower Band', type: 'line', data: lowerBand },
          ]);
        }
        
        setVolumeSeries([{ name: 'Volume', data: candleRes.data.map(c => ({ x: new Date(c.time * 1000), y: c.volume })) }]);

      } catch (error) {
        console.error("Failed to fetch chart data", error);
      }
    };
    fetchData();
  }, [timeframe, indicator, indicatorPeriod]);

  const options = {
    chart: { type: 'candlestick', height: 290, id: 'candles', toolbar: { show: false }, zoom: { enabled: false } },
    grid: { borderColor: '#444' },
    xaxis: { type: 'datetime', labels: { style: { colors: '#ccc' } } },
    yaxis: { tooltip: { enabled: true }, labels: { style: { colors: '#ccc' } } },
    theme: { mode: 'dark' },
    plotOptions: { candlestick: { colors: { upward: '#4CAF50', downward: '#F44336' } } },
    stroke: { width: [1, 2, 2, 2], curve: 'smooth' },
    legend: { show: true, position: 'top', horizontalAlign: 'left' },
    tooltip: { shared: true },
  };

  const volumeOptions = {
    chart: { height: 160, id: 'volume', brush: { enabled: true, target: 'candles' },
      selection: {
        enabled: true, fill: { color: '#ccc', opacity: 0.4 },
        xaxis: { min: series[0].data[0]?.x.getTime(), max: series[0].data[series[0].data.length - 1]?.x.getTime() }
      },
    },
    dataLabels: { enabled: false }, stroke: { width: 0 },
    xaxis: { type: 'datetime', tickAmount: 6, labels: { style: { colors: '#ccc' } } },
    yaxis: { labels: { show: false } }, theme: { mode: 'dark' },
    fill: { colors: ['#8884d8'], opacity: 0.5 }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Price Chart</h2>
        <div className="flex items-center space-x-4">
            <div>
                <span className="text-xs mr-2">Timeframe:</span>
                <ChartButton value={10} label="10T" activeValue={timeframe} onClick={setTimeframe} />
                <ChartButton value={30} label="30T" activeValue={timeframe} onClick={setTimeframe} />
            </div>
            <div>
                <span className="text-xs mr-2">Indicator:</span>
                <ChartButton value={'sma'} label="SMA" activeValue={indicator} onClick={setIndicator} />
                <ChartButton value={'bbands'} label="BBands" activeValue={indicator} onClick={setIndicator} />
            </div>
            <div>
                <span className="text-xs mr-2">Period:</span>
                <ChartButton value={20} label="20" activeValue={indicatorPeriod} onClick={setIndicatorPeriod} />
                <ChartButton value={50} label="50" activeValue={indicatorPeriod} onClick={setIndicatorPeriod} />
            </div>
        </div>
      </div>
      <div id="chart-candlestick">
        <ReactApexChart options={options} series={series} type="line" height={290} />
      </div>
      <div id="chart-bar">
        <ReactApexChart options={volumeOptions} series={volumeSeries} type="bar" height={160} />
      </div>
    </div>
  );
};

export default CandlestickChart;