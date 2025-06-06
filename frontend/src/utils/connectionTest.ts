import { ethers } from 'ethers';

export const testDirectConnection = async () => {
  console.log('=== Direct Connection Test ===');
  
  try {
    // Test connection via CORS-enabled proxy
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8546/rpc');
    console.log('Provider created successfully (via proxy)');
    
    // Test basic connection first
    const blockNumber = await provider.getBlockNumber();
    console.log('Block Number:', blockNumber);
    
    return {
      success: true,
      blockNumber,
      network: 'localhost'
    };
  } catch (error) {
    console.error('Direct connection failed:', error);
    
    // Try to determine if it's a CORS issue or connection issue
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('fetch') || errorMessage.includes('CORS')) {
      return {
        success: false,
        error: 'CORS or network access issue - blockchain may not be accessible from browser'
      };
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

export const testContractConnection = async () => {
  console.log('=== Contract Connection Test ===');
  
  try {
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8546/rpc');
    
    // Test contract exists
    const escrowFactoryAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    const mockTokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    
    const escrowFactoryCode = await provider.getCode(escrowFactoryAddress);
    const mockTokenCode = await provider.getCode(mockTokenAddress);
    
    const escrowFactoryDeployed = escrowFactoryCode !== '0x';
    const mockTokenDeployed = mockTokenCode !== '0x';
    
    console.log('EscrowFactory deployed:', escrowFactoryDeployed);
    console.log('MockToken deployed:', mockTokenDeployed);
    
    return {
      success: true,
      escrowFactoryDeployed,
      mockTokenDeployed
    };
  } catch (error) {
    console.error('Contract connection failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};