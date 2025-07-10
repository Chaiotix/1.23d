
import React, { lazy } from 'react';
import { AppDefinition } from './types';

// Lazy load app components for better initial performance
const Portal = lazy(() => import('/apps/LairBrowser.tsx'));
const Automaton = lazy(() => import('/apps/WorkflowDesigner.tsx'));
const Axiom = lazy(() => import('/apps/LairAIConcierge.tsx'));
const Nexus = lazy(() => import('/apps/ConnectorHub.tsx'));
const Settings = lazy(() => import('/apps/Settings.tsx'));
const Scratchpad = lazy(() => import('/apps/Scratchpad.tsx'));
const Terminal = lazy(() => import('/apps/Terminal.tsx'));
const Help = lazy(() => import('/apps/Help.tsx'));


// --- Aperture UI Icons ---
// A consistent set of professional, minimalist icons.

export const LairOSLogo: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <use href="#lair-os-aperture-logo"></use>
    </svg>
);

const PortalIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

const AutomatonIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4" />
        <path d="M12 18v4" />
        <path d="M4.93 4.93l2.83 2.83" />
        <path d="M16.24 16.24l2.83 2.83" />
        <path d="M2 12h4" />
        <path d="M18 12h4" />
        <path d="M4.93 19.07l2.83-2.83" />
        <path d="M16.24 7.76l2.83-2.83" />
        <rect x="7" y="7" width="10" height="10" rx="2"/>
    </svg>
);

const AxiomIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const NexusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h-1a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1"/>
        <path d="M6 8h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6"/>
        <path d="M12 8v8"/>
    </svg>
);

const SettingsIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
);

const ScratchpadIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const TerminalIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5"></polyline>
        <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
);

const HelpIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);


export const APPS: AppDefinition[] = [
  { id: 'portal', name: 'Portal', icon: PortalIcon, component: Portal, defaultSize: { width: 1024, height: 768 } },
  { id: 'automaton', name: 'Automaton', icon: AutomatonIcon, component: Automaton, defaultSize: { width: 1100, height: 700 } },
  { id: 'axiom', name: 'Axiom', icon: AxiomIcon, component: Axiom, defaultSize: { width: 500, height: 650 } },
  { id: 'nexus', name: 'Nexus', icon: NexusIcon, component: Nexus, defaultSize: { width: 600, height: 500 } },
  { id: 'scratchpad', name: 'Scratchpad', icon: ScratchpadIcon, component: Scratchpad, defaultSize: { width: 450, height: 550 } },
  { id: 'terminal', name: 'Terminal', icon: TerminalIcon, component: Terminal, defaultSize: { width: 680, height: 400 } },
  { id: 'settings', name: 'Settings', icon: SettingsIcon, component: Settings, defaultSize: { width: 700, height: 550 } },
  { id: 'help', name: 'Help', icon: HelpIcon, component: Help, defaultSize: { width: 500, height: 400 } },
];
