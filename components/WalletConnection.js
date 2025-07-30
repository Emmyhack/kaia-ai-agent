import { useState } from 'react';
import { WalletIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function WalletConnection({ 
  isConnected, 
  walletAddress, 
  balance, 
  onConnect, 
  onDisconnect 
}) {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet');
      return;
    }

    setIsConnecting(true);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        // Check if we're on the correct network (Kaia)
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        // Kaia testnet chainId is 0x3e9 (1001 in decimal)
        // Kaia mainnet chainId is 0x2019 (8217 in decimal)
        if (chainId !== '0x3e9' && chainId !== '0x2019') {
          try {
            // Try to switch to Kaia testnet
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x3e9' }],
            });
          } catch (switchError) {
            // If the network doesn't exist, add it
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: '0x3e9',
                      chainName: 'Kaia Testnet',
                      nativeCurrency: {
                        name: 'KAIA',
                        symbol: 'KAIA',
                        decimals: 18,
                      },
                      rpcUrls: ['https://public-en-kairos.node.kaia.io'],
                      blockExplorerUrls: ['https://kairos.kaiascope.com'],
                    },
                  ],
                });
              } catch (addError) {
                console.error('Failed to add Kaia network:', addError);
                alert('Failed to add Kaia network');
                return;
              }
            } else {
              console.error('Failed to switch to Kaia network:', switchError);
              alert('Please switch to Kaia network manually');
              return;
            }
          }
        }

        onConnect(accounts[0]);
        alert('Wallet connected successfully!');

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length === 0) {
            onDisconnect();
            alert('Wallet disconnected');
          } else {
            onConnect(accounts[0]);
          }
        });

        // Listen for chain changes
        window.ethereum.on('chainChanged', (chainId) => {
          // Reload the page when chain changes
          window.location.reload();
        });

      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    onDisconnect();
    alert('Wallet disconnected');
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(4);
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      alert('Address copied to clipboard');
    }
  };

  if (isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <WalletIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">
                  {formatAddress(walletAddress)}
                </span>
                <button
                  onClick={copyAddress}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Copy
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Balance: {formatBalance(balance)} KAIA
              </div>
            </div>
          </div>
          
          <button
            onClick={disconnectWallet}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            <span>Disconnect</span>
          </button>
        </div>
        
        <div className="mt-3 flex items-center justify-center">
          <div className="flex items-center space-x-1 text-xs text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Connected to Kaia Network</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <WalletIcon className="h-8 w-8 text-indigo-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Connect Your Wallet
      </h3>
      
      <p className="text-sm text-gray-600 mb-6">
        Connect your wallet to start using the Kaia AI Agent for blockchain operations.
      </p>
      
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isConnecting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </div>
        ) : (
          'Connect Wallet'
        )}
      </button>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Supports MetaMask and other Web3 wallets</p>
        <p>Make sure you're on the Kaia network</p>
      </div>
    </div>
  );
}