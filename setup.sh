#!/bin/bash

echo "🤖 Setting up Kaia AI Agent..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your configuration:"
    echo "   - Add your GOOGLE_GENERATIVE_AI_API_KEY"
    echo "   - Add your KAIA_PRIVATE_KEY"
    echo "   - Update CONTRACT_ADDRESS after deployment"
else
    echo "✅ Environment file already exists"
fi

# Create directories if they don't exist
mkdir -p deployments
mkdir -p frontend/public

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your configuration"
echo "2. Deploy smart contracts: npm run deploy:contracts:testnet"
echo "3. Start development server: npm run dev"
echo ""
echo "📚 For more information, check the README.md file"