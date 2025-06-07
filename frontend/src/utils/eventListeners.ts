/**
 * Smart Contract Event Listeners for Property Escrow Platform
 * Automatically captures and logs all contract events
 */

import { ethers } from 'ethers';
import logger from './logger';
import { ESCROW_FACTORY_ABI, PROPERTY_ESCROW_ABI } from './contractABI';

export class EventListenerService {
  private provider: ethers.Provider | null = null;
  private activeListeners: Map<string, ethers.Contract> = new Map();

  constructor(provider: ethers.Provider) {
    this.provider = provider;
  }

  // Setup event listeners for EscrowFactory contract
  setupFactoryEventListeners(factoryAddress: string) {
    if (!this.provider) {
      logger.error('No provider available for event listeners', new Error('Provider not initialized'));
      return;
    }

    try {
      const factoryContract = new ethers.Contract(factoryAddress, ESCROW_FACTORY_ABI, this.provider);
      
      // EscrowContractDeployed event
      factoryContract.on('EscrowContractDeployed', (escrowContract, creator, escrowId, event) => {
        logger.contractEvent('EscrowContractDeployed', {
          escrowContract,
          creator,
          escrowId: escrowId.toString()
        }, event.transactionHash, factoryAddress);
      });

      // TokenWhitelisted event
      factoryContract.on('TokenWhitelisted', (token, whitelisted, event) => {
        logger.contractEvent('TokenWhitelisted', {
          token,
          whitelisted
        }, event.transactionHash, factoryAddress);
      });

      this.activeListeners.set('factory', factoryContract);
      logger.uiAction('Factory event listeners initialized', { factoryAddress });

    } catch (error) {
      logger.error('Failed to setup factory event listeners', error as Error);
    }
  }

  // Setup event listeners for PropertyEscrow contract
  setupEscrowEventListeners(escrowAddress: string) {
    if (!this.provider) {
      logger.error('No provider available for event listeners', new Error('Provider not initialized'));
      return;
    }

    try {
      const escrowContract = new ethers.Contract(escrowAddress, PROPERTY_ESCROW_ABI, this.provider);

      // FundsDeposited event
      escrowContract.on('FundsDeposited', (escrowId, buyer, amount, event) => {
        logger.contractEvent('FundsDeposited', {
          escrowId: escrowId.toString(),
          buyer,
          amount: amount.toString()
        }, event.transactionHash, escrowAddress);

        logger.escrowDeposited(escrowAddress, amount.toString(), event.transactionHash, buyer);
      });

      // VerificationCompleted event
      escrowContract.on('VerificationCompleted', (escrowId, agent, event) => {
        logger.contractEvent('VerificationCompleted', {
          escrowId: escrowId.toString(),
          agent
        }, event.transactionHash, escrowAddress);
      });

      // ApprovalGiven event
      escrowContract.on('ApprovalGiven', (escrowId, approver, event) => {
        logger.contractEvent('ApprovalGiven', {
          escrowId: escrowId.toString(),
          approver
        }, event.transactionHash, escrowAddress);
      });

      // FundsReleased event
      escrowContract.on('FundsReleased', (escrowId, seller, amount, platformFee, event) => {
        logger.contractEvent('FundsReleased', {
          escrowId: escrowId.toString(),
          seller,
          amount: amount.toString(),
          platformFee: platformFee.toString()
        }, event.transactionHash, escrowAddress);

        logger.escrowReleased(escrowAddress, event.transactionHash, seller);
      });

      // EscrowCancelled event
      escrowContract.on('EscrowCancelled', (escrowId, reason, event) => {
        logger.contractEvent('EscrowCancelled', {
          escrowId: escrowId.toString(),
          reason
        }, event.transactionHash, escrowAddress);
      });

      // DisputeRaised event
      escrowContract.on('DisputeRaised', (escrowId, initiator, reason, event) => {
        logger.contractEvent('DisputeRaised', {
          escrowId: escrowId.toString(),
          initiator,
          reason
        }, event.transactionHash, escrowAddress);

        logger.escrowDisputeRaised(escrowAddress, reason, event.transactionHash, initiator);
      });

      // DisputeResolved event
      escrowContract.on('DisputeResolved', (escrowId, favorBuyer, resolution, event) => {
        logger.contractEvent('DisputeResolved', {
          escrowId: escrowId.toString(),
          favorBuyer,
          resolution
        }, event.transactionHash, escrowAddress);
      });

      this.activeListeners.set(`escrow-${escrowAddress}`, escrowContract);
      logger.uiAction('Escrow event listeners initialized', { escrowAddress });

    } catch (error) {
      logger.error('Failed to setup escrow event listeners', error as Error);
    }
  }

  // Remove event listeners for a specific contract
  removeEventListeners(contractKey: string) {
    const contract = this.activeListeners.get(contractKey);
    if (contract) {
      contract.removeAllListeners();
      this.activeListeners.delete(contractKey);
      logger.uiAction('Event listeners removed', { contractKey });
    }
  }

  // Remove all active event listeners
  removeAllEventListeners() {
    this.activeListeners.forEach((contract, key) => {
      contract.removeAllListeners();
      logger.uiAction('Event listeners removed', { contractKey: key });
    });
    this.activeListeners.clear();
    logger.uiAction('All event listeners removed');
  }

  // Get active listener count
  getActiveListenerCount(): number {
    return this.activeListeners.size;
  }

  // Setup listeners for multiple escrow contracts
  setupMultipleEscrowListeners(escrowAddresses: string[]) {
    escrowAddresses.forEach(address => {
      this.setupEscrowEventListeners(address);
    });
    
    logger.uiAction('Multiple escrow listeners initialized', { 
      count: escrowAddresses.length,
      addresses: escrowAddresses 
    });
  }
}

// Global event listener service instance
let eventListenerService: EventListenerService | null = null;

export const initializeEventListeners = (provider: ethers.Provider): EventListenerService => {
  if (eventListenerService) {
    eventListenerService.removeAllEventListeners();
  }
  
  eventListenerService = new EventListenerService(provider);
  logger.uiAction('Event listener service initialized');
  return eventListenerService;
};

export const getEventListenerService = (): EventListenerService | null => {
  return eventListenerService;
};

export const cleanupEventListeners = () => {
  if (eventListenerService) {
    eventListenerService.removeAllEventListeners();
    eventListenerService = null;
    logger.uiAction('Event listener service cleaned up');
  }
};