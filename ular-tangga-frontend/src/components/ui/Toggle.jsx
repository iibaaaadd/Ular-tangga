import React from 'react';

const Toggle = ({ 
  checked = false, 
  onChange, 
  disabled = false, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-9 h-5',
    md: 'w-12 h-6', 
    lg: 'w-16 h-8'
  };

  const thumbSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  const translateClasses = {
    sm: checked ? 'translate-x-4' : 'translate-x-0',
    md: checked ? 'translate-x-6' : 'translate-x-0', 
    lg: checked ? 'translate-x-8' : 'translate-x-0'
  };

  return (
    <label className={`relative inline-block ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange && onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <div
        className={`
          ${sizeClasses[size]} 
          rounded-full p-0.5 cursor-pointer transition-colors duration-300 ease-in-out
          ${checked 
            ? 'bg-blue-500' 
            : 'bg-gray-300'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer'
          }
        `}
      >
        <div
          className={`
            ${thumbSizeClasses[size]} 
            ${translateClasses[size]}
            bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out
          `}
        />
      </div>
    </label>
  );
};

export default Toggle;