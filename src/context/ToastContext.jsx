import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Portal */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => {
            const icons = {
              success: '✅',
              error: '❌',
              warning: '⚠️',
              info: 'ℹ️',
            };
            const icon = icons[toast.type] || 'ℹ️';
            return (
              <div
                key={toast.id}
                className={`toast toast-${toast.type}`}
                onClick={() => dismissToast(toast.id)}
              >
                <span className="toast-icon">{icon}</span>
                <span className="toast-text">{toast.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}
