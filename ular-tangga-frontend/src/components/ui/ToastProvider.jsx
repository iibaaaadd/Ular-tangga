import React, { createContext, useContext } from 'react';
import { useToast } from './Alert';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const toast = useToast();
  
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <toast.ToastContainer />
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};