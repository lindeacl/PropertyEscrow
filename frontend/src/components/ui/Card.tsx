import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'elevated';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  padding = 'md',
  variant = 'default'
}) => {
  const baseClasses = 'rounded-xl transition-colors';
  
  const variantClasses = {
    default: 'bg-white dark:bg-grey-800 border border-grey-200 dark:border-grey-700',
    outlined: 'bg-transparent border-2 border-grey-200 dark:border-grey-700',
    elevated: 'bg-white dark:bg-grey-800 shadow-lg border border-grey-200 dark:border-grey-700 hover:shadow-xl transition-shadow'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}>
      {(title || subtitle) && (
        <div className={`${padding !== 'none' ? 'mb-4' : 'mb-0'}`}>
          {title && (
            <h3 className="text-lg font-semibold text-grey-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-grey-600 dark:text-grey-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;