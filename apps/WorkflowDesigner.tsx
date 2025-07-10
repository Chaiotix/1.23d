
import React, { useState } from 'react';
import { Workflow, WorkflowNode, Edge } from '../types';

const Automaton: React.FC = () => {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);
    const [nodes, setNodes] = useState<WorkflowNode[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    // This is a placeholder for a real node-based UI.
    // A real implementation would use a library like React Flow or a custom canvas solution.

    const renderNode = (node: WorkflowNode) => {
        return (
            <div
                key={node.id}
                className="absolute p-3 rounded-md shadow-lg cursor-pointer bg-[var(--color-bg-surface)] border border-[var(--color-border-default)]"
                style={{ top: node.position.y, left: node.position.x, minWidth: 150 }}
            >
                <div className="text-xs font-bold mb-1 capitalize text-[var(--accent-color)]">{node.type}</div>
                <div className="text-sm font-semibold text-neutral-200">{node.label}</div>
            </div>
        );
    };

    const addNode = (type: 'action' | 'trigger') => {
        const newNode: WorkflowNode = {
            id: `node-${Date.now()}`,
            type: type,
            position: { x: 50, y: 50 },
            label: `New ${type} node`,
            inputs: {}
        };
        setNodes([...nodes, newNode]);
    }

    return (
        <div className="h-full w-full flex bg-[var(--color-bg-surface-2)] text-neutral-300">
            {/* Sidebar for Workflows & Nodes */}
            <aside className="w-64 bg-[var(--color-bg-surface)] border-r border-[var(--color-border-subtle)] flex flex-col">
                <div className="p-3 border-b border-[var(--color-border-subtle)]">
                    <h2 className="text-lg font-bold text-white">Automaton</h2>
                    <p className="text-xs text-neutral-400">Visual Workflow Editor</p>
                </div>
                <div className="p-3 flex-1 overflow-y-auto">
                     <h3 className="text-xs font-bold uppercase text-neutral-500 mb-2">My Workflows</h3>
                     {/* Workflow list would go here */}
                     <div className="text-xs text-neutral-400 p-2 text-center">No workflows saved.</div>
                </div>
                <div className="p-3 border-t border-[var(--color-border-subtle)]">
                    <button className="w-full bg-[var(--accent-color)] text-black rounded py-2 text-sm font-bold hover:opacity-80 transition-opacity">
                        New Workflow
                    </button>
                </div>
            </aside>

            {/* Main Canvas Area */}
            <main className="flex-1 flex flex-col">
                <div className="p-2 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-bg-surface)]">
                    <input 
                        type="text" 
                        defaultValue="Untitled Workflow" 
                        className="bg-transparent text-white font-semibold focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                        <button onClick={() => addNode('trigger')} className="text-xs bg-white/10 px-3 py-1 rounded hover:bg-white/20">Add Trigger</button>
                        <button onClick={() => addNode('action')} className="text-xs bg-white/10 px-3 py-1 rounded hover:bg-white/20">Add Action</button>
                        <button className="text-xs bg-[var(--accent-color)] text-black font-bold px-3 py-1 rounded hover:opacity-80">Run</button>
                    </div>
                </div>
                <div className="flex-1 relative bg-grid-pattern overflow-hidden">
                    {/* Placeholder for node canvas */}
                    <div className="absolute inset-0 bg-repeat bg-center" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-border-subtle) 1px, transparent 0)' , backgroundSize: '20px 20px'}}></div>
                    {nodes.map(renderNode)}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-neutral-600">
                        <p className="font-bold text-lg">Automaton Canvas</p>
                        <p className="text-sm">This is a visual placeholder for the node editor.</p>
                        <p className="text-xs mt-2">Click "Add Trigger" or "Add Action" to begin.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Automaton;
