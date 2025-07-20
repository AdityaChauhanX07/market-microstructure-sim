import './App.css';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import soundManager from './SoundManager';

import OrderBook3D from './OrderBook3D';
import CandlestickChart from './CandlestickChart';
import TimeAndSales from './TimeAndSales';
import Heatmap from './Heatmap';
import PriceChart from './PriceChart';
import NetworkGraph from './NetworkGraph';
import AgentPnL from './AgentPnL';
import MetricsDashboard from './MetricsDashboard';
import { Button } from './components/ui/button';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [trades, setTrades] = useState([]);
  const [pnlData, setPnlData] = useState([]);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState(10);
  const [depthData, setDepthData] = useState({ bids: [], asks: [] });
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [marketMetrics, setMarketMetrics] = useState({ total_volume: 0, volatility: 0, trade_count: 0 });
  const [candlestickData, setCandlestickData] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [priceDirection, setPriceDirection] = useState('neutral');
  const [isMuted, setIsMuted] = useState(true);
  
  const lastPriceRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [tradesRes, pnlRes, depthRes, graphRes, metricsRes, candleRes, priceHistoryRes] = await Promise.all([
        axios.get(`${API_URL}/data/trades`),
        axios.get(`${API_URL}/agents/pnl`),
        axios.get(`${API_URL}/data/book/depth`),
        axios.get(`${API_URL}/data/agent-interactions`),
        axios.get(`${API_URL}/data/market-metrics`),
        axios.get(`${API_URL}/data/candlestick`),
        axios.get(`${API_URL}/data/price-history`)
      ]);

      const newTrades = tradesRes.data;
      const newPriceHistory = priceHistoryRes.data;
      const newMetrics = metricsRes.data;

      setTrades(prevTrades => {
        if (newTrades.length > prevTrades.length) {
          const newlyExecutedTrades = newTrades.slice(prevTrades.length);
          if (soundManager.isStarted) {
            newlyExecutedTrades.forEach(trade => soundManager.playTradeSound(trade.side));
          }
          const latestTrade = newTrades[newTrades.length-1];
          const side = latestTrade.side.charAt(0).toUpperCase() + latestTrade.side.slice(1);
          toast.success(`${side} executed: ${latestTrade.quantity} @ ${latestTrade.price.toFixed(2)}`);
        }
        return newTrades.slice(-100); // Keep only last 100 trades
      });

      if (newPriceHistory.length > 0) {
        const currentPrice = newPriceHistory[newPriceHistory.length - 1].price;
        if (lastPriceRef.current && currentPrice > lastPriceRef.current) {
          setPriceDirection('up');
        } else if (lastPriceRef.current && currentPrice < lastPriceRef.current) {
          setPriceDirection('down');
        }
        lastPriceRef.current = currentPrice;
      }
      
      if (soundManager.isStarted) {
        soundManager.updateAmbientNoise(newMetrics.total_volume);
      }

      setPnlData(pnlRes.data);
      setDepthData(depthRes.data);
      setGraphData(graphRes.data);
      setMarketMetrics(newMetrics);
      setCandlestickData(candleRes.data);
      setPriceHistory(newPriceHistory);
    } catch (error) {
      console.error("Error fetching data: ", error);
      // Stop auto-run on error
      setIsAutoRunning(false);
    }
  }, []);

  const handleStep = useCallback(async (count = 1) => {
    try {
      await axios.post(`${API_URL}/simulation/step`, { count: count });
      fetchData();
    } catch (error) {
      console.error("Error running simulation step: ", error);
      setIsAutoRunning(false);
    }
  }, [fetchData]);
  
  const handleReset = async () => {
    try {
      await axios.post(`${API_URL}/simulation/reset`);
      lastPriceRef.current = null;
      setPriceDirection('neutral');
      toast.error('Simulation Reset');
      fetchData();
    } catch (error) {
      console.error("Error resetting simulation: ", error);
    }
  };

  const handleToggleMute = () => {
    soundManager.start();
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  useEffect(() => {
    fetchData();
    if (isAutoRunning) {
      intervalRef.current = setInterval(() => handleStep(simSpeed), 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoRunning, simSpeed, handleStep]);

  return (
    <div className="container mx-auto p-4 font-sans relative overflow-hidden rounded-lg">
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
      </div>
      <div className="relative z-10">
        <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Market Microstructure Simulator
        </h1>
        <div className="p-4 mb-4 bg-white/10 backdrop-blur-lg border border-gray-700 rounded-lg shadow-md flex items-center justify-center space-x-4">
          <Button onClick={() => handleStep(1)} disabled={isAutoRunning}>Run 1 Step</Button>
          <Button onClick={() => setIsAutoRunning(prev => !prev)} variant="secondary" className="flex items-center">
              {isAutoRunning && (<span className="relative flex h-3 w-3 mr-2"><span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 pulse-animate"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>)}
              {isAutoRunning ? 'Stop Auto-Run' : 'Start Auto-Run'}
          </Button>
          <Button onClick={handleReset} variant="destructive">Reset</Button>
          <div className="flex items-center space-x-2 text-sm">
              <label htmlFor="speed">Slow</label>
              <input type="range" id="speed" min="1" max="50" step="1" value={simSpeed} onChange={(e) => setSimSpeed(Number(e.target.value))} className="w-32 custom-slider" />
              <label htmlFor="speed">Fast</label>
          </div>
          <span className="text-xs w-28 text-center">({simSpeed} ticks/sec)</span>
          <Button onClick={handleToggleMute} variant="secondary" size="icon">
            {isMuted ? '🔇' : '🔊'}
          </Button>
        </div>
        <div className="mb-4 bg-white/10 backdrop-blur-lg border border-gray-700 rounded-lg shadow-md p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
          <MetricsDashboard metrics={marketMetrics} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-lg border border-gray-700 rounded-lg shadow-md p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
            <NetworkGraph graphData={graphData} onUpdate={fetchData} />
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-gray-700 rounded-lg shadow-md p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
            <AgentPnL pnlData={pnlData} />
          </div>
        </div>
        <div className="mt-4 bg-white/10 backdrop-blur-lg border border-gray-700 rounded-lg shadow-md p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
          <CandlestickChart />
        </div>
        <div className="mt-4 bg-white/10 backdrop-blur-lg border border-gray-700 rounded-lg shadow-md p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
          <PriceChart data={priceHistory} priceDirection={priceDirection} />
        </div>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-lg border border-gray-700 rounded-lg shadow-md p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
            <h2 className="text-xl font-semibold mb-2 text-center">3D Order Book Depth</h2>
            <OrderBook3D data={depthData} />
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-gray-700 rounded-lg shadow-md p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
            <TimeAndSales trades={trades} />
          </div>
        </div>
        <div className="mt-4 bg-white/10 backdrop-blur-lg border border-gray-700 rounded-lg shadow-md p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
          <Heatmap trades={trades} />
        </div>
      </div>
    </div>
  );
}

export default App;