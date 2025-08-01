import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useEffect, useState } from 'react';
import { Wallet, ChevronDown, X, RefreshCw, Settings, ExternalLink } from 'lucide-react';

const Web3ModalWalletConnection = ({ onConnect, onDisconnect, onNetworkChange }) => {
  const { open } = useWeb3Modal();
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isLoading, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain, chains } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  
  const [balance, setBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadBalance();
      if (onConnect) {
        onConnect({
          success: true,
          walletType: connector?.id || 'unknown',
          address: address,
          chainId: chain?.id?.toString(),
          provider: connector
        });
      }
    } else if (!isConnected) {
      setBalance(null);
      if (onDisconnect) {
        onDisconnect();
      }
    }
  }, [isConnected, address, chain, connector]);

  const loadBalance = async () => {
    if (!isConnected || !address) return;
    
    setIsLoadingBalance(true);
    try {
      // For demo purposes, set a mock balance
      const mockBalance = (Math.random() * 1000 + 100).toFixed(4);
      setBalance(mockBalance);
    } catch (error) {
      console.error('Failed to load balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleConnect = () => {
    open();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleNetworkSwitch = async (targetChainId) => {
    if (switchNetwork) {
      switchNetwork(targetChainId);
      if (onNetworkChange) {
        const networkName = targetChainId === 1001 ? 'testnet' : 'mainnet';
        onNetworkChange(networkName);
      }
    }
  };

  const getWalletIcon = (connectorId) => {
    switch (connectorId) {
      case 'metaMask':
        return '🦊';
      case 'kaiaWallet':
        return '⚡';
      case 'coinbaseWallet':
        return '🪙';
      case 'walletConnect':
        return '🔗';
      default:
        return '🔗';
    }
  };

  const getNetworkColor = (chainId) => {
    switch (chainId) {
      case 1001:
        return 'text-blue-400';
      case 8217:
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1001:
        return 'Kaia Testnet';
      case 8217:
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
  if (isConnected && address) {
    return (
      <div className="relative">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">{getWalletIcon(connector?.id)}</span>
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold">
                    {connector?.name || 'Connected Wallet'}
                  </span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getNetworkColor(chain?.id)} bg-white/10`}>
                    {getNetworkName(chain?.id)}
                  </div>
                </div>
                
                <div className="text-gray-400 text-sm font-mono">
                  {formatAddress(address)}
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
                onClick={() => open({ view: 'Networks' })}
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
          
          {/* Available Networks */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-sm text-gray-400 mb-2">Available Networks:</div>
            <div className="flex space-x-2">
              {chains.map((targetChain) => (
                <button
                  key={targetChain.id}
                  onClick={() => handleNetworkSwitch(targetChain.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    chain?.id === targetChain.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {targetChain.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Disconnected state
  return (
    <div className="relative">
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wallet className="w-5 h-5" />
        <span>
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </span>
        {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
      </button>

      {/* Connection Status */}
      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-blue-400 text-sm">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Connecting to {pendingConnector?.name}...</span>
          </div>
        </div>
      )}

      {/* Available Connectors Info */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        <div>Supports: MetaMask, Kaia Wallet, WalletConnect, Coinbase Wallet</div>
        <div className="mt-1">
          <span className="text-gray-500">
            Click to open Web3Modal and choose your preferred wallet
          </span>
        </div>
      </div>
    </div>
  );
};

export default Web3ModalWalletConnection;