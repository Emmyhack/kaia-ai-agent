import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function ChatInterface({ walletAddress, isWalletConnected, onBalanceUpdate }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'agent',
      content: `Hi! I'm your Kaia AI Agent. I can help you with:

• **Token Swapping** - Swap between any tokens and KAIA
• **Balance Checking** - Check your token balances
• **Token Sending** - Send KAIA to other addresses  
• **Yield Farming** - Manage your yield farm positions
• **Trade Analysis** - Analyze your on-chain activities
• **Fiat Conversion** - Get info about fiat-to-KAIA conversion

${isWalletConnected ? `Your wallet is connected: ${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}` : 'Please connect your wallet to get started.'}

What would you like to do today?`,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestedQueries = [
    "Check my KAIA balance",
    "Swap 10 KAIA to USDT",
    "What are my yield farming positions?",
    "Analyze my recent trades",
    "How to convert USD to KAIA?",
    "Send 5 KAIA to 0x...",
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: inputMessage,
          userAddress: walletAddress,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const agentMessage = {
          id: Date.now() + 1,
          type: 'agent',
          content: data.response,
          timestamp: new Date(),
          toolCalls: data.toolCalls,
          steps: data.steps,
        };

        setMessages(prev => [...prev, agentMessage]);

        // Check if balance was updated and refresh
        const hasBalanceUpdate = data.toolCalls?.some(call => 
          ['checkBalance', 'sendTokens', 'swapTokens'].includes(call.toolName)
        );
        
        if (hasBalanceUpdate && walletAddress && onBalanceUpdate) {
          setTimeout(() => onBalanceUpdate(walletAddress), 1000);
        }

        // Show success alert for successful operations
        const hasSuccessfulOperation = data.toolCalls?.some(call => 
          call.result?.success && ['swapTokens', 'sendTokens'].includes(call.toolName)
        );
        
        if (hasSuccessfulOperation) {
          alert('Operation completed successfully!');
        }

      } else {
        throw new Error(data.error || 'Failed to get response from agent');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'agent',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
        isError: true,
      };

      setMessages(prev => [...prev, errorMessage]);
      alert('Failed to process your request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuery = (query) => {
    setInputMessage(query);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    setMessages([messages[0]]); // Keep the initial greeting message
    alert('Chat cleared');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">Kaia AI Agent</h2>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600">Online</span>
          </div>
        </div>
        
        <button
          onClick={clearChat}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isLoading && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Queries */}
      {messages.length === 1 && !isLoading && (
        <div className="px-4 py-2 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuery(query)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        {!isWalletConnected && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              💡 Connect your wallet to perform blockchain operations
            </p>
          </div>
        )}
        
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isWalletConnected ? "Ask me anything about Kaia blockchain..." : "Connect wallet to get started..."}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows="2"
              disabled={isLoading}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Powered by Google Gemini AI • Kaia Blockchain
        </div>
      </div>
    </div>
  );
}