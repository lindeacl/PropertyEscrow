import { ethers } from 'ethers';

export const testDirectConnection = async () => {
  console.log('=== Direct Connection Test ===');
  
  try {
    // Try multiple endpoint variations to handle CORS/network issues
    const endpoints = [
      'http://localhost:8546',
      'http://127.0.0.1:8546',
      `http://${window.location.hostname}:8546`
    ];
    
    let workingEndpoint = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing proxy health endpoint: ${endpoint}/health`);
        const healthResponse = await fetch(`${endpoint}/health`);
        console.log(`Health check status for ${endpoint}:`, healthResponse.status);
        
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          console.log('Health check data:', healthData);
          workingEndpoint = endpoint;
          break;
        }
      } catch (error) {
        console.log(`Health check failed for ${endpoint}:`, error);
        continue;
      }
    }
    
    if (!workingEndpoint) {
      throw new Error('No working proxy endpoint found');
    }
    
    console.log(`Using working endpoint: ${workingEndpoint}/rpc`);
    
    const testPayload = {
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1
    };
    
    console.log('Making direct fetch request to proxy...');
    const response = await fetch('http://127.0.0.1:8546/rpc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('Fetch response status:', response.status);
    console.log('Fetch response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Fetch response data:', data);
    
    if (data.error) {
      throw new Error(`JSON-RPC Error: ${data.error.message}`);
    }
    
    const blockNumber = parseInt(data.result, 16);
    console.log('Block Number from fetch:', blockNumber);
    
    // Now test with ethers provider
    console.log('Testing with ethers provider...');
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8546/rpc');
    const ethersBlockNumber = await provider.getBlockNumber();
    console.log('Block Number from ethers:', ethersBlockNumber);
    
    return {
      success: true,
      blockNumber: ethersBlockNumber,
      network: 'localhost'
    };
  } catch (error) {
    console.error('Direct connection failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace',
      type: typeof error,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    if (errorMessage.includes('fetch') || errorMessage.includes('CORS') || errorMessage.includes('network')) {
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