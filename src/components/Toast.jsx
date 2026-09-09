/* oxlint-disable react/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, WarningCircle, XCircle, X } from '@phosphor-icons/react';
import './Toast.css';

const ToastContext = createContext({
  showToast: () => {}
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="civic-toast-container" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`civic-toast-item toast-${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' && <CheckCircle size={18} weight="fill" />}
              {t.type === 'warning' && <WarningCircle size={18} weight="fill" />}
              {t.type === 'error' && <XCircle size={18} weight="fill" />}
            </span>
            <span className="toast-message">{t.message}</span>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
