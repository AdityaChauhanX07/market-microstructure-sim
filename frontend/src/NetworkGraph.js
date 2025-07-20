import React, { useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';

const NetworkGraph = ({ graphData, onUpdate }) => {
  const [agentType, setAgentType] = useState('NoiseTrader');

  const getNodeColor = (node) => {
    // ... (getNodeColor function remains the same)
    switch (node.type) {
      case 'LiquidityProvider':
        return '#4CAF50'; // Green
      case 'MarketTaker':
        return '#F44336'; // Red
      case 'NoiseTrader':
        return '#2196F3'; // Blue
      default:
        return '#E0E0E0'; // Grey
    }
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/agents', {
        agent_type: agentType,
        count: 1,
      });
      onUpdate(); // Trigger a refresh in the parent App component
    } catch (error) {
      console.error("Error adding agent:", error);
    }
  };

  const handleRemoveAgent = async (node) => {
    // A simple confirmation before deleting
    if (window.confirm(`Are you sure you want to remove Agent ID ${node.id}?`)) {
      try {
        await axios.delete(`http://localhost:8000/agents/${node.id}`);
        onUpdate(); // Trigger a refresh
      } catch (error) {
        console.error(`Error removing agent ${node.id}:`, error);
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Agent Interaction Graph</h2>
      
      {/* Form to add agents */}
      <form onSubmit={handleAddAgent} className="flex items-center mb-2">
        <select value={agentType} onChange={(e) => setAgentType(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-md p-2 mr-2 flex-grow">
          <option value="NoiseTrader">Noise Trader</option>
          <option value="MarketTaker">Market Taker</option>
          <option value="LiquidityProvider">Liquidity Provider</option>
        </select>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add</button>
      </form>

      <div style={{ border: '1px solid #4A5568', borderRadius: '0.25rem', overflow: 'hidden' }}>
        <ForceGraph2D
          graphData={graphData}
          width={500}
          height={220} // Adjusted height
          backgroundColor="#1A202C"
          nodeLabel="type"
          nodeVal={5}
          nodeCanvasObject={(node, ctx, globalScale) => {
            // ... (nodeCanvasObject function remains the same)
            const label = `ID: ${node.id}`;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
            ctx.fillStyle = getNodeColor(node);
            ctx.fill();
            ctx.fillText(label, node.x, node.y + 10);
          }}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={2}
          linkWidth={link => Math.min(link.value / 10, 5)} // Cap link width
          linkColor={() => 'rgba(255,255,255,0.5)'}
          onNodeClick={handleRemoveAgent} // Add click handler to remove agents
        />
      </div>
    </div>
  );
};

export default NetworkGraph;