const { ethers } = require('ethers');

async function testBlockchainConnection() {
  console.log('Testing blockchain connection...');
  
  try {
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    
    // Test basic connection
    const blockNumber = await provider.getBlockNumber();
    console.log('✓ Blockchain connected, block number:', blockNumber);
    
    // Test contracts
    const escrowFactoryAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    const mockTokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    
    const escrowFactoryCode = await provider.getCode(escrowFactoryAddress);
    const mockTokenCode = await provider.getCode(mockTokenAddress);
    
    console.log('✓ EscrowFactory deployed:', escrowFactoryCode !== '0x');
    console.log('✓ MockToken deployed:', mockTokenCode !== '0x');
    
    return true;
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    return false;
  }
}

testBlockchainConnection();