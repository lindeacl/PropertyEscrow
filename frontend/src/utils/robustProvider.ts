// Robust provider with fallback strategies and enhanced error handling
import { ethers } from 'ethers';
import { JsonRpcValidator } from './jsonRpcValidator';
import { SafeProviderFactory } from './safeEthersProvider';

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
    const response = await JsonRpcValidator.safeJsonRpcCall(url, 'net_version', [], 3000);
    return response !== null && (response.result !== undefined || response.error !== undefined);
  }

  static async createProviderWithRetry(url: string): Promise<ethers.Provider | null> {
    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        console.log(`Provider creation attempt ${attempt}/${this.config.retries} for ${url}`);

        // Use SafeProviderFactory for JSON-validated connection
        const provider = await SafeProviderFactory.createProvider(url);
        
        if (provider) {
          console.log(`Provider created successfully for ${url}`);
          return provider;
        } else {
          throw new Error(`SafeProviderFactory failed for ${url}`);
        }

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