import { ethers } from 'ethers';
import { ESCROW_FACTORY_ABI, PROPERTY_ESCROW_ABI, MOCK_ERC20_ABI } from '../utils/contractABI';

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
      console.log('Creating escrow with parameters:', params);
      
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

      console.log('Escrow created successfully:', { escrowContract, escrowId, txHash: tx.hash });
      
      return { escrowContract, escrowId };
    } catch (error) {
      console.error('Failed to create escrow:', error);
      throw error;
    }
  }

  async depositFunds(escrowAddress: string, escrowId: number): Promise<string> {
    try {
      console.log('Depositing funds to escrow:', { escrowAddress, escrowId });
      
      const escrow = new ethers.Contract(escrowAddress, PROPERTY_ESCROW_ABI, this.signer);
      const tx = await escrow.depositFunds(escrowId);
      await tx.wait();

      console.log('Funds deposited successfully:', { escrowId, txHash: tx.hash });
      return tx.hash;
    } catch (error) {
      console.error('Failed to deposit funds:', error);
      throw error;
    }
  }

  async completeVerification(escrowAddress: string, escrowId: number): Promise<string> {
    try {
      console.log('Completing verification for escrow:', { escrowAddress, escrowId });
      
      const escrow = new ethers.Contract(escrowAddress, PROPERTY_ESCROW_ABI, this.signer);
      const tx = await escrow.completeVerification(escrowId);
      await tx.wait();

      console.log('Verification completed successfully:', { escrowId, txHash: tx.hash });
      return tx.hash;
    } catch (error) {
      console.error('Failed to complete verification:', error);
      throw error;
    }
  }

  async giveApproval(escrowAddress: string, escrowId: number): Promise<string> {
    try {
      console.log('Giving approval for escrow:', { escrowAddress, escrowId });
      
      const escrow = new ethers.Contract(escrowAddress, PROPERTY_ESCROW_ABI, this.signer);
      const tx = await escrow.giveApproval(escrowId);
      await tx.wait();

      console.log('Approval given successfully:', { escrowId, txHash: tx.hash });
      return tx.hash;
    } catch (error) {
      console.error('Failed to give approval:', error);
      throw error;
    }
  }

  async releaseFunds(escrowAddress: string, escrowId: number): Promise<string> {
    try {
      console.log('Releasing funds from escrow:', { escrowAddress, escrowId });
      
      const escrow = new ethers.Contract(escrowAddress, PROPERTY_ESCROW_ABI, this.signer);
      const tx = await escrow.releaseFunds(escrowId);
      await tx.wait();

      console.log('Funds released successfully:', { escrowId, txHash: tx.hash });
      return tx.hash;
    } catch (error) {
      console.error('Failed to release funds:', error);
      throw error;
    }
  }

  async raiseDispute(escrowAddress: string, escrowId: number, reason: string): Promise<string> {
    try {
      console.log('Raising dispute for escrow:', { escrowAddress, escrowId, reason });
      
      const escrow = new ethers.Contract(escrowAddress, PROPERTY_ESCROW_ABI, this.signer);
      const tx = await escrow.raiseDispute(escrowId, reason);
      await tx.wait();

      console.log('Dispute raised successfully:', { escrowId, reason, txHash: tx.hash });
      return tx.hash;
    } catch (error) {
      console.error('Failed to raise dispute:', error);
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
      console.error('Failed to get escrow details:', error);
      throw error;
    }
  }

  async approveToken(tokenAddress: string, spender: string, amount: string): Promise<string> {
    try {
      console.log('Approving token spending:', { tokenAddress, spender, amount });
      
      const token = new ethers.Contract(tokenAddress, MOCK_ERC20_ABI, this.signer);
      const tx = await token.approve(spender, ethers.parseEther(amount));
      await tx.wait();

      console.log('Token approval successful:', { spender, amount, txHash: tx.hash });
      return tx.hash;
    } catch (error) {
      console.error('Failed to approve token:', error);
      throw error;
    }
  }

  async getTokenBalance(tokenAddress: string, address: string): Promise<string> {
    try {
      const token = new ethers.Contract(tokenAddress, MOCK_ERC20_ABI, this.provider);
      const balance = await token.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get token balance:', error);
      throw error;
    }
  }
}