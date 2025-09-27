import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Icon from './Icon';

const ConfirmDialog = ({
  isOpen = false,
  onConfirm,
  onCancel,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  type = 'danger', // 'danger', 'warning', 'info'
  icon,
  className = ''
}) => {
  const getTypeConfig = () => {
    const configs = {
      danger: {
        icon: icon || 'delete',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        confirmBg: 'bg-red-600 hover:bg-red-700',
        confirmText: 'text-white'
      },
      warning: {
        icon: icon || 'warning',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
        confirmText: 'text-white'
      },
      info: {
        icon: icon || 'info',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        confirmBg: 'bg-blue-600 hover:bg-blue-700',
        confirmText: 'text-white'
      }
    };
    return configs[type] || configs.danger;
  };

  const config = getTypeConfig();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onCancel}
        />

        {/* Dialog */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl ${className}`}
          >
            {/* Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className={`rounded-full p-3 ${config.iconBg}`}>
                <Icon 
                  name={config.icon} 
                  size={24} 
                  className={config.iconColor}
                />
              </div>
            </div>

            {/* Content */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${config.confirmBg} ${config.confirmText} focus:ring-red-500`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

// Context untuk confirm dialog
const ConfirmContext = React.createContext();

// Provider component
export const ConfirmProvider = ({ children }) => {
  const [dialog, setDialog] = React.useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    type: 'danger',
    confirmText: 'Ya, Hapus',
    cancelText: 'Batal'
  });

  const confirm = (options) => {
    return new Promise((resolve) => {
      setDialog({
        ...options,
        isOpen: true,
        onConfirm: () => {
          setDialog(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setDialog(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
        type={dialog.type}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
      />
    </ConfirmContext.Provider>
  );
};

// Hook untuk menggunakan confirm dialog
export const useConfirm = () => {
  const context = React.useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export default ConfirmDialog;