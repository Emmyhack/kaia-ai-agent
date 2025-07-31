import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WALLET_PROVIDERS = [
  { 
    key: 'metamask', 
    name: 'MetaMask', 
    icon: '🦊', 
    description: 'Popular Ethereum wallet',
    detect: () => typeof window !== 'undefined' && window.ethereum && !window.ethereum.isKaiaWallet,
    installUrl: 'https://metamask.io/download/'
  },
  { 
    key: 'kaia', 
    name: 'Kaia Wallet', 
    icon: '🪙', 
    description: 'Native Kaia blockchain wallet',
    detect: () => typeof window !== 'undefined' && (window.kaia || window.kaiaWallet || (window.ethereum && window.ethereum.isKaiaWallet)),
    installUrl: 'https://kaia.io/wallet'
  },
];

export default function WalletConnection({ isConnected, walletAddress, balance, onConnect, onDisconnect }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [availableProviders, setAvailableProviders] = useState([]);

  useEffect(() => {
    // Detect available wallet providers
    const detected = WALLET_PROVIDERS.filter(p => p.detect());
    setAvailableProviders(detected);
  }, []);

  const connectWallet = async (providerKey) => {
    setIsConnecting(true);
    try {
      if (providerKey === 'metamask') {
        if (!window.ethereum || window.ethereum.isKaiaWallet) {
          toast.error('MetaMask is not installed. Please install MetaMask first.');
          setIsConnecting(false);
          return;
        }
        
        // MetaMask connection logic
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const account = accounts[0];
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const kaiaTestnetChainId = '0x3e9';
          
          if (chainId !== kaiaTestnetChainId) {
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: kaiaTestnetChainId }],
              });
            } catch (switchError) {
              if (switchError.code === 4902) {
                try {
                  await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                      chainId: kaiaTestnetChainId,
                      chainName: 'Kaia Testnet',
                      nativeCurrency: { name: 'KAIA', symbol: 'KAIA', decimals: 18 },
                      rpcUrls: ['https://public-en-kairos.node.kaia.io'],
                      blockExplorerUrls: ['https://kaiascope.com'],
                    }],
                  });
                } catch (addError) {
                  toast.error('Failed to add Kaia testnet. Please add it manually in MetaMask.');
                  setIsConnecting(false);
                  return;
                }
              } else {
                toast.error('Failed to switch to Kaia testnet. Please switch manually in MetaMask.');
                setIsConnecting(false);
                return;
              }
            }
          }
          onConnect(account);
          toast.success('MetaMask connected successfully!');
        }
      } else if (providerKey === 'kaia') {
        // Kaia Wallet connection logic
        const kaiaProvider = window.kaia || window.kaiaWallet || (window.ethereum && window.ethereum.isKaiaWallet ? window.ethereum : null);
        
        if (!kaiaProvider) {
          toast.error('Kaia Wallet is not installed. Please install Kaia Wallet first.');
          setIsConnecting(false);
          return;
        }
        
        const accounts = await kaiaProvider.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const account = accounts[0];
          const chainId = await kaiaProvider.request({ method: 'eth_chainId' });
          const kaiaTestnetChainId = '0x3e9';
          
          if (chainId !== kaiaTestnetChainId) {
            try {
              await kaiaProvider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: kaiaTestnetChainId }],
              });
            } catch (switchError) {
              if (switchError.code === 4902) {
                try {
                  await kaiaProvider.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                      chainId: kaiaTestnetChainId,
                      chainName: 'Kaia Testnet',
                      nativeCurrency: { name: 'KAIA', symbol: 'KAIA', decimals: 18 },
                      rpcUrls: ['https://public-en-kairos.node.kaia.io'],
                      blockExplorerUrls: ['https://kaiascope.com'],
                    }],
                  });
                } catch (addError) {
                  toast.error('Failed to add Kaia testnet to Kaia Wallet. Please add it manually.');
                  setIsConnecting(false);
                  return;
                }
              } else {
                toast.error('Failed to switch to Kaia testnet in Kaia Wallet. Please switch manually.');
                setIsConnecting(false);
                return;
              }
            }
          }
          onConnect(account);
          toast.success('Kaia Wallet connected successfully!');
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error(`Failed to connect wallet: ${error.message}`);
    } finally {
      setIsConnecting(false);
      setShowWalletModal(false);
    }
  };

  const disconnectWallet = () => {
    onDisconnect();
    toast.success('Wallet disconnected');
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success('Address copied to clipboard!');
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const installWallet = (provider) => {
    window.open(provider.installUrl, '_blank');
    toast.success(`Opening ${provider.name} download page`);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.ethereum || window.kaia)) {
      // Listen for account changes
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          onDisconnect();
          toast.error('Wallet disconnected');
        } else if (accounts[0] !== walletAddress) {
          onConnect(accounts[0]);
          toast.success('Account changed');
        }
      };
      
      // Listen for chain changes
      const handleChainChanged = (chainId) => {
        if (chainId !== '0x3e9') {
          toast.error('Please switch to Kaia testnet');
        }
      };
      
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      }
      if (window.kaia || window.kaiaWallet) {
        const kaiaProvider = window.kaia || window.kaiaWallet;
        kaiaProvider.on('accountsChanged', handleAccountsChanged);
        kaiaProvider.on('chainChanged', handleChainChanged);
      }
      
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
        if (window.kaia || window.kaiaWallet) {
          const kaiaProvider = window.kaia || window.kaiaWallet;
          kaiaProvider.removeListener('accountsChanged', handleAccountsChanged);
          kaiaProvider.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [walletAddress, onConnect, onDisconnect]);

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      {!isConnected ? (
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-gray-300 mb-6">Choose your preferred wallet to start using the AI Agent</p>
          </div>
          
          <button
            onClick={() => setShowWalletModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
          >
            <span>Choose Wallet</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className="mt-4 text-sm text-gray-400">
            <p>Make sure you're on Kaia testnet for the best experience</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Connected Wallet</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Connected</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-300 text-sm">Address</span>
              <button
                onClick={copyAddress}
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                Copy
              </button>
            </div>
            <div className="font-mono text-white text-sm break-all">
              {shortenAddress(walletAddress)}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Balance</span>
              <span className="text-white font-semibold">{parseFloat(balance).toFixed(4)} KAIA</span>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
          >
            Disconnect Wallet
          </button>
        </div>
      )}

      {/* Wallet Selection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Choose Your Wallet</h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {WALLET_PROVIDERS.map((provider) => {
                const isAvailable = provider.detect();
                return (
                  <div key={provider.key} className="relative">
                    <button
                      onClick={() => isAvailable ? connectWallet(provider.key) : installWallet(provider)}
                      disabled={isConnecting}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                        isAvailable 
                          ? 'border-purple-500 bg-purple-500/20 hover:bg-purple-500/30 text-white' 
                          : 'border-gray-500 bg-gray-500/20 text-gray-400 cursor-not-allowed'
                      } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{provider.icon}</span>
                        <div className="flex-1 text-left">
                          <div className="font-semibold">{provider.name}</div>
                          <div className="text-sm opacity-75">{provider.description}</div>
                        </div>
                        {isAvailable ? (
                          <div className="text-green-400 text-sm">✓ Available</div>
                        ) : (
                          <div className="text-gray-400 text-sm">Install</div>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 text-sm text-gray-400 text-center">
              <p>Don't have a wallet? Install one of the options above to get started.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}