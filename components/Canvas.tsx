import React, { useRef, useState, useEffect, useCallback } from 'react';
import { NodeData, CanvasState, NodeType, Point, ToolMode, Connection } from '../types';
import { NodeItem } from './NodeItem';
import { ConnectionLine } from './ConnectionLine';
import { generateTextExpansion, generateImageNode, synthesizeConcepts } from '../services/geminiService';
import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH, NODE_COLORS } from '../constants';
import { v4 as uuidv4 } from 'uuid'; // We'll implement a simple UUID generator locally to avoid ext deps if possible, but guide allows libraries. I will use a simple Math.random fallback if uuid not avail, or better, just a simple helper.

// Simple ID generator to avoid strict dependency on 'uuid' package if not pre-installed in environment
const generateId = () => Math.random().toString(36).substr(2, 9);

interface CanvasProps {
    toolMode: ToolMode;
    setToolMode: (m: ToolMode) => void;
    nodes: NodeData[];
    setNodes: React.Dispatch<React.SetStateAction<NodeData[]>>;
    connections: Connection[];
    setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
    selectedNodeIds: Set<string>;
    setSelectedNodeIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    systemInstruction: string;
}

export const Canvas: React.FC<CanvasProps> = ({ 
    toolMode, 
    setToolMode,
    nodes,
    setNodes,
    connections,
    setConnections,
    selectedNodeIds,
    setSelectedNodeIds,
    systemInstruction
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasState, setCanvasState] = useState<CanvasState>({ offsetX: 0, offsetY: 0, scale: 1 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 });

  // Coordinate Conversion
  const screenToWorld = useCallback((x: number, y: number) => {
    return {
      x: (x - canvasState.offsetX) / canvasState.scale,
      y: (y - canvasState.offsetY) / canvasState.scale,
    };
  }, [canvasState]);

  // Handlers
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
        // Zoom
        e.preventDefault();
        const zoomSensitivity = 0.001;
        const delta = -e.deltaY * zoomSensitivity;
        const newScale = Math.min(Math.max(0.1, canvasState.scale + delta), 3);
        
        // Zoom towards mouse pointer logic could go here, keeping simple center zoom for now to save code space
        // Or simple mouse-centric zoom:
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const worldPosBefore = screenToWorld(mouseX, mouseY);
        
        const newOffsetX = mouseX - worldPosBefore.x * newScale;
        const newOffsetY = mouseY - worldPosBefore.y * newScale;

        setCanvasState({
            scale: newScale,
            offsetX: newOffsetX,
            offsetY: newOffsetY
        });
    } else {
        // Pan
        setCanvasState(prev => ({
            ...prev,
            offsetX: prev.offsetX - e.deltaX,
            offsetY: prev.offsetY - e.deltaY
        }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click or Space+Click or Hand Tool -> Pan
    if (e.button === 1 || toolMode === ToolMode.HAND) {
        setIsDraggingCanvas(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        return;
    }

    // If clicked on empty space (target is the container or the background SVG)
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
        setSelectedNodeIds(new Set());
        if (toolMode === ToolMode.SELECT) {
             // Logic for selection box could go here
        }
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    
    if (toolMode === ToolMode.HAND) return;

    if (e.shiftKey) {
        setSelectedNodeIds(prev => {
            const next = new Set(prev);
            if (next.has(nodeId)) next.delete(nodeId);
            else next.add(nodeId);
            return next;
        });
    } else {
        if (!selectedNodeIds.has(nodeId)) {
            setSelectedNodeIds(new Set([nodeId]));
        }
        setIsDraggingNode(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        setCanvasState(prev => ({
            ...prev,
            offsetX: prev.offsetX + dx,
            offsetY: prev.offsetY + dy
        }));
        setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isDraggingNode) {
        const dx = (e.clientX - lastMousePos.x) / canvasState.scale;
        const dy = (e.clientY - lastMousePos.y) / canvasState.scale;
        
        setNodes(prev => prev.map(node => {
            if (selectedNodeIds.has(node.id)) {
                return { ...node, x: node.x + dx, y: node.y + dy };
            }
            return node;
        }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setIsDraggingNode(false);
  };

  // Node Actions
  const updateNodeContent = (id: string, content: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, content } : n));
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.fromId !== id && c.toId !== id));
    setSelectedNodeIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
    });
  };

  // GEMINI ACTIONS

  const expandNode = async (id: string) => {
    const parentNode = nodes.find(n => n.id === id);
    if (!parentNode || !parentNode.content.trim()) return;

    // Set loading state
    setNodes(prev => prev.map(n => n.id === id ? { ...n, isLoading: true } : n));

    try {
        const ideas = await generateTextExpansion(parentNode.content, '', systemInstruction);
        
        // Create new nodes in a circle around the parent
        const radius = 350;
        const startAngle = Math.random() * Math.PI * 2;
        const newNodes: NodeData[] = [];
        const newConnections: Connection[] = [];

        ideas.forEach((idea, index) => {
            const angle = startAngle + (index / ideas.length) * Math.PI * 2;
            const newNodeId = generateId();
            
            newNodes.push({
                id: newNodeId,
                x: parentNode.x + Math.cos(angle) * radius + (Math.random() * 50),
                y: parentNode.y + Math.sin(angle) * radius + (Math.random() * 50),
                width: DEFAULT_NODE_WIDTH,
                height: DEFAULT_NODE_HEIGHT,
                content: idea,
                type: NodeType.TEXT,
                color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)]
            });

            newConnections.push({
                id: generateId(),
                fromId: parentNode.id,
                toId: newNodeId
            });
        });

        setNodes(prev => [...prev.map(n => n.id === id ? { ...n, isLoading: false } : n), ...newNodes]);
        setConnections(prev => [...prev, ...newConnections]);

    } catch (e) {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, isLoading: false, error: 'Failed to expand' } : n));
    }
  };

  const visualizeNode = async (id: string) => {
    const node = nodes.find(n => n.id === id);
    if (!node) return;

    setNodes(prev => prev.map(n => n.id === id ? { ...n, isLoading: true } : n));

    try {
        const imageBase64 = await generateImageNode(node.content);
        if (imageBase64) {
             // Create a new image node next to it
             const newNode: NodeData = {
                id: generateId(),
                x: node.x + node.width + 50,
                y: node.y,
                width: 300,
                height: 300,
                content: node.content, // Keep prompt as caption
                type: NodeType.IMAGE,
                imageUrl: imageBase64,
                color: '#000000'
             };
             
             const newConn: Connection = {
                 id: generateId(),
                 fromId: node.id,
                 toId: newNode.id
             };

             setNodes(prev => [...prev.map(n => n.id === id ? { ...n, isLoading: false } : n), newNode]);
             setConnections(prev => [...prev, newConn]);
        } else {
             setNodes(prev => prev.map(n => n.id === id ? { ...n, isLoading: false } : n));
        }
    } catch (e) {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, isLoading: false } : n));
    }
  };


  // Render connections
  const renderedConnections = connections.map(conn => {
    const fromNode = nodes.find(n => n.id === conn.fromId);
    const toNode = nodes.find(n => n.id === conn.toId);
    if (!fromNode || !toNode) return null;

    // Simple center-to-center for now
    const start = { x: fromNode.x + fromNode.width / 2, y: fromNode.y + fromNode.height / 2 };
    const end = { x: toNode.x + toNode.width / 2, y: toNode.y + toNode.height / 2 };

    return <ConnectionLine key={conn.id} start={start} end={end} />;
  });


  return (
    <div 
        ref={containerRef}
        className={`w-full h-full relative overflow-hidden bg-slate-950 ${toolMode === ToolMode.HAND || isDraggingCanvas ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
    >
        {/* Grid Background */}
        <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
                backgroundSize: `${40 * canvasState.scale}px ${40 * canvasState.scale}px`,
                backgroundPosition: `${canvasState.offsetX}px ${canvasState.offsetY}px`,
                backgroundImage: `radial-gradient(circle, #475569 1px, transparent 1px)`
            }}
        />

        {/* Content Container with Transform */}
        <div 
            className="absolute inset-0 origin-top-left will-change-transform"
            style={{
                transform: `translate(${canvasState.offsetX}px, ${canvasState.offsetY}px) scale(${canvasState.scale})`
            }}
        >
            <svg className="absolute inset-0 overflow-visible w-full h-full pointer-events-none">
                {renderedConnections}
            </svg>

            {nodes.map(node => (
                <NodeItem 
                    key={node.id} 
                    node={node} 
                    scale={canvasState.scale}
                    isSelected={selectedNodeIds.has(node.id)}
                    onMouseDown={handleNodeMouseDown}
                    onUpdate={updateNodeContent}
                    onDelete={deleteNode}
                    onExpand={expandNode}
                    onGenerateImage={visualizeNode}
                />
            ))}
        </div>
    </div>
  );
};