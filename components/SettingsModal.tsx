import React, { useState, useEffect } from 'react';
import { 
  X, 
  LayoutTemplate, 
  Feather, 
  Search, 
  Rocket, 
  BookOpen, 
  Target, 
  Smile, 
  Minimize2, 
  FlaskConical,
  Sparkles 
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemInstruction: string;
  onSave: (instruction: string) => void;
}

const PRESET_STYLES = [
  {
    id: 'architect',
    name: "The Architect",
    icon: LayoutTemplate,
    description: "Structural, organized, and systems thinking.",
    instruction: "You are an Architect. You think in systems, structures, and blueprints. Organize ideas logically, focus on foundations, hierarchies, and scalability. Use structured formatting and clear categorization.",
    gradient: "from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border-blue-500/30"
  },
  {
    id: 'poet',
    name: "The Poet",
    icon: Feather,
    description: "Abstract, metaphorical, and emotional.",
    instruction: "You are a Poet. Use metaphors, vivid imagery, and lyrical language. Connect concepts through abstract associations, feelings, and emotional resonance rather than pure logic. Be evocative.",
    gradient: "from-rose-500/20 to-pink-500/20 hover:from-rose-500/30 hover:to-pink-500/30 border-rose-500/30"
  },
  {
    id: 'visionary',
    name: "The Visionary",
    icon: Rocket,
    description: "Future-focused, optimistic, and big-picture.",
    instruction: "You are a Visionary. Focus on the long-term future, radical innovation, and 'moonshot' ideas. Ignore current constraints and imagine what is possible in 10-20 years. Think big.",
    gradient: "from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border-purple-500/30"
  },
  {
    id: 'skeptic',
    name: "The Skeptic",
    icon: Search,
    description: "Critical, questioning, and stress-testing.",
    instruction: "You are a Skeptic. Question assumptions, identify potential pitfalls, and play devil's advocate. Analyze ideas for weaknesses, edge cases, and logical fallacies. Be rigorous.",
    gradient: "from-slate-500/20 to-gray-500/20 hover:from-slate-500/30 hover:to-gray-500/30 border-slate-500/30"
  },
  {
    id: 'teacher',
    name: "The Teacher",
    icon: BookOpen,
    description: "Clear, educational, and simple (ELI5).",
    instruction: "You are a Teacher explaining complex topics to a 5-year-old. Use simple analogies, clear language, and avoid jargon. Prioritize clarity, patience, and fundamental understanding.",
    gradient: "from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border-amber-500/30"
  },
  {
    id: 'strategist',
    name: "The Strategist",
    icon: Target,
    description: "Action-oriented, competitive, and results.",
    instruction: "You are a Strategist. Focus on execution, competitive advantage, and actionable steps. Prioritize high-impact activities, leverage, and efficient resource allocation. Be direct.",
    gradient: "from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border-emerald-500/30"
  },
  {
    id: 'comedian',
    name: "The Wit",
    icon: Smile,
    description: "Humorous, ironic, and unconventional.",
    instruction: "You are a Satirist. Approach ideas with wit, irony, and clever humor. Find the funny or absurd side of concepts. Make points memorable through entertainment and sharp observation.",
    gradient: "from-yellow-400/20 to-amber-400/20 hover:from-yellow-400/30 hover:to-amber-400/30 border-yellow-400/30"
  },
  {
    id: 'minimalist',
    name: "The Minimalist",
    icon: Minimize2,
    description: "Concise, essentialist, and strict.",
    instruction: "You are a Minimalist. Remove all fluff. Provide only the absolute essential information. Use brevity and whitespace as tools. Maximum impact with minimum words.",
    gradient: "from-zinc-400/20 to-stone-400/20 hover:from-zinc-400/30 hover:to-stone-400/30 border-zinc-400/30"
  },
  {
    id: 'scientist',
    name: "The Scientist",
    icon: FlaskConical,
    description: "Empirical, hypothesis-driven, and objective.",
    instruction: "You are a Scientist. Base your responses on empirical evidence, hypothesis testing, and objective analysis. Differentiate between fact and speculation. Be precise.",
    gradient: "from-teal-500/20 to-cyan-600/20 hover:from-teal-500/30 hover:to-cyan-600/30 border-teal-500/30"
  }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  systemInstruction,
  onSave,
}) => {
  const [value, setValue] = useState(systemInstruction);
  const [activeStyle, setActiveStyle] = useState<string | null>(null);

  useEffect(() => {
    setValue(systemInstruction);
    // Try to match current instruction to a preset to highlight it
    const match = PRESET_STYLES.find(s => s.instruction === systemInstruction);
    setActiveStyle(match ? match.id : null);
  }, [systemInstruction, isOpen]);

  const handleStyleSelect = (style: typeof PRESET_STYLES[0]) => {
    setValue(style.instruction);
    setActiveStyle(style.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-white/10 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                <Sparkles size={20} />
            </div>
            <div>
                <h2 className="text-slate-100 font-semibold text-xl tracking-tight">AI Persona Studio</h2>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Configure System Instructions</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-8">
            
            {/* Presets Grid */}
            <section>
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Choose a Style
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PRESET_STYLES.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => handleStyleSelect(style)}
                            className={`
                                relative group flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 border
                                ${activeStyle === style.id 
                                    ? `bg-gradient-to-br ${style.gradient} ring-1 ring-white/20 border-transparent shadow-lg scale-[1.02]` 
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                }
                            `}
                        >
                            <div className={`
                                p-2.5 rounded-lg transition-colors
                                ${activeStyle === style.id ? 'bg-black/20 text-white' : 'bg-white/5 text-slate-400 group-hover:text-white'}
                            `}>
                                <style.icon size={18} />
                            </div>
                            <div>
                                <h4 className={`text-sm font-semibold mb-1 ${activeStyle === style.id ? 'text-white' : 'text-slate-200'}`}>
                                    {style.name}
                                </h4>
                                <p className={`text-xs leading-relaxed ${activeStyle === style.id ? 'text-white/80' : 'text-slate-500 group-hover:text-slate-400'}`}>
                                    {style.description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Custom Editor */}
            <section className="flex-1 flex flex-col min-h-[150px]">
                 <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    Fine-tune Instructions
                </h3>
                <div className="relative flex-1">
                    <textarea
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            setActiveStyle(null); // Deselect preset if user edits manually
                        }}
                        className="w-full h-full min-h-[120px] bg-slate-900/50 border border-white/10 rounded-xl p-4 text-slate-200 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none transition-all placeholder:text-slate-600"
                        placeholder="Define your own custom AI persona here..."
                    />
                    <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 bg-black/40 px-2 py-1 rounded border border-white/5">
                        {value.length} chars
                    </div>
                </div>
            </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-slate-900/50 backdrop-blur flex justify-between items-center">
            <button 
                onClick={() => { setValue(''); setActiveStyle(null); }}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2"
            >
                Reset to default
            </button>
            <div className="flex gap-3">
                <button 
                    onClick={onClose}
                    className="px-5 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={() => { onSave(value); onClose(); }}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95"
                >
                    Save Persona
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
