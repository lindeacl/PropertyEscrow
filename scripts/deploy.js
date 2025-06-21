const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying PropertyEscrow Factory and Implementation contracts...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  console.log("\n1. Deploying PropertyEscrowImplementation...");
  const PropertyEscrowImplementation = await ethers.getContractFactory("PropertyEscrowImplementation");
  const implementation = await PropertyEscrowImplementation.deploy();
  await implementation.waitForDeployment();
  const implementationAddress = await implementation.getAddress();
  console.log("PropertyEscrowImplementation deployed to:", implementationAddress);

  console.log("\n2. Deploying PropertyEscrowFactory...");
  const PropertyEscrowFactory = await ethers.getContractFactory("PropertyEscrowFactory");
  const factory = await PropertyEscrowFactory.deploy(implementationAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("PropertyEscrowFactory deployed to:", factoryAddress);

  console.log("\n3. Granting AGENT_ROLE to deployer...");
  const AGENT_ROLE = await factory.AGENT_ROLE();
  await factory.grantRole(AGENT_ROLE, deployer.address);
  console.log("AGENT_ROLE granted to:", deployer.address);

  console.log("\n4. Deploying legacy PropertyEscrow for backward compatibility...");
  const PropertyEscrow = await ethers.getContractFactory("PropertyEscrow");
  const legacyEscrow = await PropertyEscrow.deploy();
  await legacyEscrow.waitForDeployment();
  const legacyAddress = await legacyEscrow.getAddress();
  console.log("Legacy PropertyEscrow deployed to:", legacyAddress);

  const deploymentInfo = {
    factoryAddress: factoryAddress,
    implementationAddress: implementationAddress,
    legacyContractAddress: legacyAddress,
    deployer: deployer.address,
    network: hre.network.name,
    factoryDeploymentHash: factory.deploymentTransaction().hash,
    implementationDeploymentHash: implementation.deploymentTransaction().hash,
    legacyDeploymentHash: legacyEscrow.deploymentTransaction().hash,
    timestamp: new Date().toISOString()
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n=== Environment Variables to Update ===");
  console.log(`FACTORY_CONTRACT_ADDRESS=${factoryAddress}`);
  console.log(`IMPLEMENTATION_CONTRACT_ADDRESS=${implementationAddress}`);
  console.log(`LEGACY_CONTRACT_ADDRESS=${legacyAddress}`);
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
