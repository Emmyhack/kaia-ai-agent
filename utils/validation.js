import { ethers } from 'ethers';

export const validation = {
  // Validate Ethereum address
  isValidAddress: (address) => {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  },
  
  // Validate and sanitize prompt
  sanitizePrompt: (prompt) => {
    if (!prompt || typeof prompt !== 'string') {
      return null;
    }
    
    // Remove potentially dangerous characters
    const sanitized = prompt
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .substring(0, 1000); // Limit length
    
    return sanitized.length > 0 ? sanitized : null;
  },
  
  // Validate network parameter
  isValidNetwork: (network) => {
    return ['testnet', 'mainnet'].includes(network);
  },
  
  // Validate amount
  isValidAmount: (amount) => {
    if (typeof amount === 'string') {
      amount = parseFloat(amount);
    }
    return !isNaN(amount) && amount > 0 && amount <= 1000000; // Max 1M
  },
  
  // Validate transaction hash
  isValidTxHash: (hash) => {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  },
  
  // Validate user address
  validateUserAddress: (address) => {
    if (!address) {
      return { valid: false, error: 'Address is required' };
    }
    
    if (!validation.isValidAddress(address)) {
      return { valid: false, error: 'Invalid Ethereum address' };
    }
    
    return { valid: true };
  },
  
  // Validate API request
  validateApiRequest: (body) => {
    const errors = [];
    
    if (!body.prompt) {
      errors.push('Prompt is required');
    } else {
      const sanitizedPrompt = validation.sanitizePrompt(body.prompt);
      if (!sanitizedPrompt) {
        errors.push('Invalid prompt format');
      }
    }
    
    if (body.userAddress && !validation.isValidAddress(body.userAddress)) {
      errors.push('Invalid user address');
    }
    
    if (body.network && !validation.isValidNetwork(body.network)) {
      errors.push('Invalid network parameter');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      sanitizedData: {
        prompt: validation.sanitizePrompt(body.prompt),
        userAddress: body.userAddress,
        network: body.network || 'testnet'
      }
    };
  }
};