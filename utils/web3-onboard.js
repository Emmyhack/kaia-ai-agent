import Onboard from '@web3-onboard/core';
import metamaskModule from '@web3-onboard/metamask';
import walletConnectModule from '@web3-onboard/walletconnect';
import injectedModule from '@web3-onboard/injected-wallets';

// Wallet modules with proper configuration
const metamask = metamaskModule({
  options: {
    extensionOnly: false,
    dappMetadata: {
      name: 'Kaia AI Agent'
    }
  }
});

const walletConnect = walletConnectModule({
  version: 2,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id',
  dappUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.vercel.app',
});

const injected = injectedModule({
  custom: [
    {
      label: 'Kaia Wallet',
      injectedNamespace: 'kaia',
      checkProviderIdentity: ({ provider }) => provider && provider.isKaiaWallet === true,
      getIcon: async () => '🪙',
      getInterface: async () => ({ provider: window.kaia || window.kaiaWallet }),
      platforms: ['all']
    }
  ],
  sort: (wallets) => {
    // Prioritize Kaia Wallet and MetaMask
    const kaiaWallet = wallets.find(({ label }) => label === 'Kaia Wallet');
    const metamask = wallets.find(({ label }) => label === 'MetaMask');
    const others = wallets.filter(({ label }) => !['Kaia Wallet', 'MetaMask'].includes(label));
    
    return [kaiaWallet, metamask, ...others].filter(Boolean);
  }
});

// Kaia network configurations
const kaiaTestnet = {
  id: '0x3e9', // 1001 in hex
  token: 'KAIA',
  label: 'Kaia Testnet',
  rpcUrl: 'https://public-en-kairos.node.kaia.io'
};

const kaiaMainnet = {
  id: '0x2019', // 8217 in hex
  token: 'KAIA', 
  label: 'Kaia Mainnet',
  rpcUrl: 'https://public-en.node.kaia.io'
};

// Initialize Web3-Onboard
const onboard = Onboard({
  wallets: [metamask, injected, walletConnect],
  chains: [kaiaTestnet, kaiaMainnet],
  appMetadata: {
    name: 'Kaia AI Agent',
    icon: '🤖',
    description: 'AI-Powered Blockchain Assistant for Kaia Network',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io' },
      { name: 'Kaia Wallet', url: 'https://kaia.io/wallet' }
    ]
  },
  connect: {
    autoConnectLastWallet: true,
    autoConnectAllPreviousWallet: true,
    showSidebar: true,
    removeWhereIsMyWalletWarning: true,
    disableUDResolution: false
  },
  accountCenter: {
    desktop: {
      position: 'topRight',
      enabled: true,
      minimal: false
    },
    mobile: {
      position: 'topRight',
      enabled: true,
      minimal: true
    }
  },
  notify: {
    desktop: {
      enabled: true,
      transactionHandler: transaction => {
        console.log({ transaction });
        if (transaction.eventCode === 'txPool') {
          return {
            type: 'success',
            message: 'Your transaction from #1 DApp is in the mempool',
          };
        }
      },
      position: 'bottomLeft'
    },
    mobile: {
      enabled: true,
      transactionHandler: transaction => {
        console.log({ transaction });
        if (transaction.eventCode === 'txPool') {
          return {
            type: 'success',
            message: 'Your transaction from #1 DApp is in the mempool',
          };
        }
      },
      position: 'topCenter'
    }
  }
});

export default onboard;