import React, { createContext, useContext, ReactNode } from 'react';
import { SettingsState, DeepPartial } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const DEFAULT_SETTINGS: SettingsState = {
  appearance: {
    theme: 'dark',
    accentColor: '#00A9FF', // A vibrant blue
    background: 'default',
  },
  layout: {
    dock: {
      position: 'bottom',
      size: 'md',
      autoHide: false,
    },
  },
  system: {
    gridSnapping: true,
  }
};

interface SettingsContextType {
  settings: SettingsState;
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>;
  isLoaded: boolean;
  updateSettings: (updates: DeepPartial<SettingsState>) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage<SettingsState>('lair-os-settings', DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    setIsLoaded(true);
  }, []);

  const updateSettings = (updates: DeepPartial<SettingsState>) => {
    setSettings(prev => {
        // A robust, non-recursive deep merge specific to the SettingsState structure.
        // This is safer and more predictable than a generic recursive merge function.
        const newSettings: SettingsState = {
            ...prev,
            appearance: {
                ...prev.appearance,
                ...(updates.appearance || {})
            },
            layout: {
                ...prev.layout,
                dock: {
                    ...prev.layout.dock,
                    ...(updates.layout?.dock || {})
                }
            },
            system: {
                ...prev.system,
                ...(updates.system || {})
            }
        };
        return newSettings;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const value = { settings, setSettings, isLoaded, updateSettings, resetSettings };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};