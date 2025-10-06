import React from 'react';
import { motion } from 'motion/react';

/**
 * AnimatedBackground Component
 * 
 * Komponen background dengan animasi partikel untuk aplikasi QuizBattle Arena
 * 
 * @param {string} variant - Tema background ('default', 'dark', 'light')
 * @param {number} particleCount - Jumlah partikel animasi (default: 20)
 * @param {string} className - Custom CSS classes tambahan
 * @param {React.ReactNode} children - Konten yang akan ditampilkan di atas background
 */
const AnimatedBackground = ({ 
  variant = 'default', 
  particleCount = 20, 
  className = '',
  children 
}) => {
  // Different background variants
  const variants = {
    default: {
      gradient: 'from-pink-50 via-rose-100 to-pink-200',
      particleColor: 'bg-pink-300/30'
    },
    dark: {
      gradient: 'from-pink-500 via-rose-500 to-pink-600',
      particleColor: 'bg-white/20'
    },
    light: {
      gradient: 'from-pink-25 via-rose-50 to-pink-100',
      particleColor: 'bg-pink-400/20'
    }
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentVariant.gradient} relative overflow-hidden ${className}`}>
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(particleCount)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-4 h-4 ${currentVariant.particleColor} rounded-full`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Additional decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`large-${i}`}
            className={`absolute w-20 h-20 ${currentVariant.particleColor} rounded-full blur-xl`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -200, 0],
              x: [0, Math.random() * 100 - 50, 0],
              scale: [0.5, 1, 0.5],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      {children}
    </div>
  );
};

export default AnimatedBackground;