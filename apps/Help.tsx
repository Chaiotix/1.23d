
import React from 'react';

const SHORTCUTS = [
    { keys: ['Ctrl/⌘', 'K'], description: 'Open Command Palette' },
    { keys: ['Esc'], description: 'Close Command Palette or focused element' },
];

const Help: React.FC = () => {
    return (
        <div className="h-full w-full flex flex-col bg-[var(--color-bg-surface-2)] text-neutral-300">
            <header className="p-4 border-b border-[var(--color-border-subtle)]">
                <h2 className="text-xl font-bold text-white">Help Center</h2>
                <p className="text-sm text-neutral-400">Keyboard shortcuts and guides.</p>
            </header>
            <main className="flex-1 p-6 overflow-y-auto">
                <h3 className="font-semibold text-lg text-white mb-4">Global Shortcuts</h3>
                <div className="space-y-3">
                    {SHORTCUTS.map(shortcut => (
                        <div key={shortcut.description} className="flex items-center justify-between p-3 bg-[var(--color-bg-surface)] rounded-md border border-[var(--color-border-subtle)]">
                            <p className="text-sm text-neutral-200">{shortcut.description}</p>
                            <div className="flex items-center gap-2">
                                {shortcut.keys.map(key => (
                                    <kbd key={key} className="px-2 py-1 text-xs font-sans font-semibold text-neutral-400 bg-[var(--color-bg-muted)] border border-[var(--color-border-default)] rounded-md">{key}</kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Help;
