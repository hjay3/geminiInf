import React, { useRef, useEffect, useState } from 'react';
import { NodeData, NodeType } from '../types';
import { Sparkles, Loader2, X, Move, Image as ImageIcon, Copy } from 'lucide-react';

interface NodeItemProps {
  node: NodeData;
  scale: number;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onExpand: (id: string) => void;
  onGenerateImage: (id: string) => void;
}

export const NodeItem: React.FC<NodeItemProps> = ({
  node,
  scale,
  isSelected,
  onMouseDown,
  onUpdate,
  onDelete,
  onExpand,
  onGenerateImage
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localContent, setLocalContent] = useState(node.content);

  useEffect(() => {
    setLocalContent(node.content);
  }, [node.content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
    onUpdate(node.id, e.target.value);
  };

  return (
    <div
      className={`absolute flex flex-col rounded-xl shadow-lg backdrop-blur-md transition-shadow duration-200 border
        ${isSelected ? 'border-blue-500 shadow-blue-500/20 ring-2 ring-blue-500/30' : 'border-white/10 shadow-black/40'}
      `}
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
        width: node.width,
        height: 'auto',
        minHeight: node.height,
        backgroundColor: node.color || '#1e293b',
      }}
      onMouseDown={(e) => onMouseDown(e, node.id)}
    >
      {/* Header / Drag Handle */}
      <div className="h-8 flex items-center justify-between px-2 border-b border-white/5 cursor-grab active:cursor-grabbing group">
        <div className="flex items-center gap-2">
            <Move size={14} className="text-slate-400" />
            <span className="text-xs text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                {node.type}
            </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
          className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-red-400 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col relative">
        {node.isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10 rounded-b-xl">
             <div className="flex flex-col items-center gap-2">
                <Loader2 size={24} className="animate-spin text-blue-400" />
                <span className="text-xs text-blue-300 font-medium">Gemini thinking...</span>
             </div>
          </div>
        ) : null}

        {node.type === NodeType.IMAGE && node.imageUrl ? (
            <div className="relative group/img">
                <img 
                    src={node.imageUrl} 
                    alt="Generated" 
                    className="w-full h-auto rounded-md border border-white/10" 
                    draggable={false}
                />
                <div className="text-xs text-slate-400 mt-2 italic border-t border-white/5 pt-2">
                    "{node.content}"
                </div>
            </div>
        ) : (
             <textarea
              ref={textareaRef}
              className="w-full h-full min-h-[100px] bg-transparent text-slate-100 resize-none outline-none text-sm leading-relaxed placeholder-slate-600"
              placeholder="Start typing or ask Gemini..."
              value={localContent}
              onChange={handleContentChange}
              onMouseDown={(e) => e.stopPropagation()} // Allow text selection without dragging node
            />
        )}
      </div>

      {/* Action Bar (Visible when selected or hovering) */}
      <div className={`px-2 py-2 border-t border-white/5 flex items-center justify-end gap-2 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        
        {node.type === NodeType.TEXT && (
            <>
                 <button
                  onClick={(e) => { e.stopPropagation(); onGenerateImage(node.id); }}
                  className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded text-xs font-medium border border-purple-500/20 transition-all"
                  title="Generate Image from this text"
                >
                  <ImageIcon size={12} />
                  Visualize
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onExpand(node.id); }}
                  className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded text-xs font-medium border border-blue-500/20 transition-all"
                >
                  <Sparkles size={12} />
                  Expand Ideas
                </button>
            </>
        )}
        
      </div>
    </div>
  );
};