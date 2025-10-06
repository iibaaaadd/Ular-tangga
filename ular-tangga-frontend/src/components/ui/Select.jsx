import React from 'react';
import { motion } from 'motion/react';
import Icon from './Icon';

const Select = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Pilih opsi...",
  error,
  disabled = false,
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = 'w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white';
  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : '';
  const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed' : '';

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon name={icon} size={18} />
          </div>
        )}
        
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${baseStyles} ${errorStyles} ${disabledStyles} ${icon ? 'pl-10' : 'pl-4'}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled={value !== ""}>
              {placeholder}
            </option>
          )}
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom Dropdown Arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
          <Icon name="chevronDown" size={18} />
        </div>
      </div>
      
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default Select;