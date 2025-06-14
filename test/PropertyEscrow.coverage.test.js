const { expect } = require("chai");
const { ethers } = require("hardhat");
require("@nomicfoundation/hardhat-chai-matchers");

describe("PropertyEscrow - Comprehensive Coverage Tests", function () {
  let propertyEscrow;
  let mockToken;
  let owner, buyer, seller, agent, arbiter;
  let platformWallet;

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

    // Whitelist the token
    await propertyEscrow.whitelistToken(mockToken.target, true);

    // Transfer tokens to buyer for testing
    await mockToken.transfer(buyer.address, ethers.parseEther("10000"));
    
    // Approve PropertyEscrow to spend buyer's tokens
    await mockToken.connect(buyer).approve(propertyEscrow.target, ethers.parseEther("10000"));
  });

  describe("Contract Deployment", function () {
    it("Should deploy with correct initial values", async function () {
      expect(await propertyEscrow.platformWallet()).to.equal(platformWallet.address);
      expect(await propertyEscrow.platformFeePercentage()).to.equal(250n);
      expect(await propertyEscrow.MAX_PLATFORM_FEE()).to.equal(500n);
      expect(await propertyEscrow.BASIS_POINTS()).to.equal(10000n);
    });

    it("Should assign correct roles", async function () {
      const ADMIN_ROLE = await propertyEscrow.ADMIN_ROLE();
      const DEFAULT_ADMIN_ROLE = await propertyEscrow.DEFAULT_ADMIN_ROLE();
      
      expect(await propertyEscrow.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await propertyEscrow.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Escrow Creation", function () {
    it("Should create escrow with valid parameters", async function () {
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
          propertyId: "PROP-001",
          description: "Test Property",
          salePrice: ethers.parseEther("1000"),
          documentHash: "0x1234567890123456789012345678901234567890123456789012345678901234",
          verified: false
        },
        depositDeadline: Math.floor(Date.now() / 1000) + 86400, // 1 day
        verificationDeadline: Math.floor(Date.now() / 1000) + 172800 // 2 days
      };

      await expect(propertyEscrow.createEscrow(params))
        .to.emit(propertyEscrow, "EscrowCreated")
        .withArgs(0, buyer.address, seller.address, ethers.parseEther("1000"));

      const escrow = await propertyEscrow.getEscrow(0);
      expect(escrow.buyer).to.equal(buyer.address);
      expect(escrow.seller).to.equal(seller.address);
      expect(escrow.depositAmount).to.equal(ethers.parseEther("1000"));
    });

    it("Should reject invalid parameters", async function () {
      const params = {
        buyer: ethers.ZeroAddress,
        seller: seller.address,
        agent: agent.address,
        arbiter: arbiter.address,
        tokenAddress: mockToken.target,
        depositAmount: ethers.parseEther("1000"),
        agentFee: ethers.parseEther("50"),
        platformFee: 250,
        property: {
          propertyId: "PROP-001",
          description: "Test Property",
          salePrice: ethers.parseEther("1000"),
          documentHash: "0x1234567890123456789012345678901234567890123456789012345678901234",
          verified: false
        },
        depositDeadline: Math.floor(Date.now() / 1000) + 86400,
        verificationDeadline: Math.floor(Date.now() / 1000) + 172800
      };

      await expect(propertyEscrow.createEscrow(params))
        .to.be.revertedWithCustomError(propertyEscrow, "InvalidAddress");
    });
  });

  describe("Fund Deposit", function () {
    let escrowId;

    beforeEach(async function () {
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
          propertyId: "PROP-001",
          description: "Test Property",
          salePrice: ethers.parseEther("1000"),
          documentHash: "0x1234567890123456789012345678901234567890123456789012345678901234",
          verified: false
        },
        depositDeadline: Math.floor(Date.now() / 1000) + 86400,
        verificationDeadline: Math.floor(Date.now() / 1000) + 172800
      };

      const tx = await propertyEscrow.createEscrow(params);
      const receipt = await tx.wait();
      escrowId = 0; // First escrow
    });

    it("Should allow buyer to deposit funds", async function () {
      await expect(propertyEscrow.connect(buyer).depositFunds(escrowId))
        .to.emit(propertyEscrow, "FundsDeposited")
        .withArgs(escrowId, buyer.address, ethers.parseEther("1000"));

      const escrow = await propertyEscrow.getEscrow(escrowId);
      expect(escrow.state).to.equal(1); // Deposited state
    });

    it("Should reject deposit from non-buyer", async function () {
      await expect(propertyEscrow.connect(seller).depositFunds(escrowId))
        .to.be.revertedWithCustomError(propertyEscrow, "UnauthorizedAccess");
    });
  });

  describe("Verification Process", function () {
    let escrowId;

    beforeEach(async function () {
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
          propertyId: "PROP-001",
          description: "Test Property",
          salePrice: ethers.parseEther("1000"),
          documentHash: "0x1234567890123456789012345678901234567890123456789012345678901234",
          verified: false
        },
        depositDeadline: Math.floor(Date.now() / 1000) + 86400,
        verificationDeadline: Math.floor(Date.now() / 1000) + 172800
      };

      await propertyEscrow.createEscrow(params);
      escrowId = 0;
      await propertyEscrow.connect(buyer).depositFunds(escrowId);
    });

    it("Should allow agent to complete verification", async function () {
      await expect(propertyEscrow.connect(agent).completeVerification(escrowId))
        .to.emit(propertyEscrow, "VerificationCompleted")
        .withArgs(escrowId, agent.address);

      const escrow = await propertyEscrow.getEscrow(escrowId);
      expect(escrow.state).to.equal(2); // Verified state
    });

    it("Should reject verification from unauthorized user", async function () {
      await expect(propertyEscrow.connect(buyer).completeVerification(escrowId))
        .to.be.revertedWithCustomError(propertyEscrow, "UnauthorizedAccess");
    });
  });

  describe("Approval System", function () {
    let escrowId;

    beforeEach(async function () {
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
          propertyId: "PROP-001",
          description: "Test Property",
          salePrice: ethers.parseEther("1000"),
          documentHash: "0x1234567890123456789012345678901234567890123456789012345678901234",
          verified: false
        },
        depositDeadline: Math.floor(Date.now() / 1000) + 86400,
        verificationDeadline: Math.floor(Date.now() / 1000) + 172800
      };

      await propertyEscrow.createEscrow(params);
      escrowId = 0;
      await propertyEscrow.connect(buyer).depositFunds(escrowId);
      await propertyEscrow.connect(agent).completeVerification(escrowId);
    });

    it("Should allow participants to give approval", async function () {
      await expect(propertyEscrow.connect(buyer).giveApproval(escrowId))
        .to.emit(propertyEscrow, "ApprovalGiven");

      await expect(propertyEscrow.connect(seller).giveApproval(escrowId))
        .to.emit(propertyEscrow, "ApprovalGiven");
    });

    it("Should prevent double approval from same participant", async function () {
      await propertyEscrow.connect(buyer).giveApproval(escrowId);
      
      await expect(propertyEscrow.connect(buyer).giveApproval(escrowId))
        .to.be.revertedWithCustomError(propertyEscrow, "AlreadyApproved");
    });
  });

  describe("Fund Release", function () {
    let escrowId;

    beforeEach(async function () {
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
          propertyId: "PROP-001",
          description: "Test Property",
          salePrice: ethers.parseEther("1000"),
          documentHash: "0x1234567890123456789012345678901234567890123456789012345678901234",
          verified: false
        },
        depositDeadline: Math.floor(Date.now() / 1000) + 86400,
        verificationDeadline: Math.floor(Date.now() / 1000) + 172800
      };

      await propertyEscrow.createEscrow(params);
      escrowId = 0;
      await propertyEscrow.connect(buyer).depositFunds(escrowId);
      await propertyEscrow.connect(agent).completeVerification(escrowId);
      await propertyEscrow.connect(buyer).giveApproval(escrowId);
      await propertyEscrow.connect(seller).giveApproval(escrowId);
    });

    it("Should release funds when conditions are met", async function () {
      const initialSellerBalance = await mockToken.balanceOf(seller.address);
      
      await expect(propertyEscrow.releaseFunds(escrowId))
        .to.emit(propertyEscrow, "FundsReleased");

      const escrow = await propertyEscrow.getEscrow(escrowId);
      expect(escrow.state).to.equal(3); // Released state

      const finalSellerBalance = await mockToken.balanceOf(seller.address);
      expect(finalSellerBalance).to.be.gt(initialSellerBalance);
    });
  });

  describe("Access Control", function () {
    it("Should have proper role definitions", async function () {
      const ADMIN_ROLE = await propertyEscrow.ADMIN_ROLE();
      const AGENT_ROLE = await propertyEscrow.AGENT_ROLE();
      const ARBITER_ROLE = await propertyEscrow.ARBITER_ROLE();

      expect(ADMIN_ROLE).to.equal(ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE")));
      expect(AGENT_ROLE).to.equal(ethers.keccak256(ethers.toUtf8Bytes("AGENT_ROLE")));
      expect(ARBITER_ROLE).to.equal(ethers.keccak256(ethers.toUtf8Bytes("ARBITER_ROLE")));
    });

    it("Should allow admin to pause/unpause", async function () {
      await propertyEscrow.pause();
      expect(await propertyEscrow.paused()).to.be.true;

      await propertyEscrow.unpause();
      expect(await propertyEscrow.paused()).to.be.false;
    });
  });

  describe("Token Management", function () {
    it("Should allow admin to whitelist tokens", async function () {
      const newToken = await ethers.getContractFactory("MockERC20");
      const token = await newToken.deploy("New Token", "NEW", ethers.parseEther("1000"));

      await propertyEscrow.whitelistToken(token.target, true);
      expect(await propertyEscrow.whitelistedTokens(token.target)).to.be.true;

      await propertyEscrow.whitelistToken(token.target, false);
      expect(await propertyEscrow.whitelistedTokens(token.target)).to.be.false;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle invalid escrow IDs", async function () {
      await expect(propertyEscrow.getEscrow(999))
        .to.be.revertedWithCustomError(propertyEscrow, "InvalidEscrowId");
    });

    it("Should reject operations when paused", async function () {
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
          propertyId: "PROP-001",
          description: "Test Property",
          salePrice: ethers.parseEther("1000"),
          documentHash: "0x1234567890123456789012345678901234567890123456789012345678901234",
          verified: false
        },
        depositDeadline: Math.floor(Date.now() / 1000) + 86400,
        verificationDeadline: Math.floor(Date.now() / 1000) + 172800
      };

      await expect(propertyEscrow.createEscrow(params))
        .to.be.revertedWith("Pausable: paused");
    });
  });
});