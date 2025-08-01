# 🤖 Kaia AI Agent

> **AI-Powered Blockchain Assistant for Kaia Network**

An intelligent AI agent that enables natural language interaction with the Kaia blockchain ecosystem. Built with Next.js, Google Gemini AI, and Solidity smart contracts for seamless DeFi operations.

![Kaia AI Agent](https://img.shields.io/badge/Kaia-AI%20Agent-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636)
![Ethers.js](https://img.shields.io/badge/Ethers.js-6.8.0-orange)
![Google Gemini](https://img.shields.io/badge/Google-Gemini%20AI-green)

## 🚀 Live Demo

### Main Contract
**KaiaAIAgent Contract (Kaia Testnet)**: `0x554Ef03BA2A7CC0A539731CA6beF561fA2648c4E`

### Mock Contracts (for Testing & Demonstration)
- **MockERC20 Token**: `0x8C82fa4dc47a9bf5034Bb38815c843B75EF76690`
- **MockSwapRouter**: `0x48B1F3EA22eC9a094C709a3710ce94B13d4408dE`
- **MockYieldFarm**: `0x27A0239D6F238c6AD5b5952d70e62081D1cc896e`

**Network**: Kaia Testnet (Chain ID: 1001)

## ✨ Features

### 🤖 AI-Powered Interface
- **Natural Language Processing**: Chat with AI to perform blockchain operations
- **Google Gemini Integration**: Advanced AI capabilities for complex queries
- **Context-Aware Responses**: Intelligent understanding of user intent
- **Multi-step Operations**: Handle complex DeFi workflows

### 💰 DeFi Operations
- **Token Swapping**: Swap between any tokens and KAIA (Demo mode)
- **Balance Checking**: Real-time balance monitoring across multiple tokens
- **Token Sending**: Send KAIA tokens to any address
- **Yield Farming**: Real on-chain data from Kaiascan API
- **Trade Analysis**: Analyze on-chain trading activities
- **Network Status**: Real-time blockchain network monitoring

### 🔗 Advanced Wallet Integration
- **Multi-wallet Support**: MetaMask, Kaia Wallet, Coinbase Wallet, Trust Wallet, Binance Wallet
- **Network Management**: Automatic Kaia network detection and switching
- **Real-time Updates**: Live balance and transaction monitoring
- **Secure Transactions**: Proper error handling and user feedback
- **Wallet Connection**: Advanced wallet connector with multiple options

### 🌾 Real Yield Farming Data
- **Kaiascan Integration**: Real on-chain yield farming data
- **Live APY Calculations**: Real-time yield rates from blockchain
- **TVL Display**: Actual total value locked amounts
- **Contract Verification**: Verified contract status from blockchain explorer
- **Interactive Farm Cards**: Click to view detailed farm information

### 📊 Trade Analysis & Market Data
- **Real-time Trade Analysis**: Live market data from Kaiascan API
- **Market Sentiment**: AI-powered market sentiment analysis
- **Trading Insights**: Professional trading recommendations
- **Network Statistics**: Active addresses, transaction counts, volume analysis
- **Auto-refresh**: Automatic data updates every 30 seconds

### 🛡️ Security & Reliability
- **Smart Contract Security**: ReentrancyGuard, Pausable, Ownable patterns
- **Environment Variables**: Secure configuration management
- **Error Handling**: Comprehensive error recovery and user feedback
- **Gas Optimization**: Efficient smart contract design
- **Input Validation**: All user inputs validated and sanitized

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with custom components
- **Blockchain**: Ethers.js v6 for Web3 integration
- **AI**: Google Gemini API for natural language processing
- **UI Components**: Heroicons, React Hot Toast, Lucide React

### Smart Contract Stack
- **Language**: Solidity 0.8.20
- **Framework**: Hardhat with OpenZeppelin contracts
- **Network**: Kaia Testnet/Mainnet
- **Security**: ReentrancyGuard, Pausable, Ownable patterns

### Backend Services
- **API Routes**: Next.js API for AI agent communication
- **Blockchain Integration**: Direct contract interaction
- **Kaiascan API**: Real blockchain data integration
- **AI Tools**: Token operations, balance checking, yield farming

## 📋 Prerequisites

- **Node.js**: 18+ (Recommended: 20.x)
- **npm**: 9+ or **yarn**: 1.22+
- **Web3 Wallet**: MetaMask, Kaia Wallet, or compatible wallet
- **Kaia Network**: Access to Kaia testnet/mainnet

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/kaia-ai-agent.git
cd kaia-ai-agent
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env.local` file with your configuration:

```env
# Google Generative AI API Key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# WalletConnect Configuration (Optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Kaia Chain Configuration
NEXT_PUBLIC_KAIA_TESTNET_RPC=https://public-en-kairos.node.kaia.io
NEXT_PUBLIC_KAIA_MAINNET_RPC=https://public-en.node.kaia.io

# Kaiascan API Key (Optional)
KAIASCAN_API_KEY=your_kaiascan_api_key_here

# Mock Contract Addresses
NEXT_PUBLIC_MOCK_ERC20_ADDRESS=0x8C82fa4dc47a9bf5034Bb38815c843B75EF76690
NEXT_PUBLIC_MOCK_YIELD_FARM_ADDRESS=0x27A0239D6F238c6AD5b5952d70e62081D1cc896e

# Security
NEXT_PUBLIC_ENABLE_RATE_LIMITING=true
NEXT_PUBLIC_MAX_REQUESTS_PER_MINUTE=60
```

### 4. Deploy Smart Contracts (Optional)
```bash
# Compile contracts
npx hardhat compile

# Deploy to testnet
npm run deploy:contracts:testnet

# Deploy to mainnet
npm run deploy:contracts:mainnet
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | ❌ |
| `NEXT_PUBLIC_KAIA_TESTNET_RPC` | Kaia testnet RPC endpoint | ✅ |
| `NEXT_PUBLIC_KAIA_MAINNET_RPC` | Kaia mainnet RPC endpoint | ✅ |
| `KAIASCAN_API_KEY` | Kaiascan API key for real data | ❌ |
| `NEXT_PUBLIC_MOCK_ERC20_ADDRESS` | Mock ERC20 token address | ✅ |
| `NEXT_PUBLIC_MOCK_YIELD_FARM_ADDRESS` | Mock yield farm address | ✅ |

### Network Configuration

#### Kaia Testnet
- **Chain ID**: 1001 (0x3e9)
- **RPC URL**: `https://public-en-kairos.node.kaia.io`
- **Explorer**: `https://testnet.kaiascan.com`

#### Kaia Mainnet
- **Chain ID**: 8217 (0x2019)
- **RPC URL**: `https://public-en.node.kaia.io`
- **Explorer**: `https://kaiascan.com`

## 📖 Usage Guide

### 1. Connect Your Wallet
1. Click "Connect Wallet" button
2. Choose your preferred wallet:
   - 🦊 **MetaMask** - Most popular Web3 wallet
   - ⚡ **Kaia Wallet** - Native Kaia Chain wallet
   - 🪙 **Coinbase Wallet** - Coinbase exchange wallet
   - 🛡️ **Trust Wallet** - Binance Trust Wallet
   - 🟡 **Binance Wallet** - Binance Chain wallet
3. Approve the connection in your wallet
4. Ensure you're on the Kaia network
5. Your wallet address and balance will be displayed

### 2. Chat with AI Agent
Use natural language to interact with the blockchain:

#### Token Operations
```
"Check my KAIA balance"
"Swap 10 KAIA to MOCK token"
"Send 5 KAIA to 0x1234..."
"Get a quote for swapping 100 MOCK to KAIA"
```

#### Yield Farming (Real Data)
```
"What are the yield farming opportunities?"
"Show me the best APY farms"
"Check my yield farming positions"
"Deposit 50 KAIA to yield farm"
```

#### Analysis & Information
```
"Check network status"
"Show me the current gas price"
"Analyze my recent trades"
"What's the current block number?"
"Show me market sentiment"
"Get trading recommendations"
```

### 3. Advanced Features

#### Real Blockchain Data
- **Balance Checking**: Real on-chain balance queries
- **Network Status**: Live blockchain network monitoring
- **Transaction History**: Real transaction data from Kaiascan
- **Yield Farming**: Real APY and TVL data from contracts
- **Trade Analysis**: Live market data and sentiment analysis
- **Token Prices**: Real-time token prices with market data

#### Multi-Token Support
```
"Check my balances for KAIA and MOCK tokens"
"Show me all available tokens"
"Get token information for MOCK"
```

#### Complex Operations
```
"Swap 100 MOCK to KAIA, then check my balance"
"Show me yield farming opportunities and my positions"
"Analyze the network status and gas prices"
"Get market sentiment and trading recommendations"
"Check token prices and market analysis"
```

## 🏗️ Smart Contract Details

### Contract Address
- **Testnet**: `0x554Ef03BA2A7CC0A539731CA6beF561fA2648c4E`
- **Mainnet**: TBD

### Key Functions

#### Token Operations
```solidity
function swapTokens(
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 minAmountOut,
    address recipient
) external returns (uint256)

function checkBalance(address user, address token) external view returns (uint256)
function sendTokens(address token, address to, uint256 amount) external
```

#### Yield Farming
```solidity
function depositToYieldFarm(address farmAddress, uint256 amount, address user) external
function withdrawFromYieldFarm(address farmAddress, uint256 amount, address user) external
function getYieldFarmInfo(address farmAddress, address user) external view returns (uint256, uint256, uint256)
```

#### Management
```solidity
function addAuthorizedAgent(address agent) external onlyOwner
function setSwapFee(uint256 _fee) external onlyOwner
function pause() external onlyOwner
```

### Security Features
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Ownable**: Access control for admin functions
- **Fee Management**: Configurable swap fees
- **Emergency Withdraw**: Emergency token recovery

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### Contract Testing
```bash
npx hardhat test
```

### API Testing
```bash
# Test AI agent
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Check my balance","userAddress":"0x123...","network":"testnet"}'

# Test Kaiascan integration
curl http://localhost:3000/api/test-kaiascan

# Test wallet connector
curl http://localhost:3000/api/test-simple-wallet
```

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests |
| `npm run deploy:contracts:testnet` | Deploy to testnet |
| `npm run deploy:contracts:mainnet` | Deploy to mainnet |

## 🔍 API Reference

### AI Agent Endpoint
```
POST /api/agent
```

**Request Body:**
```json
{
  "prompt": "Check my KAIA balance",
  "userAddress": "0x...",
  "network": "testnet"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Your KAIA balance is 100.5 KAIA",
  "blockchainData": {
    "balance": "100.5",
    "network": "testnet",
    "isReal": true
  }
}
```

### Available AI Tools
- `swapTokens`: Execute token swaps (Demo mode)
- `getSwapQuote`: Get swap quotes
- `checkBalance`: Check token balances (Real data)
- `sendTokens`: Send tokens to addresses
- `depositToYieldFarm`: Deposit to yield farms
- `withdrawFromYieldFarm`: Withdraw from yield farms
- `getYieldFarmInfo`: Get farm information
- `analyzeYields`: Analyze yield performance
- `analyzeTrades`: Analyze trading activities
- `getNetworkStatus`: Get network status (Real data)
- `getTradeAnalysis`: Get market analysis and sentiment (Real data)
- `getTokenPrices`: Get real-time token prices (Real data)

## 🛠️ Development

### Project Structure
```
kaia-ai-agent/
├── contracts/           # Smart contracts
│   ├── KaiaAIAgent.sol
│   └── mocks/          # Mock contracts for testing
├── pages/              # Next.js pages
│   ├── index.js        # Main application page
│   └── api/            # API routes
│       ├── agent.js    # AI agent endpoint
│       ├── test-kaiascan.js
│       ├── test-simple-wallet.js
│       ├── trade-analysis.js
│       ├── token-prices.js
│       └── test-panels.js
├── components/         # React components
│   ├── AdvancedWalletConnection.js
│   ├── ChatInterface.js
│   ├── AgentStats.js
│   ├── YieldFarmingPanel.js
│   ├── TradeAnalysisPanel.js
│   ├── TokenPricePanel.js
│   └── NetworkStatus.js
├── utils/              # Utility functions
│   ├── kaiaAgent.js   # Blockchain service
│   ├── kaiascanService.js # Kaiascan API integration
│   ├── simpleWalletConnector.js # Wallet connection
│   ├── validation.js  # Input validation
│   └── rateLimiter.js # Rate limiting
├── styles/             # Global styles
│   └── globals.css
├── scripts/            # Deployment scripts
│   └── deploy.js
└── test/               # Test files
```

### Adding New Features

#### 1. Smart Contract Functions
```solidity
// Add to KaiaAIAgent.sol
function newFeature() external {
    // Implementation
}
```

#### 2. Frontend Integration
```javascript
// Add to utils/kaiaAgent.js
async newFeature() {
    // Implementation
}
```

#### 3. AI Tool Integration
```javascript
// Add to pages/api/agent.js
if (lowerPrompt.includes('new feature')) {
  const result = await kaiaAgentService.newFeature();
  // Handle response
}
```

## 🔒 Security Considerations

### Smart Contract Security
- **Reentrancy Protection**: All external calls protected
- **Access Control**: Only authorized agents can execute operations
- **Emergency Pause**: Ability to pause operations in emergencies
- **Fee Limits**: Maximum fee limits to prevent abuse

### Frontend Security
- **Environment Variables**: Sensitive data not exposed
- **Input Validation**: All user inputs validated and sanitized
- **Error Handling**: Comprehensive error recovery
- **Wallet Security**: No private key storage in frontend
- **Rate Limiting**: API rate limiting to prevent abuse

### Best Practices
- **Regular Audits**: Smart contracts audited regularly
- **Testing**: Comprehensive test coverage
- **Documentation**: Clear documentation for all functions
- **Monitoring**: Real-time monitoring of contract operations

## 🚨 Error Handling

### Common Errors & Solutions

#### "Wallet not connected" Error
**Cause**: Trying to perform transactions without connecting wallet
**Solution**: Connect your wallet first using the wallet connection button

#### "Signer not initialized" Error
**Cause**: Wallet not properly connected or wrong network
**Solution**: 
1. Connect your wallet
2. Switch to correct Kaia network (Testnet: 1001, Mainnet: 8217)
3. Try the operation again

#### "Network error" Error
**Cause**: RPC endpoint issues or network connectivity
**Solution**: 
1. Check your internet connection
2. Verify RPC endpoints are accessible
3. Try switching networks

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Add tests for new functionality
5. Run tests: `npm test`
6. Commit your changes: `git commit -am 'Add new feature'`
7. Push to branch: `git push origin feature/new-feature`
8. Submit a pull request

### Code Style
- Follow ESLint configuration
- Use TypeScript for new files
- Write comprehensive tests
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/your-username">
        <img src="https://github.com/your-username.png" width="100px;" alt=""/>
        <br />
        <sub><b>Your Name</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="mailto:aigbojie2020@gmail.com">
        <img src="https://github.com/github.png" width="100px;" alt=""/>
        <br />
        <sub><b>Contributor 1</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="mailto:hengjunkai@gmail.com">
        <img src="https://github.com/github.png" width="100px;" alt=""/>
        <br />
        <sub><b>Contributor 2</b></sub>
      </a>
    </td>
  </tr>
</table>

📋 **See [CONTRIBUTORS.md](CONTRIBUTORS.md) for detailed contributor information and guidelines.**

## 🙏 Acknowledgments

- **Kaia Network**: For the blockchain infrastructure
- **Google Gemini**: For AI capabilities
- **OpenZeppelin**: For secure smart contract libraries
- **Next.js Team**: For the excellent framework
- **Ethers.js Team**: For Web3 integration
- **Kaiascan**: For blockchain explorer data

## 📞 Support

- **Documentation**: [Project Wiki](https://github.com/your-username/kaia-ai-agent/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/kaia-ai-agent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/kaia-ai-agent/discussions)


## 🔄 Version History

### v1.1.0 (Current)
- ✅ **Advanced Wallet Integration**: Multi-wallet support with MetaMask, Kaia Wallet, Coinbase, Trust, Binance
- ✅ **Real Yield Farming Data**: Kaiascan API integration with live APY and TVL
- ✅ **Trade Analysis Panel**: Real-time market data and sentiment analysis from Kaiascan
- ✅ **Token Prices Panel**: Live token prices with market data and trends
- ✅ **Enhanced Error Handling**: Clear error messages and user guidance
- ✅ **Network Management**: Automatic network detection and switching
- ✅ **Real Blockchain Data**: Live balance checking and network status
- ✅ **Improved UI/UX**: Modern interface with real-time updates

### v1.0.0 (Previous)
- ✅ Initial release with AI-powered blockchain interface
- ✅ Basic token swapping and balance checking
- ✅ Simple wallet connection
- ✅ Smart contract deployment

## 🚀 Roadmap

### Phase 1: Enhanced AI & UX (Q1 2024)
- [ ] **Advanced AI Features**
  - [ ] Multi-language support
  - [ ] Voice-to-text capabilities
  - [ ] AI-powered trading recommendations
  - [ ] Predictive analytics

- [ ] **Enhanced User Experience**
  - [ ] Dark/Light theme toggle
  - [ ] Customizable dashboard
  - [ ] Advanced notifications
  - [ ] PWA features

### Phase 2: Multi-Chain & Protocol Integration (Q2 2024)
- [ ] **Multi-Chain Support**
  - [ ] Ethereum mainnet integration
  - [ ] Polygon network support
  - [ ] Cross-chain bridge functionality

- [ ] **DeFi Protocol Integrations**
  - [ ] Uniswap V3 integration
  - [ ] Aave lending and borrowing
  - [ ] Compound protocol support

### Phase 3: Advanced Analytics & Trading (Q3 2024)
- [ ] **Advanced Analytics Dashboard**
  - [ ] Real-time portfolio tracking
  - [ ] Performance analytics
  - [ ] Risk assessment tools

- [ ] **Trading Features**
  - [ ] Limit orders and stop-loss
  - [ ] DCA automation
  - [ ] Grid trading strategies

### Phase 4: Mobile & Cross-Platform (Q4 2024)
- [ ] **Mobile Applications**
  - [ ] iOS native app
  - [ ] Android native app
  - [ ] React Native cross-platform

- [ ] **Desktop Applications**
  - [ ] Electron desktop app
  - [ ] System tray integration

### Phase 5: Security & Enterprise (Q1 2025)
- [ ] **Enhanced Security**
  - [ ] Hardware wallet integration
  - [ ] Multi-signature support
  - [ ] Social recovery mechanisms

- [ ] **Enterprise Features**
  - [ ] Multi-user management
  - [ ] Role-based access control
  - [ ] White-label solutions

## 🎯 Success Metrics



#### Advanced Analytics Implementation
```typescript
// Future Analytics Dashboard
interface AnalyticsDashboard {
  // Real-time Portfolio Tracking
  portfolioValue: () => Promise<number>;
  portfolioPerformance: () => Promise<PerformanceMetrics>;
  riskMetrics: () => Promise<RiskAssessment>;
  
  // Advanced Charting
  createChart: (data: ChartData, type: ChartType) => Chart;
  technicalIndicators: (priceData: number[]) => TechnicalIndicators;
  
  // AI-Powered Insights
  generateInsights: () => Promise<TradingInsights>;
  recommendActions: () => Promise<TradingRecommendations>;
}
```

#### Mobile App Architecture
```typescript
// Future Mobile App Structure
interface MobileApp {
  // Core Features
  walletManagement: WalletManager;
  tradingInterface: TradingInterface;
  analyticsDashboard: AnalyticsDashboard;
  
  // Mobile-Specific Features
  biometricAuth: BiometricAuthentication;
  pushNotifications: NotificationService;
  offlineMode: OfflineCapabilities;
  
  // Cross-Platform Features
  syncAcrossDevices: () => Promise<void>;
  cloudBackup: () => Promise<void>;
}
```


### 🎯 Success Metrics

#### User Engagement
- **Target**: 100,000+ active users by early 2026
=======
### User Engagement
- **Target**: 100,000+ active users by end of 2024
>>>>>>> cursor/full-project-review-and-issue-resolution-8ee3
- **Metric**: Daily active users, session duration, feature adoption

### Technical Performance
- **Target**: 99.9% uptime, <100ms response time
- **Metric**: System reliability, API response times, error rates

### Financial Impact
- **Target**: $1B+ in total value locked (TVL)
- **Metric**: Transaction volume, user assets under management

### AI Effectiveness
- **Target**: 95% accuracy in user intent recognition
- **Metric**: AI response accuracy, user satisfaction scores

## 🔮 Long-term Vision

The Kaia AI Agent aims to become the **premier AI-powered DeFi platform** that:

1. **Democratizes DeFi**: Makes complex DeFi operations accessible to everyone
2. **Enhances Security**: Provides enterprise-grade security for retail users
3. **Drives Innovation**: Continuously integrates cutting-edge technologies
4. **Builds Community**: Fosters a global community of DeFi enthusiasts
5. **Shapes the Future**: Leads the evolution of AI-powered financial services

---

**Built with ❤️ for the Kaia blockchain ecosystem**

*Powered by AI and smart contracts for seamless DeFi interactions*
