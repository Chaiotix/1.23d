
import React, { useState } from 'react';
import { useSettings, DEFAULT_SETTINGS } from '../contexts/SettingsContext';
import { DockPosition, DockSize, Theme } from '../types';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('appearance');
    const { settings, updateSettings, resetSettings } = useSettings();

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all settings to their defaults?')) {
            resetSettings();
        }
    };
    
    const TabButton: React.FC<{id: string, children: React.ReactNode}> = ({id, children}) => (
        <button 
            onClick={() => setActiveTab(id)} 
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === id ? 'bg-[var(--accent-color)] text-black' : 'text-neutral-300 hover:bg-white/10'}`}
        >
            {children}
        </button>
    );

    const Section: React.FC<{title: string, description: string, children: React.ReactNode}> = ({title, description, children}) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-[var(--color-border-subtle)] py-6">
            <div className="md:col-span-1">
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-xs text-neutral-400 mt-1">{description}</p>
            </div>
            <div className="md:col-span-2 space-y-4">
                {children}
            </div>
        </div>
    );

    const SelectInput: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode}> = ({label, value, onChange, children}) => (
        <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">{label}</label>
            <select value={value} onChange={onChange} className="w-full bg-[var(--color-bg-surface)] px-3 py-2 rounded-md border border-[var(--color-border-default)] focus:outline-none focus:border-[var(--accent-color)] text-sm">
                {children}
            </select>
        </div>
    );

    const appearanceSettings = (
        <div>
            <Section title="Theme" description="Change the overall look and feel of Lair_OS.">
                <SelectInput label="Interface Theme" value={settings.appearance.theme} onChange={e => updateSettings({ appearance: { theme: e.target.value as Theme }})}>
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="matrix">Matrix</option>
                </SelectInput>
            </Section>
            <Section title="Accent Color" description="Choose the primary color for highlights, focus rings, and active elements.">
                <div className="flex items-center gap-4">
                    <input type="color" value={settings.appearance.accentColor} onChange={e => updateSettings({ appearance: { accentColor: e.target.value }})} className="w-10 h-10 p-1 bg-transparent border-none rounded-md" />
                    <input type="text" value={settings.appearance.accentColor} onChange={e => updateSettings({ appearance: { accentColor: e.target.value }})} className="flex-1 bg-[var(--color-bg-surface)] px-3 py-2 rounded-md border border-[var(--color-border-default)] focus:outline-none focus:border-[var(--accent-color)] text-sm"/>
                </div>
            </Section>
        </div>
    );
    
    const layoutSettings = (
        <div>
            <Section title="Dock Position" description="Change where the dock appears on the screen.">
                <SelectInput label="Position" value={settings.layout.dock.position} onChange={e => updateSettings({ layout: { dock: { position: e.target.value as DockPosition } } })}>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                </SelectInput>
            </Section>
             <Section title="Dock Size & Behavior" description="Adjust the size of dock icons and its visibility.">
                <SelectInput label="Icon Size" value={settings.layout.dock.size} onChange={e => updateSettings({ layout: { dock: { size: e.target.value as DockSize } } })}>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                </SelectInput>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="autoHide" checked={settings.layout.dock.autoHide} onChange={e => updateSettings({ layout: { dock: { autoHide: e.target.checked } } })} className="w-4 h-4 rounded accent-[var(--accent-color)]"/>
                    <label htmlFor="autoHide" className="text-sm text-neutral-300">Auto-hide dock</label>
                </div>
            </Section>
        </div>
    );

    const systemSettings = (
        <div>
            <Section title="Window Snapping" description="Automatically align windows to a grid when dragging.">
                 <div className="flex items-center gap-2">
                    <input type="checkbox" id="gridSnapping" checked={settings.system.gridSnapping} onChange={e => updateSettings({ system: { gridSnapping: e.target.checked }})} className="w-4 h-4 rounded accent-[var(--accent-color)]"/>
                    <label htmlFor="gridSnapping" className="text-sm text-neutral-300">Enable grid snapping</label>
                </div>
            </Section>
             <Section title="Reset Settings" description="This will reset all your customizations back to the original Lair_OS defaults.">
                <button onClick={handleReset} className="bg-red-600/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-600/40 transition-colors">
                    Reset to Default
                </button>
            </Section>
        </div>
    );


    return (
        <div className="h-full w-full flex flex-col bg-[var(--color-bg-surface-2)] text-neutral-300">
            <header className="p-4 border-b border-[var(--color-border-subtle)]">
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <p className="text-sm text-neutral-400">Configure and personalize your Lair_OS experience.</p>
            </header>
            <div className="flex-1 flex">
                <nav className="w-48 p-4 border-r border-[var(--color-border-subtle)]">
                    <div className="space-y-2 flex flex-col items-stretch">
                        <TabButton id="appearance">Appearance</TabButton>
                        <TabButton id="layout">Layout</TabButton>
                        <TabButton id="system">System</TabButton>
                    </div>
                </nav>
                <main className="flex-1 p-6 overflow-y-auto">
                    {activeTab === 'appearance' && appearanceSettings}
                    {activeTab === 'layout' && layoutSettings}
                    {activeTab === 'system' && systemSettings}
                </main>
            </div>
        </div>
    );
};

export default Settings;
