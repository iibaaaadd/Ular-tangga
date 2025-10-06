import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Icon from './Icon';

const Alert = ({
  type = 'info',
  title,
  message,
  isVisible = false,
  onClose,
  autoClose = true,
  duration = 3000,
  position = 'top-right',
  showIcon = true,
  showCloseButton = true,
  className = ''
}) => {
  const [visible, setVisible] = useState(isVisible);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    setVisible(isVisible);
    if (isVisible) {
      setProgress(100); // Reset progress when toast becomes visible
    }
  }, [isVisible]);

  useEffect(() => {
    if (visible && autoClose) {
      // Animate progress bar
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      // Auto close timer
      const closeTimer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearInterval(progressTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [visible, autoClose, duration]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      setTimeout(onClose, 300); // Wait for animation to complete
    }
  };

  const getAlertConfig = () => {
    const configs = {
      success: {
        icon: 'check',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        titleColor: 'text-green-900',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        progressBar: 'bg-green-500'
      },
      error: {
        icon: 'error',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        titleColor: 'text-red-900',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        progressBar: 'bg-red-500'
      },
      warning: {
        icon: 'warning',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        titleColor: 'text-yellow-900',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        progressBar: 'bg-yellow-500'
      },
      info: {
        icon: 'info',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        titleColor: 'text-blue-900',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        progressBar: 'bg-blue-500'
      }
    };
    return configs[type] || configs.info;
  };

  const getPositionClasses = () => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    return positions[position] || positions['top-right'];
  };

  const config = getAlertConfig();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed ${getPositionClasses()} z-50 ${className}`}
        >
          <div className={`relative max-w-sm w-full ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg overflow-hidden`}>
            <div className="p-4">
              <div className="flex items-start">
                {showIcon && (
                  <div className={`flex-shrink-0 ${config.iconBg} rounded-full p-2 mr-3`}>
                    <Icon 
                      name={config.icon} 
                      size={20} 
                      className={config.iconColor}
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  {title && (
                    <h4 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
                      {title}
                    </h4>
                  )}
                  {message && (
                    <p className={`text-sm ${config.textColor}`}>
                      {message}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    onClick={handleClose}
                    className={`flex-shrink-0 ml-4 ${config.textColor} hover:opacity-75 transition-opacity`}
                  >
                    <Icon name="x" size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar for auto-close */}
            {autoClose && (
              <div
                className={`h-1 ${config.progressBar} transition-all duration-100 ease-linear`}
                style={{ width: `${progress}%` }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast notification hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());
  const debounceRef = useRef(new Map()); // For debouncing similar toasts
  const maxToasts = 3; // Limit maximum number of toasts

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
      debounceRef.current.clear();
    };
  }, []);

  const showToast = (options) => {
    // Create a unique key for this toast type/message combination
    const toastKey = `${options.type}-${options.title}-${options.message}`;
    
    // Check if we recently showed this exact toast (debounce)
    const now = Date.now();
    const lastShown = debounceRef.current.get(toastKey);
    if (lastShown && (now - lastShown) < 1000) { // 1 second debounce
      return null;
    }
    
    // Check if similar toast is already showing
    const existingToast = toasts.find(toast => 
      toast.type === options.type && 
      toast.title === options.title && 
      toast.message === options.message
    );
    
    // If similar toast exists, don't add new one
    if (existingToast) {
      return existingToast.id;
    }

    // Record this toast in debounce map
    debounceRef.current.set(toastKey, now);

    const id = Date.now() + Math.random();
    const toast = { ...options, id, isVisible: true };
    
    setToasts(prev => {
      // If we're at max capacity, remove the oldest toast
      let newToasts = [...prev];
      if (newToasts.length >= maxToasts) {
        const oldestToast = newToasts[0];
        removeToast(oldestToast.id);
        newToasts = newToasts.slice(1);
      }
      return [...newToasts, toast];
    });

    // Auto remove after duration
    const timer = setTimeout(() => {
      removeToast(id);
      // Clean up debounce entry after toast is removed
      setTimeout(() => {
        debounceRef.current.delete(toastKey);
      }, 500);
    }, options.duration || 3000);
    
    // Store timer reference for cleanup
    timersRef.current.set(id, timer);

    return id;
  };

  const removeToast = (id) => {
    // Clear timer if exists
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    // Clear all timers
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current.clear();
    
    // Clear debounce map
    debounceRef.current.clear();
    
    // Clear all toasts
    setToasts([]);
  };

  const success = (title, message, options = {}) => {
    return showToast({ type: 'success', title, message, showIcon: true, ...options });
  };

  const error = (title, message, options = {}) => {
    return showToast({ type: 'error', title, message, showIcon: true, ...options });
  };

  const warning = (title, message, options = {}) => {
    return showToast({ type: 'warning', title, message, showIcon: true, ...options });
  };

  const info = (title, message, options = {}) => {
    return showToast({ type: 'info', title, message, showIcon: true, ...options });
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Alert
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );

  return {
    success,
    error,
    warning,
    info,
    ToastContainer,
    removeToast,
    clearAllToasts
  };
};

export default Alert;