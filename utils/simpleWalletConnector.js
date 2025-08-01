import { ethers } from 'ethers';

// Kaia Chain network configurations
const KAIA_NETWORKS = {
  testnet: {
    chainId: '0x3e9', // 1001 in hex
    chainName: 'Kaia Testnet',
    nativeCurrency: {
      name: 'KAIA',
      symbol: 'KAIA',
      decimals: 18
    },
    rpcUrls: ['https://public-en-kairos.node.kaia.io'],
    blockExplorerUrls: ['https://testnet.kaiascan.com']
  },
  mainnet: {
    chainId: '0x2019', // 8217 in hex
    chainName: 'Kaia Mainnet',
    nativeCurrency: {
      name: 'KAIA',
      symbol: 'KAIA',
      decimals: 18
    },
    rpcUrls: ['https://public-en.node.kaia.io'],
    blockExplorerUrls: ['https://kaiascan.com']
  }
};

class SimpleWalletConnector {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.chainId = null;
    this.isConnected = false;
    this.walletType = null;
    this.listeners = new Map();
  }

  // Get all available wallet types
  getAvailableWallets() {
    const wallets = [];

    // MetaMask
    if (typeof window !== 'undefined' && window.ethereum) {
      wallets.push({
        id: 'metamask',
        name: 'MetaMask',
        icon: '🦊',
        description: 'The most popular Web3 wallet',
        isAvailable: true
      });
    }

    // Kaia Wallet
    if (typeof window !== 'undefined' && (window.kaia || window.kaiaWallet)) {
      wallets.push({
        id: 'kaia',
        name: 'Kaia Wallet',
        icon: '⚡',
        description: 'Native Kaia Chain wallet',
        isAvailable: true
      });
    }

    // Coinbase Wallet
    if (typeof window !== 'undefined' && window.coinbaseWalletExtension) {
      wallets.push({
        id: 'coinbase',
        name: 'Coinbase Wallet',
        icon: '🪙',
        description: 'Coinbase exchange wallet',
        isAvailable: true
      });
    }

    // Trust Wallet
    if (typeof window !== 'undefined' && window.trustwallet) {
      wallets.push({
        id: 'trust',
        name: 'Trust Wallet',
        icon: '🛡️',
        description: 'Binance Trust Wallet',
        isAvailable: true
      });
    }

    // Binance Wallet
    if (typeof window !== 'undefined' && window.BinanceChain) {
      wallets.push({
        id: 'binance',
        name: 'Binance Wallet',
        icon: '🟡',
        description: 'Binance Chain wallet',
        isAvailable: true
      });
    }

    // WalletConnect (placeholder)
    wallets.push({
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect any wallet via QR code',
      isAvailable: true
    });

    return wallets;
  }

  // Connect to MetaMask
  async connectMetaMask() {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = network.chainId.toString();

      this.setupWalletState('metamask', provider, signer, address, chainId);
      this.setupEventListeners(provider, 'metamask');

      return {
        success: true,
        walletType: 'metamask',
        address: address,
        chainId: chainId,
        provider: provider
      };
    } catch (error) {
      console.error('MetaMask connection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Connect to Kaia Wallet
  async connectKaiaWallet() {
    try {
      const kaiaProvider = window.kaia || window.kaiaWallet;
      if (!kaiaProvider) {
        throw new Error('Kaia Wallet is not installed');
      }

      const provider = new ethers.BrowserProvider(kaiaProvider);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = network.chainId.toString();

      this.setupWalletState('kaia', provider, signer, address, chainId);
      this.setupEventListeners(provider, 'kaia');

      return {
        success: true,
        walletType: 'kaia',
        address: address,
        chainId: chainId,
        provider: provider
      };
    } catch (error) {
      console.error('Kaia Wallet connection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Connect to Coinbase Wallet
  async connectCoinbaseWallet() {
    try {
      if (!window.coinbaseWalletExtension) {
        throw new Error('Coinbase Wallet is not installed');
      }

      const provider = new ethers.BrowserProvider(window.coinbaseWalletExtension);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = network.chainId.toString();

      this.setupWalletState('coinbase', provider, signer, address, chainId);
      this.setupEventListeners(provider, 'coinbase');

      return {
        success: true,
        walletType: 'coinbase',
        address: address,
        chainId: chainId,
        provider: provider
      };
    } catch (error) {
      console.error('Coinbase Wallet connection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Connect to Trust Wallet
  async connectTrustWallet() {
    try {
      if (!window.trustwallet) {
        throw new Error('Trust Wallet is not installed');
      }

      const provider = new ethers.BrowserProvider(window.trustwallet);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = network.chainId.toString();

      this.setupWalletState('trust', provider, signer, address, chainId);
      this.setupEventListeners(provider, 'trust');

      return {
        success: true,
        walletType: 'trust',
        address: address,
        chainId: chainId,
        provider: provider
      };
    } catch (error) {
      console.error('Trust Wallet connection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Connect to Binance Wallet
  async connectBinanceWallet() {
    try {
      if (!window.BinanceChain) {
        throw new Error('Binance Wallet is not installed');
      }

      const provider = new ethers.BrowserProvider(window.BinanceChain);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = network.chainId.toString();

      this.setupWalletState('binance', provider, signer, address, chainId);
      this.setupEventListeners(provider, 'binance');

      return {
        success: true,
        walletType: 'binance',
        address: address,
        chainId: chainId,
        provider: provider
      };
    } catch (error) {
      console.error('Binance Wallet connection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Connect to WalletConnect (placeholder)
  async connectWalletConnect() {
    try {
      throw new Error('WalletConnect integration coming soon. Please use another wallet for now.');
    } catch (error) {
      console.error('WalletConnect connection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Main connect method
  async connect(walletType) {
    switch (walletType) {
      case 'metamask':
        return await this.connectMetaMask();
      case 'kaia':
        return await this.connectKaiaWallet();
      case 'coinbase':
        return await this.connectCoinbaseWallet();
      case 'trust':
        return await this.connectTrustWallet();
      case 'binance':
        return await this.connectBinanceWallet();
      case 'walletconnect':
        return await this.connectWalletConnect();
      default:
        return {
          success: false,
          error: `Unsupported wallet type: ${walletType}`
        };
    }
  }

  // Disconnect wallet
  disconnect() {
    this.removeEventListeners();
    this.resetWalletState();
  }

  // Switch network
  async switchNetwork(network) {
    try {
      if (!this.provider) {
        throw new Error('No wallet connected');
      }

      const targetNetwork = KAIA_NETWORKS[network];
      if (!targetNetwork) {
        throw new Error(`Unsupported network: ${network}`);
      }

      await this.provider.send('wallet_switchEthereumChain', [
        { chainId: targetNetwork.chainId }
      ]);

      // Update chain ID
      const newNetwork = await this.provider.getNetwork();
      this.chainId = newNetwork.chainId.toString();

      return {
        success: true,
        network: network,
        chainId: this.chainId
      };
    } catch (error) {
      console.error('Network switch failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Add network to wallet
  async addNetwork(network) {
    try {
      if (!this.provider) {
        throw new Error('No wallet connected');
      }

      const targetNetwork = KAIA_NETWORKS[network];
      if (!targetNetwork) {
        throw new Error(`Unsupported network: ${network}`);
      }

      await this.provider.send('wallet_addEthereumChain', [targetNetwork]);

      return {
        success: true,
        network: network
      };
    } catch (error) {
      console.error('Add network failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get current wallet info
  getWalletInfo() {
    return {
      isConnected: this.isConnected,
      walletType: this.walletType,
      address: this.address,
      chainId: this.chainId,
      network: this.getNetworkName()
    };
  }

  // Get provider
  getProvider() {
    return this.provider;
  }

  // Get signer
  getSigner() {
    return this.signer;
  }

  // Get network name
  getNetworkName() {
    if (!this.chainId) return null;
    
    switch (this.chainId) {
      case '1001':
        return 'testnet';
      case '8217':
        return 'mainnet';
      default:
        return 'unknown';
    }
  }

  // Setup wallet state
  setupWalletState(walletType, provider, signer, address, chainId) {
    this.provider = provider;
    this.signer = signer;
    this.address = address;
    this.chainId = chainId;
    this.isConnected = true;
    this.walletType = walletType;
  }

  // Reset wallet state
  resetWalletState() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.chainId = null;
    this.isConnected = false;
    this.walletType = null;
  }

  // Setup event listeners
  setupEventListeners(provider, walletType) {
    // Remove existing listeners
    this.removeEventListeners();

    // Account change listener
    const accountsChangedListener = (accounts) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.address = accounts[0];
      }
    };

    // Chain change listener
    const chainChangedListener = (chainId) => {
      this.chainId = chainId;
    };

    // Disconnect listener
    const disconnectListener = () => {
      this.disconnect();
    };

    // Store listeners for cleanup
    this.listeners.set('accountsChanged', accountsChangedListener);
    this.listeners.set('chainChanged', chainChangedListener);
    this.listeners.set('disconnect', disconnectListener);

    // Add listeners
    provider.on('accountsChanged', accountsChangedListener);
    provider.on('chainChanged', chainChangedListener);
    provider.on('disconnect', disconnectListener);
  }

  // Remove event listeners
  removeEventListeners() {
    if (this.provider) {
      this.listeners.forEach((listener, event) => {
        this.provider.off(event, listener);
      });
    }
    this.listeners.clear();
  }

  // Check if wallet is connected
  async checkConnection() {
    if (!this.provider) return false;

    try {
      const accounts = await this.provider.listAccounts();
      return accounts.length > 0;
    } catch (error) {
      console.error('Connection check failed:', error);
      return false;
    }
  }

  // Get wallet balance
  async getBalance() {
    if (!this.provider || !this.address) {
      throw new Error('No wallet connected');
    }

    try {
      const balance = await this.provider.getBalance(this.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Balance check failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const simpleWalletConnector = new SimpleWalletConnector();
export default SimpleWalletConnector;