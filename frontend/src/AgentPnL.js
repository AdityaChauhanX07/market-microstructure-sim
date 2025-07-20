import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './components/ui/hover-card.jsx';
import AgentStats from './AgentStats';

const AgentPnL = ({ pnlData }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Agent PnL (Profit and Loss)</h2>
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px', borderBottom: '1px solid #555' }}>Agent ID</th>
            <th style={{ padding: '8px', borderBottom: '1px solid #555' }}>Type</th>
            <th style={{ padding: '8px', borderBottom: '1px solid #555' }}>Cash</th>
            <th style={{ padding: '8px', borderBottom: '1px solid #555' }}>Shares</th>
            <th style={{ padding: '8px', borderBottom: '1px solid #555' }}>Portfolio Value</th>
            <th style={{ padding: '8px', borderBottom: '1px solid #555' }}>PnL</th>
          </tr>
        </thead>
        <tbody>
          {pnlData.map(agent => (
            <HoverCard key={agent.agent_id}>
              <HoverCardTrigger asChild>
                <tr className="cursor-pointer hover:bg-gray-800">
                  <td style={{ padding: '8px' }}>{agent.agent_id}</td>
                  <td style={{ padding: '8px' }}>{agent.type}</td>
                  <td style={{ padding: '8px' }}>${agent.portfolio.cash.toFixed(2)}</td>
                  <td style={{ padding: '8px' }}>{agent.portfolio.shares}</td>
                  <td style={{ padding: '8px' }}>${agent.portfolio_value.toFixed(2)}</td>
                  <td style={{ padding: '8px', color: agent.pnl >= 0 ? '#4CAF50' : '#F44336' }}>
                    ${agent.pnl.toFixed(2)}
                  </td>
                </tr>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 bg-gray-900 border-purple-500 text-gray-200">
                <AgentStats agentId={agent.agent_id} />
              </HoverCardContent>
            </HoverCard>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AgentPnL;