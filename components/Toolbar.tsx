import React from 'react';
import { Plus, Hand, MousePointer2, GitFork, Link2, Settings } from 'lucide-react';
import { ToolMode } from '../types';

interface ToolbarProps {
  currentMode: ToolMode;
  setMode: (mode: ToolMode) => void;
  onAddNode: () => void;
  onSynthesize: () => void;
  selectionCount: number;
  onOpenSettings: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
    currentMode, 
    setMode, 
    onAddNode,
    onSynthesize,
    selectionCount,
    onOpenSettings
}) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 flex items-center gap-4 shadow-2xl shadow-black/50 z-50">
      
      <div className="flex items-center gap-1 border-r border-white/10 pr-4">
        <button
          onClick={() => setMode(ToolMode.SELECT)}
          className={`p-2 rounded-full transition-all ${currentMode === ToolMode.SELECT ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Select (V)"
        >
          <MousePointer2 size={20} />
        </button>
        <button
          onClick={() => setMode(ToolMode.HAND)}
          className={`p-2 rounded-full transition-all ${currentMode === ToolMode.HAND ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Pan (H)"
        >
          <Hand size={20} />
        </button>
        {/* Connection mode could be added here if explicit connection drawing is needed */}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onAddNode}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 rounded-full text-sm font-medium transition-all border border-white/5"
        >
          <Plus size={16} />
          Add Node
        </button>
        
        {selectionCount >= 2 && (
             <button
             onClick={onSynthesize}
             className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-medium transition-all shadow-lg shadow-indigo-500/25 animate-in fade-in zoom-in duration-200"
           >
             <Link2 size={16} />
             Synthesize ({selectionCount})
           </button>
        )}

        <button
            onClick={onOpenSettings}
            className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-colors border border-white/5 ml-2"
            title="System Instruction Settings"
        >
            <Settings size={18} />
        </button>
      </div>

    </div>
  );
};