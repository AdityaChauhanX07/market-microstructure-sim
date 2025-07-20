import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AgentStats = ({ agentId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/agents/${agentId}/stats`);
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch agent stats", error);
        setLoading(false);
      }
    };

    if (agentId) {
      fetchStats();
    }
  }, [agentId]);

  if (loading) {
    return <div>Loading stats...</div>;
  }

  if (!stats) {
    return <div>No stats available.</div>;
  }

  return (
    <div className="text-sm">
      <h4 className="font-bold mb-2">Agent {agentId} - Detailed Stats</h4>
      <p><strong>Total Trades:</strong> {stats.total_trades}</p>
      <p><strong>Volume Bought:</strong> {stats.volume_bought}</p>
      <p><strong>Volume Sold:</strong> {stats.volume_sold}</p>
      <p><strong>Net Volume:</strong> {stats.net_volume}</p>
    </div>
  );
};

export default AgentStats;