import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';

// Dynamic imports to avoid SSR issues
const ChatInterface = dynamic(() => import('../components/ChatInterface'), { ssr: false });
const WalletConnection = dynamic(() => import('../components/WalletConnection'), { ssr: false });
const AgentStats = dynamic(() => import('../components/AgentStats'), { ssr: false });

// Add these at the top for demo addresses
const MOCK_ERC20_ADDRESS = process.env.NEXT_PUBLIC_MOCK_ERC20_ADDRESS || '0x8C82fa4dc47a9bf5034Bb38815c843B75EF76690';
const MOCK_YIELD_FARM_ADDRESS = process.env.NEXT_PUBLIC_MOCK_YIELD_FARM_ADDRESS || '0x27A0239D6F238c6AD5b5952d70e62081D1cc896e';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  const chatRef = useRef();
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    // Check if wallet is already connected
    checkWalletConnection();
    // Set loading to false after initial load
    setIsLoading(false);
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        console.log('Checking for existing wallet connection...');
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        console.log('Existing accounts:', accounts);
        
        if (accounts.length > 0) {
          console.log('Found existing connection:', accounts[0]);
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          await updateBalance(accounts[0]);
        } else {
          console.log('No existing wallet connection found');
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    } else {
      console.log('MetaMask not detected');
    }
  };

  const updateBalance = async (address) => {
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Check my KAIA balance`,
          userAddress: address,
        }),
      });

      const data = await response.json();
      if (data.success && data.toolCalls?.length > 0) {
        const balanceResult = data.toolCalls.find(call => call.toolName === 'checkBalance');
        if (balanceResult?.result?.balance) {
          setBalance(balanceResult.result.balance);
        }
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const handleWalletConnect = (address) => {
    console.log('Wallet connected with address:', address);
    setWalletAddress(address);
    setIsConnected(true);
    updateBalance(address);
  };

  const handleWalletDisconnect = () => {
    setWalletAddress('');
    setIsConnected(false);
    setBalance('0');
  };

  // Function to send a prompt to the chat bot programmatically
  const sendPrompt = (prompt) => {
    console.log('Sending prompt:', prompt);
    if (chatRef.current && chatRef.current.sendPrompt) {
      console.log('Calling chatRef.sendPrompt');
      chatRef.current.sendPrompt(prompt);
    } else {
      console.error('chatRef.current or sendPrompt not available');
    }
  };

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

        {/* Wallet Connection */}
        <div className="mb-8">
          <WalletConnection
            isConnected={isConnected}
            walletAddress={walletAddress}
            balance={balance}
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
          />
        </div>

        {/* Demo Instructions */}
        <div className="mb-8 max-w-2xl mx-auto bg-yellow-100/10 border border-yellow-300/20 rounded-xl p-6 text-yellow-200 text-center">
          <h2 className="text-xl font-bold mb-2 text-yellow-300">Demo Instructions</h2>
          <ul className="text-yellow-100 text-sm list-disc list-inside space-y-1">
            <li>This demo uses <b>mock contracts</b> on the Kaia testnet.</li>
            <li>All swaps, balances, and yield farm actions use <b>test tokens</b> and <b>mock addresses</b>.</li>
            <li>Use the Quick Actions or type prompts like <code>Swap 10 KAIA for MOCK token at {MOCK_ERC20_ADDRESS}</code>.</li>
            <li>The backend wallet performs all actions (not your personal wallet).</li>
            <li>For real DeFi, you would need a real DEX, liquidity, and user wallet signing.</li>
          </ul>
        </div>

        {/* Main Content */}
        {isLoading ? (
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
              />
              {aiError && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300">
                  <div className="font-semibold">AI Error:</div>
                  <div>{aiError}</div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Agent Stats */}
              {isConnected && (
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <AgentStats walletAddress={walletAddress} />
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                    onClick={() => sendPrompt(`Check my KAIA and MOCK token balance at ${MOCK_ERC20_ADDRESS}`)}
                  >
                    Check Balance
                  </button>
                  <button
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                    onClick={() => sendPrompt(`Swap 10 KAIA for MOCK token at ${MOCK_ERC20_ADDRESS}`)}
                  >
                    Swap Tokens
                  </button>
                  <button
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                    onClick={() => sendPrompt(`Deposit 5 KAIA to yield farm at ${MOCK_YIELD_FARM_ADDRESS}`)}
                  >
                    Yield Farming
                  </button>
                </div>
              </div>

              {/* Network Status */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Network Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Network</span>
                    <span className="text-green-400 font-semibold">Kaia Testnet</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Status</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">Connected</span>
                    </div>
                  </div>
                </div>
              </div>
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