import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function WalletConnection({ isConnected, walletAddress, balance, onConnect, onDisconnect }) {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    try {
      console.log('Starting wallet connection...');
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Accounts received:', accounts);
      
      if (accounts.length > 0) {
        const account = accounts[0];
        console.log('Selected account:', account);
        
        // Check if we're on the correct network (Kaia testnet)
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('Current chain ID:', chainId);
        
        // Kaia testnet chain ID (1001 in decimal = 0x3e9 in hex)
        const kaiaTestnetChainId = '0x3e9';
        
        if (chainId !== kaiaTestnetChainId) {
          console.log('Switching to Kaia testnet...');
          try {
            // Try to switch to Kaia testnet
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: kaiaTestnetChainId }],
            });
            console.log('Successfully switched to Kaia testnet');
          } catch (switchError) {
            console.log('Switch error:', switchError);
            // If the network doesn't exist, add it
            if (switchError.code === 4902) {
              console.log('Adding Kaia testnet to MetaMask...');
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: kaiaTestnetChainId,
                    chainName: 'Kaia Testnet',
                    nativeCurrency: {
                      name: 'KAIA',
                      symbol: 'KAIA',
                      decimals: 18,
                    },
                    rpcUrls: ['https://public-en-kairos.node.kaia.io'],
                    blockExplorerUrls: ['https://kaiascope.com'],
                  }],
                });
                console.log('Successfully added Kaia testnet');
              } catch (addError) {
                console.error('Failed to add network:', addError);
                toast.error('Failed to add Kaia testnet. Please add it manually in MetaMask.');
                setIsConnecting(false);
                return;
              }
            } else {
              console.error('Failed to switch network:', switchError);
              toast.error('Failed to switch to Kaia testnet. Please switch manually in MetaMask.');
              setIsConnecting(false);
              return;
            }
          }
        } else {
          console.log('Already on Kaia testnet');
        }
        
        console.log('Connecting wallet with account:', account);
        onConnect(account);
        toast.success('Wallet connected successfully!');
      } else {
        console.log('No accounts found');
        toast.error('No accounts found. Please unlock MetaMask and try again.');
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
    if (typeof window !== 'undefined' && window.ethereum) {
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

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
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
            <p className="text-gray-300 mb-6">Connect your MetaMask wallet to start using the AI Agent</p>
          </div>
          
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Connect Wallet</span>
              </>
            )}
          </button>
          
          <div className="mt-4 text-sm text-gray-400">
            <p>Make sure you have MetaMask installed and are on Kaia testnet</p>
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