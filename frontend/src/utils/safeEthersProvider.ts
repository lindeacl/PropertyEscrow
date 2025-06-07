// Safe ethers provider factory with JSON validation
import { ethers } from 'ethers';
import { JsonRpcValidator } from './jsonRpcValidator';

export class SafeProviderFactory {
  static async createProvider(url: string, network?: ethers.Networkish): Promise<ethers.JsonRpcProvider | null> {
    // Test connection first with safe JSON-RPC validation
    const testResponse = await JsonRpcValidator.safeJsonRpcCall(url, 'eth_chainId', [], 5000);
    
    if (!testResponse) {
      console.error('Failed to validate provider connection for', url);
      return null;
    }

    if (testResponse.error) {
      console.error('Provider test failed:', JsonRpcValidator.handleJsonRpcError(testResponse));
      return null;
    }

    // Create provider with safe configuration
    const provider = new ethers.JsonRpcProvider(url, network, {
      staticNetwork: true,
      batchMaxCount: 1,
      batchMaxSize: 1,
      batchStallTime: 0
    });

    // Verify provider works with a simple call
    try {
      await provider.getBlockNumber();
      console.log('Provider validation successful for', url);
      return provider;
    } catch (error) {
      console.error('Provider validation failed:', error);
      return null;
    }
  }

  static async validateProviderHealth(provider: ethers.Provider): Promise<boolean> {
    try {
      await provider.getBlockNumber();
      return true;
    } catch {
      return false;
    }
  }
}