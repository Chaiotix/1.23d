
import React from 'react';

// Core OS Types
export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export interface AppDefinition {
  id: string;
  name: string;
  icon: React.FC<{className?: string}>;
  component: React.ComponentType;
  defaultSize?: { width: number; height: number };
}

export interface WindowInstance {
  id: string;
  appId: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
}

// Settings & Personalization
export type Theme = 'light' | 'dark' | 'matrix';
export type DockPosition = 'bottom' | 'left' | 'right';
export type DockSize = 'sm' | 'md' | 'lg';

export interface SettingsState {
  appearance: {
    theme: Theme;
    accentColor: string;
    background: string;
  };
  layout: {
    dock: {
      position: DockPosition;
      size: DockSize;
      autoHide: boolean;
    };
  };
  system: {
    gridSnapping: boolean;
  };
}

// Command Palette
export interface Command {
  id: string;
  title: string;
  type: 'action' | 'app';
  action: () => void;
  icon: React.ReactNode;
  category: string;
}

// Notification System
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}


// --- App-Specific Types ---

// Portal (Browser)
export interface Bookmark {
  id: string;
  url: string;
  title: string;
  favicon?: string;
}

export interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  timestamp: number;
}

export interface TabGroup {
    id: string;
    name: string;
    color: string;
    tabIds: number[];
}

// Automaton (Workflow Designer)
export type NodeType = 'trigger' | 'action' | 'logic' | 'output';
export interface WorkflowNode {
    id: string;
    type: NodeType;
    position: { x: number, y: number };
    label: string;
    inputs: Record<string, any>;
}
export interface Edge {
    id: string;
    source: string;
    target: string;
}
export interface Workflow {
    id: string;
    name: string;
    nodes: WorkflowNode[];
    edges: Edge[];
}

// Axiom (AI Concierge)
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}
export interface AIPersona {
    id: string;
    name: string;
    systemInstruction: string;
}
export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    personaId: string;
}

// Scratchpad
export interface ScratchpadData {
    content: string;
}