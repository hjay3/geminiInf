import React, { useState, useCallback } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { SettingsModal } from './components/SettingsModal';
import { NodeData, ToolMode, NodeType, Connection } from './types';
import { DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT, NODE_COLORS } from './constants';
import { synthesizeConcepts } from './services/geminiService';

// Helper
const generateId = () => Math.random().toString(36).substr(2, 9);

const DEFAULT_SYSTEM_INSTRUCTION = "You are a creative assistant in an infinite canvas brainstorming tool.";

const App: React.FC = () => {
  const [nodes, setNodes] = useState<NodeData[]>([
    {
      id: '1',
      x: 100,
      y: 100,
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT,
      content: 'Welcome to Gemini Canvas. \n\nDouble-click text to edit. \nClick "Expand" to generate related ideas.',
      type: NodeType.TEXT,
      color: NODE_COLORS[0]
    }
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [toolMode, setToolMode] = useState<ToolMode>(ToolMode.SELECT);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  
  // Settings State
  const [systemInstruction, setSystemInstruction] = useState<string>(DEFAULT_SYSTEM_INSTRUCTION);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleAddNode = useCallback(() => {
    // Add to center of screen approx (simplified)
    const centerX = window.innerWidth / 2 - 140;
    const centerY = window.innerHeight / 2 - 80;
    
    // Adjust for some random offset to not stack perfectly
    const newNode: NodeData = {
      id: generateId(),
      x: centerX + (Math.random() * 40 - 20),
      y: centerY + (Math.random() * 40 - 20),
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT,
      content: '',
      type: NodeType.TEXT,
      color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)]
    };
    
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeIds(new Set([newNode.id]));
    setToolMode(ToolMode.SELECT);
  }, []);

  const handleSynthesize = async () => {
    if (selectedNodeIds.size !== 2) return;
    setIsSynthesizing(true);
    const ids = Array.from(selectedNodeIds);
    const nodeA = nodes.find(n => n.id === ids[0]);
    const nodeB = nodes.find(n => n.id === ids[1]);

    if (nodeA && nodeB) {
        try {
            // Visual feedback - set them to loading? 
            // For simplicity, we just show global loading or wait.
            const synthesisText = await synthesizeConcepts(nodeA.content, nodeB.content, systemInstruction);
            
            // Create new node between them
            const midX = (nodeA.x + nodeB.x) / 2;
            const midY = (nodeA.y + nodeB.y) / 2;
            
            const newNode: NodeData = {
                id: generateId(),
                x: midX,
                y: midY + 200, // Drop it below
                width: DEFAULT_NODE_WIDTH,
                height: DEFAULT_NODE_HEIGHT,
                content: synthesisText,
                type: NodeType.TEXT,
                color: '#4f46e5' // Indigo
            };

            const conn1: Connection = { id: generateId(), fromId: nodeA.id, toId: newNode.id };
            const conn2: Connection = { id: generateId(), fromId: nodeB.id, toId: newNode.id };

            setNodes(prev => [...prev, newNode]);
            setConnections(prev => [...prev, conn1, conn2]);
            setSelectedNodeIds(new Set([newNode.id]));

        } catch (e) {
            console.error(e);
        }
    }
    setIsSynthesizing(false);
  };

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden relative font-sans">
      <Canvas 
        toolMode={toolMode}
        setToolMode={setToolMode}
        nodes={nodes}
        setNodes={setNodes}
        connections={connections}
        setConnections={setConnections}
        selectedNodeIds={selectedNodeIds}
        setSelectedNodeIds={setSelectedNodeIds}
        systemInstruction={systemInstruction}
      />
      
      <Toolbar 
        currentMode={toolMode}
        setMode={setToolMode}
        onAddNode={handleAddNode}
        onSynthesize={handleSynthesize}
        selectionCount={selectedNodeIds.size}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        systemInstruction={systemInstruction}
        onSave={setSystemInstruction}
      />

      {isSynthesizing && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-indigo-600/90 rounded-full text-white font-medium shadow-xl z-50 animate-pulse">
            Synthesizing concepts with Gemini...
          </div>
      )}
      
      {/* Help / Info Overlay */}
      <div className="fixed top-4 right-4 pointer-events-none z-40 opacity-50 hover:opacity-100 transition-opacity">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/5 text-xs text-slate-400">
          <p className="font-semibold text-slate-200 mb-2">Gemini Infinite Canvas</p>
          <ul className="space-y-1">
            <li>• Scroll to Zoom</li>
            <li>• Middle-click / Hand to Pan</li>
            <li>• Shift+Click to Select multiple</li>
            <li>• Select 2 nodes to Synthesize</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;