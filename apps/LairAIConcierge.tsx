import React, { useState, useRef, useEffect, memo } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationType, ChatMessage, AIPersona, ChatSession } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const PERSONAS: AIPersona[] = [
    { id: 'general', name: 'General Assistant', systemInstruction: "You are Axiom, a helpful and direct AI assistant integrated into a virtual operating system called Lair_OS. Be concise and accurate." },
    { id: 'code', name: 'Code Assistant', systemInstruction: "You are Axiom, an expert programmer AI assistant. You provide only code solutions and explanations. Use markdown for all code blocks, specifying the language." },
    { id: 'creative', name: 'Creative Writer', systemInstruction: "You are Axiom, a creative AI for brainstorming and writing. You speak eloquently and provide imaginative ideas." },
];

const DEFAULT_SESSION: ChatSession = {id: `session-${Date.now()}`, title: 'New Chat', messages: [], personaId: 'general'};

// Memoize the Message component to prevent re-renders of the entire list during streaming
const Message = memo(({ msg }: { msg: ChatMessage }) => {
    return (
        <div className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl p-3 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-[var(--accent-color)] text-black' : 'bg-[var(--color-bg-surface)] text-neutral-200'}`}>
                <p className="whitespace-pre-wrap font-sans my-0">{msg.text}</p>
            </div>
        </div>
    );
});

const TypingIndicator = () => (
    <div className="flex items-start gap-3 justify-start">
        <div className="max-w-lg p-3 rounded-lg bg-[var(--color-bg-surface)]">
            <div className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"></span>
            </div>
        </div>
    </div>
);


const Axiom: React.FC = () => {
  const [sessions, setSessions] = useLocalStorage<ChatSession[]>('axiom-sessions', [DEFAULT_SESSION]);
  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0].id);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatInstances = useRef(new Map<string, Chat>());
  const { addNotification } = useNotifications();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isLoading]);
  
  const getOrInitChat = (session: ChatSession): Chat | null => {
      if (chatInstances.current.has(session.id)) {
          return chatInstances.current.get(session.id)!;
      }
      if (process.env.API_KEY) {
          try {
              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
              const persona = PERSONAS.find(p => p.id === session.personaId) || PERSONAS[0];
              const history = session.messages.map(msg => ({
                  role: msg.sender === 'user' ? 'user' : 'model',
                  parts: [{ text: msg.text }]
              }));
              
              const chat = ai.chats.create({
                  model: 'gemini-2.5-flash',
                  config: { systemInstruction: persona.systemInstruction },
                  history: history,
              });
              chatInstances.current.set(session.id, chat);
              return chat;
          } catch(e) {
              console.error(e);
              addNotification('Failed to initialize AI. Check API Key.', NotificationType.ERROR);
              return null;
          }
      }
      return null;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !activeSession) return;

    const userMessage: ChatMessage = { id: `msg-${Date.now()}`, sender: 'user', text: input, timestamp: Date.now() };
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    // Optimistically update UI
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, userMessage] } : s));

    const chat = getOrInitChat(activeSession);
    if (!chat) {
        addNotification('AI is not configured. Using mock response.', NotificationType.WARNING);
        setTimeout(() => {
            const mockResponse: ChatMessage = { id: `msg-${Date.now()}`, sender: 'ai', text: "This is a mock response. Please configure your API key.", timestamp: Date.now()};
            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, mockResponse] } : s));
            setIsLoading(false);
        }, 1000);
        return;
    }

    try {
        const stream = await chat.sendMessageStream({ message: currentInput });
        let aiResponse: ChatMessage = { id: `msg-${Date.now()+1}`, sender: 'ai', text: "", timestamp: Date.now() };
        let firstChunk = true;
        
        for await (const chunk of stream) {
            const chunkText = chunk.text;
            aiResponse.text += chunkText;
            if(firstChunk) {
              setSessions(prev => prev.map(s => s.id === activeSessionId ? {...s, messages: [...s.messages, aiResponse]} : s));
              firstChunk = false;
            } else {
              setSessions(prev => prev.map(s => {
                  if (s.id === activeSessionId) {
                      const newMsgs = [...s.messages];
                      newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], text: aiResponse.text };
                      return {...s, messages: newMsgs};
                  }
                  return s;
              }));
            }
        }
    } catch (error) {
        console.error("Error sending message:", error);
        addNotification("Error communicating with AI.", NotificationType.ERROR);
        // Revert optimistic update on error
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: s.messages.slice(0, -1) } : s));

    } finally {
        setIsLoading(false);
    }
  };

  const handleNewSession = () => {
    const newSession: ChatSession = {id: `session-${Date.now()}`, title: 'New Chat', messages: [], personaId: 'general'};
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }
  
  const handleDeleteSession = (id: string) => {
    let newSessions = sessions.filter(s => s.id !== id);
    if (newSessions.length === 0) {
        newSessions = [DEFAULT_SESSION];
    }
    setSessions(newSessions);
    if (activeSessionId === id) {
        setActiveSessionId(newSessions[0].id);
    }
    chatInstances.current.delete(id);
  }

  return (
    <div className="h-full w-full flex bg-[var(--color-bg-surface-2)] text-neutral-300">
      {/* Sidebar */}
      <aside className="w-56 bg-[var(--color-bg-surface)] flex flex-col border-r border-[var(--color-border-subtle)]">
        <div className="p-3 border-b border-[var(--color-border-subtle)]">
          <button onClick={handleNewSession} className="w-full bg-[var(--accent-color)] text-black rounded py-2 text-sm font-bold hover:opacity-80 transition-opacity">
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.map(s => (
            <div key={s.id} onClick={() => setActiveSessionId(s.id)} className={`p-3 text-sm truncate cursor-pointer relative group ${activeSessionId === s.id ? 'bg-[var(--color-bg-muted)] text-white' : 'text-neutral-400 hover:bg-[var(--color-bg-surface-2)]'}`}>
              {s.title}
              <button onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.id)}} className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:block text-neutral-500 hover:text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.046A12.706 12.706 0 0110 17.07l-.149.046a.75.75 0 00-.23 1.482l2.365.468a2.75 2.75 0 002.75-2.75V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
              </button>
            </div>
          ))}
        </div>
      </aside>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="p-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
            <h2 className="text-base font-bold text-white">{activeSession?.title || 'Axiom'}</h2>
            <select value={activeSession.personaId} onChange={e => {
                const newPersonaId = e.target.value;
                setSessions(sessions.map(s => s.id === activeSessionId ? {...s, personaId: newPersonaId} : s));
                chatInstances.current.delete(activeSessionId); // Force re-initialization with new persona
            }} className="bg-transparent text-xs text-neutral-300 border border-neutral-700 rounded p-1 focus:outline-none">
                {PERSONAS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
        </header>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {activeSession?.messages.map((msg) => <Message key={msg.id} msg={msg} />)}
            { isLoading && <TypingIndicator /> }
            <div ref={messagesEndRef} />
        </div>
        <div className="p-3 border-t border-[var(--color-border-subtle)]">
            <div className="flex items-center bg-[var(--color-bg-surface)] rounded-md p-1 border border-transparent focus-within:border-[var(--accent-color)]">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Ask Axiom..."
                className="flex-1 bg-transparent px-2 py-1.5 text-sm text-neutral-200 focus:outline-none resize-none h-auto max-h-24"
                rows={1}
                disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-[var(--accent-color)] hover:opacity-80 text-black font-bold p-2 rounded-md transition-all duration-200 disabled:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M3.105 13.667a.75.75 0 010-1.334L18.333 3.105a.75.75 0 01.958.958L10.06 18.333a.75.75 0 01-1.334 0L3.105 13.667z" /></svg>
            </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Axiom;