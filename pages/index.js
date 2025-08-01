import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { Toaster, toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamic imports to prevent SSR issues
const AdvancedWalletConnection = dynamic(() => import('../components/AdvancedWalletConnection'), {
  ssr: false,
  loading: () => <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 animate-pulse">Loading advanced wallet connection...</div>
});

const ChatInterface = dynamic(() => import('../components/ChatInterface'), {
  ssr: false,
  loading: () => <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 animate-pulse">Loading chat interface...</div>
});

const AgentStats = dynamic(() => import('../components/AgentStats'), {
  ssr: false,
  loading: () => <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 animate-pulse">Loading agent stats...</div>
});

const NetworkStatus = dynamic(() => import('../components/NetworkStatus'), {
  ssr: false,
  loading: () => <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 animate-pulse">Loading network status...</div>
});

const YieldFarmingPanel = dynamic(() => import('../components/YieldFarmingPanel'), {
  ssr: false,
  loading: () => <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 animate-pulse">Loading yield farming data...</div>
});

const TradeAnalysisPanel = dynamic(() => import('../components/TradeAnalysisPanel'), {
  ssr: false,
  loading: () => <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 animate-pulse">Loading trade analysis data...</div>
});

const TokenPricePanel = dynamic(() => import('../components/TokenPricePanel'), {
  ssr: false,
  loading: () => <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 animate-pulse">Loading token price data...</div>
});

// Add these at the top for demo addresses
const MOCK_ERC20_ADDRESS = process.env.NEXT_PUBLIC_MOCK_ERC20_ADDRESS || '0x8C82fa4dc47a9bf5034Bb38815c843B75EF76690';
const MOCK_YIELD_FARM_ADDRESS = process.env.NEXT_PUBLIC_MOCK_YIELD_FARM_ADDRESS || '0x27A0239D6F238c6AD5b5952d70e62081D1cc896e';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('testnet');
  const [apiResponse, setApiResponse] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatRef = useRef();
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    // Check if wallet is already connected
    checkWalletConnection();
    
    // Set components as loaded after a short delay
    const timer = setTimeout(() => {
      setComponentsLoaded(true);
      setIsLoading(false);
      console.log('Components loaded, chatRef should be available');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Add a test effect to check if chatRef is available
  useEffect(() => {
    if (componentsLoaded && chatRef.current) {
      console.log('ChatInterface component loaded successfully');
      console.log('Available methods:', Object.keys(chatRef.current));
    } else if (componentsLoaded) {
      console.log('Components loaded but chatRef not available');
    }
  }, [componentsLoaded]);

  const checkWalletConnection = async () => {
    if (typeof window === 'undefined') return;
    
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          handleWalletConnect(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    } else if (window.kaia || window.kaiaWallet) {
      try {
        const kaiaProvider = window.kaia || window.kaiaWallet;
        const accounts = await kaiaProvider.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          handleWalletConnect(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking Kaia wallet connection:', error);
      }
    }
  };

  const updateBalance = async (address) => {
    try {
      // For demo purposes, set a mock balance
      const mockBalance = (Math.random() * 1000 + 100).toFixed(4);
      setBalance(mockBalance);
      
      // In a real scenario, this would call the actual balance checking API
      console.log('Updated balance for address:', address, 'to:', mockBalance);
    } catch (error) {
      console.error('Error updating balance:', error);
      // Set a fallback balance
      setBalance('0.0000');
    }
  };

  const handleWalletConnect = (result) => {
    console.log('Wallet connected with result:', result);
    setWalletAddress(result.address);
    setIsConnected(true);
    updateBalance(result.address);
  };

  const handleWalletDisconnect = () => {
    setWalletAddress('');
    setIsConnected(false);
    setBalance('0');
  };

  const handleNetworkChange = (network) => {
    console.log('Network changed to:', network);
    setSelectedNetwork(network);
  };

  const handleFarmSelect = (farm) => {
    console.log('Farm selected:', farm);
    const prompt = `Show detailed information for ${farm.name} yield farm on ${selectedNetwork}`;
    sendPrompt(prompt);
  };

  // Function to send a prompt to the chat bot programmatically
  const sendPrompt = (prompt) => {
    console.log('sendPrompt called with:', prompt);
    console.log('Selected network:', selectedNetwork);
    console.log('isConnected:', isConnected);
    console.log('walletAddress:', walletAddress);
    
    if (!isConnected) {
      console.log('Wallet not connected');
      // Show a toast notification if wallet is not connected
      toast.error('Please connect your wallet first');
      return;
    }
    
    // Set processing state
    setIsProcessing(true);
    setApiResponse(null);
    
    // Direct API call approach - more reliable
    console.log('Making direct API call');
    fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        userAddress: walletAddress,
        network: selectedNetwork,

      }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('API response:', data);
      setIsProcessing(false);
      
      if (data.success) {
        setApiResponse(data);
        // Show success message
        toast.success('Query processed successfully!');
      } else {
        console.error('API error:', data.error);
        setApiResponse({ error: data.error || 'Unknown error' });
        toast.error('Error: ' + (data.error || 'Unknown error'));
      }
    })
    .catch(error => {
      console.error('API call failed:', error);
      setIsProcessing(false);
      setApiResponse({ error: 'Network error: ' + error.message });
      toast.error('Network error: ' + error.message);
    });
  };

  // Network switching function
  const switchNetwork = async (targetNetwork) => {
    if (typeof window === 'undefined') {
      setSelectedNetwork(targetNetwork);
      return;
    }

    if (!isConnected) {
      setSelectedNetwork(targetNetwork);
      return;
    }

    try {
      const targetChainId = targetNetwork === 'testnet' ? '0x3e9' : '0x2019'; // 1001 for testnet, 8217 for mainnet
      const targetNetworkName = targetNetwork === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet';
      const targetRpcUrl = targetNetwork === 'testnet' 
        ? 'https://public-en-kairos.node.kaia.io' 
        : 'https://public-en.node.kaia.io';
      const targetExplorerUrl = 'https://kaiascope.com';

      // Try to switch network in the connected wallet
      if (window.ethereum) {
        try {
          // First try to switch to the target network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
          
          setSelectedNetwork(targetNetwork);
          toast.success(`Switched to ${targetNetworkName}`);
        } catch (switchError) {
          if (switchError.code === 4902) {
            // Network not added, add it
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: targetChainId,
                  chainName: targetNetworkName,
                  nativeCurrency: { 
                    name: 'KAIA', 
                    symbol: 'KAIA', 
                    decimals: 18 
                  },
                  rpcUrls: [targetRpcUrl],
                  blockExplorerUrls: [targetExplorerUrl],
                }],
              });
              
              setSelectedNetwork(targetNetwork);
              toast.success(`Added and switched to ${targetNetworkName}`);
            } catch (addError) {
              console.error('Failed to add network:', addError);
              toast.error(`Failed to add ${targetNetworkName}. Please add it manually.`);
              // Still update the UI even if wallet network switch fails
              setSelectedNetwork(targetNetwork);
            }
          } else {
            console.error('Failed to switch network:', switchError);
            toast.error(`Failed to switch to ${targetNetworkName}. Please switch manually.`);
            // Still update the UI even if wallet network switch fails
            setSelectedNetwork(targetNetwork);
          }
        }
      } else if (window.kaia || window.kaiaWallet) {
        // Handle Kaia Wallet network switching
        const kaiaProvider = window.kaia || window.kaiaWallet;
        try {
          await kaiaProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
          
          setSelectedNetwork(targetNetwork);
          toast.success(`Switched to ${targetNetworkName}`);
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await kaiaProvider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: targetChainId,
                  chainName: targetNetworkName,
                  nativeCurrency: { 
                    name: 'KAIA', 
                    symbol: 'KAIA', 
                    decimals: 18 
                  },
                  rpcUrls: [targetRpcUrl],
                  blockExplorerUrls: [targetExplorerUrl],
                }],
              });
              
              setSelectedNetwork(targetNetwork);
              toast.success(`Added and switched to ${targetNetworkName}`);
            } catch (addError) {
              console.error('Failed to add network to Kaia Wallet:', addError);
              toast.error(`Failed to add ${targetNetworkName} to Kaia Wallet. Please add it manually.`);
              setSelectedNetwork(targetNetwork);
            }
          } else {
            console.error('Failed to switch network in Kaia Wallet:', switchError);
            toast.error(`Failed to switch to ${targetNetworkName} in Kaia Wallet. Please switch manually.`);
            setSelectedNetwork(targetNetwork);
          }
        }
      } else {
        // No wallet connected, just update the UI
        setSelectedNetwork(targetNetwork);
        toast.success(`Selected ${targetNetworkName}`);
      }
    } catch (error) {
      console.error('Network switching error:', error);
      toast.error('Failed to switch network. Please try again.');
    }
  };

  // Check current wallet network and sync with selected network
  const checkAndSyncNetwork = async () => {
    if (typeof window === 'undefined' || !isConnected) return;

    try {
      let currentChainId;
      if (window.ethereum) {
        currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      } else if (window.kaia || window.kaiaWallet) {
        const kaiaProvider = window.kaia || window.kaiaWallet;
        currentChainId = await kaiaProvider.request({ method: 'eth_chainId' });
      } else {
        return;
      }

      // Map chain IDs to networks
      const chainIdToNetwork = {
        '0x3e9': 'testnet',    // 1001
        '0x2019': 'mainnet'    // 8217
      };

      const currentNetwork = chainIdToNetwork[currentChainId];
      if (currentNetwork && currentNetwork !== selectedNetwork) {
        setSelectedNetwork(currentNetwork);
        toast.success(`Synced with wallet network: ${currentNetwork === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet'}`);
      }
    } catch (error) {
      console.error('Failed to check wallet network:', error);
    }
  };

  // Listen for network changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleChainChanged = (chainId) => {
      const chainIdToNetwork = {
        '0x3e9': 'testnet',    // 1001
        '0x2019': 'mainnet'    // 8217
      };
      
      const newNetwork = chainIdToNetwork[chainId];
      if (newNetwork && newNetwork !== selectedNetwork) {
        setSelectedNetwork(newNetwork);
        toast.success(`Wallet switched to ${newNetwork === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet'}`);
      }
    };

    const cleanupListeners = () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
      if (window.kaia || window.kaiaWallet) {
        const kaiaProvider = window.kaia || window.kaiaWallet;
        kaiaProvider.removeListener('chainChanged', handleChainChanged);
        kaiaProvider.removeListener('accountsChanged', handleAccountsChanged);
      }
    };

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        handleWalletDisconnect();
      } else if (accounts[0] !== walletAddress) {
        handleWalletConnect(accounts[0]);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    if (window.kaia || window.kaiaWallet) {
      const kaiaProvider = window.kaia || window.kaiaWallet;
      kaiaProvider.on('chainChanged', handleChainChanged);
      kaiaProvider.on('accountsChanged', handleAccountsChanged);
    }

    return cleanupListeners;
  }, [selectedNetwork, walletAddress]);

  // Check network when wallet connects
  useEffect(() => {
    if (isConnected) {
      checkAndSyncNetwork();
    }
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
              <Head>
          <title>Kaia AI Agent - Intelligent Blockchain Assistant</title>
          <meta name="description" content="AI-powered blockchain agent for Kaia network with advanced DeFi capabilities" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          <meta name="cache-control" content="no-cache, no-store, must-revalidate" />
          <meta name="pragma" content="no-cache" />
          <meta name="expires" content="0" />
        </Head>

      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #475569',
          },
        }}
      />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-bounce"></div>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl">
            <div className="text-3xl">🤖</div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            Kaia Assistant v1.0
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your intelligent blockchain assistant for the Kaia network. 
            <span className="text-purple-400 font-semibold"> Swap tokens</span>, 
            <span className="text-blue-400 font-semibold"> check balances</span>, 
            <span className="text-green-400 font-semibold"> analyze yields</span>, and 
            <span className="text-pink-400 font-semibold"> manage DeFi activities</span> 
            with natural language commands.
          </p>
        </div>

        {/* Advanced Wallet Connection */}
        <div className="mb-8 max-w-md mx-auto">
          <AdvancedWalletConnection
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
            onNetworkChange={handleNetworkChange}
          />
        </div>

        {/* Network Selector */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">Select Network</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => switchNetwork('testnet')}
                className={`flex-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedNetwork === 'testnet'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                🧪 Testnet
              </button>
              <button
                onClick={() => switchNetwork('mainnet')}
                className={`flex-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedNetwork === 'mainnet'
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                🚀 Mainnet
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-2 text-center">
              Currently selected: <span className="text-blue-400 font-semibold">{selectedNetwork === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet'}</span>
            </p>
          </div>
        </div>

        {/* Demo Instructions */}
        <div className="mb-8 max-w-2xl mx-auto bg-yellow-100/10 border border-yellow-300/20 rounded-xl p-6 text-yellow-200 text-center">
          <h2 className="text-xl font-bold mb-2 text-yellow-300">Demo Instructions</h2>
          <ul className="text-yellow-100 text-sm list-disc list-inside space-y-1">
            <li>This demo uses <b>real blockchain queries</b> for balances and network status.</li>
            <li>Select between <b>Testnet</b> and <b>Mainnet</b> to query different networks.</li>
            <li>Use the Quick Actions or type prompts like <code>Check my KAIA balance on testnet</code>.</li>
            <li>Real blockchain data is displayed with network information and data source.</li>
            <li>Complex operations (swaps, farming) use mock responses for demo purposes.</li>
          </ul>
        </div>

        {/* Main Content */}
        {isLoading || !componentsLoaded ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-lg text-gray-300">Loading AI Agent...</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <ChatInterface
                ref={chatRef}
                walletAddress={walletAddress}
                isWalletConnected={isConnected}
                onBalanceUpdate={updateBalance}
                onAiError={setAiError}
                selectedNetwork={selectedNetwork}
              />
              {aiError && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300">
                  <div className="font-semibold">AI Error:</div>
                  <div>{aiError}</div>
                </div>
              )}
              
              {/* Trade Analysis Panel */}
              <div className="mt-6">
                <TradeAnalysisPanel selectedNetwork={selectedNetwork} />
              </div>
              
              {/* Token Prices Panel */}
              <div className="mt-6">
                <TokenPricePanel selectedNetwork={selectedNetwork} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Agent Stats */}
              {isConnected && (
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <AgentStats walletAddress={walletAddress} />
                </div>
              )}

              {/* Yield Farming Panel */}
              <YieldFarmingPanel 
                selectedNetwork={selectedNetwork}
                onFarmSelect={handleFarmSelect}
              />

              {/* API Response Display */}
              {apiResponse && (
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Query Result
                    {apiResponse.isMock && (
                      <span className="ml-2 text-sm bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                        Demo Mode
                      </span>
                    )}
                  </h3>
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    {apiResponse.error ? (
                      <div className="text-red-400">
                        <div className="font-semibold">Error:</div>
                        <div className="text-sm">{apiResponse.error}</div>
                      </div>
                    ) : (
                      <div className="text-green-400">
                        <div className="font-semibold">Success:</div>
                        <div className="text-sm whitespace-pre-wrap">{apiResponse.response}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Network Status */}
              <NetworkStatus selectedNetwork={selectedNetwork} />
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Powerful DeFi Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🔄</div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Token Swapping</h3>
              <p className="text-gray-300 leading-relaxed">
                Swap between any tokens and KAIA with intelligent routing, best price discovery, and minimal slippage.
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">💰</div>
              <h3 className="text-xl font-semibold text-white mb-3">Real-time Balances</h3>
              <p className="text-gray-300 leading-relaxed">
                Check your KAIA and token balances across multiple addresses with instant updates and detailed analytics.
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-green-500/50 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📤</div>
              <h3 className="text-xl font-semibold text-white mb-3">Secure Token Transfers</h3>
              <p className="text-gray-300 leading-relaxed">
                Send KAIA tokens to any address with enhanced security, transaction monitoring, and instant confirmations.
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-yellow-500/50 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🌾</div>
              <h3 className="text-xl font-semibold text-white mb-3">Advanced Yield Farming</h3>
              <p className="text-gray-300 leading-relaxed">
                Deposit tokens to yield farms, track earnings, and optimize your DeFi strategies with AI-powered insights.
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-pink-500/50 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📊</div>
              <h3 className="text-xl font-semibold text-white mb-3">Trade Analytics</h3>
              <p className="text-gray-300 leading-relaxed">
                Analyze your on-chain trading activities with detailed charts, performance metrics, and personalized insights.
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">💱</div>
              <h3 className="text-xl font-semibold text-white mb-3">Fiat Integration</h3>
              <p className="text-gray-300 leading-relaxed">
                Get real-time exchange rates and seamless fiat-to-crypto conversion with trusted on-ramp services.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <p className="text-gray-300 mb-4">
              Built with ❤️ for the Kaia blockchain ecosystem
            </p>
            <p className="text-gray-400 text-sm">
              Powered by AI and smart contracts for seamless DeFi interactions
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}