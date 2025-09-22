import React from 'react';
import { motion } from 'motion/react';

const Card = ({ 
  children, 
  className = '', 
  hoverable = true, 
  padding = 'medium',
  shadow = 'medium',
  onClick,
  ...props 
}) => {
  const baseStyles = 'bg-white rounded-xl border transition-all duration-300';
  
  const paddings = {
    none: 'p-0',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };

  const shadows = {
    none: '',
    small: 'shadow-sm',
    medium: 'shadow-lg',
    large: 'shadow-xl'
  };

  const hoverStyles = hoverable ? 'hover:shadow-xl hover:-translate-y-1' : '';
  const clickableStyles = onClick ? 'cursor-pointer' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hoverable ? { y: -2, transition: { duration: 0.2 } } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      className={`${baseStyles} ${paddings[padding]} ${shadows[shadow]} ${hoverStyles} ${clickableStyles} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;