// Robust provider with fallback strategies and enhanced error handling
import { ethers } from 'ethers';
import { JsonRpcValidator } from './jsonRpcValidator';
import { SafeProviderFactory } from './safeEthersProvider';
import logger from './logger';

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
        logger.providerInitialized(`Attempt ${attempt}/${this.config.retries} for ${url}`);

        // Use SafeProviderFactory for JSON-validated connection
        const provider = await SafeProviderFactory.createProvider(url);
        
        if (provider) {
          logger.providerInitialized(`Provider created successfully for ${url}`);
          return provider;
        } else {
          throw new Error(`SafeProviderFactory failed for ${url}`);
        }

      } catch (error) {
        logger.error(`Provider creation attempt ${attempt} failed`, error as Error);
        
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

    // Try Alchemy provider first
    const alchemyUrl = process.env.REACT_APP_ALCHEMY_RPC_URL;
    if (alchemyUrl && alchemyUrl.startsWith('https://polygon-mainnet.g.alchemy.com/v2/')) {
      try {
        const alchemyProvider = await this.createProviderWithRetry(alchemyUrl);
        if (alchemyProvider) {
          this.instance = alchemyProvider;
          console.log('Connected to Alchemy provider');
          return alchemyProvider;
        }
      } catch (error) {
        console.warn('Alchemy provider failed:', error);
      }
    }

    // Try public Polygon RPC as fallback
    try {
      const polygonProvider = await this.createProviderWithRetry('https://polygon-rpc.com/');
      if (polygonProvider) {
        this.instance = polygonProvider;
        console.log('Connected to public Polygon RPC');
        return polygonProvider;
      }
    } catch (error) {
      console.warn('Public Polygon RPC failed:', error);
    }

    // Try MetaMask as final fallback
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const metamaskProvider = new ethers.BrowserProvider(window.ethereum);
        await this.withTimeout(metamaskProvider.getBlockNumber(), 3000);
        this.instance = metamaskProvider;
        console.log('Connected via MetaMask wallet');
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