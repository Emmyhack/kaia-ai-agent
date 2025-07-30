# 🤖 Kaia AI Agent

> **AI-Powered Blockchain Assistant for Kaia Network**

An intelligent AI agent that enables natural language interaction with the Kaia blockchain ecosystem. Built with Next.js, Google Gemini AI, and Solidity smart contracts for seamless DeFi operations.

![Kaia AI Agent](https://img.shields.io/badge/Kaia-AI%20Agent-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636)
![Ethers.js](https://img.shields.io/badge/Ethers.js-6.8.0-orange)
![Google Gemini](https://img.shields.io/badge/Google-Gemini%20AI-green)

## 🚀 Live Demo

**Contract Address (Kaia Testnet)**: `0x554Ef03BA2A7CC0A539731CA6beF561fA2648c4E`

**Network**: Kaia Testnet (Chain ID: 1001)

## ✨ Features

### 🤖 AI-Powered Interface
- **Natural Language Processing**: Chat with AI to perform blockchain operations
- **Google Gemini Integration**: Advanced AI capabilities for complex queries
- **Context-Aware Responses**: Intelligent understanding of user intent
- **Multi-step Operations**: Handle complex DeFi workflows

### 💰 DeFi Operations
- **Token Swapping**: Swap between any tokens and KAIA
- **Balance Checking**: Real-time balance monitoring across multiple tokens
- **Token Sending**: Send KAIA tokens to any address
- **Yield Farming**: Deposit/withdraw from yield farms
- **Trade Analysis**: Analyze on-chain trading activities
- **Fiat Conversion**: Information about fiat-to-KAIA conversion

### 🔗 Wallet Integration
- **Multi-wallet Support**: MetaMask and other Web3 wallets
- **Network Management**: Automatic Kaia network detection and switching
- **Real-time Updates**: Live balance and transaction monitoring
- **Secure Transactions**: Proper error handling and user feedback

### 🛡️ Security & Reliability
- **Smart Contract Security**: ReentrancyGuard, Pausable, Ownable patterns
- **Environment Variables**: Secure configuration management
- **Error Handling**: Comprehensive error recovery and user feedback
- **Gas Optimization**: Efficient smart contract design

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with custom components
- **Blockchain**: Ethers.js v6 for Web3 integration
- **AI**: Google Gemini API for natural language processing
- **UI Components**: Heroicons, React Hot Toast

### Smart Contract Stack
- **Language**: Solidity 0.8.20
- **Framework**: Hardhat with OpenZeppelin contracts
- **Network**: Kaia Testnet/Mainnet
- **Security**: ReentrancyGuard, Pausable, Ownable patterns

### Backend Services
- **API Routes**: Next.js API for AI agent communication
- **Blockchain Integration**: Direct contract interaction
- **AI Tools**: Token operations, balance checking, yield farming

## 📋 Prerequisites

- **Node.js**: 18+ (Recommended: 20.x)
- **npm**: 9+ or **yarn**: 1.22+
- **MetaMask**: Or compatible Web3 wallet
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
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Wallet Private Key (for backend operations)
KAIA_PRIVATE_KEY=your_private_key_here

# RPC Provider URL for Kaia network
KAIA_RPC_URL=https://public-en-kairos.node.kaia.io

# Kaiascan API Key for blockchain explorer
KAIASCAN_API_KEY=your_kaiascan_api_key_here

# Contract Address (will be set after deployment)
CONTRACT_ADDRESS=0x554Ef03BA2A7CC0A539731CA6beF561fA2648c4E

# Additional configuration
NODE_ENV=development
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
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini API key | ✅ |
| `KAIA_PRIVATE_KEY` | Wallet private key for backend operations | ✅ |
| `KAIA_RPC_URL` | Kaia network RPC endpoint | ✅ |
| `KAIASCAN_API_KEY` | Kaiascan API key for contract verification | ✅ |
| `CONTRACT_ADDRESS` | Deployed contract address | ✅ |

### Network Configuration

#### Kaia Testnet
- **Chain ID**: 1001
- **RPC URL**: `https://public-en-kairos.node.kaia.io`
- **Explorer**: `https://kaiascope.com`

#### Kaia Mainnet
- **Chain ID**: 8217
- **RPC URL**: `https://public-en.node.kaia.io`
- **Explorer**: `https://kaiascope.com`

## 📖 Usage Guide

### 1. Connect Your Wallet
1. Click "Connect Wallet" button
2. Approve the connection in your wallet
3. Ensure you're on the Kaia network
4. Your wallet address and balance will be displayed

### 2. Chat with AI Agent
Use natural language to interact with the blockchain:

#### Token Operations
```
"Check my KAIA balance"
"Swap 10 KAIA to USDT"
"Send 5 KAIA to 0x1234..."
"Get a quote for swapping 100 USDT to KAIA"
```

#### Yield Farming
```
"What are my yield farming positions?"
"Deposit 50 KAIA to yield farm"
"Withdraw my rewards from farm"
"Check my total yield value"
```

#### Analysis & Information
```
"Analyze my recent trades"
"How to convert USD to KAIA?"
"What's the current gas price?"
"Show me my transaction history"
```

### 3. Advanced Features

#### Multi-Token Balance Checking
```
"Check my balances for KAIA, USDT, and ETH"
```

#### Complex Operations
```
"Swap 100 USDT to KAIA, then deposit 50 KAIA to yield farm"
```

#### Trade Analysis
```
"Analyze my trading performance for the last 30 days"
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
  "userAddress": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "response": "Your KAIA balance is 100.5 KAIA",
  "toolCalls": [...],
  "steps": [...]
}
```

### Available AI Tools
- `swapTokens`: Execute token swaps
- `getSwapQuote`: Get swap quotes
- `checkBalance`: Check token balances
- `sendTokens`: Send tokens to addresses
- `depositToYieldFarm`: Deposit to yield farms
- `withdrawFromYieldFarm`: Withdraw from yield farms
- `getYieldFarmInfo`: Get farm information
- `analyzeYields`: Analyze yield performance
- `analyzeTrades`: Analyze trading activities
- `fiatToKaia`: Fiat conversion information

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
│       └── agent.js    # AI agent endpoint
├── components/         # React components
│   ├── WalletConnection.js
│   ├── ChatInterface.js
│   ├── AgentStats.js
│   └── ...
├── utils/              # Utility functions
│   └── kaiaAgent.js   # Blockchain service
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
const newFeatureTool = tool({
    description: 'Description of new feature',
    parameters: z.object({
        // Parameters
    }),
    execute: async ({ params }) => {
        // Implementation
    },
});
```

## 🔒 Security Considerations

### Smart Contract Security
- **Reentrancy Protection**: All external calls protected
- **Access Control**: Only authorized agents can execute operations
- **Emergency Pause**: Ability to pause operations in emergencies
- **Fee Limits**: Maximum fee limits to prevent abuse

### Frontend Security
- **Environment Variables**: Sensitive data not exposed
- **Input Validation**: All user inputs validated
- **Error Handling**: Comprehensive error recovery
- **Wallet Security**: No private key storage in frontend

### Best Practices
- **Regular Audits**: Smart contracts audited regularly
- **Testing**: Comprehensive test coverage
- **Documentation**: Clear documentation for all functions
- **Monitoring**: Real-time monitoring of contract operations

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

## 🙏 Acknowledgments

- **Kaia Network**: For the blockchain infrastructure
- **Google Gemini**: For AI capabilities
- **OpenZeppelin**: For secure smart contract libraries
- **Next.js Team**: For the excellent framework
- **Ethers.js Team**: For Web3 integration

## 📞 Support

- **Documentation**: [Project Wiki](https://github.com/your-username/kaia-ai-agent/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/kaia-ai-agent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/kaia-ai-agent/discussions)
- **Email**: support@kaia-ai-agent.com

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Initial release
- ✅ AI-powered blockchain interface
- ✅ Token swapping and balance checking
- ✅ Yield farming integration
- ✅ Multi-wallet support
- ✅ Smart contract deployment

### Roadmap
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-chain support
- [ ] DeFi protocol integrations
- [ ] Advanced AI features

---

**Built with ❤️ for the Kaia blockchain ecosystem**

*Powered by AI and smart contracts for seamless DeFi interactions*