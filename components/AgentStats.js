import { useState, useEffect } from 'react';
import { BarChart3, DollarSign, TrendingUp } from 'lucide-react';

export default function AgentStats({ walletAddress }) {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalValue: 0,
    yieldFarms: 0,
  });

  useEffect(() => {
    if (walletAddress) {
      // Mock stats - in production, this would fetch real data
      setStats({
        totalTransactions: Math.floor(Math.random() * 50) + 10,
        totalValue: (Math.random() * 1000 + 100).toFixed(2),
        yieldFarms: Math.floor(Math.random() * 5) + 1,
      });
    }
  }, [walletAddress]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Agent Statistics</h3>
      
      <div className="space-y-3">
        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-white font-semibold">{stats.totalTransactions}</div>
              <div className="text-gray-300 text-sm">Total Transactions</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-white font-semibold">${stats.totalValue}</div>
              <div className="text-gray-300 text-sm">Total Value</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-white font-semibold">{stats.yieldFarms}</div>
              <div className="text-gray-300 text-sm">Active Farms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}