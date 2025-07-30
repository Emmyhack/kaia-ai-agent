import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { SendIcon, BotIcon, UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatInterface = forwardRef(function ChatInterface({ walletAddress, isWalletConnected, onBalanceUpdate, onAiError, selectedNetwork = 'testnet' }, ref) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const messagesEndRef = useRef(null);

  useImperativeHandle(ref, () => ({
    sendPrompt: (prompt, network = 'testnet') => {
      console.log('ChatInterface.sendPrompt called with:', prompt, 'network:', network);
      setInputValue(prompt);
      handleSubmit({ preventDefault: () => {} }, prompt, network);
    },
  }));

  // Add test mode toggle
  useEffect(() => {
    // Enable test mode if URL has test parameter
    if (typeof window !== 'undefined' && window.location.search.includes('test=true')) {
      setTestMode(true);
      console.log('Test mode enabled');
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e, overridePrompt, network) => {
    e.preventDefault();
    const prompt = overridePrompt !== undefined ? overridePrompt : inputValue;
    if (!prompt.trim()) return;
    
    // Allow testing without wallet connection in test mode
    if (!isWalletConnected && !testMode) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    console.log('Submitting prompt:', prompt);
    console.log('Wallet connected:', isWalletConnected);
    console.log('Wallet address:', walletAddress);
    console.log('Test mode:', testMode);
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    if (onAiError) onAiError(null);
    
    try {
      console.log('Making API request to /api/agent...');
      const apiEndpoint = testMode ? '/api/test-chat' : '/api/agent';
      console.log('Using API endpoint:', apiEndpoint);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          userAddress: walletAddress,
          network: network, // Pass the network parameter
        }),
      });
      
      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: data.response,
          toolCalls: data.toolCalls || [],
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiMessage]);
        console.log('AI message added successfully');
        
        // Update balance if it's a balance-related query
        if (prompt.toLowerCase().includes('balance') && onBalanceUpdate) {
          onBalanceUpdate(walletAddress);
        }
      } else {
        console.error('API returned error:', data.error, data.details);
        const errorMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: data.error || 'Sorry, I encountered an error processing your request. Please try again.',
          isError: true,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, errorMessage]);
        if (onAiError) onAiError(data.details || data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Network error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I encountered a network error. Please check your connection and try again.',
        isError: true,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      if (onAiError) onAiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderToolCall = (toolCall) => {
    const { toolName, result } = toolCall;
    
    if (!result || !result.success) {
      return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-2">
          <div className="text-red-400 text-sm font-medium">Tool Error</div>
          <div className="text-red-300 text-xs">{result?.error || 'Unknown error'}</div>
        </div>
      );
    }

    switch (toolName) {
      case 'checkBalance':
        return (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mt-2">
            <div className="text-green-400 text-sm font-medium">Balance Checked</div>
            <div className="text-green-300 text-sm">
              Balance: {result.balance} {result.tokenName || 'KAIA'}
            </div>
          </div>
        );
      
      case 'swapTokens':
        return (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-2">
            <div className="text-blue-400 text-sm font-medium">Swap Executed</div>
            <div className="text-blue-300 text-sm">
              Transaction: {result.transactionHash?.slice(0, 10)}...
            </div>
          </div>
        );
      
      case 'sendTokens':
        return (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mt-2">
            <div className="text-purple-400 text-sm font-medium">Tokens Sent</div>
            <div className="text-purple-300 text-sm">
              Transaction: {result.transactionHash?.slice(0, 10)}...
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-3 mt-2">
            <div className="text-gray-400 text-sm font-medium">{toolName}</div>
            <div className="text-gray-300 text-sm">Executed successfully</div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <BotIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              AI Assistant {testMode && <span className="text-yellow-400 text-sm">(TEST MODE)</span>}
            </h3>
            <p className="text-sm text-gray-300">
              {isWalletConnected ? 'Connected to Kaia Network' : 'Connect wallet to start'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BotIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Welcome to Kaia AI Agent</h3>
            <p className="text-gray-300 mb-6">
              I can help you with blockchain operations on the Kaia network. Try asking me to:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-blue-400 font-medium">Check Balance</div>
                <div className="text-gray-400">"What's my KAIA balance?"</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-purple-400 font-medium">Swap Tokens</div>
                <div className="text-gray-400">"Swap 10 KAIA for USDC"</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-green-400 font-medium">Send Tokens</div>
                <div className="text-gray-400">"Send 5 KAIA to 0x..."</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-yellow-400 font-medium">Yield Farming</div>
                <div className="text-gray-400">"Show my yield farms"</div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : message.isError
                    ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                    : 'bg-white/10 border border-white/20 text-white'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {message.type === 'user' ? (
                    <UserIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <BotIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.toolCalls.map((toolCall, index) => (
                          <div key={index}>
                            {renderToolCall(toolCall)}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-xs opacity-60 mt-2">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
              <div className="flex items-center space-x-3">
                <BotIcon className="w-5 h-5 text-white" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/10">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isWalletConnected ? "Ask me anything about Kaia blockchain..." : "Connect wallet to start chatting"}
            disabled={!isWalletConnected || isLoading}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || !isWalletConnected || isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
});

export default ChatInterface;