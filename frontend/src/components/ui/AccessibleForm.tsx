import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { ariaUtils } from '../../utils/accessibility';

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  helpText?: string;
  placeholder?: string;
  className?: string;
}

export const AccessibleFormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  error,
  helpText,
  placeholder,
  className = ''
}) => {
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(false);
  
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const hasError = touched && error;
  
  useEffect(() => {
    setIsValid(touched && !error && value.length > 0);
  }, [touched, error, value]);

  const handleBlur = () => {
    setTouched(true);
    // Announce validation result to screen readers
    if (error) {
      ariaUtils.announce(`Error in ${label}: ${error}`, 'assertive');
    } else if (required && value) {
      ariaUtils.announce(`${label} is valid`, 'polite');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-300"
      >
        {label}
        {required && (
          <span className="text-red-400 ml-1" aria-label="required">*</span>
        )}
      </label>
      
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          aria-required={required}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={[
            error ? errorId : '',
            helpText ? helpId : ''
          ].filter(Boolean).join(' ') || undefined}
          className={`
            w-full px-4 py-3 rounded-lg border transition-colors duration-200
            bg-white/10 backdrop-blur-sm text-white placeholder-gray-400
            min-h-[44px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
            ${hasError 
              ? 'border-red-500 focus:ring-red-500' 
              : isValid
              ? 'border-green-500 focus:ring-green-500'
              : 'border-white/30 focus:ring-blue-500'
            }
          `}
        />
        
        {/* Validation Icon */}
        {touched && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {hasError ? (
              <AlertCircle className="w-5 h-5 text-red-400" aria-hidden="true" />
            ) : isValid ? (
              <CheckCircle className="w-5 h-5 text-green-400" aria-hidden="true" />
            ) : null}
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {hasError && (
        <div 
          id={errorId}
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2 text-sm text-red-400"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}
      
      {/* Help Text */}
      {helpText && !hasError && (
        <div 
          id={helpId}
          className="text-sm text-gray-400"
        >
          {helpText}
        </div>
      )}
    </div>
  );
};

interface FormSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
}

export const AccessibleFormSelect: React.FC<FormSelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  error,
  helpText,
  className = ''
}) => {
  const [touched, setTouched] = useState(false);
  
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const hasError = touched && error;

  const handleBlur = () => {
    setTouched(true);
    if (error) {
      ariaUtils.announce(`Error in ${label}: ${error}`, 'assertive');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-300"
      >
        {label}
        {required && (
          <span className="text-red-400 ml-1" aria-label="required">*</span>
        )}
      </label>
      
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        required={required}
        aria-required={required}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={[
          error ? errorId : '',
          helpText ? helpId : ''
        ].filter(Boolean).join(' ') || undefined}
        className={`
          w-full px-4 py-3 rounded-lg border transition-colors duration-200
          bg-white/10 backdrop-blur-sm text-white
          min-h-[44px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
          ${hasError 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-white/30 focus:ring-blue-500'
          }
        `}
      >
        <option value="" disabled>Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-800 text-white">
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Error Message */}
      {hasError && (
        <div 
          id={errorId}
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2 text-sm text-red-400"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}
      
      {/* Help Text */}
      {helpText && !hasError && (
        <div 
          id={helpId}
          className="text-sm text-gray-400"
        >
          {helpText}
        </div>
      )}
    </div>
  );
};

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const AccessibleFormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = ''
}) => {
  const sectionId = ariaUtils.generateId('form-section');
  
  return (
    <fieldset className={`space-y-6 ${className}`}>
      <legend className="sr-only">{title}</legend>
      
      <div>
        <h3 id={sectionId} className="text-lg font-semibold text-white mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-gray-300 text-sm mb-4" aria-describedby={sectionId}>
            {description}
          </p>
        )}
      </div>
      
      <div className="space-y-4" role="group" aria-labelledby={sectionId}>
        {children}
      </div>
    </fieldset>
  );
};