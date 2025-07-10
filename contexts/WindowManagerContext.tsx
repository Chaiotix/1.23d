
import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { WindowInstance, AppDefinition } from '../types';

interface WindowManagerContextType {
  windows: WindowInstance[];
  openWindow: (app: AppDefinition) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowState: (id: string, updates: Partial<WindowInstance>) => void;
}

export const WindowManagerContext = createContext<WindowManagerContextType | undefined>(undefined);

const BASE_Z_INDEX = 100;

export const WindowManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [lastPosition, setLastPosition] = useState({ x: 50, y: 50 });

  const getTopZIndex = useCallback(() => {
    return Math.max(BASE_Z_INDEX, ...windows.map(w => w.zIndex));
  }, [windows]);

  const focusWindow = useCallback((id: string) => {
    setWindows(prevWindows => {
      const topZ = getTopZIndex();
      const windowToFocus = prevWindows.find(w => w.id === id);
      // Only re-order if the window isn't already on top
      if (windowToFocus && windowToFocus.zIndex <= topZ) {
        return prevWindows.map(w =>
          w.id === id ? { ...w, zIndex: topZ + 1, isMinimized: false } : w
        );
      }
      return prevWindows;
    });
  }, [getTopZIndex]);

  const openWindow = useCallback((app: AppDefinition) => {
    let existingWindow = windows.find(w => w.appId === app.id);
    
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        updateWindowState(existingWindow.id, { isMinimized: false });
      }
      focusWindow(existingWindow.id);
      return;
    }

    const newWindowId = `win-${Date.now()}`;
    const topZ = getTopZIndex();

    // Cascade new windows
    const newPos = { x: lastPosition.x + 30, y: lastPosition.y + 30 };
    // Reset position if it goes too far off-screen
    if (newPos.x > window.innerWidth / 2 || newPos.y > window.innerHeight / 2) {
      newPos.x = 50;
      newPos.y = 50;
    }
    setLastPosition(newPos);
    
    const newWindow: WindowInstance = {
        id: newWindowId,
        appId: app.id,
        title: app.name,
        position: newPos,
        size: app.defaultSize || { width: 800, height: 600 },
        zIndex: topZ + 1,
        isMinimized: false,
        isMaximized: false
    };
    setWindows(prev => [...prev, newWindow]);

  }, [windows, focusWindow, getTopZIndex, lastPosition]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const updateWindowState = useCallback((id: string, updates: Partial<WindowInstance>) => {
    setWindows(prev => prev.map(w => (w.id === id ? { ...w, ...updates } : w)));
  }, []);
  

  const value = { windows, openWindow, closeWindow, focusWindow, updateWindowState };

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
};
