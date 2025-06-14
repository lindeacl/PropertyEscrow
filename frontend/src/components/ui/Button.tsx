import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-royal-500 text-white hover:bg-royal-600 active:bg-royal-700 focus:ring-royal-500 shadow-sm hover:shadow-md hover:scale-105',
    secondary: 'bg-grey-100 text-grey-900 hover:bg-grey-200 active:bg-grey-300 focus:ring-grey-500 dark:bg-grey-700 dark:text-grey-100 dark:hover:bg-grey-600 dark:active:bg-grey-500 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-sm hover:shadow-md hover:scale-105',
    ghost: 'text-grey-600 hover:text-grey-900 hover:bg-grey-100 active:bg-grey-200 focus:ring-grey-500 dark:text-grey-400 dark:hover:text-grey-100 dark:hover:bg-grey-700 dark:active:bg-grey-600',
    outline: 'border-2 border-royal-500 text-royal-500 hover:bg-royal-50 active:bg-royal-100 focus:ring-royal-500 dark:border-royal-400 dark:text-royal-400 dark:hover:bg-royal-900/20'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
    lg: 'px-6 py-3 text-base min-h-[48px]'
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  // Mobile-first responsive design: full width on mobile for primary buttons
  const responsiveClasses = variant === 'primary' ? 'w-full sm:w-auto' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${responsiveClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;