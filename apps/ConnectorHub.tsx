
import React, { useState } from 'react';

const MOCK_CONNECTORS = [
    { id: 'weather', name: 'Weather API', description: 'Real-time weather data.', category: 'data', status: 'active' },
    { id: 'jira', name: 'Jira', description: 'Manage project tasks and issues.', category: 'productivity', status: 'inactive' },
    { id: 'github', name: 'GitHub', description: 'Interact with repositories.', category: 'dev', status: 'active' },
    { id: 'stocks', name: 'Stock Market API', description: 'Real-time stock prices.', category: 'data', status: 'error' },
    { id: 'slack', name: 'Slack', description: 'Send and receive messages.', category: 'communication', status: 'active' },
];

const Nexus: React.FC = () => {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filteredConnectors = MOCK_CONNECTORS
        .filter(c => filter === 'all' || c.category === filter)
        .filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    const statusIndicator = (status: string) => {
        switch (status) {
            case 'active': return <div className="w-2 h-2 rounded-full bg-green-500" title="Active"></div>;
            case 'inactive': return <div className="w-2 h-2 rounded-full bg-neutral-500" title="Inactive"></div>;
            case 'error': return <div className="w-2 h-2 rounded-full bg-red-500" title="Error"></div>;
            default: return null;
        }
    }

    return (
        <div className="h-full w-full flex flex-col bg-[var(--color-bg-surface-2)] text-neutral-300">
            <header className="p-4 border-b border-[var(--color-border-subtle)]">
                <h2 className="text-xl font-bold text-white">Nexus</h2>
                <p className="text-sm text-neutral-400">Manage API connectors and authentications.</p>
            </header>

            <div className="p-4 flex gap-4 border-b border-[var(--color-border-subtle)] items-center">
                <input
                    type="search"
                    placeholder="Search connectors..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 bg-[var(--color-bg-surface)] text-sm px-3 py-1.5 rounded-md border border-[var(--color-border-default)] focus:outline-none focus:border-[var(--accent-color)]"
                />
                 <button className="bg-[var(--accent-color)] text-black text-sm font-bold px-4 py-1.5 rounded-md hover:opacity-80 transition-opacity">Add New</button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Mock Keys Section - a real app would have a dedicated page */}
                <div className="p-4">
                    <h3 className="font-semibold text-white mb-2">API Keys</h3>
                    <div className="bg-[var(--color-bg-surface)] p-3 rounded-md border border-[var(--color-border-subtle)]">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Gemini API Key</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-green-400">CONFIGURED</span>
                                <button className="text-xs font-semibold text-neutral-400 hover:text-white">EDIT</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Connectors List */}
                <div className="p-4">
                     <h3 className="font-semibold text-white mb-2">Connectors</h3>
                     {filteredConnectors.map(connector => (
                        <div key={connector.id} className="flex items-center justify-between p-3 bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-muted)] rounded-md mb-2 border border-[var(--color-border-subtle)] transition-colors">
                            <div className="flex items-center gap-3">
                                {statusIndicator(connector.status)}
                                <div>
                                    <p className="font-semibold text-sm text-neutral-200">{connector.name}</p>
                                    <p className="text-xs text-neutral-400">{connector.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button className="text-xs font-semibold text-neutral-400 hover:text-white">CONFIGURE</button>
                            </div>
                        </div>
                     ))}
                     {filteredConnectors.length === 0 && <div className="text-center text-sm text-neutral-500 py-8">No connectors found.</div>}
                </div>
            </div>
        </div>
    );
};

export default Nexus;
