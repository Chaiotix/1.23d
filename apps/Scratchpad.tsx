
import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ScratchpadData } from '../types';

const Scratchpad: React.FC = () => {
    const [data, setData] = useLocalStorage<ScratchpadData>('scratchpad-data', { content: '' });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setData({ content: e.target.value });
    };

    return (
        <div className="h-full w-full flex flex-col bg-[var(--color-bg-surface-2)] text-neutral-300">
            <header className="p-3 border-b border-[var(--color-border-subtle)] flex-shrink-0">
                <h2 className="text-base font-bold text-white">Scratchpad</h2>
                <p className="text-xs text-neutral-400">Your thoughts, auto-saved.</p>
            </header>
            <main className="flex-1 flex">
                <textarea
                    value={data.content}
                    onChange={handleChange}
                    placeholder="Start typing..."
                    className="w-full h-full bg-transparent p-4 text-sm text-neutral-200 focus:outline-none resize-none leading-relaxed"
                />
            </main>
        </div>
    );
};

export default Scratchpad;
