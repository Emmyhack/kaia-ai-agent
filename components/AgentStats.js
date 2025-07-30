import { useState, useEffect } from 'react';
import { ChartBarIcon, CurrencyDollarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

export default function AgentStats({ walletAddress }) {
  const [stats, setStats] = useState({
    totalYieldValue: '0',
    numberOfFarms: 0,
    totalTransactions: 0,
    loading: true,
  });

  useEffect(() => {
    if (walletAddress) {
      fetchStats();
    }
  }, [walletAddress]);

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));

      // Fetch yield analysis
      const yieldResponse = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Analyze my yield farming positions',
          userAddress: walletAddress,
        }),
      });

      const yieldData = await yieldResponse.json();
      
      // Fetch trade analysis
      const tradeResponse = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Analyze my recent trades',
          userAddress: walletAddress,
        }),
      });

      const tradeData = await tradeResponse.json();

      // Extract stats from responses
      let totalYieldValue = '0';
      let numberOfFarms = 0;
      let totalTransactions = 0;

      if (yieldData.success && yieldData.toolCalls) {
        const yieldCall = yieldData.toolCalls.find(call => call.toolName === 'analyzeYields');
        if (yieldCall?.result?.success) {
          totalYieldValue = yieldCall.result.totalYieldValue || '0';
          numberOfFarms = yieldCall.result.numberOfFarms || 0;
        }
      }

      if (tradeData.success && tradeData.toolCalls) {
        const tradeCall = tradeData.toolCalls.find(call => call.toolName === 'analyzeTrades');
        if (tradeCall?.result?.success) {
          totalTransactions = tradeCall.result.totalTransactions || 0;
        }
      }

      setStats({
        totalYieldValue,
        numberOfFarms,
        totalTransactions,
        loading: false,
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const formatValue = (value) => {
    const num = parseFloat(value);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(4);
  };

  if (stats.loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Your DeFi Overview</h2>
        <p className="text-sm text-gray-600">Real-time stats from your Kaia blockchain activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Yield Value */}
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-sm text-green-700 font-medium mb-1">Total Yield Value</div>
          <div className="text-2xl font-bold text-green-800">
            {formatValue(stats.totalYieldValue)} KAIA
          </div>
          <div className="text-xs text-green-600 mt-1">
            Across {stats.numberOfFarms} farm{stats.numberOfFarms !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Active Farms */}
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-sm text-blue-700 font-medium mb-1">Active Farms</div>
          <div className="text-2xl font-bold text-blue-800">
            {stats.numberOfFarms}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Yield farming positions
          </div>
        </div>

        {/* Total Transactions */}
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ChartBarIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-sm text-purple-700 font-medium mb-1">Transactions</div>
          <div className="text-2xl font-bold text-purple-800">
            {stats.totalTransactions}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            Recent activity
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">Quick Actions</p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              Ask: "What are my yield positions?"
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              Ask: "Analyze my trading performance"
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              Ask: "Find the best yield opportunities"
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}