import { ethers } from 'ethers';

// Kaia Chain Network Configuration
const KAIA_NETWORKS = {
  testnet: {
    chainId: '0x3e9', // 1001
    chainName: 'Kaia Testnet',
    nativeCurrency: {
      name: 'KAIA',
      symbol: 'KAIA',
      decimals: 18
    },
    rpcUrls: ['https://public-en-kairos.node.kaia.io'],
    blockExplorerUrls: ['https://kaiascope.com']
  },
  mainnet: {
    chainId: '0x2019', // 8217
    chainName: 'Kaia Mainnet',
    nativeCurrency: {
      name: 'KAIA',
      symbol: 'KAIA',
      decimals: 18
    },
    rpcUrls: ['https://public-en.node.kaia.io'],
    blockExplorerUrls: ['https://kaiascope.com']
  }
};

class WalletConnector {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.chainId = null;
    this.walletType = null;
    this.isConnected = false;
  }

  // Get available wallet types
  getAvailableWallets() {
    const wallets = [];

    // MetaMask
    if (typeof window !== 'undefined' && window.ethereum) {
      wallets.push({
        name: 'MetaMask',
        id: 'metamask',
        icon: '🦊',
        description: 'MetaMask Browser Extension',
        isAvailable: true
      });
    }

    // Kaia Wallet
    if (typeof window !== 'undefined' && (window.kaia || window.kaiaWallet)) {
      wallets.push({
        name: 'Kaia Wallet',
        id: 'kaia',
        icon: '🔗',
        description: 'Official Kaia Wallet',
        isAvailable: true
      });
    }

    // WalletConnect
    wallets.push({
      name: 'WalletConnect',
      id: 'walletconnect',
      icon: '🔌',
      description: 'Mobile Wallet Connection',
      isAvailable: true
    });

    // Coinbase Wallet
    if (typeof window !== 'undefined' && window.coinbaseWalletExtension) {
      wallets.push({
        name: 'Coinbase Wallet',
        id: 'coinbase',
        icon: '🪙',
        description: 'Coinbase Wallet Extension',
        isAvailable: true
      });
    }

    // Trust Wallet
    if (typeof window !== 'undefined' && window.trustwallet) {
      wallets.push({
        name: 'Trust Wallet',
        id: 'trustwallet',
        icon: '🛡️',
        description: 'Trust Wallet Extension',
        isAvailable: true
      });
    }

    // Binance Wallet
    if (typeof window !== 'undefined' && window.BinanceChain) {
      wallets.push({
        name: 'Binance Wallet',
        id: 'binance',
        icon: '📊',
        description: 'Binance Chain Wallet',
        isAvailable: true
      });
    }

    return wallets;
  }

  // Connect to MetaMask
  async connectMetaMask() {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not found. Please install MetaMask extension.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      // Get chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.address = account;
      this.chainId = chainId;
      this.walletType = 'metamask';
      this.isConnected = true;

      // Set up event listeners
      this.setupEventListeners(window.ethereum);

      return {
        success: true,
        address: account,
        chainId: chainId,
        walletType: 'metamask'
      };
    } catch (error) {
      console.error('MetaMask connection failed:', error);
      throw error;
    }
  }

  // Connect to Kaia Wallet
  async connectKaiaWallet() {
    if (typeof window === 'undefined' || (!window.kaia && !window.kaiaWallet)) {
      throw new Error('Kaia Wallet not found. Please install Kaia Wallet extension.');
    }

    try {
      const kaiaProvider = window.kaia || window.kaiaWallet;
      
      // Request account access
      const accounts = await kaiaProvider.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      // Get chain ID
      const chainId = await kaiaProvider.request({ method: 'eth_chainId' });

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(kaiaProvider);
      this.signer = await this.provider.getSigner();
      this.address = account;
      this.chainId = chainId;
      this.walletType = 'kaia';
      this.isConnected = true;

      // Set up event listeners
      this.setupEventListeners(kaiaProvider);

      return {
        success: true,
        address: account,
        chainId: chainId,
        walletType: 'kaia'
      };
    } catch (error) {
      console.error('Kaia Wallet connection failed:', error);
      throw error;
    }
  }

  // Connect to Coinbase Wallet
  async connectCoinbaseWallet() {
    if (typeof window === 'undefined' || !window.coinbaseWalletExtension) {
      throw new Error('Coinbase Wallet not found. Please install Coinbase Wallet extension.');
    }

    try {
      const coinbaseProvider = window.coinbaseWalletExtension;
      
      // Request account access
      const accounts = await coinbaseProvider.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      // Get chain ID
      const chainId = await coinbaseProvider.request({ method: 'eth_chainId' });

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(coinbaseProvider);
      this.signer = await this.provider.getSigner();
      this.address = account;
      this.chainId = chainId;
      this.walletType = 'coinbase';
      this.isConnected = true;

      // Set up event listeners
      this.setupEventListeners(coinbaseProvider);

      return {
        success: true,
        address: account,
        chainId: chainId,
        walletType: 'coinbase'
      };
    } catch (error) {
      console.error('Coinbase Wallet connection failed:', error);
      throw error;
    }
  }

  // Connect to Trust Wallet
  async connectTrustWallet() {
    if (typeof window === 'undefined' || !window.trustwallet) {
      throw new Error('Trust Wallet not found. Please install Trust Wallet extension.');
    }

    try {
      const trustProvider = window.trustwallet;
      
      // Request account access
      const accounts = await trustProvider.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      // Get chain ID
      const chainId = await trustProvider.request({ method: 'eth_chainId' });

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(trustProvider);
      this.signer = await this.provider.getSigner();
      this.address = account;
      this.chainId = chainId;
      this.walletType = 'trustwallet';
      this.isConnected = true;

      // Set up event listeners
      this.setupEventListeners(trustProvider);

      return {
        success: true,
        address: account,
        chainId: chainId,
        walletType: 'trustwallet'
      };
    } catch (error) {
      console.error('Trust Wallet connection failed:', error);
      throw error;
    }
  }

  // Connect to Binance Wallet
  async connectBinanceWallet() {
    if (typeof window === 'undefined' || !window.BinanceChain) {
      throw new Error('Binance Wallet not found. Please install Binance Wallet extension.');
    }

    try {
      const binanceProvider = window.BinanceChain;
      
      // Request account access
      const accounts = await binanceProvider.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      // Get chain ID
      const chainId = await binanceProvider.request({ method: 'eth_chainId' });

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(binanceProvider);
      this.signer = await this.provider.getSigner();
      this.address = account;
      this.chainId = chainId;
      this.walletType = 'binance';
      this.isConnected = true;

      // Set up event listeners
      this.setupEventListeners(binanceProvider);

      return {
        success: true,
        address: account,
        chainId: chainId,
        walletType: 'binance'
      };
    } catch (error) {
      console.error('Binance Wallet connection failed:', error);
      throw error;
    }
  }

  // Generic connect method
  async connect(walletType) {
    switch (walletType) {
      case 'metamask':
        return await this.connectMetaMask();
      case 'kaia':
        return await this.connectKaiaWallet();
      case 'coinbase':
        return await this.connectCoinbaseWallet();
      case 'trustwallet':
        return await this.connectTrustWallet();
      case 'binance':
        return await this.connectBinanceWallet();
      default:
        throw new Error(`Unsupported wallet type: ${walletType}`);
    }
  }

  // Disconnect wallet
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.chainId = null;
    this.walletType = null;
    this.isConnected = false;
  }

  // Switch network
  async switchNetwork(network) {
    if (!this.isConnected) {
      throw new Error('Wallet not connected');
    }

    const targetNetwork = KAIA_NETWORKS[network];
    if (!targetNetwork) {
      throw new Error(`Unsupported network: ${network}`);
    }

    try {
      // Try to switch to the target network
      await this.provider.send('wallet_switchEthereumChain', [
        { chainId: targetNetwork.chainId }
      ]);

      this.chainId = targetNetwork.chainId;
      return {
        success: true,
        chainId: targetNetwork.chainId,
        network: network
      };
    } catch (switchError) {
      if (switchError.code === 4902) {
        // Network not added, add it
        try {
          await this.provider.send('wallet_addEthereumChain', [targetNetwork]);
          this.chainId = targetNetwork.chainId;
          return {
            success: true,
            chainId: targetNetwork.chainId,
            network: network
          };
        } catch (addError) {
          throw new Error(`Failed to add network: ${addError.message}`);
        }
      } else {
        throw new Error(`Failed to switch network: ${switchError.message}`);
      }
    }
  }

  // Get current network
  getCurrentNetwork() {
    if (!this.chainId) return null;

    for (const [network, config] of Object.entries(KAIA_NETWORKS)) {
      if (config.chainId === this.chainId) {
        return network;
      }
    }
    return null;
  }

  // Set up event listeners
  setupEventListeners(provider) {
    if (!provider) return;

    // Handle account changes
    provider.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.address = accounts[0];
      }
    });

    // Handle chain changes
    provider.on('chainChanged', (chainId) => {
      this.chainId = chainId;
    });

    // Handle disconnect
    provider.on('disconnect', () => {
      this.disconnect();
    });
  }

  // Get wallet info
  getWalletInfo() {
    return {
      isConnected: this.isConnected,
      address: this.address,
      chainId: this.chainId,
      walletType: this.walletType,
      network: this.getCurrentNetwork()
    };
  }

  // Get provider and signer
  getProvider() {
    return this.provider;
  }

  getSigner() {
    return this.signer;
  }
}

export default WalletConnector;