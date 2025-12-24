
import React, { useState } from 'react';

interface Props {
  onCommand: (cmd: string) => void;
  isLoading: boolean;
  placeholder: string;
  executeText: string;
  processingText: string;
}

const CommandInput: React.FC<Props> = ({ 
  onCommand, 
  isLoading, 
  placeholder, 
  executeText, 
  processingText 
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onCommand(input);
      setInput('');
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
      <form onSubmit={handleSubmit} className="relative dark-glass rounded-2xl p-2 flex items-center gap-2">
        <div className="pl-4 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none py-4 px-2 text-xl placeholder-slate-600"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={`
            px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2
            ${isLoading ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'}
          `}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              {processingText}
            </>
          ) : (
            executeText
          )}
        </button>
      </form>
    </div>
  );
};

export default CommandInput;
