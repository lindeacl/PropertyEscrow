import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Shield,
  DollarSign,
  FileText,
  Users,
  Gavel
} from 'lucide-react';
import { EscrowStatus } from '../../types';
import logger from '../../utils/logger';

interface EscrowLifecycleProps {
  status: EscrowStatus;
  depositAmount: string;
  tokenSymbol: string;
  buyerApproval: boolean;
  sellerApproval: boolean;
  agentApproval: boolean;
  isVerified: boolean;
  onAction: (action: string) => void;
  userRole: {
    isBuyer: boolean;
    isSeller: boolean;
    isAgent: boolean;
    isArbiter: boolean;
  };
}

const EscrowLifecycle: React.FC<EscrowLifecycleProps> = ({
  status,
  depositAmount,
  tokenSymbol,
  buyerApproval,
  sellerApproval,
  agentApproval,
  isVerified,
  onAction,
  userRole
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const lifecycleSteps = [
    {
      id: 'created',
      title: 'Escrow Created',
      description: 'Property listed and escrow terms set',
      icon: FileText,
      status: EscrowStatus.CREATED,
      completed: status >= EscrowStatus.CREATED
    },
    {
      id: 'deposited',
      title: 'Funds Deposited',
      description: `${depositAmount} ${tokenSymbol} deposited by buyer`,
      icon: DollarSign,
      status: EscrowStatus.DEPOSITED,
      completed: status >= EscrowStatus.DEPOSITED
    },
    {
      id: 'verified',
      title: 'Property Verified',
      description: 'Agent verification of property conditions',
      icon: CheckCircle,
      status: EscrowStatus.VERIFIED,
      completed: status >= EscrowStatus.VERIFIED
    },
    {
      id: 'approved',
      title: 'Approvals Collected',
      description: 'All parties approve fund release',
      icon: Users,
      status: EscrowStatus.VERIFIED,
      completed: buyerApproval && sellerApproval && agentApproval
    },
    {
      id: 'released',
      title: 'Funds Released',
      description: 'Funds transferred to seller',
      icon: CheckCircle,
      status: EscrowStatus.RELEASED,
      completed: status === EscrowStatus.RELEASED
    }
  ];

  useEffect(() => {
    const activeStep = lifecycleSteps.findIndex(step => !step.completed);
    setCurrentStep(activeStep === -1 ? lifecycleSteps.length - 1 : activeStep);
    logger.uiAction('Escrow lifecycle viewed', { status, currentStep: activeStep });
  }, [status, buyerApproval, sellerApproval, agentApproval]);

  const getAvailableActions = () => {
    const actions = [];

    if (status === EscrowStatus.CREATED && userRole.isBuyer) {
      actions.push({
        id: 'deposit',
        label: 'Deposit Funds',
        description: `Deposit ${depositAmount} ${tokenSymbol}`,
        variant: 'primary' as const,
        icon: DollarSign
      });
    }

    if (status === EscrowStatus.DEPOSITED && userRole.isAgent && !isVerified) {
      actions.push({
        id: 'verify',
        label: 'Complete Verification',
        description: 'Mark property verification as complete',
        variant: 'primary' as const,
        icon: CheckCircle
      });
    }

    if (status === EscrowStatus.VERIFIED) {
      if (userRole.isBuyer && !buyerApproval) {
        actions.push({
          id: 'approve_buyer',
          label: 'Give Buyer Approval',
          description: 'Approve fund release as buyer',
          variant: 'primary' as const,
          icon: CheckCircle
        });
      }

      if (userRole.isSeller && !sellerApproval) {
        actions.push({
          id: 'approve_seller',
          label: 'Give Seller Approval',
          description: 'Approve fund release as seller',
          variant: 'primary' as const,
          icon: CheckCircle
        });
      }

      if (userRole.isAgent && !agentApproval) {
        actions.push({
          id: 'approve_agent',
          label: 'Give Agent Approval',
          description: 'Approve fund release as agent',
          variant: 'primary' as const,
          icon: CheckCircle
        });
      }

      if (buyerApproval && sellerApproval && agentApproval) {
        actions.push({
          id: 'release',
          label: 'Release Funds',
          description: 'Transfer funds to seller',
          variant: 'success' as const,
          icon: DollarSign
        });
      }
    }

    if (status < EscrowStatus.RELEASED && status !== EscrowStatus.DISPUTED) {
      if (userRole.isBuyer || userRole.isSeller) {
        actions.push({
          id: 'dispute',
          label: 'Raise Dispute',
          description: 'Initiate dispute resolution process',
          variant: 'danger' as const,
          icon: Gavel
        });
      }

      if (userRole.isBuyer && status === EscrowStatus.CREATED) {
        actions.push({
          id: 'cancel',
          label: 'Cancel Escrow',
          description: 'Cancel escrow before deposit',
          variant: 'secondary' as const,
          icon: AlertTriangle
        });
      }
    }

    return actions;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Escrow Progress</h3>
      
      <div className="space-y-4 mb-8">
        {lifecycleSteps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = step.completed;
          const isCurrent = index === currentStep && !isCompleted;
          
          return (
            <div key={step.id} className="flex items-center space-x-4">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                ${isCompleted 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-100 border-gray-300 text-grey-400'
                }
              `}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <div className={`font-medium ${isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-500'}`}>
                  {step.title}
                </div>
                <div className="text-sm text-gray-600">
                  {step.description}
                </div>
              </div>
              
              {isCompleted && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {isCurrent && (
                <Clock className="w-5 h-5 text-blue-500" />
              )}
            </div>
          );
        })}
      </div>

      {status >= EscrowStatus.VERIFIED && status < EscrowStatus.RELEASED && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="font-medium text-gray-800 mb-3">Approval Status</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${buyerApproval ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm text-gray-600">Buyer</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${sellerApproval ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm text-gray-600">Seller</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${agentApproval ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm text-gray-600">Agent</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="font-medium text-gray-800">Available Actions</h4>
        {getAvailableActions().map(action => {
          const Icon = action.icon;
          const variantClasses = {
            primary: 'bg-blue-600 hover:bg-blue-700 text-white',
            success: 'bg-green-600 hover:bg-green-700 text-white',
            danger: 'bg-red-600 hover:bg-red-700 text-white',
            secondary: 'bg-gray-600 hover:bg-gray-700 text-white'
          };

          return (
            <button
              key={action.id}
              onClick={() => {
                logger.uiAction('Escrow action triggered', { action: action.id, status });
                onAction(action.id);
              }}
              className={`
                w-full flex items-center justify-between p-4 rounded-xl border-2 border-transparent
                transition-colors ${variantClasses[action.variant]}
              `}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-sm opacity-90">{action.description}</div>
                </div>
              </div>
            </button>
          );
        })}
        
        {getAvailableActions().length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No actions available at this time</p>
            <p className="text-sm">Waiting for other participants</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscrowLifecycle;