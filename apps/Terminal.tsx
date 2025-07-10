import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { LairOSLogo } from '../constants';
import { GoogleGenAI } from '@google/genai';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationType } from '../types';

// --- Types ---
interface HistoryItem {
  command: string;
  output: React.ReactNode;
}

const commandMetadata: Record<string, string> = {
  help: 'Shows this help message.',
  clear: 'Clears the terminal history.',
  echo: 'Prints the provided text. Ex: echo Hello World',
  date: 'Displays the current date and time.',
  uname: 'Shows system information.',
  neofetch: 'Displays Lair_OS info.',
  ai: 'Query the integrated Gemini AI. Ex: ai explain quantum computing',
};

const Terminal: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endOfHistoryRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotifications();

  const handleCommand = async (cmdStr: string) => {
    const trimmedCmd = cmdStr.trim();
    if (!trimmedCmd) return;

    setIsProcessing(true);
    const [commandName, ...args] = trimmedCmd.split(/\s+/);
    const lowerCaseCommand = commandName.toLowerCase();
    
    // Add command to history immediately for better UX
    setHistory(prev => [...prev, { command: trimmedCmd, output: ' ' }]);
    setInput('');
    
    let output: React.ReactNode;

    switch (lowerCaseCommand) {
      case 'clear':
        setHistory([]);
        break;

      case 'help':
        output = (
          <div className="text-neutral-300 font-sans grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            {Object.entries(commandMetadata)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([name, description]) => (
                <React.Fragment key={name}>
                  <span className="font-bold text-white">{name}</span>
                  <span className="text-neutral-400">{description}</span>
                </React.Fragment>
              ))}
          </div>
        );
        break;

      case 'echo':
        output = args.join(' ');
        break;

      case 'date':
        output = new Date().toString();
        break;

      case 'uname':
        output = 'Lair_OS Aperture v1.0.0-hyperion';
        break;

      case 'neofetch':
        output = (
          <div className="flex gap-6 font-sans text-sm">
            <LairOSLogo className="w-20 h-20 text-cyan-400" />
            <div>
              <p className="font-bold text-lg"><span className="text-cyan-400">user</span>@<span className="text-white">lair_os</span></p>
              <div className="mt-1 border-t border-neutral-700 w-32 mb-2"></div>
              <p><span className="font-bold text-white w-20 inline-block">OS</span>: Lair_OS Aperture</p>
              <p><span className="font-bold text-white w-20 inline-block">Uptime</span>: {Math.floor(performance.now() / 60000)} minutes</p>
              <p><span className="font-bold text-white w-20 inline-block">Shell</span>: la-sh</p>
              <p><span className="font-bold text-white w-20 inline-block">Terminal</span>: Lair Terminal</p>
            </div>
          </div>
        );
        break;

      case 'ai':
        if (!process.env.API_KEY) {
            output = 'Error: Gemini API key is not configured in this environment.';
            addNotification('Gemini API Key is not set.', NotificationType.ERROR);
            break;
        }
        if (args.length === 0) {
            output = "Usage: ai <prompt>";
            break;
        }
        const prompt = args.join(' ');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            output = response.text;
        } catch (error) {
            console.error(error);
            output = `AI Error: ${error instanceof Error ? error.message : 'An unknown error occurred.'}`;
            addNotification('Failed to query Gemini AI.', NotificationType.ERROR);
        }
        break;

      default:
        output = `Command not found: ${commandName}. Try 'help'.`;
        break;
    }
    
    // Update the history entry with the final output
    setHistory(prev => {
        const newHistory = [...prev];
        if (lowerCaseCommand === 'clear') return [];
        newHistory[newHistory.length-1] = { command: trimmedCmd, output };
        return newHistory;
    });

    setIsProcessing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    handleCommand(input);
  };
  
  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);
  
  useEffect(() => {
    if (!isProcessing) {
        inputRef.current?.focus();
    }
  }, [isProcessing]);
  
  useEffect(() => {
    setHistory([{ command: '', output: `Welcome to Lair Terminal. Type 'help' for a list of commands.` }]);
  }, []);

  return (
    <div
      className="h-full w-full flex flex-col bg-black/80 text-green-400 font-mono"
      onClick={() => inputRef.current?.focus()}
    >
      <main className="flex-1 p-2 overflow-y-auto text-sm" aria-live="polite">
        {history.map((item, index) => (
          <div key={index}>
            {item.command ? (
              <div className="flex items-center">
                <span className="text-cyan-400">lair_os &gt;</span>
                <span className="ml-2 text-white">{item.command}</span>
              </div>
            ) : null}
            {item.output && <div className="mt-1 mb-2 text-neutral-300 whitespace-pre-wrap font-sans">{item.output}</div>}
          </div>
        ))}
         {isProcessing && !input && (
            <div className="mt-1 mb-2 text-neutral-400 font-sans">Thinking...</div>
        )}
        <div ref={endOfHistoryRef} />
      </main>
      <footer className="p-2 border-t border-green-400/20 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-cyan-400">lair_os &gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 bg-transparent ml-2 text-white focus:outline-none font-mono"
            autoFocus
            aria-label="Terminal input"
            spellCheck="false"
            autoComplete="off"
            disabled={isProcessing}
          />
        </form>
      </footer>
    </div>
  );
};

export default Terminal;