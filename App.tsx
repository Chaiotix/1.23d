
import React, { Suspense, useState, useEffect } from 'react';
import { WindowManagerProvider } from './contexts/WindowManagerContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import Desktop from './components/Desktop';
import Dock from './components/Dock';
import CommandPalette from './components/CommandPalette';
import { LairOSLogo } from './constants';
import { desktopBg } from './assets/desktop-background';

const SplashScreen: React.FC = () => (
  <div className="absolute inset-0 bg-black z-[100000] flex flex-col items-center justify-center animate-fade-out" style={{ animationDelay: '2.5s' }}>
    <LairOSLogo className="w-24 h-24 text-white animate-fade-in" />
    <p className="mt-4 text-neutral-400 text-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>Lair_OS Aperture Initializing...</p>
  </div>
);

const AppContent: React.FC = () => {
  const { settings, isLoaded } = useSettings();

  if (!isLoaded) {
    return null; // Render nothing until settings are loaded from localStorage to prevent flash of unstyled content
  }

  return (
    <div 
      className="w-screen h-screen overflow-hidden flex"
      style={{
        '--accent-color': settings.appearance.accentColor,
        '--accent-color-rgb': settings.appearance.accentColor.match(/\w\w/g)?.map(x => parseInt(x, 16)).join(','),
        '--desktop-bg': `url(${desktopBg})`,
      } as React.CSSProperties}
      data-theme={settings.appearance.theme}
    >
      <main className="flex-1 relative bg-transparent">
        <Desktop />
      </main>
      <Dock />
      <CommandPalette />
    </div>
  );
};

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 3000); // Match animation delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <Suspense fallback={<div className="w-screen h-screen bg-black" />}>
      <SettingsProvider>
        {isBooting && <SplashScreen />}
        <div className={isBooting ? 'opacity-0' : 'animate-fade-in'}>
          <NotificationProvider>
            <WindowManagerProvider>
              <AppContent />
            </WindowManagerProvider>
          </NotificationProvider>
        </div>
      </SettingsProvider>
    </Suspense>
  );
};

export default App;