
import React, { useState, useEffect, useMemo } from 'react';
import { APPS } from '../constants';
import { useWindowManager } from '../hooks/useWindowManager';
import { Command } from '../types';

const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { openWindow } = useWindowManager();

  const commands: Command[] = useMemo(() => [
    ...APPS.map(app => ({
      id: `app-${app.id}`,
      title: `Open ${app.name}`,
      type: 'app' as const,
      action: () => openWindow(app),
      icon: <app.icon className="w-4 h-4" />,
      category: 'Applications'
    }))
  ], [openWindow]);

  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    return commands.filter(cmd => cmd.title.toLowerCase().includes(search.toLowerCase()));
  }, [search, commands]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (isOpen) {
        if (e.key === 'Escape') setIsOpen(false);
        if (e.key === 'ArrowDown') {
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        }
        if (e.key === 'ArrowUp') {
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        }
        if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);
  
  useEffect(() => {
    if(!isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-start justify-center pt-24" onClick={() => setIsOpen(false)}>
      <div className="w-full max-w-lg bg-[var(--color-bg-surface-2)] rounded-lg shadow-2xl border border-[var(--color-border-default)]" onClick={e => e.stopPropagation()}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          placeholder="Type a command or search..."
          className="w-full bg-transparent p-4 text-base text-neutral-200 focus:outline-none border-b border-[var(--color-border-subtle)]"
        />
        <ul className="p-2 max-h-96 overflow-y-auto">
          {filteredCommands.length > 0 ? filteredCommands.map((cmd, index) => (
            <li
              key={cmd.id}
              onClick={() => {
                cmd.action();
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 p-2 rounded-md cursor-pointer text-sm ${selectedIndex === index ? 'bg-[var(--accent-color)] text-black' : 'text-neutral-300 hover:bg-white/5'}`}
            >
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{cmd.icon}</div>
              <span>{cmd.title}</span>
            </li>
          )) : (
            <li className="text-center text-sm text-neutral-500 p-8">No results found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CommandPalette;
