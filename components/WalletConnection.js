import { useState, useEffect } from 'react';
import { useConnectWallet, useSetChain, useWallets } from '@web3-onboard/react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

export default function WalletConnection({ isConnected, walletAddress, balance, onConnect, onDisconnect }) {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [{ chains, connectedChain }, setChain] = useSetChain();
  const connectedWallets = useWallets();
  
  const [currentBalance, setCurrentBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  // Update parent component when wallet state changes
  useEffect(() => {
    if (wallet) {
      const address = wallet.accounts[0]?.address;
      if (address && address !== walletAddress) {
        onConnect(address);
        updateBalance(address);
      }
    } else if (walletAddress && !wallet) {
      onDisconnect();
    }
  }, [wallet, walletAddress, onConnect, onDisconnect]);

  // Update balance when connected chain changes
  useEffect(() => {
    if (wallet && connectedChain) {
      const address = wallet.accounts[0]?.address;
      if (address) {
        updateBalance(address);
      }
    }
  }, [connectedChain, wallet]);

  const updateBalance = async (address) => {
    if (!address || !connectedChain) return;

    setIsLoading(true);
    try {
      // Create provider using the connected wallet's provider
      const ethersProvider = new ethers.BrowserProvider(wallet.provider, 'any');
      
      // Get balance
      const balanceWei = await ethersProvider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei);
      const formattedBalance = parseFloat(balanceEth).toFixed(4);
      
      setCurrentBalance(formattedBalance);
      
      // Also update parent if balance prop is managed there
      if (typeof balance === 'function') {
        balance(formattedBalance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const handleDisconnect = async () => {
    try {
      if (wallet) {
        await disconnect(wallet);
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const handleSwitchNetwork = async (chainId) => {
    try {
      await setChain({ chainId });
      toast.success('Network switched successfully');
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast.error('Failed to switch network');
    }
  };

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case '0x3e9':
        return 'Kaia Testnet';
      case '0x2019':
        return 'Kaia Mainnet';
      default:
        return 'Unknown Network';
    }
  };

  const getNetworkColor = (chainId) => {
    switch (chainId) {
      case '0x3e9':
        return 'bg-blue-500';
      case '0x2019':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (wallet) {
    const address = wallet.accounts[0]?.address;
    const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
    
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Wallet Connected</h3>
          <button
            onClick={handleDisconnect}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors"
          >
            Disconnect
          </button>
        </div>

        {/* Wallet Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Wallet:</span>
            <span className="text-white font-medium flex items-center gap-2">
              {wallet.label}
              {wallet.icon && (
                <img src={wallet.icon} alt={wallet.label} className="w-5 h-5" />
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Address:</span>
            <span className="text-white font-mono text-sm">{shortAddress}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Balance:</span>
            <span className="text-white font-medium">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Loading...
                </div>
              ) : (
                `${currentBalance} KAIA`
              )}
            </span>
          </div>

          {/* Network Info */}
          {connectedChain && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Network:</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getNetworkColor(connectedChain.id)}`}></div>
                <span className="text-white text-sm">{getNetworkName(connectedChain.id)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Network Switching */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-gray-300 text-sm mb-2">Switch Network:</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleSwitchNetwork('0x3e9')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors flex-1 ${
                connectedChain?.id === '0x3e9'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              🧪 Testnet
            </button>
            <button
              onClick={() => handleSwitchNetwork('0x2019')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors flex-1 ${
                connectedChain?.id === '0x2019'
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              🚀 Mainnet
            </button>
          </div>
        </div>

        {/* Refresh Balance */}
        <button
          onClick={() => updateBalance(address)}
          disabled={isLoading}
          className="w-full mt-4 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh Balance'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="text-center">
        <div className="text-4xl mb-4">🔗</div>
        <h3 className="text-xl font-semibold text-white mb-3">Connect Your Wallet</h3>
        <p className="text-gray-300 mb-6 text-sm">
          Connect your wallet to start using the Kaia AI Agent
        </p>

        <button
          onClick={handleConnect}
          disabled={connecting}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {connecting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              Connecting...
            </div>
          ) : (
            'Connect Wallet'
          )}
        </button>

        <div className="mt-4 text-xs text-gray-400">
          <p>Supports MetaMask, Kaia Wallet, WalletConnect and more</p>
        </div>
      </div>
    </div>
  );
}