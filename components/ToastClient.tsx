'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// 1. Define the types of notifications we support
type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

// 2. Create the Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // 3. The function that pages will call to trigger the popup
  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
    
    // Auto-hide the notification after 3 seconds
    setTimeout(() => {
      setToast(null);
    }, 3000); 
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* 4. The Visual Notification UI */}
      {toast && (
        <div 
          className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl text-white font-bold z-50 flex items-center gap-3 animate-fade-in-up
            ${toast.type === 'success' ? 'bg-emerald-500 border border-emerald-400' : ''}
            ${toast.type === 'error' ? 'bg-rose-500 border border-rose-400' : ''}
            ${toast.type === 'info' ? 'bg-indigo-500 border border-indigo-400' : ''}
          `}
        >
          {/* Optional: Simple icons based on type */}
          {toast.type === 'success' && <span>✅</span>}
          {toast.type === 'error' && <span>⚠️</span>}
          {toast.type === 'info' && <span>ℹ️</span>}
          
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

// 5. A custom hook so other files can grab the showToast function easily
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};