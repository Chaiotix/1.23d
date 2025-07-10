import React from 'react';
import { APPS } from '../constants';
import { useWindowManager } from '../hooks/useWindowManager';
import { useSettings } from '../contexts/SettingsContext';

const Dock: React.FC = () => {
  const { openWindow, windows } = useWindowManager();
  const { settings } = useSettings();
  const { position, size, autoHide } = settings.layout.dock;

  const runningAppIds = new Set(windows.map(w => w.appId));
  const minimizedAppIds = new Set(windows.filter(w => w.isMinimized).map(w => w.appId));

  const positionClasses = {
    bottom: 'bottom-4 left-1/2 -translate-x-1/2 flex-row',
    left: 'left-4 top-1/2 -translate-y-1/2 flex-col',
    right: 'right-4 top-1/2 -translate-y-1/2 flex-col',
  };

  const sizeClasses = {
    sm: { container: 'space-x-2 p-2', icon: 'w-10 h-10' },
    md: { container: 'space-x-3 p-3', icon: 'w-12 h-12' },
    lg: { container: 'space-x-4 p-3', icon: 'w-14 h-14' },
  };

  const verticalSizeClasses = {
    sm: { container: 'space-y-2 p-2', icon: 'w-10 h-10' },
    md: { container: 'space-y-3 p-3', icon: 'w-12 h-12' },
    lg: { container: 'space-y-4 p-3', icon: 'w-14 h-14' },
  };

  const currentSize = position === 'bottom' ? sizeClasses[size] : verticalSizeClasses[size];

  return (
    <footer className={`fixed z-[5000] transition-all duration-300 group ${positionClasses[position]} ${autoHide ? 'hover:opacity-100 opacity-20' : ''}`}>
      <div 
        className={`flex items-center justify-center bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-black/50 transition-all duration-300 ${currentSize.container}`}
      >
        {APPS.map(app => {
          const AppIcon = app.icon;
          const isRunning = runningAppIds.has(app.id);
          const isMinimized = minimizedAppIds.has(app.id);

          return (
            <div key={app.id} className="relative flex flex-col items-center group/item" title={app.name}>
               <div className="absolute -top-8 hidden group-hover/item:block px-2 py-1 bg-gray-900 text-white text-xs rounded-md pointer-events-none transition-opacity">
                {app.name}
              </div>
              <button
                onClick={() => openWindow(app)}
                className={`p-2 rounded-lg text-neutral-300 hover:bg-white/10 transition-all duration-200 transform-gpu hover:scale-110 focus:outline-none focus-visible:ring-2 ring-offset-2 ring-offset-transparent ring-[var(--accent-color)] ${currentSize.icon}`}
                aria-label={`Open ${app.name}`}
              >
                <AppIcon className="w-full h-full" />
              </button>
              {isRunning && (
                <div 
                    className={`absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] shadow-[0_0_5px_var(--accent-color)] ${isMinimized ? 'w-3' : 'w-1.5'} transition-all`}
                />
              )}
            </div>
          )
        })}
      </div>
    </footer>
  );
};

export default Dock;