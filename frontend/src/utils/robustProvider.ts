// Robust provider with fallback strategies and enhanced error handling
import { ethers } from 'ethers';

interface ProviderConfig {
  timeout: number;
  retries: number;
  retryDelay: number;
}

const DEFAULT_CONFIG: ProviderConfig = {
  timeout: 5000,
  retries: 3,
  retryDelay: 1000
};

export class RobustProvider {
  private static instance: ethers.Provider | null = null;
  private static config = DEFAULT_CONFIG;

  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async withTimeout<T>(
    promise: Promise<T>, 
    timeoutMs: number, 
    errorMessage = 'Operation timeout'
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
      )
    ]);
  }

  static async testConnection(url: string): Promise<boolean> {
    try {
      const response = await this.withTimeout(
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'net_version',
            params: [],
            id: 1
          })
        }),
        3000
      );

      if (!response.ok) return false;

      const data = await response.json();
      return data && (data.result !== undefined || data.error !== undefined);
    } catch {
      return false;
    }
  }

  static async createProviderWithRetry(url: string): Promise<ethers.Provider | null> {
    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        console.log(`Provider creation attempt ${attempt}/${this.config.retries} for ${url}`);

        // Test basic connectivity first
        const isConnected = await this.testConnection(url);
        if (!isConnected) {
          throw new Error(`Connection test failed for ${url}`);
        }

        // Create provider with specific configuration
        const provider = new ethers.JsonRpcProvider(url, undefined, {
          staticNetwork: true,
          batchMaxCount: 1, // Disable batching to avoid JSON parsing issues
          batchMaxSize: 1,
          batchStallTime: 0
        });

        // Test provider functionality
        const blockNumber = await this.withTimeout(
          provider.getBlockNumber(),
          this.config.timeout,
          `Provider test timeout for ${url}`
        );

        if (typeof blockNumber !== 'number' || blockNumber < 0) {
          throw new Error(`Invalid block number response: ${blockNumber}`);
        }

        console.log(`Provider created successfully for ${url}, block: ${blockNumber}`);
        return provider;

      } catch (error) {
        console.warn(`Provider creation attempt ${attempt} failed:`, error);
        
        if (attempt < this.config.retries) {
          await this.delay(this.config.retryDelay * attempt);
          continue;
        }
        
        throw error;
      }
    }

    return null;
  }

  static async getProvider(): Promise<ethers.Provider | null> {
    if (this.instance) {
      try {
        // Verify existing provider is still working
        await this.withTimeout(this.instance.getBlockNumber(), 2000);
        return this.instance;
      } catch {
        console.warn('Cached provider failed, creating new one');
        this.instance = null;
      }
    }

    // Try proxy server first
    try {
      const proxyProvider = await this.createProviderWithRetry('http://127.0.0.1:8546/rpc');
      if (proxyProvider) {
        this.instance = proxyProvider;
        return proxyProvider;
      }
    } catch (error) {
      console.warn('Proxy provider failed:', error);
    }

    // Try direct connection as fallback
    try {
      const directProvider = await this.createProviderWithRetry('http://127.0.0.1:8545');
      if (directProvider) {
        this.instance = directProvider;
        return directProvider;
      }
    } catch (error) {
      console.warn('Direct provider failed:', error);
    }

    // Try MetaMask as final fallback
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const metamaskProvider = new ethers.BrowserProvider(window.ethereum);
        await this.withTimeout(metamaskProvider.getBlockNumber(), 3000);
        this.instance = metamaskProvider;
        return metamaskProvider;
      } catch (error) {
        console.warn('MetaMask provider failed:', error);
      }
    }

    console.error('All provider strategies failed');
    return null;
  }

  static resetProvider(): void {
    this.instance = null;
  }

  static updateConfig(newConfig: Partial<ProviderConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}