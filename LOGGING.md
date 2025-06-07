# Comprehensive Logging Documentation
## Property Escrow Platform Logging System

This document describes the comprehensive logging system implemented throughout the Property Escrow Platform for monitoring user actions, contract interactions, and system events.

## Frontend Logging Architecture

### Logger Utility (`frontend/src/utils/logger.ts`)

The centralized logging utility provides structured logging with the following categories:

#### Log Levels
- **INFO**: General information and successful operations
- **WARN**: Warning conditions that don't prevent operation
- **ERROR**: Error conditions requiring attention
- **DEBUG**: Detailed information for development

#### Log Categories
- **WALLET**: Wallet connection, disconnection, and authentication events
- **ESCROW**: Escrow creation, deposits, releases, and disputes
- **TRANSACTION**: Blockchain transaction lifecycle events
- **CONTRACT**: Smart contract interactions and events
- **UI**: User interface actions and interactions
- **NETWORK**: Network changes and provider events
- **EVENT**: Smart contract event emissions

### Error Boundary Implementation

The `ErrorBoundary` component (`frontend/src/components/ErrorBoundary.tsx`) catches and logs all React component errors with:

- Full error stack traces
- Component stack information
- Automatic error reporting
- User-friendly error display
- Development-only detailed error information

## Frontend Logging Examples

### Wallet Operations
```javascript
// Wallet connection attempt
logger.walletConnectAttempt('MetaMask');

// Successful wallet connection
logger.walletConnected('0x742d...4c85', 'Polygon Mainnet');

// Wallet disconnection
logger.walletDisconnected('0x742d...4c85');

// Wallet errors
logger.walletError(error, 'Connection process');
```

### Escrow Operations
```javascript
// Escrow creation attempt
logger.escrowCreateAttempt({
  buyer: '0x123...',
  seller: '0x456...',
  amount: '1000',
  propertyId: 'PROP001'
}, userAddress);

// Successful escrow creation
logger.escrowCreated('0xEscrow...', 'escrow123', '0xTx...', userAddress);

// Fund deposit
logger.escrowDeposited('0xEscrow...', '1000', '0xTx...', userAddress);

// Fund release
logger.escrowReleased('0xEscrow...', '0xTx...', userAddress);

// Dispute raised
logger.escrowDisputeRaised('0xEscrow...', 'Property condition issues', '0xTx...', userAddress);
```

### Transaction Lifecycle
```javascript
// Transaction sent
logger.transactionSent('Deposit Funds', '0xTx...', userAddress, contractAddress);

// Transaction mined
logger.transactionMined('Deposit Funds', '0xTx...', blockNumber, gasUsed);

// Transaction failed
logger.transactionFailed('Deposit Funds', '0xTx...', error, userAddress);
```

### Contract Interactions
```javascript
// Contract method call
logger.contractCall('PropertyEscrow', 'depositFunds', [escrowId], userAddress, contractAddress);

// Contract error
logger.contractError('PropertyEscrow', 'depositFunds', error, userAddress);

// Contract event
logger.contractEvent('FundsDeposited', eventData, txHash, contractAddress);
```

### UI Actions
```javascript
// User interface actions
logger.uiAction('Navigate to Create Escrow', { route: '/create' });
logger.uiAction('Form submission', { formType: 'createEscrow' });
logger.uiAction('Button click', { action: 'connectWallet' });

// UI errors
logger.uiError(error, 'CreateEscrow', 'Form validation');
```

## Smart Contract Event Logging

### Existing Events in PropertyEscrow.sol

The PropertyEscrow contract emits the following events that are automatically logged:

#### Core Events
```solidity
event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, uint256 depositAmount);
event FundsDeposited(uint256 indexed escrowId, address indexed buyer, uint256 amount);
event VerificationCompleted(uint256 indexed escrowId, address indexed agent);
event ApprovalGiven(uint256 indexed escrowId, address indexed approver, uint8 role);
event FundsReleased(uint256 indexed escrowId, address indexed seller, uint256 amount, uint256 platformFee);
event EscrowCancelled(uint256 indexed escrowId, string reason);
event DisputeRaised(uint256 indexed escrowId, address indexed initiator, string reason);
event DisputeResolved(uint256 indexed escrowId, bool favorBuyer, string resolution);
```

#### Administrative Events
```solidity
event TokenWhitelisted(address indexed token, bool whitelisted);
event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
event PlatformWalletUpdated(address indexed oldWallet, address indexed newWallet);
event ContractPaused(address indexed admin);
event ContractUnpaused(address indexed admin);
```

### Event Logging in Frontend

All smart contract events are automatically captured and logged when transactions are processed:

```javascript
// Event listener setup
const contract = new ethers.Contract(address, abi, provider);

contract.on('FundsDeposited', (escrowId, buyer, amount, event) => {
  logger.contractEvent('FundsDeposited', {
    escrowId: escrowId.toString(),
    buyer,
    amount: amount.toString()
  }, event.transactionHash, contract.address);
});
```

## Sample Log Output

### Wallet Connection Flow
```
[2024-12-07T14:30:15.123Z] [INFO] [WALLET] Attempting to connect MetaMask wallet
[2024-12-07T14:30:16.456Z] [INFO] [WALLET] Wallet connected successfully | User: 0x742d...4c85
[2024-12-07T14:30:16.500Z] [INFO] [NETWORK] Provider initialized: Contract service with signer
```

### Escrow Creation Flow
```
[2024-12-07T14:31:00.123Z] [INFO] [ESCROW] Creating new escrow | User: 0x742d...4c85
[2024-12-07T14:31:00.200Z] [INFO] [CONTRACT] Calling EscrowFactory.createEscrow | User: 0x742d...4c85
[2024-12-07T14:31:05.456Z] [INFO] [TRANSACTION] Transaction sent: Create Escrow | TX: 0x123a...def9 | User: 0x742d...4c85
[2024-12-07T14:31:08.789Z] [INFO] [TRANSACTION] Transaction mined: Create Escrow | TX: 0x123a...def9
[2024-12-07T14:31:08.800Z] [INFO] [EVENT] Contract event: EscrowCreated | TX: 0x123a...def9
[2024-12-07T14:31:08.850Z] [INFO] [ESCROW] Escrow created successfully | User: 0x742d...4c85 | TX: 0x123a...def9
```

### Error Logging
```
[2024-12-07T14:35:00.123Z] [ERROR] [WALLET] Wallet error during Connection process
Error: User rejected the request.
    at MetaMaskProvider.request (...)
    at connectWallet (...)

[2024-12-07T14:36:15.456Z] [ERROR] [CONTRACT] Contract error: PropertyEscrow.depositFunds | User: 0x742d...4c85
Error: insufficient funds for intrinsic transaction cost
    at Contract.depositFunds (...)
```

## Monitoring and Analysis

### Browser Console Access

All logs are visible in the browser's developer console:

1. Open Developer Tools (F12)
2. Navigate to Console tab
3. Filter by log level or category
4. Search for specific actions or transactions

### Log Filtering

Use browser console filtering to focus on specific areas:

```javascript
// Filter by category
console.log messages containing '[WALLET]'
console.log messages containing '[ESCROW]'
console.log messages containing '[TRANSACTION]'

// Filter by user address
console.log messages containing 'User: 0x742d'

// Filter by transaction hash
console.log messages containing 'TX: 0x123a'
```

### Performance Monitoring

The logger includes performance tracking:

```javascript
logger.performance('Escrow creation form submission', 1250, {
  formValidation: true,
  userAddress: '0x742d...4c85'
});
```

## Integration with External Services

The logging system is designed to integrate with external monitoring services:

### Sentry Integration (Production Ready)
```javascript
// In production, logs can be sent to Sentry
if (process.env.NODE_ENV === 'production') {
  Sentry.captureException(error, {
    tags: {
      category: LogCategory.WALLET,
      action: 'Connection process'
    },
    extra: logEntry
  });
}
```

### LogRocket Integration (Optional)
```javascript
// Session recording with context
LogRocket.captureMessage('Escrow created', {
  extra: {
    escrowId,
    userAddress,
    transactionHash
  }
});
```

## Troubleshooting Guide

### Common Log Patterns

1. **Wallet Connection Issues**
   - Look for `[WALLET]` logs with `ERROR` level
   - Check for MetaMask installation and network errors

2. **Transaction Failures**
   - Search for `[TRANSACTION]` logs with `failed` in the message
   - Review contract error messages for specific failure reasons

3. **Contract Interaction Problems**
   - Filter by `[CONTRACT]` category
   - Check for provider initialization and contract availability errors

4. **UI Component Errors**
   - Look for `[UI]` logs and Error Boundary reports
   - Review component stack traces for debugging

### Best Practices

1. **Development Mode**: All log levels are visible
2. **Production Mode**: Only ERROR and WARN levels are displayed
3. **Privacy**: Sensitive data is never logged (private keys, full balances)
4. **Performance**: Logging is optimized to minimize impact on application performance

This comprehensive logging system provides complete visibility into all platform operations, enabling effective debugging, monitoring, and user support.