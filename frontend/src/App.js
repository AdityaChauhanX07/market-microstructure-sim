import './App.css';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import OrderBook from './OrderBook';
import TradeLog from './TradeLog';
import PriceChart from './PriceChart';
import AgentManager from './AgentManager';

function App() {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [trades, setTrades] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  
  const intervalRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [bookRes, tradesRes, priceRes, agentsRes] = await Promise.all([
        axios.get('http://localhost:8000/data/book'),
        axios.get('http://localhost:8000/data/trades'),
        axios.get('http://localhost:8000/data/price-history'),
        axios.get('http://localhost:8000/agents')
      ]);
      setOrderBook(bookRes.data);
      setTrades(tradesRes.data);
      setPriceHistory(priceRes.data);
      setAgents(agentsRes.data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }, []);

  const handleStep = async () => {
    try {
      await axios.post('http://localhost:8000/simulation/step');
      fetchData();
    } catch (error) {
      console.error("Error running simulation step: ", error);
    }
  };
  
  const handleReset = async () => {
    try {
      await axios.post('http://localhost:8000/simulation/reset');
      fetchData();
    } catch (error) {
      console.error("Error resetting simulation: ", error);
    }
  };

  useEffect(() => {
    fetchData();
    if (isAutoRunning) {
      intervalRef.current = setInterval(handleStep, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoRunning, fetchData]);

  return (
    <div>
      <h1>Market Microstructure Simulator</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleStep} disabled={isAutoRunning} style={{ padding: '10px', marginRight: '10px' }}>
          Run Simulation Step
        </button>
        <button onClick={() => setIsAutoRunning(prev => !prev)} style={{ padding: '10px', marginRight: '10px' }}>
          {isAutoRunning ? 'Stop Auto-Run' : 'Start Auto-Run'}
        </button>
        <button onClick={handleReset} style={{ padding: '10px' }}>
          Reset Simulation
        </button>
      </div>
      <AgentManager agents={agents} onUpdate={fetchData} />
      <PriceChart data={priceHistory} />
      <OrderBook bids={orderBook.bids} asks={orderBook.asks} />
      <TradeLog trades={trades} />
    </div>
  );
}

export default App;