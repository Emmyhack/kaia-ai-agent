import { SparklesIcon } from '@heroicons/react/24/outline';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-xs lg:max-w-md">
        <div className="flex items-start space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <div className="bg-gray-100 rounded-lg px-4 py-3 shadow-sm">
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600">AI is thinking</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}