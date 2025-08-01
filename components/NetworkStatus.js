import { useState, useEffect } from 'react';
import { Wifi, WifiOff, CheckCircle, XCircle } from 'lucide-react';

const NetworkStatus = ({ selectedNetwork }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [networkStatus, setNetworkStatus] = useState('checking');
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        setNetworkStatus('checking');
        
        // Test network connectivity
        const rpcUrl = selectedNetwork === 'testnet' 
          ? 'https://public-en-kairos.node.kaia.io'
          : 'https://public-en.node.kaia.io';
        
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1
          }),
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        if (response.ok) {
          setNetworkStatus('connected');
        } else {
          setNetworkStatus('error');
        }
      } catch (error) {
        console.error('Network status check failed:', error);
        setNetworkStatus('error');
      } finally {
        setLastChecked(new Date());
      }
    };

    // Check immediately
    checkNetworkStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkNetworkStatus, 30000);
    
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [selectedNetwork]);

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="w-4 h-4 text-red-400" />;
    }
    
    switch (networkStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'checking':
        return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    
    switch (networkStatus) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Connection Error';
      case 'checking':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-400';
    
    switch (networkStatus) {
      case 'connected':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'checking':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-3">Network Status</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Status</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Network</span>
          <span className={`font-semibold ${selectedNetwork === 'testnet' ? 'text-blue-400' : 'text-green-400'}`}>
            {selectedNetwork === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Chain ID</span>
          <span className="text-gray-300 text-sm font-mono">
            {selectedNetwork === 'testnet' ? '1001 (0x3e9)' : '8217 (0x2019)'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-300">RPC URL</span>
          <span className="text-gray-300 text-xs font-mono truncate max-w-32">
            {selectedNetwork === 'testnet' 
              ? 'public-en-kairos.node.kaia.io' 
              : 'public-en.node.kaia.io'}
          </span>
        </div>
        
        {lastChecked && (
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Last Check</span>
            <span className="text-gray-400 text-xs">
              {lastChecked.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkStatus;