
import { useContext } from 'react';
import { WindowManagerContext } from '../contexts/WindowManagerContext';

export const useWindowManager = () => {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error('useWindowManager must be used within a WindowManagerProvider');
  }
  return context;
};
