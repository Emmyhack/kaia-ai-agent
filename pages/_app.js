import '../styles/globals.css';
import { Web3OnboardProvider } from '@web3-onboard/react';
import onboard from '../utils/web3-onboard';

export default function App({ Component, pageProps }) {
  return (
    <Web3OnboardProvider web3Onboard={onboard}>
      <Component {...pageProps} />
    </Web3OnboardProvider>
  );
}