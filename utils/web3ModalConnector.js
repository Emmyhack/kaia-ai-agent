import { createConfig, configureChains, mainnet } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { walletConnectProvider, EIP6963Connector, injected, coinbaseWallet } from '@web3modal/wagmi';
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

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [kaiaTestnet, kaiaMainnet, mainnet],
  [
    walletConnectProvider({ projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID' }),
    publicProvider(),
  ]
);

// Set up wagmi config
const metadata = {
  name: 'Kaia AI Agent',
  description: 'Your intelligent blockchain assistant for the Kaia network',
  url: 'https://kaia.ai', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const config = createConfig({
  autoConnect: true,
  connectors: [
    EIP6963Connector({ chains }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({ appName: metadata.name, chains }),
    KaiaWalletConnector({ chains }),
  ],
  publicClient,
  webSocketPublicClient,
});

// Initialize Web3Modal
createWeb3Modal({
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

export { config, chains, kaiaTestnet, kaiaMainnet };