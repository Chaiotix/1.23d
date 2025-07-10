import React from 'react';
import { useWindowManager } from '../hooks/useWindowManager';
import { APPS } from '../constants';
import Window from './Window';

const Desktop: React.FC = () => {
  const { windows } = useWindowManager();

  return (
    <div className="absolute inset-0 w-full h-full">
      {windows
        .filter(win => !win.isMinimized)
        .map(win => {
          const app = APPS.find(app => app.id === win.appId);
          if (!app) return null;
          
          return (
            <Window key={win.id} instance={win}>
              <app.component />
            </Window>
          );
      })}
    </div>
  );
};

export default Desktop;