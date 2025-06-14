import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  autoClose?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

export interface ToastProps extends ToastData {
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id,
  type, 
  title,
  message, 
  onClose, 
  autoClose = 5000,
  actions = []
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Entrance animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    
    // Auto close timer
    let closeTimer: NodeJS.Timeout;
    if (autoClose > 0) {
      closeTimer = setTimeout(() => {
        handleClose();
      }, autoClose);
    }

    return () => {
      clearTimeout(showTimer);
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, [autoClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Animation duration
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400" aria-hidden={true} />;
      case 'error':
        return <XCircle className="w-5 h-5 flex-shrink-0 text-red-400" aria-hidden={true} />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 flex-shrink-0 text-yellow-400" aria-hidden={true} />;
      case 'info':
        return <Info className="w-5 h-5 flex-shrink-0 text-royal-400" aria-hidden={true} />;
    }
  };

  const getStyles = () => {
    const baseClasses = "border backdrop-blur-sm";
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-500/10 border-green-500/30 text-green-100`;
      case 'error':
        return `${baseClasses} bg-red-500/10 border-red-500/30 text-red-100`;
      case 'warning':
        return `${baseClasses} bg-yellow-500/10 border-yellow-500/30 text-yellow-100`;
      case 'info':
        return `${baseClasses} bg-royal-500/10 border-royal-500/30 text-royal-100`;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Information';
    }
  };

  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      aria-labelledby={`toast-${id}-title`}
      aria-describedby={`toast-${id}-description`}
      className={`
        fixed z-50 max-w-md w-full pointer-events-auto
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${getStyles()}
        rounded-lg shadow-xl p-4
      `}
      style={{
        top: '20px',
        right: '20px'
      }}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <div id={`toast-${id}-title`} className="text-sm font-semibold">
            {title || getTypeLabel()}
          </div>
          <div 
            id={`toast-${id}-description`} 
            className="text-sm opacity-90 mt-1 break-words"
          >
            {message}
          </div>
          
          {actions.length > 0 && (
            <div className="flex gap-2 mt-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`
                    px-3 py-1.5 text-xs font-medium rounded transition-colors
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
                    ${action.variant === 'primary' 
                      ? 'bg-white/20 hover:bg-white/30 text-white focus:ring-white/50' 
                      : 'bg-transparent hover:bg-white/10 text-white/80 border border-white/30 focus:ring-white/30'
                    }
                  `}
                  aria-label={`${action.label} for ${getTypeLabel().toLowerCase()} notification`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label={`Dismiss ${getTypeLabel().toLowerCase()} notification`}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default Toast;