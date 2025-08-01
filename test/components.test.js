import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '../pages/index'

// Mock the dynamic imports
jest.mock('../components/WalletConnection', () => {
  return function MockWalletConnection({ isConnected, walletAddress, balance, onConnect, onDisconnect }) {
    return (
      <div data-testid="wallet-connection">
        <div data-testid="connection-status">{isConnected ? 'Connected' : 'Disconnected'}</div>
        {walletAddress && <div data-testid="wallet-address">{walletAddress}</div>}
        {balance && <div data-testid="wallet-balance">{balance}</div>}
        <button onClick={() => onConnect('0x1234567890123456789012345678901234567890')}>
          Connect Wallet
        </button>
        <button onClick={onDisconnect}>Disconnect</button>
      </div>
    )
  }
})

jest.mock('../components/ChatInterface', () => {
  return function MockChatInterface({ walletAddress, isWalletConnected, selectedNetwork }) {
    return (
      <div data-testid="chat-interface">
        <div data-testid="chat-wallet-status">{isWalletConnected ? 'Connected' : 'Disconnected'}</div>
        <div data-testid="chat-network">{selectedNetwork}</div>
        <input data-testid="chat-input" placeholder="Type your message..." />
        <button data-testid="send-button">Send</button>
      </div>
    )
  }
})

jest.mock('../components/AgentStats', () => {
  return function MockAgentStats({ walletAddress }) {
    return (
      <div data-testid="agent-stats">
        <div data-testid="stats-wallet">{walletAddress}</div>
      </div>
    )
  }
})

describe('Home Page', () => {
  beforeEach(() => {
    // Reset fetch mock
    fetch.mockClear()
  })

  it('renders without crashing', () => {
    render(<Home />)
    expect(screen.getByText('Kaia Assistant v1.0')).toBeInTheDocument()
  })

  it('shows wallet connection component', () => {
    render(<Home />)
    expect(screen.getByTestId('wallet-connection')).toBeInTheDocument()
  })

  it('shows chat interface component', () => {
    render(<Home />)
    expect(screen.getByTestId('chat-interface')).toBeInTheDocument()
  })

  it('shows network selector', () => {
    render(<Home />)
    expect(screen.getByText('Select Network')).toBeInTheDocument()
    expect(screen.getByText('🧪 Testnet')).toBeInTheDocument()
    expect(screen.getByText('🚀 Mainnet')).toBeInTheDocument()
  })

  it('shows quick actions', async () => {
    render(<Home />)
    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    })
    expect(screen.getByText('Check Balance')).toBeInTheDocument()
    expect(screen.getByText('Swap with DragonSwap')).toBeInTheDocument()
  })

  it('shows network status', async () => {
    render(<Home />)
    await waitFor(() => {
      expect(screen.getByText('Network Status')).toBeInTheDocument()
    })
    expect(screen.getByText('Connected')).toBeInTheDocument()
  })
})

describe('Wallet Connection', () => {
  it('allows connecting wallet', async () => {
    render(<Home />)
    
    const connectButton = screen.getByText('Connect Wallet')
    fireEvent.click(connectButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected')
    })
  })

  it('allows disconnecting wallet', async () => {
    render(<Home />)
    
    // First connect
    const connectButton = screen.getByText('Connect Wallet')
    fireEvent.click(connectButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected')
    })
    
    // Then disconnect
    const disconnectButton = screen.getByText('Disconnect')
    fireEvent.click(disconnectButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected')
    })
  })
})

describe('Network Selection', () => {
  it('allows switching between networks', async () => {
    render(<Home />)
    
    const mainnetButton = screen.getByText('🚀 Mainnet')
    fireEvent.click(mainnetButton)
    
    await waitFor(() => {
      expect(screen.getByText('Currently selected: Kaia Mainnet')).toBeInTheDocument()
    })
  })
})