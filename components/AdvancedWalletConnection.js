import { useState, useEffect } from 'react';
import { Wallet, ChevronDown, Check, X, RefreshCw, Settings, ExternalLink } from 'lucide-react';
import { advancedWalletConnector } from '../utils/advancedWalletConnector.js';

const AdvancedWalletConnection = ({ onConnect, onDisconnect, onNetworkChange }) => {
  const [availableWallets, setAvailableWallets] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletList, setShowWalletList] = useState(false);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  useEffect(() => {
    // Get available wallets on component mount
    const wallets = advancedWalletConnector.getAvailableWallets();
    setAvailableWallets(wallets);

    // Check if already connected
    const info = advancedWalletConnector.getWalletInfo();
    if (info.isConnected) {
      setWalletInfo(info);
      loadBalance();
    }
  }, []);

  const loadBalance = async () => {
    if (!walletInfo?.isConnected) return;
    
    setIsLoadingBalance(true);
    try {
      const balance = await advancedWalletConnector.getBalance();
      setBalance(balance);
    } catch (error) {
      console.error('Failed to load balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleConnect = async (walletType) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const result = await advancedWalletConnector.connect(walletType);
      
      if (result.success) {
        setWalletInfo(advancedWalletConnector.getWalletInfo());
        setShowWalletList(false);
        await loadBalance();
        
        if (onConnect) {
          onConnect(result);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    advancedWalletConnector.disconnect();
    setWalletInfo(null);
    setBalance(null);
    setShowWalletList(false);
    setShowNetworkSelector(false);
    
    if (onDisconnect) {
      onDisconnect();
    }
  };

  const handleNetworkSwitch = async (network) => {
    try {
      const result = await advancedWalletConnector.switchNetwork(network);
      
      if (result.success) {
        setWalletInfo(advancedWalletConnector.getWalletInfo());
        setShowNetworkSelector(false);
        
        if (onNetworkChange) {
          onNetworkChange(network);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
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

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    if (!balance) return '0.0000';
    const num = parseFloat(balance);
    return num.toFixed(4);
  };

  // Connected wallet display
  if (walletInfo?.isConnected) {
    return (
      <div className="relative">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">{getWalletIcon(walletInfo.walletType)}</span>
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold">
                    {walletInfo.walletType.charAt(0).toUpperCase() + walletInfo.walletType.slice(1)}
                  </span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getNetworkColor(walletInfo.network)} bg-white/10`}>
                    {getNetworkName(walletInfo.network)}
                  </div>
                </div>
                
                <div className="text-gray-400 text-sm font-mono">
                  {formatAddress(walletInfo.address)}
                </div>
                
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-gray-300 text-sm">
                    {isLoadingBalance ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      `${formatBalance(balance)} KAIA`
                    )}
                  </span>
                  <button
                    onClick={loadBalance}
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNetworkSelector(!showNetworkSelector)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Switch Network"
              >
                <Settings className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleDisconnect}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Disconnect"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Network Selector */}
          {showNetworkSelector && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-sm text-gray-400 mb-2">Switch Network:</div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleNetworkSwitch('testnet')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    walletInfo.network === 'testnet'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  Testnet
                </button>
                <button
                  onClick={() => handleNetworkSwitch('mainnet')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    walletInfo.network === 'mainnet'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  Mainnet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Disconnected state with wallet list
  return (
    <div className="relative">
      <button
        onClick={() => setShowWalletList(!showWalletList)}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
      >
        <Wallet className="w-5 h-5" />
        <span>Connect Wallet</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showWalletList ? 'rotate-180' : ''}`} />
      </button>

      {/* Wallet List Dropdown */}
      {showWalletList && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl z-50">
          <div className="p-4">
            <div className="text-white font-semibold mb-3">Choose Wallet</div>
            
            <div className="space-y-2">
              {availableWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet.id)}
                  disabled={isConnecting}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-2xl">{wallet.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-medium">{wallet.name}</div>
                    <div className="text-gray-400 text-sm">{wallet.description}</div>
                  </div>
                  {isConnecting && wallet.id === 'connecting' && (
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Install Wallet Links */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-sm text-gray-400 mb-2">Don't have a wallet?</div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-sm"
                >
                  <span>🦊</span>
                  <span className="text-white">MetaMask</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
                <a
                  href="https://www.coinbase.com/wallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-sm"
                >
                  <span>🪙</span>
                  <span className="text-white">Coinbase</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
          <div className="flex items-center space-x-2">
            <X className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedWalletConnection;