
import React, { createContext, useState, useCallback, ReactNode, useContext } from 'react';
import { Notification, NotificationType } from '../types';

interface NotificationContextType {
  addNotification: (message: string, type?: NotificationType, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: NotificationType = NotificationType.INFO, duration: number = 4000) => {
    const id = `notif-${Date.now()}`;
    const newNotification: Notification = { id, message, type, duration };
    setNotifications(prev => [...prev, newNotification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <NotificationContainer notifications={notifications} />
    </NotificationContext.Provider>
  );
};

const Icon: React.FC<{ type: NotificationType }> = ({ type }) => {
  const iconStyle = "w-5 h-5";
  switch(type) {
    case NotificationType.SUCCESS: return <svg xmlns="http://www.w3.org/2000/svg" className={iconStyle} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
    case NotificationType.WARNING: return <svg xmlns="http://www.w3.org/2000/svg" className={iconStyle} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.27-1.21 2.906 0l4.337 8.22c.628 1.19- .066 2.68-1.453 2.68H5.373c-1.387 0-2.08-1.49-1.453-2.68l4.337-8.22zM10 8a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 8zm0 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>;
    case NotificationType.ERROR: return <svg xmlns="http://www.w3.org/2000/svg" className={iconStyle} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>;
    default: return <svg xmlns="http://www.w3.org/2000/svg" className={iconStyle} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" /></svg>;
  }
}

export const NotificationContainer: React.FC<{ notifications?: Notification[] }> = ({ notifications = [] }) => {
  const getThemeColor = (type: NotificationType) => {
    switch(type) {
      case NotificationType.SUCCESS: return 'text-green-400';
      case NotificationType.WARNING: return 'text-yellow-400';
      case NotificationType.ERROR: return 'text-red-500';
      default: return 'text-[var(--accent-color)]';
    }
  }

  return (
    <div className="fixed top-5 right-5 z-[99999] w-80 space-y-3">
      {notifications.map(n => {
        const themeColor = getThemeColor(n.type);
        return (
            <div key={n.id} className="flex items-start p-3 rounded-lg shadow-2xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] animate-in slide-in-from-top">
              <div className={`mr-3 flex-shrink-0 ${themeColor}`}>
                <Icon type={n.type} />
              </div>
              <p className="font-medium text-sm text-[var(--color-text-secondary)] pr-2">{n.message}</p>
            </div>
        )
      })}
    </div>
  );
};
