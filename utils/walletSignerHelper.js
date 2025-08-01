import { ethers } from 'ethers';

// Helper to get signer from connected wallet
export const getWalletSigner = async () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Check for MetaMask
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return signer;
    }

    // Check for Kaia Wallet
    if (window.kaia) {
      const provider = new ethers.BrowserProvider(window.kaia);
      const signer = await provider.getSigner();
      return signer;
    }

    // Check for Kaia Wallet alternative
    if (window.kaiaWallet) {
      const provider = new ethers.BrowserProvider(window.kaiaWallet);
      const signer = await provider.getSigner();
      return signer;
    }

    // Check for Coinbase Wallet
    if (window.coinbaseWalletExtension) {
      const provider = new ethers.BrowserProvider(window.coinbaseWalletExtension);
      const signer = await provider.getSigner();
      return signer;
    }

    // Check for Trust Wallet
    if (window.trustwallet) {
      const provider = new ethers.BrowserProvider(window.trustwallet);
      const signer = await provider.getSigner();
      return signer;
    }

    // Check for Binance Wallet
    if (window.BinanceChain) {
      const provider = new ethers.BrowserProvider(window.BinanceChain);
      const signer = await provider.getSigner();
      return signer;
    }

    return null;
  } catch (error) {
    console.error('Failed to get wallet signer:', error);
    return null;
  }
};

// Helper to check if wallet is connected
export const isWalletConnected = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return !!(window.ethereum || window.kaia || window.kaiaWallet || 
           window.coinbaseWalletExtension || window.trustwallet || window.BinanceChain);
};

// Helper to get connected wallet type
export const getConnectedWalletType = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (window.ethereum) return 'metamask';
  if (window.kaia || window.kaiaWallet) return 'kaia';
  if (window.coinbaseWalletExtension) return 'coinbase';
  if (window.trustwallet) return 'trust';
  if (window.BinanceChain) return 'binance';
  
  return null;
};