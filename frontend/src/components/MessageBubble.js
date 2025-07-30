import { useState } from 'react';
import { UserIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

export default function MessageBubble({ message }) {
  const [showDetails, setShowDetails] = useState(false);
  
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatContent = (content) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br />');
  };

  const renderToolCallResult = (toolCall) => {
    const { toolName, args, result } = toolCall;
    
    return (
      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              {toolName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </span>
            {result?.success ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
            ) : (
              <XCircleIcon className="h-4 w-4 text-red-500" />
            )}
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
          >
            <span>{showDetails ? 'Hide' : 'Show'} Details</span>
            {showDetails ? (
              <ChevronUpIcon className="h-3 w-3" />
            ) : (
              <ChevronDownIcon className="h-3 w-3" />
            )}
          </button>
        </div>
        
        {result && (
          <div className="text-sm">
            {result.success ? (
              <div className="text-green-700">
                {result.transactionHash && (
                  <div>
                    <span className="font-medium">Transaction:</span>{' '}
                    <code className="bg-green-100 px-1 rounded text-xs">
                      {result.transactionHash.slice(0, 10)}...
                    </code>
                  </div>
                )}
                {result.balance && (
                  <div>
                    <span className="font-medium">Balance:</span> {result.balance} {result.symbol || 'KAIA'}
                  </div>
                )}
                {result.amountOut && (
                  <div>
                    <span className="font-medium">Quote:</span> {result.amountOut} tokens
                  </div>
                )}
                {result.totalYieldValue && (
                  <div>
                    <span className="font-medium">Total Yield:</span> {result.totalYieldValue} KAIA
                  </div>
                )}
              </div>
            ) : (
              <div className="text-red-700">
                <span className="font-medium">Error:</span> {result.error}
              </div>
            )}
          </div>
        )}
        
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-300">
            <div className="text-xs text-gray-600">
              <div className="mb-2">
                <span className="font-medium">Parameters:</span>
                <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                  {JSON.stringify(args, null, 2)}
                </pre>
              </div>
              {result && (
                <div>
                  <span className="font-medium">Result:</span>
                  <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (message.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-xs lg:max-w-md">
          <div className="flex items-end space-x-2">
            <div className="bg-indigo-600 text-white rounded-lg px-4 py-2 shadow-sm">
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500 text-right mt-1 mr-10">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-xs lg:max-w-2xl">
        <div className="flex items-start space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <div className={`rounded-lg px-4 py-2 shadow-sm ${
            message.isError 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-gray-100'
          }`}>
            <div 
              className={`text-sm whitespace-pre-wrap ${
                message.isError ? 'text-red-800' : 'text-gray-800'
              }`}
              dangerouslySetInnerHTML={{ 
                __html: formatContent(message.content) 
              }}
            />
            
            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.toolCalls.map((toolCall, index) => (
                  <div key={index}>
                    {renderToolCallResult(toolCall)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1 ml-10">
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
}