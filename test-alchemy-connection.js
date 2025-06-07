const { ethers } = require('ethers');

async function testAlchemyConnection() {
  console.log('🔗 Testing Alchemy Connection...');
  
  const alchemyApiKey = process.env.REACT_APP_ALCHEMY_RPC_URL;
  
  if (!alchemyApiKey) {
    console.error('❌ REACT_APP_ALCHEMY_RPC_URL not found in environment');
    return false;
  }
  
  // Construct proper Alchemy URL
  const alchemyUrl = `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;
  console.log('🔧 Using Alchemy URL:', alchemyUrl.substring(0, 50) + '...');
  
  try {
    console.log('📡 Connecting to Alchemy...');
    const provider = new ethers.JsonRpcProvider(alchemyUrl);
    
    // Test basic connectivity
    const blockNumber = await provider.getBlockNumber();
    console.log('✅ Connected successfully!');
    console.log('📊 Current block number:', blockNumber.toLocaleString());
    
    // Test network info
    const network = await provider.getNetwork();
    console.log('🌐 Network:', network.name, '(Chain ID:', Number(network.chainId), ')');
    
    // Test gas price
    const gasPrice = await provider.getFeeData();
    console.log('⛽ Current gas price:', ethers.formatUnits(gasPrice.gasPrice, 'gwei'), 'Gwei');
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

testAlchemyConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 Alchemy integration is working perfectly!');
      console.log('🚀 Your Property Escrow Platform is ready for Polygon network');
    } else {
      console.log('\n❌ Please check your Alchemy configuration');
    }
  })
  .catch(console.error);