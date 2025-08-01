import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, RefreshCw } from 'lucide-react';

const TradeAnalysisPanel = ({ selectedNetwork }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTradeAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/trade-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          network: selectedNetwork,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAnalysisData(data.analysis);
      } else {
        setError(data.error || 'Failed to fetch trade analysis');
      }
    } catch (err) {
      setError('Network error while fetching trade analysis');
      console.error('Trade analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTradeAnalysis();
  }, [selectedNetwork]);

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const getTrendIcon = (change) => {
    const changeNum = parseFloat(change);
    if (changeNum > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (changeNum < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (change) => {
    const changeNum = parseFloat(change);
    if (changeNum > 0) return 'text-green-500';
    if (changeNum < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Trade Analysis
          </h3>
          <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Trade Analysis
          </h3>
          <button
            onClick={fetchTradeAnalysis}
            className="text-blue-500 hover:text-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Trade Analysis - {selectedNetwork === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet'}
        </h3>
        <button
          onClick={fetchTradeAnalysis}
          className="text-blue-500 hover:text-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {analysisData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Market Overview */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Market Cap</p>
                <p className="text-xl font-bold text-gray-800">
                  ${formatNumber(analysisData.marketCap)}
                </p>
              </div>
              <DollarSign className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(analysisData.marketCapChange)}
              <span className={`text-sm ml-1 ${getTrendColor(analysisData.marketCapChange)}`}>
                {analysisData.marketCapChange}%
              </span>
            </div>
          </div>

          {/* Volume */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">24h Volume</p>
                <p className="text-xl font-bold text-gray-800">
                  ${formatNumber(analysisData.volume24h)}
                </p>
              </div>
              <Activity className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(analysisData.volumeChange)}
              <span className={`text-sm ml-1 ${getTrendColor(analysisData.volumeChange)}`}>
                {analysisData.volumeChange}%
              </span>
            </div>
          </div>

          {/* Active Addresses */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Addresses</p>
                <p className="text-xl font-bold text-gray-800">
                  {formatNumber(analysisData.activeAddresses)}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(analysisData.addressChange)}
              <span className={`text-sm ml-1 ${getTrendColor(analysisData.addressChange)}`}>
                {analysisData.addressChange}%
              </span>
            </div>
          </div>

          {/* Transaction Count */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-xl font-bold text-gray-800">
                  {formatNumber(analysisData.transactionCount)}
                </p>
              </div>
              <BarChart3 className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(analysisData.transactionChange)}
              <span className={`text-sm ml-1 ${getTrendColor(analysisData.transactionChange)}`}>
                {analysisData.transactionChange}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Trading Insights */}
      {analysisData && (
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Trading Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-2">Market Sentiment</h5>
              <p className="text-sm text-gray-600">{analysisData.sentiment}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-2">Trading Recommendation</h5>
              <p className="text-sm text-gray-600">{analysisData.recommendation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Data Source */}
      <div className="mt-4 text-xs text-gray-500 flex items-center">
        <span>📊 Data source: Kaiascan API</span>
        <span className="mx-2">•</span>
        <span>Last updated: {analysisData ? new Date(analysisData.timestamp).toLocaleTimeString() : 'N/A'}</span>
      </div>
    </div>
  );
};

export default TradeAnalysisPanel;