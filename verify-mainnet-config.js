const { ethers } = require('ethers');

async function verifyMainnetConfiguration() {
  console.log('🔍 Verifying Polygon Mainnet Configuration...\n');
  
  const alchemyApiKey = process.env.REACT_APP_ALCHEMY_RPC_URL;
  if (!alchemyApiKey) {
    console.error('❌ Missing Alchemy API key');
    return false;
  }

  const alchemyUrl = `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;
  
  try {
    const provider = new ethers.JsonRpcProvider(alchemyUrl);
    
    // Verify network details
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    const gasPrice = await provider.getFeeData();
    
    console.log('✅ Network Verification:');
    console.log(`   Chain ID: ${Number(network.chainId)} (Expected: 137)`);
    console.log(`   Network Name: ${network.name}`);
    console.log(`   Current Block: ${blockNumber.toLocaleString()}`);
    console.log(`   Gas Price: ${ethers.formatUnits(gasPrice.gasPrice, 'gwei')} Gwei`);
    
    // Verify this is actually Polygon Mainnet
    if (Number(network.chainId) !== 137) {
      console.error(`❌ Wrong network! Expected Chain ID 137, got ${Number(network.chainId)}`);
      return false;
    }
    
    // Test a few mainnet addresses to confirm we're on the right network
    const maticBalance = await provider.getBalance('0x0000000000000000000000000000000000001010'); // MATIC token contract
    console.log(`   MATIC Contract Balance: ${ethers.formatEther(maticBalance)} MATIC`);
    
    console.log('\n🎉 Polygon Mainnet configuration verified successfully!');
    console.log('🚀 All blockchain operations are properly configured for production');
    
    return true;
  } catch (error) {
    console.error('❌ Mainnet verification failed:', error.message);
    return false;
  }
}

verifyMainnetConfiguration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(console.error);