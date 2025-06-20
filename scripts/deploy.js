const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying PropertyEscrow contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const PropertyEscrow = await ethers.getContractFactory("PropertyEscrow");
  const propertyEscrow = await PropertyEscrow.deploy();

  await propertyEscrow.waitForDeployment();
  const contractAddress = await propertyEscrow.getAddress();

  console.log("PropertyEscrow deployed to:", contractAddress);
  console.log("Transaction hash:", propertyEscrow.deploymentTransaction().hash);

  console.log("Granting AGENT_ROLE to deployer...");
  const AGENT_ROLE = await propertyEscrow.AGENT_ROLE();
  await propertyEscrow.grantRole(AGENT_ROLE, deployer.address);
  console.log("AGENT_ROLE granted to:", deployer.address);

  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: hre.network.name,
    deploymentHash: propertyEscrow.deploymentTransaction().hash,
    timestamp: new Date().toISOString()
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
