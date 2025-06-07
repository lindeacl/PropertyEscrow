/**
 * Enterprise Property Escrow Platform - Interactive CLI Demo
 * Demonstrates core escrow flows with real blockchain interaction
 */

const { ethers } = require("hardhat");
const readline = require('readline');

class EscrowCLI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.contracts = {};
    this.accounts = {};
  }

  async initialize() {
    console.log("\n🏢 Enterprise Property Escrow Platform - Interactive Demo");
    console.log("=" .repeat(60));
    
    // Get accounts
    const signers = await ethers.getSigners();
    this.accounts = {
      deployer: signers[0],
      buyer: signers[1],
      seller: signers[2],
      agent: signers[3],
      arbiter: signers[4]
    };

    console.log("\n👥 Demo Participants:");
    console.log(`Deployer: ${this.accounts.deployer.address}`);
    console.log(`Buyer: ${this.accounts.buyer.address}`);
    console.log(`Seller: ${this.accounts.seller.address}`);
    console.log(`Agent: ${this.accounts.agent.address}`);
    console.log(`Arbiter: ${this.accounts.arbiter.address}`);

    await this.deployContracts();
    await this.showMainMenu();
  }

  async deployContracts() {
    console.log("\n🚀 Deploying contracts...");
    
    try {
      // Deploy MockERC20 token
      const MockERC20 = await ethers.getContractFactory("MockERC20");
      this.contracts.token = await MockERC20.deploy(
        "Demo USDC",
        "USDC",
        ethers.parseUnits("1000000", 18),
        { gasLimit: 3000000 }
      );
      await this.contracts.token.waitForDeployment();

      // Deploy EscrowFactory with required constructor parameters
      const EscrowFactory = await ethers.getContractFactory("EscrowFactory");
      this.contracts.factory = await EscrowFactory.deploy(
        this.accounts.deployer.address, // platformWallet
        250, // platformFee (2.5% in basis points)
        this.accounts.agent.address, // defaultAgent
        this.accounts.arbiter.address, // defaultArbiter
        { gasLimit: 8000000 }
      );
      await this.contracts.factory.waitForDeployment();

      console.log(`✅ MockERC20 deployed: ${await this.contracts.token.getAddress()}`);
      console.log(`✅ EscrowFactory deployed: ${await this.contracts.factory.getAddress()}`);

      // Distribute tokens to participants
      await this.distributeTokens();
    } catch (error) {
      console.error("❌ Deployment failed:", error.message);
      process.exit(1);
    }
  }

  async distributeTokens() {
    const amount = ethers.parseUnits("10000", 6); // 10,000 USDC
    
    await this.contracts.token.transfer(this.accounts.buyer.address, amount);
    await this.contracts.token.transfer(this.accounts.seller.address, amount);
    
    console.log("💰 Tokens distributed to participants");
  }

  async showMainMenu() {
    console.log("\n📋 Available Actions:");
    console.log("1. Create Property Escrow");
    console.log("2. View Escrow Details");
    console.log("3. Deposit Funds");
    console.log("4. Approve Release");
    console.log("5. Release Funds");
    console.log("6. Cancel Escrow");
    console.log("7. View Balances");
    console.log("8. Exit");

    const choice = await this.prompt("Select an action (1-8): ");
    await this.handleMenuChoice(choice);
  }

  async handleMenuChoice(choice) {
    try {
      switch (choice) {
        case '1':
          await this.createEscrow();
          break;
        case '2':
          await this.viewEscrowDetails();
          break;
        case '3':
          await this.depositFunds();
          break;
        case '4':
          await this.approveRelease();
          break;
        case '5':
          await this.releaseFunds();
          break;
        case '6':
          await this.cancelEscrow();
          break;
        case '7':
          await this.viewBalances();
          break;
        case '8':
          console.log("👋 Goodbye!");
          this.rl.close();
          return;
        default:
          console.log("❌ Invalid choice");
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
    }
    
    await this.showMainMenu();
  }

  async createEscrow() {
    console.log("\n🏠 Creating Property Escrow");
    
    const propertyId = await this.prompt("Property ID: ");
    const price = await this.prompt("Property Price (USDC): ");
    const description = await this.prompt("Property Description: ");

    const priceWei = ethers.parseUnits(price, 6);
    const agentFeeWei = ethers.parseUnits("0.1", 6); // 0.1 USDC agent fee
    const platformFeeWei = ethers.parseUnits("0.05", 6); // 0.05 USDC platform fee
    
    // Create the structured parameters that match CreateEscrowParams
    const escrowParams = {
      buyer: this.accounts.buyer.address,
      seller: this.accounts.seller.address,
      agent: this.accounts.agent.address,
      arbiter: this.accounts.arbiter.address,
      tokenAddress: await this.contracts.token.getAddress(),
      depositAmount: priceWei,
      agentFee: agentFeeWei,
      platformFee: platformFeeWei,
      property: {
        propertyId: propertyId,
        description: description,
        salePrice: priceWei,
        documentHash: "QmExampleHash123456789",
        verified: false
      },
      depositDeadline: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      verificationDeadline: Math.floor(Date.now() / 1000) + (7 * 86400) // 7 days
    };
    
    const tx = await this.contracts.factory.connect(this.accounts.seller).createEscrow(escrowParams);

    const receipt = await tx.wait();
    const event = receipt.logs.find(log => {
      try {
        const parsed = this.contracts.factory.interface.parseLog(log);
        return parsed?.name === 'EscrowContractDeployed';
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = this.contracts.factory.interface.parseLog(event);
      console.log(`✅ Escrow created! Contract: ${parsed.args.escrowContract}`);
      console.log(`   Escrow ID: ${parsed.args.escrowId}`);
      this.lastEscrowAddress = parsed.args.escrowContract;
      this.lastEscrowId = parsed.args.escrowId;
    }
  }

  async viewEscrowDetails() {
    const address = await this.prompt("Escrow address (or press Enter for last created): ");
    const escrowAddress = address || this.lastEscrowAddress;
    
    if (!escrowAddress) {
      console.log("❌ No escrow address provided");
      return;
    }

    const PropertyEscrow = await ethers.getContractFactory("PropertyEscrow");
    const escrow = PropertyEscrow.attach(escrowAddress);

    try {
      const details = await escrow.getEscrowDetails();
      const status = await escrow.status();
      
      console.log("\n📋 Escrow Details:");
      console.log(`Property ID: ${details.propertyId}`);
      console.log(`Price: ${ethers.formatUnits(details.price, 6)} USDC`);
      console.log(`Buyer: ${details.buyer}`);
      console.log(`Seller: ${details.seller}`);
      console.log(`Status: ${this.getStatusName(status)}`);
      console.log(`Description: ${details.description}`);
    } catch (error) {
      console.log("❌ Invalid escrow address or access denied");
    }
  }

  async depositFunds() {
    const address = await this.prompt("Escrow address: ");
    const amount = await this.prompt("Amount to deposit (USDC): ");
    
    const amountWei = ethers.parseUnits(amount, 6);
    
    // Approve token transfer
    await this.contracts.token.connect(this.accounts.buyer).approve(address, amountWei);
    
    const PropertyEscrow = await ethers.getContractFactory("PropertyEscrow");
    const escrow = PropertyEscrow.attach(address);
    
    const tx = await escrow.connect(this.accounts.buyer).depositFunds(amountWei);
    await tx.wait();
    
    console.log(`✅ Deposited ${amount} USDC to escrow`);
  }

  async approveRelease() {
    const address = await this.prompt("Escrow address: ");
    const role = await this.prompt("Approve as (buyer/seller/agent): ");
    
    let signer;
    switch (role.toLowerCase()) {
      case 'buyer':
        signer = this.accounts.buyer;
        break;
      case 'seller':
        signer = this.accounts.seller;
        break;
      case 'agent':
        signer = this.accounts.agent;
        break;
      default:
        console.log("❌ Invalid role");
        return;
    }

    const PropertyEscrow = await ethers.getContractFactory("PropertyEscrow");
    const escrow = PropertyEscrow.attach(address);
    
    const tx = await escrow.connect(signer).approveRelease();
    await tx.wait();
    
    console.log(`✅ Release approved by ${role}`);
  }

  async releaseFunds() {
    const address = await this.prompt("Escrow address: ");
    
    const PropertyEscrow = await ethers.getContractFactory("PropertyEscrow");
    const escrow = PropertyEscrow.attach(address);
    
    const tx = await escrow.connect(this.accounts.seller).releaseFunds();
    await tx.wait();
    
    console.log("✅ Funds released to seller");
  }

  async cancelEscrow() {
    const address = await this.prompt("Escrow address: ");
    
    const PropertyEscrow = await ethers.getContractFactory("PropertyEscrow");
    const escrow = PropertyEscrow.attach(address);
    
    const tx = await escrow.connect(this.accounts.arbiter).cancelEscrow();
    await tx.wait();
    
    console.log("✅ Escrow cancelled, funds returned to buyer");
  }

  async viewBalances() {
    console.log("\n💰 Token Balances:");
    
    for (const [role, account] of Object.entries(this.accounts)) {
      const balance = await this.contracts.token.balanceOf(account.address);
      console.log(`${role}: ${ethers.formatUnits(balance, 6)} USDC`);
    }
  }

  getStatusName(status) {
    const statuses = ['Created', 'Funded', 'Completed', 'Cancelled', 'Disputed'];
    return statuses[status] || 'Unknown';
  }

  prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// Main execution
async function main() {
  const cli = new EscrowCLI();
  await cli.initialize();
}

if (require.main === module) {
  main().catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { EscrowCLI };