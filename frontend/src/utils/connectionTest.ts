import { ethers } from 'ethers';

export const testDirectConnection = async () => {
  console.log('=== Direct Connection Test ===');
  
  try {
    // Test direct connection to local blockchain with timeout
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    console.log('Provider created successfully');
    
    // Add timeout to prevent hanging
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    // Test basic RPC call with timeout
    const blockNumber = await Promise.race([
      provider.getBlockNumber(),
      timeout
    ]);
    console.log('Block Number:', blockNumber);
    
    const chainId = await Promise.race([
      provider.send('eth_chainId', []),
      timeout
    ]);
    console.log('Chain ID:', chainId);
    
    const network = await Promise.race([
      provider.getNetwork(),
      timeout
    ]) as any;
    console.log('Network:', network);
    
    return {
      success: true,
      chainId,
      blockNumber,
      network: network?.name || 'localhost'
    };
  } catch (error) {
    console.error('Direct connection failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const testContractConnection = async () => {
  console.log('=== Contract Connection Test ===');
  
  try {
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    
    // Add timeout for contract calls
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Contract connection timeout')), 5000)
    );
    
    // Test contract exists
    const escrowFactoryAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    const mockTokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    
    const escrowFactoryCode = await Promise.race([
      provider.getCode(escrowFactoryAddress),
      timeout
    ]);
    
    const mockTokenCode = await Promise.race([
      provider.getCode(mockTokenAddress),
      timeout
    ]);
    
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