import React from 'react';
import { CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';

interface StatusChipProps {
  status: 'pending' | 'active' | 'completed' | 'disputed' | 'cancelled' | 'funded' | 'verified' | 'released';
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  variant?: 'default' | 'solid' | 'outline';
}

const StatusChip: React.FC<StatusChipProps> = ({ 
  status, 
  children, 
  size = 'md', 
  showIcon = true,
  variant = 'default'
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium transition-colors';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        icon: Clock,
        label: 'Pending',
        colors: {
          default: 'bg-grey-100 text-grey-700 dark:bg-grey-800/50 dark:text-grey-300',
          solid: 'bg-grey-500 text-white',
          outline: 'border border-grey-500 text-grey-600 bg-transparent dark:text-grey-400'
        }
      },
      active: {
        icon: Clock,
        label: 'Active',
        colors: {
          default: 'bg-royal-100 text-royal-800 dark:bg-royal-900/20 dark:text-royal-300',
          solid: 'bg-royal-500 text-white',
          outline: 'border border-royal-500 text-royal-600 bg-transparent dark:text-royal-400'
        }
      },
      funded: {
        icon: CheckCircle,
        label: 'Funded',
        colors: {
          default: 'bg-royal-100 text-royal-800 dark:bg-royal-900/20 dark:text-royal-300',
          solid: 'bg-royal-500 text-white',
          outline: 'border border-royal-500 text-royal-600 bg-transparent dark:text-royal-400'
        }
      },
      verified: {
        icon: CheckCircle,
        label: 'Verified',
        colors: {
          default: 'bg-gold-100 text-gold-800 dark:bg-gold-900/20 dark:text-gold-300',
          solid: 'bg-gold-500 text-grey-900',
          outline: 'border border-gold-500 text-gold-600 bg-transparent dark:text-gold-400'
        }
      },
      completed: {
        icon: CheckCircle,
        label: 'Completed',
        colors: {
          default: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
          solid: 'bg-green-500 text-white',
          outline: 'border border-green-500 text-green-600 bg-transparent dark:text-green-400'
        }
      },
      released: {
        icon: CheckCircle,
        label: 'Released',
        colors: {
          default: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
          solid: 'bg-emerald-500 text-white',
          outline: 'border border-emerald-500 text-emerald-600 bg-transparent dark:text-emerald-400'
        }
      },
      disputed: {
        icon: AlertTriangle,
        label: 'Disputed',
        colors: {
          default: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
          solid: 'bg-red-500 text-white',
          outline: 'border border-red-500 text-red-600 bg-transparent dark:text-red-400'
        }
      },
      cancelled: {
        icon: X,
        label: 'Cancelled',
        colors: {
          default: 'bg-grey-100 text-grey-800 dark:bg-grey-700 dark:text-grey-200',
          solid: 'bg-grey-500 text-white',
          outline: 'border border-grey-500 text-grey-600 bg-transparent dark:text-grey-400'
        }
      }
    };

    return configs[status as keyof typeof configs] || configs.pending;
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const displayText = children || config.label;

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${config.colors[variant]}`}>
      {showIcon && <Icon className={iconSizes[size]} />}
      {displayText}
    </span>
  );
};

export default StatusChip;