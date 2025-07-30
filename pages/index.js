import { useState, useEffect } from 'react';
import Head from 'next/head';
import ChatInterface from '../components/ChatInterface';
import WalletConnection from '../components/WalletConnection';
import AgentStats from '../components/AgentStats';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    // Check if wallet is already connected
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          await updateBalance(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
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
    setWalletAddress(address);
    setIsConnected(true);
    updateBalance(address);
  };

  const handleWalletDisconnect = () => {
    setWalletAddress('');
    setIsConnected(false);
    setBalance('0');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>Kaia AI Agent - Blockchain Assistant</title>
        <meta name="description" content="AI-powered blockchain agent for Kaia network" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🤖 Kaia AI Agent
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your intelligent blockchain assistant for Kaia network. Swap tokens, check balances, 
            analyze yields, and manage your DeFi activities with natural language commands.
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="mb-6">
          <WalletConnection
            isConnected={isConnected}
            walletAddress={walletAddress}
            balance={balance}
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
          />
        </div>

        {/* Agent Stats */}
        {isConnected && (
          <div className="mb-6">
            <AgentStats walletAddress={walletAddress} />
          </div>
        )}

        {/* Main Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <ChatInterface 
            walletAddress={walletAddress}
            isWalletConnected={isConnected}
            onBalanceUpdate={updateBalance}
          />
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-3">🔄</div>
            <h3 className="text-lg font-semibold mb-2">Token Swapping</h3>
            <p className="text-gray-600 text-sm">
              Swap between any tokens and KAIA with intelligent routing and best price discovery.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-3">💰</div>
            <h3 className="text-lg font-semibold mb-2">Balance Checking</h3>
            <p className="text-gray-600 text-sm">
              Check your KAIA and token balances across multiple addresses instantly.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-3">📤</div>
            <h3 className="text-lg font-semibold mb-2">Token Sending</h3>
            <p className="text-gray-600 text-sm">
              Send KAIA tokens to any address with simple natural language commands.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-3">🌾</div>
            <h3 className="text-lg font-semibold mb-2">Yield Farming</h3>
            <p className="text-gray-600 text-sm">
              Deposit tokens to yield farms and track your earnings automatically.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2">Trade Analysis</h3>
            <p className="text-gray-600 text-sm">
              Analyze your on-chain trading activities and get personalized insights.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-3">💱</div>
            <h3 className="text-lg font-semibold mb-2">Fiat Conversion</h3>
            <p className="text-gray-600 text-sm">
              Get information about converting fiat currency to KAIA tokens.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>
            Built with ❤️ for the Kaia blockchain ecosystem. 
            <br />
            Powered by AI and smart contracts for seamless DeFi interactions.
          </p>
        </footer>
      </main>
    </div>
  );
}