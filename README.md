# Kaia AI Agent 🤖

An intelligent blockchain assistant for the Kaia network that enables users to interact with DeFi protocols through natural language commands. Built with Next.js, Google Gemini AI, and Vercel AI SDK.

## 🌟 Features

- **Token Swapping**: Swap between any tokens and KAIA with intelligent routing
- **Balance Checking**: Check KAIA and ERC20 token balances instantly
- **Token Sending**: Send KAIA tokens to any address with simple commands
- **Yield Farming**: Deposit/withdraw from yield farms and track earnings
- **Trade Analysis**: Analyze on-chain trading activities and get insights
- **Fiat Conversion**: Get information about converting fiat to KAIA tokens
- **Natural Language Interface**: Interact using plain English commands
- **Real-time Updates**: Live balance and transaction updates
- **Multi-wallet Support**: Works with MetaMask and other Web3 wallets

## 🏗️ Architecture

```
├── contracts/              # Smart contracts
│   ├── KaiaAIAgent.sol     # Main agent contract
│   └── mocks/              # Mock contracts for testing
├── scripts/                # Deployment scripts
├── test/                   # Contract tests
├── frontend/src/           # Next.js frontend
│   ├── components/         # React components
│   ├── pages/              # Next.js pages and API routes
│   ├── styles/             # CSS styles
│   └── utils/              # Utility functions
└── deployments/            # Deployment artifacts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MetaMask or compatible Web3 wallet
- Google Generative AI API key
- Kaia testnet KAIA tokens

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/kaia-ai-agent.git
   cd kaia-ai-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
   KAIA_PRIVATE_KEY=your_private_key
   KAIA_RPC_URL=https://public-en-kairos.node.kaia.io
   CONTRACT_ADDRESS=deployed_contract_address
   ```

4. **Deploy smart contracts**
   ```bash
   # Deploy to Kaia testnet
   npm run deploy:contracts:testnet
   
   # Or deploy to Kaia mainnet
   npm run deploy:contracts
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Smart Contract Deployment

### Deploy to Kaia Testnet

```bash
# Set up your environment
export PRIVATE_KEY="your_private_key"
export KAIA_TOKEN_ADDRESS="0x0000000000000000000000000000000000000000"
export SWAP_ROUTER_ADDRESS="your_swap_router_address"

# Deploy contracts
npx hardhat run scripts/deploy.js --network kaia-testnet
```

### Deploy to Kaia Mainnet

```bash
# Deploy to mainnet
npx hardhat run scripts/deploy.js --network kaia-mainnet
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run contract tests
npx hardhat test
```

## 💬 Usage Examples

### Basic Commands

- **Check Balance**: "What's my KAIA balance?"
- **Send Tokens**: "Send 10 KAIA to 0x742d35Cc6634C0532925a3b8D49d80FE6b5f1234"
- **Token Swap**: "Swap 5 KAIA for USDT"
- **Get Quote**: "How much USDT can I get for 10 KAIA?"

### Advanced Commands

- **Yield Farming**: "Show me my yield farming positions"
- **Trade Analysis**: "Analyze my trading performance this week"
- **Fiat Conversion**: "How do I convert $100 USD to KAIA?"
- **Best Yields**: "Find the best yield farming opportunities"

## 🔐 Security Features

- **Access Control**: Only authorized agents can execute transactions
- **Reentrancy Protection**: All state-changing functions are protected
- **Pausable Contract**: Emergency pause functionality
- **Fee Limits**: Maximum fee caps to prevent exploitation
- **Input Validation**: Comprehensive parameter validation

## 🛠️ API Reference

### Main API Endpoint

**POST** `/api/agent`

```json
{
  "prompt": "Check my KAIA balance",
  "userAddress": "0x742d35Cc6634C0532925a3b8D49d80FE6b5f1234"
}
```

### Response Format

```json
{
  "success": true,
  "response": "Your KAIA balance is 125.5432 KAIA",
  "steps": [...],
  "toolCalls": [...]
}
```

## 🌐 Supported Networks

- **Kaia Testnet** (Chain ID: 1001)
- **Kaia Mainnet** (Chain ID: 8217)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Kaia Documentation](https://docs.kaia.io/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Google Generative AI](https://ai.google.dev/)
- [Hardhat](https://hardhat.org/)

## 🆘 Support

- **Documentation**: Check the docs above
- **Issues**: [GitHub Issues](https://github.com/your-username/kaia-ai-agent/issues)
- **Kaia Community**: [Kaia Discord](https://discord.gg/kaia)

## 🙏 Acknowledgments

- Kaia Foundation for the blockchain infrastructure
- Google for the Gemini AI model
- Vercel for the AI SDK
- OpenZeppelin for smart contract libraries

---

Built with ❤️ for the Kaia blockchain ecosystem