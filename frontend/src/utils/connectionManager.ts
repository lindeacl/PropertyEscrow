// Connection manager with automatic recovery and enhanced error handling
import { ethers } from 'ethers';
import { RobustProvider } from './robustProvider';
import { ConnectionDebugger } from './debugConnection';

interface ConnectionState {
  provider: ethers.Provider | null;
  isConnected: boolean;
  chainId: number;
  account: string | null;
  lastConnected: number;
  connectionType: 'alchemy' | 'metamask' | 'offline';
}

class ConnectionManager {
  private static instance: ConnectionManager;
  private state: ConnectionState = {
    provider: null,
    isConnected: false,
    chainId: 137,
    account: null,
    lastConnected: 0,
    connectionType: 'offline'
  };
  
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 2000;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      ConnectionDebugger.log('Initializing connection manager');
      
      const provider = await RobustProvider.getProvider();
      if (!provider) {
        throw new Error('No provider available');
      }

      // Get network and account info
      const network = await provider.getNetwork();
      let account = null;

      if (provider instanceof ethers.BrowserProvider) {
        try {
          const accounts = await provider.send('eth_requestAccounts', []);
          account = accounts[0] || null;
        } catch {
          // Silent fail for account request
        }
      }

      this.state = {
        provider,
        isConnected: true,
        chainId: Number(network.chainId),
        account,
        lastConnected: Date.now(),
        connectionType: provider instanceof ethers.BrowserProvider ? 'metamask' : 'alchemy'
      };

      this.startHealthCheck();
      this.reconnectAttempts = 0;
      
      ConnectionDebugger.log('Connection manager initialized successfully', {
        chainId: this.state.chainId,
        type: this.state.connectionType,
        hasAccount: !!this.state.account
      });

      return true;
    } catch (error) {
      ConnectionDebugger.error('Connection manager initialization failed', error);
      this.handleConnectionFailure();
      return false;
    }
  }

  private async healthCheck(): Promise<void> {
    if (!this.state.provider || !this.state.isConnected) {
      return;
    }

    try {
      await this.state.provider.getBlockNumber();
      this.state.lastConnected = Date.now();
    } catch (error) {
      ConnectionDebugger.error('Health check failed', error);
      this.handleConnectionFailure();
    }
  }

  private startHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(() => {
      this.healthCheck();
    }, 10000); // Check every 10 seconds
  }

  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  private handleConnectionFailure(): void {
    this.state.isConnected = false;
    this.state.provider = null;
    this.stopHealthCheck();

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    ConnectionDebugger.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      this.initialize();
    }, delay);
  }

  getState(): ConnectionState {
    return { ...this.state };
  }

  async getProvider(): Promise<ethers.Provider | null> {
    if (!this.state.isConnected || !this.state.provider) {
      const success = await this.initialize();
      if (!success) return null;
    }
    
    return this.state.provider;
  }

  async disconnect(): Promise<void> {
    this.stopHealthCheck();
    this.state = {
      provider: null,
      isConnected: false,
      chainId: 137,
      account: null,
      lastConnected: 0,
      connectionType: 'offline'
    };
    this.reconnectAttempts = 0;
    
    ConnectionDebugger.log('Connection manager disconnected');
  }

  async reconnect(): Promise<boolean> {
    await this.disconnect();
    return this.initialize();
  }
}

export default ConnectionManager;