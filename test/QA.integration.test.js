const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Phase 6 QA - Full Escrow Flow Integration Tests", function () {
  let propertyEscrow;
  let mockToken;
  let owner, buyer, seller, agent, arbiter, platformWallet;

  beforeEach(async function () {
    [owner, buyer, seller, agent, arbiter, platformWallet] = await ethers.getSigners();

    // Deploy MockERC20 token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20.deploy(
      "Test Token",
      "TEST",
      ethers.parseEther("1000000")
    );

    // Deploy PropertyEscrow
    const PropertyEscrow = await ethers.getContractFactory("PropertyEscrow");
    propertyEscrow = await PropertyEscrow.deploy(
      platformWallet.address,
      250 // 2.5% platform fee
    );

    // Setup initial state
    await propertyEscrow.whitelistToken(mockToken.target, true);
    await mockToken.transfer(buyer.address, ethers.parseEther("10000"));
    await mockToken.connect(buyer).approve(propertyEscrow.target, ethers.parseEther("10000"));
  });

  describe("Complete Escrow Lifecycle - Happy Path", function () {
    it("Should complete full escrow flow successfully", async function () {
      // Step 1: Create Escrow
      const depositAmount = ethers.parseEther("1000");
      const agentFee = ethers.parseEther("50");
      const currentTime = Math.floor(Date.now() / 1000);
      
      const params = {
        buyer: buyer.address,
        seller: seller.address,
        agent: agent.address,
        arbiter: arbiter.address,
        tokenAddress: mockToken.target,
        depositAmount: depositAmount,
        agentFee: agentFee,
        platformFee: 250,
        property: {
          propertyId: "PROP-001",
          description: "Test Property",
          salePrice: depositAmount,
          documentHash: "0x1234567890123456789012345678901234567890123456789012345678901234",
          verified: false
        },
        depositDeadline: currentTime + 86400, // 1 day
        verificationDeadline: currentTime + 172800 // 2 days
      };

      const tx1 = await propertyEscrow.createEscrow(params);
      const receipt1 = await tx1.wait();
      
      // Verify escrow created
      const escrow = await propertyEscrow.getEscrow(0);
      expect(escrow.buyer).to.equal(buyer.address);
      expect(escrow.seller).to.equal(seller.address);
      expect(escrow.state).to.equal(0); // Created state
      
      // Step 2: Deposit Funds
      const initialBuyerBalance = await mockToken.balanceOf(buyer.address);
      const tx2 = await propertyEscrow.connect(buyer).depositFunds(0);
      await tx2.wait();
      
      // Verify funds deposited
      const escrowAfterDeposit = await propertyEscrow.getEscrow(0);
      expect(escrowAfterDeposit.state).to.equal(1); // Deposited state
      
      const finalBuyerBalance = await mockToken.balanceOf(buyer.address);
      expect(initialBuyerBalance - finalBuyerBalance).to.equal(depositAmount);
      
      // Step 3: Complete Verification
      const tx3 = await propertyEscrow.connect(agent).completeVerification(0);
      await tx3.wait();
      
      // Verify verification completed
      const escrowAfterVerification = await propertyEscrow.getEscrow(0);
      expect(escrowAfterVerification.state).to.equal(2); // Verified state
      
      // Step 4: Give Approvals
      const tx4 = await propertyEscrow.connect(buyer).giveApproval(0);
      await tx4.wait();
      
      const tx5 = await propertyEscrow.connect(seller).giveApproval(0);
      await tx5.wait();
      
      // Step 5: Release Funds
      const initialSellerBalance = await mockToken.balanceOf(seller.address);
      const initialPlatformBalance = await mockToken.balanceOf(platformWallet.address);
      const initialAgentBalance = await mockToken.balanceOf(agent.address);
      
      const tx6 = await propertyEscrow.releaseFunds(0);
      await tx6.wait();
      
      // Verify final state
      const finalEscrow = await propertyEscrow.getEscrow(0);
      expect(finalEscrow.state).to.equal(3); // Released state
      
      // Verify fund distribution
      const finalSellerBalance = await mockToken.balanceOf(seller.address);
      const finalPlatformBalance = await mockToken.balanceOf(platformWallet.address);
      const finalAgentBalance = await mockToken.balanceOf(agent.address);
      
      expect(finalSellerBalance).to.be.gt(initialSellerBalance);
      expect(finalPlatformBalance).to.be.gt(initialPlatformBalance);
      expect(finalAgentBalance).to.be.gt(initialAgentBalance);
      
      console.log("✅ Complete escrow flow tested successfully");
    });
  });

  describe("Error Handling and Edge Cases", function () {
    it("Should handle unauthorized access properly", async function () {
      const params = {
        buyer: buyer.address,
        seller: seller.address,
        agent: agent.address,
        arbiter: arbiter.address,
        tokenAddress: mockToken.target,
        depositAmount: ethers.parseEther("1000"),
        agentFee: ethers.parseEther("50"),
        platformFee: 250,
        property: {
          propertyId: "PROP-002",
          description: "Test Property 2",
          salePrice: ethers.parseEther("1000"),
          documentHash: "0x1234567890123456789012345678901234567890123456789012345678901234",
          verified: false
        },
        depositDeadline: Math.floor(Date.now() / 1000) + 86400,
        verificationDeadline: Math.floor(Date.now() / 1000) + 172800
      };

      await propertyEscrow.createEscrow(params);
      
      // Test unauthorized deposit
      try {
        await propertyEscrow.connect(seller).depositFunds(0);
        expect.fail("Should have thrown unauthorized access error");
      } catch (error) {
        expect(error.message).to.include("UnauthorizedAccess");
      }
      
      console.log("✅ Unauthorized access handling tested");
    });

    it("Should handle invalid escrow states", async function () {
      // Try to release funds without proper setup
      try {
        await propertyEscrow.releaseFunds(999);
        expect.fail("Should have thrown invalid escrow error");
      } catch (error) {
        expect(error.message).to.include("InvalidEscrowId");
      }
      
      console.log("✅ Invalid state handling tested");
    });
  });

  describe("Contract Pause Functionality", function () {
    it("Should prevent operations when paused", async function () {
      await propertyEscrow.pause();
      
      const params = {
        buyer: buyer.address,
        seller: seller.address,
        agent: agent.address,
        arbiter: arbiter.address,
        tokenAddress: mockToken.target,
        depositAmount: ethers.parseEther("1000"),
        agentFee: ethers.parseEther("50"),
        platformFee: 250,
        property: {
          propertyId: "PROP-003",
          description: "Test Property 3",
          salePrice: ethers.parseEther("1000"),
          documentHash: "0x1234567890123456789012345678901234567890123456789012345678901234",
          verified: false
        },
        depositDeadline: Math.floor(Date.now() / 1000) + 86400,
        verificationDeadline: Math.floor(Date.now() / 1000) + 172800
      };

      try {
        await propertyEscrow.createEscrow(params);
        expect.fail("Should have thrown paused error");
      } catch (error) {
        expect(error.message).to.include("Pausable: paused");
      }
      
      console.log("✅ Pause functionality tested");
    });
  });
});