/**
 * Contract Event Listener Service
 * Listens for smart contract events and provides real-time updates to the frontend
 */

import { ethers } from 'ethers';
import { useToastHelpers } from '../components/ui/ToastManager';
import logger from '../utils/logger';

export interface EventData {
  event: string;
  escrowId?: string;
  participant?: string;
  amount?: string;
  blockNumber: number;
  transactionHash: string;
  timestamp?: number;
}

class ContractEventListenerService {
  private contract: ethers.Contract | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private isListening = false;

  constructor(contract?: ethers.Contract) {
    if (contract) {
      this.contract = contract;
    }
  }

  /**
   * Initialize event listening for the PropertyEscrow contract
   */
  async startListening(contract: ethers.Contract) {
    if (this.isListening) {
      return;
    }

    this.contract = contract;
    this.isListening = true;

    try {
      // Listen for EscrowCreated events
      this.contract.on('EscrowCreated', (escrowId, buyer, seller, amount, event) => {
        const eventData: EventData = {
          event: 'EscrowCreated',
          escrowId: escrowId.toString(),
          participant: buyer,
          amount: ethers.formatEther(amount),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        };
        
        this.handleEvent('EscrowCreated', eventData);
        logger.uiAction('Contract Event: EscrowCreated', eventData);
      });

      // Listen for FundsDeposited events
      this.contract.on('FundsDeposited', (escrowId, depositor, amount, event) => {
        const eventData: EventData = {
          event: 'FundsDeposited',
          escrowId: escrowId.toString(),
          participant: depositor,
          amount: ethers.formatEther(amount),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        };
        
        this.handleEvent('FundsDeposited', eventData);
        logger.uiAction('Contract Event: FundsDeposited', eventData);
      });

      // Listen for VerificationCompleted events
      this.contract.on('VerificationCompleted', (escrowId, verifier, event) => {
        const eventData: EventData = {
          event: 'VerificationCompleted',
          escrowId: escrowId.toString(),
          participant: verifier,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        };
        
        this.handleEvent('VerificationCompleted', eventData);
        logger.uiAction('Contract Event: VerificationCompleted', eventData);
      });

      // Listen for ApprovalGiven events
      this.contract.on('ApprovalGiven', (escrowId, approver, role, event) => {
        const eventData: EventData = {
          event: 'ApprovalGiven',
          escrowId: escrowId.toString(),
          participant: approver,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        };
        
        this.handleEvent('ApprovalGiven', eventData);
        logger.uiAction('Contract Event: ApprovalGiven', eventData);
      });

      // Listen for FundsReleased events
      this.contract.on('FundsReleased', (escrowId, seller, amount, event) => {
        const eventData: EventData = {
          event: 'FundsReleased',
          escrowId: escrowId.toString(),
          participant: seller,
          amount: ethers.formatEther(amount),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        };
        
        this.handleEvent('FundsReleased', eventData);
        logger.uiAction('Contract Event: FundsReleased', eventData);
      });

      // Listen for DisputeRaised events
      this.contract.on('DisputeRaised', (escrowId, initiator, reason, event) => {
        const eventData: EventData = {
          event: 'DisputeRaised',
          escrowId: escrowId.toString(),
          participant: initiator,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        };
        
        this.handleEvent('DisputeRaised', eventData);
        logger.uiAction('Contract Event: DisputeRaised', eventData);
      });

      logger.uiAction('Contract event listening started successfully');
    } catch (error) {
      logger.error('Failed to start contract event listening', error as Error);
      this.isListening = false;
    }
  }

  /**
   * Stop listening to contract events
   */
  stopListening() {
    if (this.contract && this.isListening) {
      this.contract.removeAllListeners();
      this.isListening = false;
      logger.uiAction('Contract event listening stopped');
    }
  }

  /**
   * Add event listener for specific contract events
   */
  addEventListener(eventName: string, callback: Function) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)?.push(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventName: string, callback: Function) {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Handle contract events and notify listeners
   */
  private handleEvent(eventName: string, eventData: EventData) {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(eventData);
        } catch (error) {
          logger.error(`Error in event listener for ${eventName}`, error as Error);
        }
      });
    }

    // Emit to global listeners
    const globalListeners = this.listeners.get('*');
    if (globalListeners) {
      globalListeners.forEach(callback => {
        try {
          callback(eventName, eventData);
        } catch (error) {
          logger.error(`Error in global event listener`, error as Error);
        }
      });
    }
  }

  /**
   * Get listening status
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

// React hook for using contract events
export const useContractEvents = () => {
  const { success, info, warning, error } = useToastHelpers();

  const handleEscrowCreated = (eventData: EventData) => {
    success(`New escrow created!`, {
      title: 'Escrow Created',
      actions: [
        {
          label: 'View Details',
          onClick: () => window.location.href = `/escrow/${eventData.escrowId}`,
          variant: 'primary'
        }
      ]
    });
  };

  const handleFundsDeposited = (eventData: EventData) => {
    success(`Funds deposited: ${eventData.amount} MATIC`, {
      title: 'Funds Deposited',
      actions: [
        {
          label: 'View Transaction',
          onClick: () => window.open(`https://polygonscan.com/tx/${eventData.transactionHash}`, '_blank'),
          variant: 'secondary'
        }
      ]
    });
  };

  const handleVerificationCompleted = (eventData: EventData) => {
    info(`Property verification completed for escrow ${eventData.escrowId}`, {
      title: 'Verification Complete'
    });
  };

  const handleApprovalGiven = (eventData: EventData) => {
    info(`Approval received from ${eventData.participant?.slice(0, 6)}...${eventData.participant?.slice(-4)}`, {
      title: 'Approval Given'
    });
  };

  const handleFundsReleased = (eventData: EventData) => {
    success(`Funds released: ${eventData.amount} MATIC`, {
      title: 'Transaction Complete',
      actions: [
        {
          label: 'View Transaction',
          onClick: () => window.open(`https://polygonscan.com/tx/${eventData.transactionHash}`, '_blank'),
          variant: 'primary'
        }
      ]
    });
  };

  const handleDisputeRaised = (eventData: EventData) => {
    warning(`Dispute raised for escrow ${eventData.escrowId}`, {
      title: 'Dispute Alert',
      actions: [
        {
          label: 'View Details',
          onClick: () => window.location.href = `/escrow/${eventData.escrowId}`,
          variant: 'primary'
        }
      ]
    });
  };

  return {
    handleEscrowCreated,
    handleFundsDeposited,
    handleVerificationCompleted,
    handleApprovalGiven,
    handleFundsReleased,
    handleDisputeRaised
  };
};

// Singleton instance
export const contractEventListener = new ContractEventListenerService();

export default ContractEventListenerService;