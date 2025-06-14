# PropertyEscrow Platform

A blockchain-powered property escrow platform that simplifies complex real estate transactions through advanced smart contract infrastructure and user-friendly design.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- MetaMask browser extension (for Web3 functionality)
- Alchemy account with Polygon API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd PropertyEscrow
```

2. **Install dependencies**
```bash
npm install
cd frontend && npm install
```

3. **Configure Environment**
Create environment files:
```bash
# Copy example files
cp .env.example .env
cd frontend && cp .env.example .env.local
```

Edit `frontend/.env.local` and set your Alchemy RPC URL:
```
REACT_APP_ALCHEMY_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY_HERE
```

4. **Start services**

**Production Landing Page (Port 5000):**
```bash
python3 -m http.server 5000 --bind 0.0.0.0
```

**React Development Server (Port 3000):**
```bash
cd frontend && npm start
```

5. **Access the application**
- Production Landing Page: http://localhost:5000
- React Development Server: http://localhost:3000

## Port Configuration

| Service | Port | Purpose |
|---------|------|---------|
| PropertyEscrow Server | 5000 | Professional landing page with enhanced styling |
| React Development | 3000 | Frontend development server |
| Smart Contract Tests | Manual | Run via `npx hardhat test` when needed |

## 📱 User Interface Flows

The platform provides four streamlined user experiences:

### 1. Dashboard Flow
- **Purpose**: Central hub for all escrow activities
- **Features**: Status overview, pending actions, transaction history
- **Navigation**: Primary landing page after wallet connection

### 2. Create Escrow Flow  
- **Purpose**: Guided escrow creation process
- **Features**: Property input, participant assignment, fee configuration
- **Navigation**: Accessible from dashboard "Create New Escrow" button

### 3. Escrow Details Flow
- **Purpose**: Individual transaction management
- **Features**: Status tracking, document verification, fund operations
- **Navigation**: Click any escrow from dashboard list

### 4. Settings Flow
- **Purpose**: Platform and user configuration
- **Features**: Wallet management, preferences, security settings
- **Navigation**: Settings icon in top navigation

**Port Configuration:**
- Frontend development: Port 3000 (React app)
- Production landing: Port 5000 (Static server)

### MetaMask Setup

1. Install MetaMask browser extension
2. Add Polygon network:
   - Network Name: `Polygon Mainnet`
   - RPC URL: `https://polygon-rpc.com`
   - Chain ID: `137`
   - Currency Symbol: `MATIC`
   - Block Explorer: `https://polygonscan.com`

3. Connect your wallet to interact with the escrow platform

## 🏗 Architecture

### Smart Contracts

- **PropertyEscrow**: Core escrow contract with multi-party support and role-based access control
- **MockERC20**: Test token for development and testing
- **EscrowStructs**: Shared data structures and enums

### Frontend Application - Four Main UI Flows

The platform features a streamlined interface with four core user flows:

#### 1. **Dashboard** (`/dashboard`)
- Overview of all escrow transactions
- Real-time status updates and notifications
- Quick access to active escrows and pending actions
- Transaction history and audit trail

#### 2. **Create Escrow** (`/create-escrow`)
- Step-by-step escrow creation wizard
- Property details input and document upload
- Participant role assignment (buyer, seller, agent, arbiter)
- Deposit amount and fee configuration

#### 3. **Escrow Details** (`/escrow/:id`)
- Individual escrow transaction management
- Status tracking and milestone completion
- Document verification and approval workflow
- Fund deposit, release, and dispute handling

#### 4. **Settings** (`/settings`)
- Wallet connection and network management
- User preferences and accessibility options
- Platform configuration and fee settings
- Security and notification preferences

### Technical Architecture

```
frontend/
├── src/
│   ├── pages/              # Four main UI flows
│   │   ├── Dashboard.tsx          # Flow 1: Transaction overview
│   │   ├── CreateEscrow.tsx       # Flow 2: Escrow creation
│   │   ├── EscrowDetails.tsx      # Flow 3: Transaction management
│   │   └── Settings.tsx           # Flow 4: User preferences
│   ├── components/         # Reusable UI components
│   ├── contexts/          # Wallet and Theme contexts
│   ├── services/          # Contract interaction services
│   └── utils/             # Utilities and helpers
```

## 🔧 Development

### Running Tests

**Smart Contract Tests:**
```bash
npx hardhat test
```

**Frontend Tests:**
```bash
cd frontend && npm test
```

**Test Coverage:**
```bash
npx hardhat coverage
cd frontend && npm test -- --coverage
```

**CLI Demo:**
```bash
node cli-demo.js
```

### Development Workflows

1. **Contract Development**
   - Modify contracts in `contracts/`
   - Run tests: `npx hardhat test`
   - Deploy: `npx hardhat run scripts/deploy.js --network localhost`

2. **Frontend Development**
   - Start dev server: `cd frontend && npm start`
   - Run tests: `npm test`
   - Build production: `npm run build`

## 📋 Features

### Core Functionality

- **Escrow Creation**: Multi-party property escrow setup
- **Fund Management**: Secure deposit, approval, and release
- **Dispute Resolution**: Built-in arbitration system
- **Wallet Integration**: MetaMask and Web3 wallet support
- **Real-time Updates**: Live transaction status monitoring

### Security Features

- **Smart Contract Auditing**: Comprehensive test coverage
- **Role-based Access**: Buyer, seller, agent, arbiter permissions
- **Time-locked Transactions**: Deadline enforcement
- **Emergency Controls**: Cancel and dispute mechanisms

## 🧪 Testing

### Test Categories

1. **Unit Tests**: Individual component functionality
2. **Integration Tests**: Cross-component interactions
3. **Contract Tests**: Smart contract behavior validation
4. **E2E Tests**: Complete user workflows
5. **Accessibility Tests**: WCAG compliance verification

### Running Specific Tests

```bash
# Smart contract tests only
npx hardhat test test/Core.test.js

# Frontend component tests
cd frontend && npm test -- --testPathPattern=components

# Coverage with threshold enforcement
npx hardhat coverage --solcoverjs .solcover.js
```

## 🔐 Security

### Smart Contract Security

- Reentrancy protection with OpenZeppelin ReentrancyGuard
- Access control with role-based permissions
- Input validation and overflow protection
- Emergency pause functionality

### Frontend Security

- Input sanitization and validation
- Secure wallet connection handling
- Error boundary implementation
- XSS protection measures

## 🌐 Deployment

### Local Development

1. Start Hardhat network: `npx hardhat node`
2. Deploy contracts: `npm run deploy:localhost`
3. Start frontend: `cd frontend && npm start`

### Production Deployment

1. Configure environment variables
2. Deploy contracts to target network
3. Build frontend: `cd frontend && npm run build`
4. Deploy static assets to hosting platform

## 🔧 Troubleshooting

### Common Issues

**Alchemy Connection Errors**
- Verify REACT_APP_ALCHEMY_RPC_URL is set correctly in .env
- Check Alchemy API key is valid and has sufficient credits
- Ensure network is set to Polygon Mainnet (Chain ID: 137)

**MetaMask Connection Errors**
- Ensure MetaMask is installed and unlocked
- Verify Polygon network is added to MetaMask
- Switch to Polygon Mainnet in MetaMask

**Frontend Issues**
- Clear browser cache and reload
- Check browser console for detailed error messages
- Verify all environment variables are configured
- Check for other applications using these ports

**Contract Deployment Failures**
- Verify Hardhat network is running
- Check account has sufficient ETH for deployment
- Ensure contract compilation succeeds: `npx hardhat compile`

**Build Errors**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Verify Node.js version compatibility (18+)
- Check for TypeScript errors: `npx tsc --noEmit`

### Node Version Issues

This project requires Node.js 18 or higher. Use nvm to manage versions:

```bash
nvm install 18
nvm use 18
```

### Missing Environment Configuration

Create `.env` files based on `.env.example`:

```bash
cp .env.example .env
cd frontend && cp .env.example .env
```

### Contract Interaction Errors

- Verify contract addresses match deployed instances
- Check ABI files are up to date after redeployment
- Ensure correct network selection in MetaMask

### Performance Issues

- Enable hardware acceleration in browser
- Close unnecessary browser tabs
- Monitor system memory usage during development

## 📖 API Documentation

### Smart Contract Interface

**EscrowFactory**
- `createEscrow()`: Create new escrow instance
- `getEscrowsByParty()`: Get escrows for specific address
- `whitelistToken()`: Add token to approved list

**PropertyEscrow**
- `deposit()`: Deposit funds into escrow
- `approve()`: Approve fund release
- `release()`: Release funds to seller
- `cancel()`: Cancel escrow transaction

### Frontend Hooks

**useWallet**
- Wallet connection management
- Account and balance tracking
- Network switching utilities

**useEscrow**
- Escrow data fetching
- Transaction state management
- Contract interaction methods

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

### Development Standards

- Write comprehensive tests for new features
- Follow TypeScript strict mode guidelines
- Maintain >90% test coverage
- Document public API changes
- Follow conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support and questions:

1. Check this README and troubleshooting section
2. Review existing GitHub issues
3. Create new issue with detailed description
4. Include system information and error logs

## 📊 Project Status

- ✅ Smart contracts deployed and tested
- ✅ Frontend core functionality complete
- ✅ CLI demo operational
- ✅ Local development environment
- 🔄 Production deployment pipeline
- 🔄 Comprehensive documentation
- 🔄 Advanced security auditing