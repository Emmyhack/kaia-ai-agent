import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { createAppKit } from '@reown/appkit';
import { walletConnect, injected, coinbaseWallet } from '@reown/appkit/wagmi';
import { KaiaWalletConnector } from './kaiaWalletConnector';

// Kaia Chain configurations
const kaiaTestnet = {
  id: 1001,
  name: 'Kaia Testnet',
  network: 'kaia-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'KAIA',
    symbol: 'KAIA',
  },
  rpcUrls: {
    public: { http: ['https://public-en-kairos.node.kaia.io'] },
    default: { http: ['https://public-en-kairos.node.kaia.io'] },
  },
  blockExplorers: {
    default: { name: 'KaiaScan Testnet', url: 'https://testnet.kaiascan.com' },
  },
  testnet: true,
};

const kaiaMainnet = {
  id: 8217,
  name: 'Kaia Mainnet',
  network: 'kaia-mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'KAIA',
    symbol: 'KAIA',
  },
  rpcUrls: {
    public: { http: ['https://public-en.node.kaia.io'] },
    default: { http: ['https://public-en.node.kaia.io'] },
  },
  blockExplorers: {
    default: { name: 'KaiaScan', url: 'https://kaiascan.com' },
  },
  testnet: false,
};

// Set up wagmi config
const metadata = {
  name: 'Kaia AI Agent',
  description: 'Your intelligent blockchain assistant for the Kaia network',
  url: 'https://kaia.ai', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const config = createConfig({
  chains: [kaiaTestnet, kaiaMainnet, mainnet],
  connectors: [
    injected(),
    coinbaseWallet({ appName: metadata.name }),
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID' }),
    KaiaWalletConnector({ chains: [kaiaTestnet, kaiaMainnet, mainnet] }),
  ],
  transports: {
    [kaiaTestnet.id]: http(),
    [kaiaMainnet.id]: http(),
    [mainnet.id]: http(),
  },
});

// Initialize AppKit
createAppKit({
  wagmiConfig: config,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  metadata,
  chains,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent-color': '#6366f1',
    '--w3m-background-color': '#1e293b',
    '--w3m-container-border-radius': '12px',
    '--w3m-font-family': 'Inter, system-ui, sans-serif',
    '--w3m-text-big-bold-size': '20px',
    '--w3m-text-big-bold-weight': '600',
    '--w3m-text-medium-regular-size': '16px',
    '--w3m-text-small-regular-size': '14px',
    '--w3m-text-small-thin-size': '14px',
  },
  defaultChain: kaiaTestnet,
});

export { config, kaiaTestnet, kaiaMainnet };