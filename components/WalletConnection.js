import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WALLET_PROVIDERS = [
  { key: 'metamask', name: 'MetaMask', icon: '🦊', detect: () => typeof window !== 'undefined' && window.ethereum },
  { key: 'kaia', name: 'Kaia Wallet', icon: '🪙', detect: () => typeof window !== 'undefined' && window.kaia },
];

export default function WalletConnection({ isConnected, walletAddress, balance, onConnect, onDisconnect }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [availableProviders, setAvailableProviders] = useState([]);

  useEffect(() => {
    // Detect available wallet providers
    const detected = WALLET_PROVIDERS.filter(p => p.detect());
    setAvailableProviders(detected);
    if (detected.length === 1) setSelectedProvider(detected[0].key);
  }, []);

  const connectWallet = async () => {
    if (!selectedProvider) {
      toast.error('Please select a wallet provider.');
      return;
    }
    setIsConnecting(true);
    try {
      if (selectedProvider === 'metamask') {
        if (!window.ethereum) {
          toast.error('MetaMask is not installed.');
          setIsConnecting(false);
          return;
        }
        // MetaMask logic (same as before)
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
          toast.success('Wallet connected successfully!');
        }
      } else if (selectedProvider === 'kaia') {
        if (!window.kaia) {
          toast.error('Kaia Wallet extension is not installed.');
          setIsConnecting(false);
          return;
        }
        // Kaia Wallet logic
        const accounts = await window.kaia.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const account = accounts[0];
          // Optionally check network here if needed
          onConnect(account);
          toast.success('Kaia Wallet connected!');
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error(`Failed to connect wallet: ${error.message}`);
    } finally {
      setIsConnecting(false);
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
      if (window.kaia) {
        window.kaia.on('accountsChanged', handleAccountsChanged);
        window.kaia.on('chainChanged', handleChainChanged);
      }
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
        if (window.kaia) {
          window.kaia.removeListener('accountsChanged', handleAccountsChanged);
          window.kaia.removeListener('chainChanged', handleChainChanged);
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
            <p className="text-gray-300 mb-6">Connect your MetaMask or Kaia Wallet to start using the AI Agent</p>
          </div>
          <div className="mb-4 flex justify-center gap-2">
            {availableProviders.map((provider) => (
              <button
                key={provider.key}
                onClick={() => setSelectedProvider(provider.key)}
                className={`px-4 py-2 rounded-lg font-semibold border-2 transition-all duration-200 ${selectedProvider === provider.key ? 'border-purple-500 bg-purple-600 text-white' : 'border-white/20 bg-white/10 text-white hover:border-purple-400'}`}
              >
                <span className="mr-2">{provider.icon}</span>
                {provider.name}
              </button>
            ))}
          </div>
          <button
            onClick={connectWallet}
            disabled={isConnecting || !selectedProvider}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>Connect Wallet</span>
              </>
            )}
          </button>
          <div className="mt-4 text-sm text-gray-400">
            <p>Make sure you have MetaMask or Kaia Wallet installed and are on Kaia testnet</p>
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
    </div>
  );
}