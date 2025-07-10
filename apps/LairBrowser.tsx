
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Bookmark, HistoryEntry, NotificationType } from '../types';
import { useNotifications } from '../contexts/NotificationContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Tab {
  id: number;
  url: string;
  title: string;
}

const Portal: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([{ id: 1, url: 'https://duckduckgo.com', title: 'New Tab' }]);
  const [activeTabId, setActiveTabId] = useState<number>(1);
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>('portal-bookmarks', []);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('portal-history', []);
  const [showVerticalTabs, setShowVerticalTabs] = useState(false);
  const nextId = useRef(2);
  const addressBarRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotifications();

  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId), [tabs, activeTabId]);

  useEffect(() => {
    if (activeTab && addressBarRef.current) {
        addressBarRef.current.value = activeTab.url;
    }
  }, [activeTab]);

  const setUrlForActiveTab = (url: string) => {
    const newHistoryEntry: HistoryEntry = { id: `hist-${Date.now()}`, url, title: url, timestamp: Date.now() };
    setHistory(prev => [newHistoryEntry, ...prev.slice(0, 99)]);
    setTabs(tabs.map(tab => (tab.id === activeTabId ? { ...tab, url, title: 'Loading...' } : tab)));
  };
  
  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement, Event>, tabId: number) => {
    try {
        const iframe = e.target as HTMLIFrameElement;
        const title = iframe.contentWindow?.document.title || 'Untitled';
        setTabs(prevTabs => prevTabs.map(tab => tab.id === tabId ? {...tab, title} : tab));
    } catch (error) {
        setTabs(prevTabs => prevTabs.map(tab => tab.id === tabId ? {...tab, title: tab.url.split('/')[2] || 'Untitled'} : tab));
    }
  };

  const handleNewTab = () => {
    const newTab: Tab = { id: nextId.current, url: 'https://duckduckgo.com', title: 'New Tab' };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    nextId.current++;
  };

  const handleCloseTab = (idToClose: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    let newTabs = tabs.filter(t => t.id !== idToClose);
    if (newTabs.length === 0) {
      newTabs = [{ id: nextId.current++, url: 'https://duckduckgo.com', title: 'New Tab' }];
    }
    if (activeTabId === idToClose) {
        const closingTabIndex = tabs.findIndex(t => t.id === idToClose);
        const newActiveTab = newTabs[closingTabIndex] || newTabs[newTabs.length - 1];
        setActiveTabId(newActiveTab.id);
    }
    setTabs(newTabs);
  };
  
  const handleAddressSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (addressBarRef.current) {
      let url = addressBarRef.current.value.trim();
      if (!url) return;
      if (!/^(https?|ftp):\/\//i.test(url)) {
        if (url.includes('.') && !url.includes(' ')) {
          url = `https://` + url;
        } else {
          url = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
        }
      }
      setUrlForActiveTab(url);
    }
  };
  
  const handleBookmark = () => {
      if (!activeTab) return;
      const isBookmarked = bookmarks.some(b => b.url === activeTab.url);
      if (isBookmarked) {
          setBookmarks(bookmarks.filter(b => b.url !== activeTab.url));
          addNotification('Bookmark removed.', NotificationType.INFO);
      } else {
          const newBookmark: Bookmark = { id: `bm-${Date.now()}`, url: activeTab.url, title: activeTab.title };
          setBookmarks([newBookmark, ...bookmarks]);
          addNotification('Bookmark added!', NotificationType.SUCCESS);
      }
  };

  const isBookmarked = useMemo(() => activeTab && bookmarks.some(b => b.url === activeTab.url), [activeTab, bookmarks]);

  const NavButton: React.FC<{children: React.ReactNode, title: string, onClick?: () => void, active?: boolean, disabled?: boolean}> = ({children, title, onClick, active, disabled}) => (
    <button onClick={onClick} disabled={disabled} className={`p-1.5 rounded text-neutral-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${active ? 'text-[var(--accent-color)] bg-white/5' : ''}`} title={title}>{children}</button>
  );

  const TabComponent: React.FC<{tab: Tab, onSelect: (id:number) => void, onClose: (id:number, e?: React.MouseEvent) => void, isActive: boolean, vertical?: boolean}> = ({tab, onSelect, onClose, isActive, vertical}) => (
    <div
      onClick={() => onSelect(tab.id)}
      className={`relative flex items-center justify-between h-full px-3 cursor-pointer transition-colors duration-200 group ${
        isActive ? 'bg-[var(--color-bg-surface-2)] text-white' : 'text-neutral-400 hover:bg-[var(--color-bg-muted)]'
      } ${vertical ? 'w-full h-10 border-b' : 'border-r'} border-[var(--color-border-subtle)]`}
    >
      <span className="text-xs truncate max-w-32 pr-4">{tab.title}</span>
      <button onClick={(e) => onClose(tab.id, e)} className="absolute right-1 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-white/10 flex items-center justify-center">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
      </button>
      {isActive && !vertical && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--accent-color)]"></div>}
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col bg-[var(--color-bg-surface)] text-neutral-300">
      <div className="flex items-center p-1.5 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] gap-2">
        <div className="flex space-x-1">
            <NavButton title="Toggle Vertical Tabs" onClick={() => setShowVerticalTabs(!showVerticalTabs)} active={showVerticalTabs}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transform -rotate-90"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" /></svg></NavButton>
            <NavButton title="Back" disabled><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg></NavButton>
            <NavButton title="Forward" disabled><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg></NavButton>
            <NavButton title="Refresh"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.181-3.183m-11.664 0-3.181 3.183m0 0-3.181-3.183" /></svg></NavButton>
            <NavButton title="Home" onClick={() => setUrlForActiveTab('https://duckduckgo.com')}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg></NavButton>
        </div>
        <form onSubmit={handleAddressSubmit} className="flex-1 relative flex items-center">
            <input
                ref={addressBarRef}
                key={activeTab?.id}
                defaultValue={activeTab?.url}
                type="text"
                className="w-full bg-[var(--color-bg-muted)] text-neutral-200 text-xs pl-3 pr-8 py-1.5 rounded-md border border-transparent focus:outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)]"
                placeholder="Search or type a URL"
            />
        </form>
         <div className="flex items-center space-x-1">
            <NavButton title="Bookmark this page" onClick={handleBookmark} active={isBookmarked}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v12l-5-3-5 3V4z" /></svg>
            </NavButton>
             <button className="flex items-center gap-2 py-1.5 px-3 rounded-md bg-[var(--accent-color)] text-black font-bold text-xs transition-colors duration-200 hover:bg-opacity-80"
                title="Send current page context to Automaton">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M14.22 2.22a.75.75 0 00-1.06 0l-4.25 4.25a.75.75 0 000 1.06l4.25 4.25a.75.75 0 001.06-1.06L10.56 8l3.66-3.66a.75.75 0 000-1.06z" /><path d="M5.78 13.78a.75.75 0 001.06 0l4.25-4.25a.75.75 0 000-1.06L6.84 4.22a.75.75 0 00-1.06 1.06L9.44 8l-3.66 3.66a.75.75 0 000 1.06z" /></svg>
                <span>AUTOMATE</span>
            </button>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {showVerticalTabs && (
             <div className="flex flex-col bg-[var(--color-bg-surface)] w-48 border-r border-[var(--color-border-subtle)]">
                <div className="flex-1 overflow-y-auto">
                    {tabs.map(tab => <TabComponent key={tab.id} tab={tab} onSelect={setActiveTabId} onClose={handleCloseTab} isActive={activeTabId === tab.id} vertical />)}
                </div>
                <button onClick={handleNewTab} className="h-10 border-t border-[var(--color-border-subtle)] text-neutral-400 hover:text-white hover:bg-white/5 transition-colors text-xs flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                    New Tab
                </button>
            </div>
        )}
        
        <div className="flex-1 flex flex-col bg-[var(--color-bg-base)]">
          {!showVerticalTabs && (
            <div className="flex items-center bg-[var(--color-bg-surface)] h-8 border-b border-[var(--color-border-subtle)]">
              {tabs.map(tab => <TabComponent key={tab.id} tab={tab} onSelect={setActiveTabId} onClose={handleCloseTab} isActive={activeTabId === tab.id} />)}
              <button onClick={handleNewTab} className="px-2 h-full text-lg text-neutral-400 hover:bg-white/5 hover:text-white transition-colors">+</button>
            </div>
          )}

          <div className="flex-1 relative bg-black">
            {tabs.map(tab => (
                <iframe
                key={tab.id}
                src={tab.url}
                title={tab.title}
                className={`w-full h-full border-none absolute top-0 left-0 transition-opacity ${activeTabId === tab.id ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
                onLoad={(e) => handleIframeLoad(e, tab.id)}
                ></iframe>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portal;