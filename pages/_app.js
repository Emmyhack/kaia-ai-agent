import '../styles/globals.css';
import ErrorBoundary from '../components/ErrorBoundary';
import { WagmiConfig } from 'wagmi';
import { config } from '../utils/web3ModalConnector';

export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig config={config}>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </WagmiConfig>
  );
}