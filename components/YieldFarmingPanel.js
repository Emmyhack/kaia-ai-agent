import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { kaiascanService } from '../utils/kaiascanService.js';

const YieldFarmingPanel = ({ selectedNetwork, onFarmSelect }) => {
  const [farmingData, setFarmingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadFarmingData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await kaiascanService.getRealYieldFarmingData(selectedNetwork);
      
      if (result.success) {
        setFarmingData(result.opportunities);
        setLastUpdated(new Date());
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFarmingData();
  }, [selectedNetwork]);

  const formatAPY = (apy) => {
    if (!apy) return '0.00%';
    const num = parseFloat(apy);
    return `${num.toFixed(2)}%`;
  };

  const formatTVL = (tvl) => {
    if (!tvl) return '0 KAIA';
    const num = parseFloat(tvl);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M KAIA`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K KAIA`;
    }
    return `${num.toFixed(0)} KAIA`;
  };

  const getRiskColor = (apy) => {
    const num = parseFloat(apy);
    if (num > 20) return 'text-red-400';
    if (num > 10) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskLabel = (apy) => {
    const num = parseFloat(apy);
    if (num > 20) return 'High';
    if (num > 10) return 'Medium';
    return 'Low';
  };

  const handleFarmSelect = (farm) => {
    if (onFarmSelect) {
      onFarmSelect(farm);
    }
  };

  const getKaiascanUrl = (address) => {
    const baseUrl = selectedNetwork === 'testnet' 
      ? 'https://testnet.kaiascan.com'
      : 'https://kaiascan.com';
    return `${baseUrl}/address/${address}`;
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
          Yield Farming Opportunities
        </h3>
        <button
          onClick={loadFarmingData}
          disabled={isLoading}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {lastUpdated && (
        <div className="text-xs text-gray-400 mb-4 flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
            <span className="text-gray-300">Loading yield farming data...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          <div className="font-semibold">Error:</div>
          <div className="text-sm">{error}</div>
        </div>
      )}

      {!isLoading && !error && farmingData && (
        <div className="space-y-4">
          {farmingData.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <div className="font-semibold">No Active Farms</div>
              <div className="text-sm">No yield farming opportunities found on {selectedNetwork}</div>
            </div>
          ) : (
            farmingData.map((farm, index) => (
              <div
                key={farm.address}
                className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-green-500/30 transition-all cursor-pointer"
                onClick={() => handleFarmSelect(farm)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-white">{farm.name}</h4>
                      {farm.contractData?.verified && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">{farm.type}</div>
                  </div>
                  <a
                    href={getKaiascanUrl(farm.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getRiskColor(farm.onChainData?.apy || '0')}`}>
                      {formatAPY(farm.onChainData?.apy || '0')}
                    </div>
                    <div className="text-xs text-gray-400">APY</div>
                    <div className="text-xs text-gray-500">
                      Risk: {getRiskLabel(farm.onChainData?.apy || '0')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">
                      {formatTVL(farm.onChainData?.totalSupply || '0')}
                    </div>
                    <div className="text-xs text-gray-400">Total Staked</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>Active</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-3 h-3" />
                    <span>Rewards: {farm.rewardToken?.symbol || 'KAIA'}</span>
                  </div>
                </div>

                {farm.onChainData && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">Reward Rate:</span>
                        <div className="text-white font-mono">
                          {parseFloat(farm.onChainData.rewardRate || '0').toFixed(6)}/sec
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Block:</span>
                        <div className="text-white font-mono">
                          {farm.onChainData.blockNumber?.toLocaleString() || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-xs text-gray-400 text-center">
          Data sourced from Kaiascan API
          <br />
          <span className="text-gray-500">
            Click on any farm to view detailed information
          </span>
        </div>
      </div>
    </div>
  );
};

export default YieldFarmingPanel;