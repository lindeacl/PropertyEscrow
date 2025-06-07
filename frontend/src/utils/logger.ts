/**
 * Comprehensive Logging Utility for Property Escrow Platform
 * Logs all user actions, contract interactions, and errors
 */

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

export enum LogCategory {
  WALLET = 'WALLET',
  ESCROW = 'ESCROW',
  TRANSACTION = 'TRANSACTION',
  CONTRACT = 'CONTRACT',
  UI = 'UI',
  NETWORK = 'NETWORK',
  EVENT = 'EVENT'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  action: string;
  data?: any;
  error?: Error;
  txHash?: string;
  userAddress?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, category, action, data, error, txHash, userAddress } = entry;
    
    let logMessage = `[${timestamp}] [${level}] [${category}] ${action}`;
    
    if (userAddress) {
      logMessage += ` | User: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    }
    
    if (txHash) {
      logMessage += ` | TX: ${txHash}`;
    }

    return logMessage;
  }

  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    action: string,
    options: {
      data?: any;
      error?: Error;
      txHash?: string;
      userAddress?: string;
    } = {}
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      action,
      ...options
    };
  }

  // Wallet Actions
  walletConnectAttempt(walletType: string) {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.WALLET, `Attempting to connect ${walletType} wallet`);
    console.log(this.formatLog(entry));
  }

  walletConnected(address: string, network: string) {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.WALLET, 'Wallet connected successfully', {
      userAddress: address,
      data: { network }
    });
    console.log(this.formatLog(entry), entry.data);
  }

  walletDisconnected(address?: string) {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.WALLET, 'Wallet disconnected', {
      userAddress: address
    });
    console.log(this.formatLog(entry));
  }

  walletError(error: Error, action: string) {
    const entry = this.createLogEntry(LogLevel.ERROR, LogCategory.WALLET, `Wallet error during ${action}`, {
      error
    });
    console.error(this.formatLog(entry), error);
  }

  // Network Events
  networkChanged(newNetwork: string, oldNetwork?: string) {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.NETWORK, 'Network changed', {
      data: { newNetwork, oldNetwork }
    });
    console.log(this.formatLog(entry), entry.data);
  }

  providerInitialized(providerType: string) {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.NETWORK, `Provider initialized: ${providerType}`);
    console.log(this.formatLog(entry));
  }

  // Escrow Actions
  escrowCreateAttempt(params: any, userAddress: string) {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.ESCROW, 'Creating new escrow', {
      userAddress,
      data: {
        buyer: params.buyer,
        seller: params.seller,
        amount: params.depositAmount?.toString(),
        propertyId: params.property?.propertyId
      }
    });
    console.log(this.formatLog(entry), entry.data);
  }

  escrowCreated(escrowAddress: string, escrowId: string, txHash: string, userAddress: string) {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.ESCROW, 'Escrow created successfully', {
      userAddress,
      txHash,
      data: { escrowAddress, escrowId }
    });
    console.log(this.formatLog(entry), entry.data);
  }

  escrowDepositAttempt(escrowAddress: string, amount: string, userAddress: string) {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.ESCROW, 'Depositing funds to escrow', {
      userAddress,
      data: { escrowAddress, amount }
    });
    console.log(this.formatLog(entry), entry.data);
  }

  escrowDeposited(escrowAddress: string, amount: string, txHash: string, userAddress: string) {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.ESCROW, 'Funds deposited successfully', {
      userAddress,
      txHash,
      data: { escrowAddress, amount }
    });
    console.log(this.formatLog(entry), entry.data);
  }

  escrowReleaseAttempt(escrowAddress: string, userAddress: string) {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.ESCROW, 'Attempting to release funds', {
      userAddress,
      data: { escrowAddress }
    });
    console.log(this.formatLog(entry), entry.data);
  }

  escrowReleased(escrowAddress: string, txHash: string, userAddress: string) {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.ESCROW, 'Funds released successfully', {
      userAddress,
      txHash,
      data: { escrowAddress }
    });
    console.log(this.formatLog(entry), entry.data);
  }

  escrowDisputeRaised(escrowAddress: string, reason: string, txHash: string, userAddress: string) {
    const entry = this.createLogEntry(LogLevel.WARN, LogCategory.ESCROW, 'Dispute raised', {
      userAddress,
      txHash,
      data: { escrowAddress, reason }
    });
    console.log(this.formatLog(entry), entry.data);
  }

  escrowRefunded(escrowAddress: string, txHash: string, userAddress: string) {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.ESCROW, 'Escrow refunded', {
      userAddress,
      txHash,
      data: { escrowAddress }
    });
    console.log(this.formatLog(entry), entry.data);
  }

  // Transaction Lifecycle
  transactionSent(action: string, txHash: string, userAddress: string, contractAddress?: string) {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.TRANSACTION, `Transaction sent: ${action}`, {
      userAddress,
      txHash,
      data: { contractAddress }
    });
    console.log(this.formatLog(entry), entry.data);
  }

  transactionMined(action: string, txHash: string, blockNumber: number, gasUsed: string) {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.TRANSACTION, `Transaction mined: ${action}`, {
      txHash,
      data: { blockNumber, gasUsed }
    });
    console.log(this.formatLog(entry), entry.data);
  }

  transactionFailed(action: string, txHash: string, error: Error, userAddress: string) {
    const entry = this.createLogEntry(LogLevel.ERROR, LogCategory.TRANSACTION, `Transaction failed: ${action}`, {
      userAddress,
      txHash,
      error
    });
    console.error(this.formatLog(entry), error);
  }

  // Contract Interactions
  contractCall(contractName: string, method: string, args: any[], userAddress: string, contractAddress: string) {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.CONTRACT, `Calling ${contractName}.${method}`, {
      userAddress,
      data: {
        contractAddress,
        method,
        arguments: args
      }
    });
    console.log(this.formatLog(entry), entry.data);
  }

  contractError(contractName: string, method: string, error: Error, userAddress?: string) {
    const entry = this.createLogEntry(LogLevel.ERROR, LogCategory.CONTRACT, `Contract error: ${contractName}.${method}`, {
      userAddress,
      error
    });
    console.error(this.formatLog(entry), error.message, error.stack);
  }

  // Smart Contract Events
  contractEvent(eventName: string, eventData: any, txHash: string, contractAddress: string) {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.EVENT, `Contract event: ${eventName}`, {
      txHash,
      data: {
        contractAddress,
        eventData
      }
    });
    console.log(this.formatLog(entry), entry.data);
  }

  // UI Actions and Errors
  uiAction(action: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.DEBUG, LogCategory.UI, action, { data });
    if (this.isDevelopment) {
      console.log(this.formatLog(entry), entry.data);
    }
  }

  uiError(error: Error, component: string, action?: string) {
    const entry = this.createLogEntry(LogLevel.ERROR, LogCategory.UI, `UI error in ${component}${action ? ` during ${action}` : ''}`, {
      error
    });
    console.error(this.formatLog(entry), error.message, error.stack);
  }

  // General Error Logging
  error(message: string, error: Error, category: LogCategory = LogCategory.UI) {
    const entry = this.createLogEntry(LogLevel.ERROR, category, message, { error });
    console.error(this.formatLog(entry), error.message, error.stack);
  }

  // Performance Logging
  performance(action: string, duration: number, data?: any) {
    const entry = this.createLogEntry(LogLevel.DEBUG, LogCategory.UI, `Performance: ${action} took ${duration}ms`, { data });
    if (this.isDevelopment) {
      console.log(this.formatLog(entry), entry.data);
    }
  }
}

export const logger = new Logger();
export default logger;