// Connection testing utilities

export const testDirectConnection = async () => {
  console.log('=== Blockchain Connection Test ===');
  
  try {
    // Use proxied API endpoint to avoid CORS issues
    const endpoints = [
      `/api/status`,
      `http://localhost:5000/api/status`,
      `http://127.0.0.1:5000/api/status`
    ];
    
    let statusData = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing status endpoint: ${endpoint}`);
        const response = await fetch(endpoint);
        console.log(`Status check response for ${endpoint}:`, response.status);
        
        if (response.ok) {
          statusData = await response.json();
          console.log('Status data received:', statusData);
          break;
        }
      } catch (error) {
        console.log(`Status check failed for ${endpoint}:`, error);
        continue;
      }
    }
    
    if (!statusData) {
      throw new Error('Unable to connect to blockchain status API');
    }
    
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
    // Use proxied API endpoint to check contract deployment
    const endpoints = [
      `/api/status`,
      `http://localhost:5000/api/status`,
      `http://127.0.0.1:5000/api/status`
    ];
    
    let statusData = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Checking contracts via: ${endpoint}`);
        const response = await fetch(endpoint);
        
        if (response.ok) {
          statusData = await response.json();
          console.log('Contract status received:', statusData.contracts);
          break;
        }
      } catch (error) {
        console.log(`Contract check failed for ${endpoint}:`, error);
        continue;
      }
    }
    
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