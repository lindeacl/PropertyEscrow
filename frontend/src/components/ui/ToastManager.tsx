import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast, { ToastData } from './Toast';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = generateId();
    const newToast: ToastData = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, clearAll }}>
      {children}
      
      {/* Toast Container */}
      <div 
        className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              transform: `translateY(${index * 10}px)`,
              zIndex: 1000 - index
            }}
            className="pointer-events-auto"
          >
            <Toast
              {...toast}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience hooks for different toast types
export const useToastHelpers = () => {
  const { showToast } = useToast();

  return {
    success: (message: string, options?: Partial<Omit<ToastData, 'id' | 'type' | 'message'>>) =>
      showToast({ type: 'success', message, ...options }),
    
    error: (message: string, options?: Partial<Omit<ToastData, 'id' | 'type' | 'message'>>) =>
      showToast({ type: 'error', message, autoClose: 8000, ...options }),
    
    warning: (message: string, options?: Partial<Omit<ToastData, 'id' | 'type' | 'message'>>) =>
      showToast({ type: 'warning', message, ...options }),
    
    info: (message: string, options?: Partial<Omit<ToastData, 'id' | 'type' | 'message'>>) =>
      showToast({ type: 'info', message, ...options }),
  };
};