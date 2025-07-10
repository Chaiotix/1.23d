import React, { useState, useRef, useEffect, ReactNode, Suspense } from 'react';
import { useWindowManager } from '../hooks/useWindowManager';
import { useSettings } from '../contexts/SettingsContext';
import { WindowInstance } from '../types';

interface WindowProps {
  instance: WindowInstance;
  children: ReactNode;
}

const WindowControl: React.FC<{ onClick?: (e: React.MouseEvent) => void; children: ReactNode, className?: string, title?: string }> = ({ onClick, children, className = '', title }) => (
    <button onClick={onClick} title={title} className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-200 text-neutral-400 hover:bg-white/10 ${className}`}>
        {children}
    </button>
);

const Window: React.FC<WindowProps> = ({ instance, children }) => {
  const { closeWindow, focusWindow, updateWindowState, windows } = useWindowManager();
  const { settings } = useSettings();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  
  const topZIndex = Math.max(100, ...windows.map(w => w.zIndex));
  const isActive = instance.zIndex === topZIndex;

  const handleFocus = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.window-control-button')) return;
    focusWindow(instance.id);
  };
  
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.window-control-button') || instance.isMaximized) return;
    handleFocus(e);
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - instance.position.x,
      y: e.clientY - instance.position.y,
    };
    e.preventDefault();
  };

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    handleFocus(e);
    setIsResizing(true);
  };

  const toggleMaximize = () => {
    updateWindowState(instance.id, { isMaximized: !instance.isMaximized });
  }

  const handleMinimize = () => {
    updateWindowState(instance.id, {isMinimized: true})
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && windowRef.current) {
        let newX = e.clientX - dragOffset.current.x;
        let newY = e.clientY - dragOffset.current.y;
        
        // Constrain to viewport
        const headerHeight = 36; // Height of the window header
        newX = Math.max(0, Math.min(newX, window.innerWidth - windowRef.current.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - headerHeight));

        if (settings.system.gridSnapping) {
            const gridSize = 20;
            newX = Math.round(newX / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
        }

        updateWindowState(instance.id, { position: { x: newX, y: newY } });
      }
      if (isResizing) {
        let newWidth = e.clientX - instance.position.x;
        let newHeight = e.clientY - instance.position.y;
        
        if (settings.system.gridSnapping) {
            const gridSize = 20;
            newWidth = Math.round(newWidth / gridSize) * gridSize;
            newHeight = Math.round(newHeight / gridSize) * gridSize;
        }

        const newSize = {
          width: Math.max(400, newWidth),
          height: Math.max(300, newHeight),
        };
        updateWindowState(instance.id, { size: newSize });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = isResizing ? 'nwse-resize' : 'grabbing';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp, { once: true });
    }

    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = 'default';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, instance.id, instance.position, updateWindowState, settings.system.gridSnapping]);

  const windowStyles: React.CSSProperties = instance.isMaximized ? {
    top: 0, left: 0, width: '100vw', height: '100vh',
    zIndex: instance.zIndex,
  } : {
    top: `${instance.position.y}px`,
    left: `${instance.position.x}px`,
    width: `${instance.size.width}px`,
    height: `${instance.size.height}px`,
    zIndex: instance.zIndex,
  }

  return (
    <div
      ref={windowRef}
      className={`absolute flex flex-col bg-[var(--color-bg-surface)] backdrop-blur-xl shadow-2xl shadow-black/50 ease-out border animate-fade-in-scale ${instance.isMaximized ? 'rounded-none duration-300' : 'rounded-lg duration-200'} ${isActive ? 'border-[var(--accent-color)]' : 'border-[var(--color-border-subtle)]'}`}
      style={windowStyles}
      onMouseDown={handleFocus}
    >
      {/* Window Header */}
      <header
        className={`h-9 flex items-center justify-between pl-3 pr-2 flex-shrink-0 border-b ${instance.isMaximized ? 'cursor-default' : 'cursor-grab'} ${isActive ? 'border-[var(--accent-color)]/30' : 'border-[var(--color-border-subtle)]'}`}
        onMouseDown={handleDragStart}
        onDoubleClick={toggleMaximize}
      >
        <span className="text-xs font-semibold text-neutral-200 truncate">{instance.title}</span>
        <div className="flex items-center space-x-1 window-control-button">
          <WindowControl title="Minimize" onClick={handleMinimize} className="hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.917 7h8.167"/></svg></WindowControl>
          <WindowControl title={instance.isMaximized ? "Restore" : "Maximize"} onClick={toggleMaximize} className="hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.917 4.083H4.083v5.834h5.834V4.083Z"/></svg></WindowControl>
          <WindowControl title="Close" onClick={() => closeWindow(instance.id)} className="hover:bg-red-500 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m10.5 3.5-7 7M3.5 3.5l7 7"/></svg></WindowControl>
        </div>
      </header>

      {/* Window Content */}
      <main className="flex-1 overflow-auto bg-[var(--color-bg-surface-2)]/80">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-[var(--color-bg-surface-2)]"><div className="text-sm text-neutral-500">Loading App...</div></div>}>
          {children}
        </Suspense>
      </main>

      {/* Resize Handle */}
      {!instance.isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize group"
          onMouseDown={handleResizeStart}
          style={{ zIndex: instance.zIndex + 1 }}
        >
            <div className={`w-2 h-2 absolute bottom-0 right-0 border-r-2 border-b-2 transition-colors duration-200 ${isActive ? 'border-[var(--accent-color)]' : 'border-neutral-600 group-hover:border-[var(--accent-color)]'}`}/>
        </div>
      )}
    </div>
  );
};

export default Window;