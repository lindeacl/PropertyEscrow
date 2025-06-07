// Connection testing utilities
import { getProvider } from './provider';

export const testDirectConnection = async () => {
  console.log('=== Blockchain Connection Test ===');
  
  try {
    // Test API status endpoint first
    const response = await fetch('http://127.0.0.1:8546/api/status');
    if (response.ok) {
      const statusData = await response.json();
      console.log('Status data received:', statusData);
      
      if (statusData.blockchain?.success) {
        return {
          success: true,
          blockNumber: statusData.blockchain.blockNumber,
          network: statusData.blockchain.network
        };
      } else {
        throw new Error(statusData.blockchain?.error || 'Blockchain connection failed');
      }
    } else {
      // Fallback to direct provider connection
      const provider = await getProvider();
      if (provider) {
        const blockNumber = await provider.getBlockNumber();
        return {
          success: true,
          blockNumber,
          network: 'localhost'
        };
      } else {
        throw new Error('No provider available');
      }
    }
  } catch (error) {
    console.error('Blockchain connection test failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

export const testContractConnection = async () => {
  console.log('=== Contract Connection Test ===');
  
  try {
    // Test API status endpoint for contract deployment
    const response = await fetch('http://127.0.0.1:8546/api/status');
    if (response.ok) {
      const statusData = await response.json();
      
      if (!statusData?.contracts) {
        throw new Error('Unable to check contract deployment status');
      }
      
      const contracts = statusData.contracts;
      const allDeployed = contracts.MockERC20?.deployed && contracts.EscrowFactory?.deployed;
      
      if (allDeployed) {
        return {
          success: true,
          contracts: {
            MockERC20: contracts.MockERC20.address,
            EscrowFactory: contracts.EscrowFactory.address
          }
        };
      } else {
        const missingContracts = Object.entries(contracts)
          .filter(([name, info]) => !(info as any)?.deployed)
          .map(([name]) => name);
        
        throw new Error(`Contracts not deployed: ${missingContracts.join(', ')}`);
      }
    } else {
      throw new Error('Unable to reach contract status API');
    }
  } catch (error) {
    console.error('Contract connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown contract error'
    };
  }
};