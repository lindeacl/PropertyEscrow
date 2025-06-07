import { ethers } from 'ethers';
import { ESCROW_FACTORY_ABI, PROPERTY_ESCROW_ABI, MOCK_ERC20_ABI } from '../utils/contractABI';
import logger from '../utils/logger';

export interface CreateEscrowParams {
  buyer: string;
  seller: string;
  agent: string;
  arbiter: string;
  tokenAddress: string;
  depositAmount: string;
  agentFee: number;
  platformFee: number;
  property: {
    propertyId: string;
    description: string;
    salePrice: string;
    documentHash: string;
    verified: boolean;
  };
  depositDeadline: number;
  verificationDeadline: number;
}

export interface EscrowDetails {
  escrowId: number;
  buyer: string;
  seller: string;
  agent: string;
  arbiter: string;
  tokenAddress: string;
  depositAmount: string;
  depositDeadline: number;
  propertyId: string;
  status: number;
  createdAt: number;
  buyerApproval: boolean;
  sellerApproval: boolean;
  agentApproval: boolean;
  isVerified: boolean;
  disputeReason: string;
  resolutionText: string;
}

export class EscrowContractService {
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private factoryAddress: string;
  private mockTokenAddress: string;

  constructor(
    provider: ethers.Provider,
    signer: ethers.Signer,
    factoryAddress: string = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    mockTokenAddress: string = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  ) {
    this.provider = provider;
    this.signer = signer;
    this.factoryAddress = factoryAddress;
    this.mockTokenAddress = mockTokenAddress;
  }

  async createEscrow(params: CreateEscrowParams): Promise<{ escrowContract: string; escrowId: number }> {
    try {
      logger.contractCall('EscrowFactory', 'createEscrow', [params], '', this.factoryAddress);
      
      const factory = new ethers.Contract(this.factoryAddress, ESCROW_FACTORY_ABI, this.signer);
      
      const createParams = {
        buyer: params.buyer,
        seller: params.seller,
        agent: params.agent,
        arbiter: params.arbiter,
        tokenAddress: params.tokenAddress,
        depositAmount: ethers.parseEther(params.depositAmount),
        agentFee: params.agentFee,
        platformFee: params.platformFee,
        property: {
          propertyId: params.property.propertyId,
          description: params.property.description,
          salePrice: ethers.parseEther(params.property.salePrice),
          documentHash: params.property.documentHash,
          verified: params.property.verified
        },
        depositDeadline: params.depositDeadline,
        verificationDeadline: params.verificationDeadline
      };

      const tx = await factory.createEscrow(createParams);
      const receipt = await tx.wait();

      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = factory.interface.parseLog(log);
          return parsed?.name === 'EscrowContractDeployed';
        } catch {
          return false;
        }
      });

      if (!event) {
        throw new Error('EscrowContractDeployed event not found');
      }

      const parsed = factory.interface.parseLog(event);
      const escrowContract = parsed?.args[0];
      const escrowId = Number(parsed?.args[2]);

      logger.contractEvent('EscrowContractDeployed', { escrowContract, escrowId }, tx.hash, this.factoryAddress);
      
      return { escrowContract, escrowId };
    } catch (error) {
      logger.contractError('createEscrow', error as Error, 'EscrowFactory');
      throw error;
    }
  }

  async depositFunds(escrowAddress: string, escrowId: number): Promise<string> {
    try {
      logger.contractCall('depositFunds', 'PropertyEscrow', { escrowAddress, escrowId });
      
      const escrow = new ethers.Contract(escrowAddress, PROPERTY_ESCROW_ABI, this.signer);
      const tx = await escrow.depositFunds(escrowId);
      await tx.wait();

      logger.contractEvent('FundsDeposited', { escrowId }, tx.hash);
      return tx.hash;
    } catch (error) {
      logger.contractError('depositFunds', error as Error, 'PropertyEscrow');
      throw error;
    }
  }

  async completeVerification(escrowAddress: string, escrowId: number): Promise<string> {
    try {
      logger.contractCall('completeVerification', 'PropertyEscrow', { escrowAddress, escrowId });
      
      const escrow = new ethers.Contract(escrowAddress, PROPERTY_ESCROW_ABI, this.signer);
      const tx = await escrow.completeVerification(escrowId);
      await tx.wait();

      logger.contractEvent('VerificationCompleted', { escrowId }, tx.hash);
      return tx.hash;
    } catch (error) {
      logger.contractError('completeVerification', error as Error, 'PropertyEscrow');
      throw error;
    }
  }

  async giveApproval(escrowAddress: string, escrowId: number): Promise<string> {
    try {
      logger.contractCall('giveApproval', 'PropertyEscrow', { escrowAddress, escrowId });
      
      const escrow = new ethers.Contract(escrowAddress, PROPERTY_ESCROW_ABI, this.signer);
      const tx = await escrow.giveApproval(escrowId);
      await tx.wait();

      logger.contractEvent('ApprovalGiven', { escrowId }, tx.hash);
      return tx.hash;
    } catch (error) {
      logger.contractError('giveApproval', error as Error, 'PropertyEscrow');
      throw error;
    }
  }

  async releaseFunds(escrowAddress: string, escrowId: number): Promise<string> {
    try {
      logger.contractCall('releaseFunds', 'PropertyEscrow', { escrowAddress, escrowId });
      
      const escrow = new ethers.Contract(escrowAddress, PROPERTY_ESCROW_ABI, this.signer);
      const tx = await escrow.releaseFunds(escrowId);
      await tx.wait();

      logger.contractEvent('FundsReleased', { escrowId }, tx.hash);
      return tx.hash;
    } catch (error) {
      logger.contractError('releaseFunds', error as Error, 'PropertyEscrow');
      throw error;
    }
  }

  async raiseDispute(escrowAddress: string, escrowId: number, reason: string): Promise<string> {
    try {
      logger.contractCall('raiseDispute', 'PropertyEscrow', { escrowAddress, escrowId, reason });
      
      const escrow = new ethers.Contract(escrowAddress, PROPERTY_ESCROW_ABI, this.signer);
      const tx = await escrow.raiseDispute(escrowId, reason);
      await tx.wait();

      logger.contractEvent('DisputeRaised', { escrowId, reason }, tx.hash);
      return tx.hash;
    } catch (error) {
      logger.contractError('raiseDispute', error as Error, 'PropertyEscrow');
      throw error;
    }
  }

  async getEscrowDetails(escrowAddress: string, escrowId: number): Promise<EscrowDetails> {
    try {
      const escrow = new ethers.Contract(escrowAddress, PROPERTY_ESCROW_ABI, this.provider);
      const details = await escrow.getEscrowDetails(escrowId);
      
      return {
        escrowId,
        buyer: details[0],
        seller: details[1],
        agent: details[2],
        arbiter: details[3],
        tokenAddress: details[4],
        depositAmount: ethers.formatEther(details[5]),
        depositDeadline: Number(details[6]),
        propertyId: details[7],
        status: Number(details[8]),
        createdAt: Number(details[9]),
        buyerApproval: details[10],
        sellerApproval: details[11],
        agentApproval: details[12],
        isVerified: details[13],
        disputeReason: details[14],
        resolutionText: details[15]
      };
    } catch (error) {
      logger.contractError('getEscrowDetails', error as Error, 'PropertyEscrow');
      throw error;
    }
  }

  async approveToken(tokenAddress: string, spender: string, amount: string): Promise<string> {
    try {
      logger.contractCall('approve', 'ERC20', { tokenAddress, spender, amount });
      
      const token = new ethers.Contract(tokenAddress, MOCK_ERC20_ABI, this.signer);
      const tx = await token.approve(spender, ethers.parseEther(amount));
      await tx.wait();

      logger.contractEvent('Approval', { spender, amount }, tx.hash);
      return tx.hash;
    } catch (error) {
      logger.contractError('approve', error as Error, 'ERC20');
      throw error;
    }
  }

  async getTokenBalance(tokenAddress: string, address: string): Promise<string> {
    try {
      const token = new ethers.Contract(tokenAddress, MOCK_ERC20_ABI, this.provider);
      const balance = await token.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.contractError('balanceOf', error as Error, 'ERC20');
      throw error;
    }
  }
}