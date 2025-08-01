import { useState, useEffect } from 'react';
import { Wallet, ChevronDown, Check, X, RefreshCw } from 'lucide-react';
import WalletConnector from '../utils/walletConnector.js';

const EnhancedWalletConnection = ({ onConnect, onDisconnect, onNetworkChange }) => {
  const [connector] = useState(new WalletConnector());
  const [availableWallets, setAvailableWallets] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletList, setShowWalletList] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get available wallets
    const wallets = connector.getAvailableWallets();
    setAvailableWallets(wallets);

    // Check if already connected
    const info = connector.getWalletInfo();
    if (info.isConnected) {
      setWalletInfo(info);
      if (onConnect) onConnect(info);
    }
  }, []);

  const handleConnect = async (walletType) => {
    setIsConnecting(true);
    setError(null);
    setShowWalletList(false);

    try {
      const result = await connector.connect(walletType);
      setWalletInfo(connector.getWalletInfo());
      
      if (onConnect) {
        onConnect(result);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setError(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    connector.disconnect();
    setWalletInfo(null);
    setError(null);
    
    if (onDisconnect) {
      onDisconnect();
    }
  };

  const handleNetworkSwitch = async (network) => {
    try {
      await connector.switchNetwork(network);
      setWalletInfo(connector.getWalletInfo());
      
      if (onNetworkChange) {
        onNetworkChange(network);
      }
    } catch (error) {
      console.error('Network switch failed:', error);
      setError(error.message);
    }
  };

  const getWalletIcon = (walletType) => {
    const wallet = availableWallets.find(w => w.id === walletType);
    return wallet ? wallet.icon : '🔗';
  };

  const getNetworkColor = (network) => {
    switch (network) {
      case 'testnet':
        return 'text-blue-400';
      case 'mainnet':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getNetworkName = (network) => {
    switch (network) {
      case 'testnet':
        return 'Kaia Testnet';
      case 'mainnet':
        return 'Kaia Mainnet';
      default:
        return 'Unknown Network';
    }
  };

  if (walletInfo?.isConnected) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Wallet Connected</h3>
          <button
            onClick={handleDisconnect}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Wallet Info */}
          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
            <div className="text-2xl">{getWalletIcon(walletInfo.walletType)}</div>
            <div className="flex-1">
              <div className="text-white font-medium">
                {availableWallets.find(w => w.id === walletInfo.walletType)?.name || 'Unknown Wallet'}
              </div>
              <div className="text-gray-400 text-sm">
                {walletInfo.address?.slice(0, 6)}...{walletInfo.address?.slice(-4)}
              </div>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>

          {/* Network Info */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${walletInfo.network === 'testnet' ? 'bg-blue-400' : 'bg-green-400'}`}></div>
              <span className={`font-medium ${getNetworkColor(walletInfo.network)}`}>
                {getNetworkName(walletInfo.network)}
              </span>
            </div>
            <button
              onClick={() => handleNetworkSwitch(walletInfo.network === 'testnet' ? 'mainnet' : 'testnet')}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="text-red-400 text-sm">{error}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-gray-400 text-sm">
          Choose your preferred wallet to connect to Kaia Chain
        </p>
      </div>

      {/* Wallet List */}
      <div className="space-y-3">
        {availableWallets.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => handleConnect(wallet.id)}
            disabled={isConnecting}
            className="w-full flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-2xl">{wallet.icon}</div>
            <div className="flex-1 text-left">
              <div className="text-white font-medium">{wallet.name}</div>
              <div className="text-gray-400 text-sm">{wallet.description}</div>
            </div>
            {isConnecting && wallet.id === 'connecting' && (
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            )}
          </button>
        ))}
      </div>

      {/* No Wallets Available */}
      {availableWallets.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">No wallets detected</div>
          <div className="text-sm text-gray-500 space-y-2">
            <div>Please install one of the following:</div>
            <div>• MetaMask Extension</div>
            <div>• Kaia Wallet</div>
            <div>• Coinbase Wallet</div>
            <div>• Trust Wallet</div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="text-red-400 text-sm">{error}</div>
        </div>
      )}

      {/* Loading State */}
      {isConnecting && (
        <div className="mt-4 flex items-center justify-center space-x-2 text-blue-400">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Connecting...</span>
        </div>
      )}
    </div>
  );
};

export default EnhancedWalletConnection;