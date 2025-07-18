import React, { useState } from 'react';
import axios from 'axios';

const AgentManager = ({ agents, onUpdate }) => {
  const [agentType, setAgentType] = useState('NoiseTrader');
  const [count, setCount] = useState(1);

  const handleAddAgent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/agents', {
        agent_type: agentType,
        count: parseInt(count, 10),
      });
      onUpdate(); // This calls fetchData in the main App to refresh the UI
    } catch (error) {
      console.error("Error adding agent:", error);
    }
  };

  const handleRemoveAgent = async (agentId) => {
    try {
      await axios.delete(`http://localhost:8000/agents/${agentId}`);
      onUpdate(); // Refresh the UI
    } catch (error) {
      console.error(`Error removing agent ${agentId}:`, error);
    }
  };

  return (
    <div style={{ marginTop: '20px', border: '1px solid grey', padding: '10px', borderRadius: '5px' }}>
      <h2>Agent Management</h2>

      <form onSubmit={handleAddAgent} style={{ marginBottom: '15px' }}>
        <select value={agentType} onChange={(e) => setAgentType(e.target.value)} style={{ marginRight: '10px', padding: '5px' }}>
          <option value="NoiseTrader">Noise Trader</option>
          <option value="MarketTaker">Market Taker</option>
          <option value="LiquidityProvider">Liquidity Provider</option>
        </select>
        <input 
          type="number" 
          value={count} 
          onChange={(e) => setCount(e.target.value)} 
          min="1"
          style={{ width: '60px', marginRight: '10px', padding: '5px' }}
        />
        <button type="submit" style={{ padding: '5px 10px' }}>Add Agent(s)</button>
      </form>

      <div>
        <h3>Current Agents ({agents.length})</h3>
        <ul style={{ listStyle: 'none', padding: 0, maxHeight: '150px', overflowY: 'auto' }}>
          {agents.map(agent => (
            <li key={agent.agent_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', padding: '5px', backgroundColor: '#3a3f47' }}>
              <span>ID: {agent.agent_id} - Type: {agent.type}</span>
              <button onClick={() => handleRemoveAgent(agent.agent_id)} style={{ backgroundColor: '#c1342a', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '3px' }}>
                &times;
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AgentManager;