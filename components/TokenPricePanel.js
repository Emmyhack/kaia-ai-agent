import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Coins, RefreshCw, ExternalLink } from 'lucide-react';

const TokenPricePanel = ({ selectedNetwork }) => {
  const [tokenPrices, setTokenPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTokenPrices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/token-prices', {
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
        setTokenPrices(data.tokens);
      } else {
        setError(data.error || 'Failed to fetch token prices');
      }
    } catch (err) {
      setError('Network error while fetching token prices');
      console.error('Token prices error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenPrices();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTokenPrices, 30000);
    return () => clearInterval(interval);
  }, [selectedNetwork]);

  const formatPrice = (price) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(2);
    return price.toFixed(2);
  };

  const formatMarketCap = (marketCap) => {
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
    return `$${marketCap.toFixed(2)}`;
  };

  const formatVolume = (volume) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const getPriceChangeColor = (change) => {
    const changeNum = parseFloat(change);
    if (changeNum > 0) return 'text-green-500';
    if (changeNum < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getPriceChangeIcon = (change) => {
    const changeNum = parseFloat(change);
    if (changeNum > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (changeNum < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getKaiascanUrl = (tokenAddress) => {
    const baseUrl = selectedNetwork === 'testnet' 
      ? 'https://testnet.kaiascan.com/token' 
      : 'https://kaiascan.com/token';
    return `${baseUrl}/${tokenAddress}`;
  };

  if (loading && tokenPrices.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Coins className="w-5 h-5 mr-2" />
            Token Prices
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

  if (error && tokenPrices.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Coins className="w-5 h-5 mr-2" />
            Token Prices
          </h3>
          <button
            onClick={fetchTokenPrices}
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
          <Coins className="w-5 h-5 mr-2" />
          Token Prices - {selectedNetwork === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet'}
        </h3>
        <button
          onClick={fetchTokenPrices}
          className="text-blue-500 hover:text-blue-700 transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {tokenPrices.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-700">Token</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Price</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">24h Change</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Market Cap</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">24h Volume</th>
                <th className="text-center py-3 px-2 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tokenPrices.map((token, index) => (
                <tr key={token.address} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{token.symbol}</div>
                        <div className="text-xs text-gray-500">{token.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-3 px-2">
                    <div className="font-medium text-gray-800">
                      ${formatPrice(token.price)}
                    </div>
                  </td>
                  <td className="text-right py-3 px-2">
                    <div className="flex items-center justify-end">
                      {getPriceChangeIcon(token.priceChange24h)}
                      <span className={`ml-1 font-medium ${getPriceChangeColor(token.priceChange24h)}`}>
                        {token.priceChange24h > 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-2">
                    <div className="text-gray-800">
                      {formatMarketCap(token.marketCap)}
                    </div>
                  </td>
                  <td className="text-right py-3 px-2">
                    <div className="text-gray-800">
                      {formatVolume(token.volume24h)}
                    </div>
                  </td>
                  <td className="text-center py-3 px-2">
                    <a
                      href={getKaiascanUrl(token.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Coins className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No token data available</p>
        </div>
      )}

      {/* Data Source */}
      <div className="mt-4 text-xs text-gray-500 flex items-center justify-between">
        <span>📊 Data source: Kaiascan API</span>
        <span>Auto-refresh: 30s</span>
      </div>
    </div>
  );
};

export default TokenPricePanel;