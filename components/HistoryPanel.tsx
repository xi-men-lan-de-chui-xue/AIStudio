
import React from 'react';

interface HistoryItem {
  command: string;
  response: string;
  timestamp: number;
}

interface Props {
  history: HistoryItem[];
  title: string;
  emptyText: string;
}

const HistoryPanel: React.FC<Props> = ({ history, title, emptyText }) => {
  return (
    <div className="dark-glass rounded-2xl p-6 shadow-xl h-full flex flex-col">
      <h2 className="text-xl font-bold mb-6">{title}</h2>
      <div className="flex-1 overflow-y-auto max-h-[400px] space-y-6 pr-2 custom-scrollbar">
        {history.length === 0 ? (
          <p className="text-slate-500 text-center py-8 italic text-sm">{emptyText}</p>
        ) : (
          history.map((item, idx) => (
            <div key={item.timestamp} className="space-y-2 group">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-tighter">Command</p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <p className="text-sm font-medium text-slate-300 bg-white/5 p-2 rounded-lg border border-white/5 group-hover:border-blue-500/30 transition-colors">
                {item.command}
              </p>
              <div className="pl-4 border-l border-slate-800 space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Response</p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.response}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default HistoryPanel;
