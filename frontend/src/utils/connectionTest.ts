// Connection testing utilities

export const testDirectConnection = async () => {
  console.log('=== Blockchain Connection Test ===');
  
  try {
    // Use global blockchain API bridge
    if (typeof (window as any).blockchainAPI === 'undefined') {
      throw new Error('Blockchain API bridge not available');
    }
    
    const statusData = await (window as any).blockchainAPI.getStatus();
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
    // Use global blockchain API bridge
    if (typeof (window as any).blockchainAPI === 'undefined') {
      throw new Error('Blockchain API bridge not available');
    }
    
    const statusData = await (window as any).blockchainAPI.getStatus();
    
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
  } catch (error) {
    console.error('Contract connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown contract error'
    };
  }
};