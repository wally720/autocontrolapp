import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const timeoutRef = useRef(null);

  const hideNotification = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setNotification(null);
  }, []);

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setNotification({ message, type });
    timeoutRef.current = setTimeout(() => {
      setNotification(null);
      timeoutRef.current = null;
    }, duration);
  }, []);

  const value = useMemo(() => ({
    notification,
    showNotification,
    hideNotification,
  }), [notification, showNotification, hideNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider');
  }

  return context;
};
