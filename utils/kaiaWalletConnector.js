import { Connector } from 'wagmi';

export class KaiaWalletConnector extends Connector {
  constructor({ chains, options = {} }) {
    super({ chains, options });
    this.id = 'kaiaWallet';
    this.name = 'Kaia Wallet';
    this.ready = typeof window !== 'undefined' && !!window.kaia;
  }

  async connect({ chainId } = {}) {
    try {
      const provider = await this.getProvider();
      if (!provider) throw new Error('Kaia Wallet not found');

      this.emit('message', { type: 'connecting' });

      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      const account = accounts[0];
      const id = await this.getChainId();
      const unsupported = this.isChainUnsupported(id);

      return {
        account,
        chain: { id, unsupported },
      };
    } catch (error) {
      throw error;
    }
  }

  async disconnect() {
    const provider = await this.getProvider();
    if (!provider) return;

    this.emit('disconnect');
  }

  async getAccount() {
    const provider = await this.getProvider();
    if (!provider) throw new Error('Kaia Wallet not found');

    const accounts = await provider.request({
      method: 'eth_accounts',
    });

    return accounts[0];
  }

  async getChainId() {
    const provider = await this.getProvider();
    if (!provider) throw new Error('Kaia Wallet not found');

    const chainId = await provider.request({
      method: 'eth_chainId',
    });

    return Number(chainId);
  }

  async getProvider() {
    if (typeof window === 'undefined') return;
    
    // Check for Kaia Wallet
    if (window.kaia) {
      return window.kaia;
    }
    
    // Check for Kaia Wallet alternative
    if (window.kaiaWallet) {
      return window.kaiaWallet;
    }

    return undefined;
  }

  async getSigner() {
    const provider = await this.getProvider();
    if (!provider) throw new Error('Kaia Wallet not found');

    return provider.getSigner();
  }

  async isAuthorized() {
    try {
      const account = await this.getAccount();
      return !!account;
    } catch {
      return false;
    }
  }

  async switchChain({ chainId }) {
    const provider = await this.getProvider();
    if (!provider) throw new Error('Kaia Wallet not found');

    const id = `0x${chainId.toString(16)}`;

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: id }],
      });

      return this.chains.find((x) => x.id === chainId);
    } catch (error) {
      // If the chain doesn't exist, add it
      if (error.code === 4902) {
        const chain = this.chains.find((x) => x.id === chainId);
        if (!chain) throw new Error('Chain not found');

        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: id,
              chainName: chain.name,
              nativeCurrency: chain.nativeCurrency,
              rpcUrls: [chain.rpcUrls.default.http[0]],
              blockExplorerUrls: chain.blockExplorers?.default?.url
                ? [chain.blockExplorers.default.url]
                : undefined,
            },
          ],
        });

        return chain;
      }

      throw error;
    }
  }

  async watchAsset({ address, symbol, decimals, image }) {
    const provider = await this.getProvider();
    if (!provider) throw new Error('Kaia Wallet not found');

    return provider.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address,
          symbol,
          decimals,
          image,
        },
      },
    });
  }

  onAccountsChanged(accounts) {
    if (accounts.length === 0) this.emit('disconnect');
    else this.emit('change', { account: accounts[0] });
  }

  onChainChanged(chainId) {
    const id = Number(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit('change', { chain: { id, unsupported } });
  }

  onDisconnect() {
    this.emit('disconnect');
  }
}