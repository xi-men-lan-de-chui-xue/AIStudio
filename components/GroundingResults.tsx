
import React from 'react';
import { GroundingChunk } from '../types';

interface Props {
  chunks: GroundingChunk[];
  title: string;
}

const GroundingResults: React.FC<Props> = ({ chunks, title }) => {
  const sources = chunks.filter(c => c.web);
  
  if (sources.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{title}</p>
      <div className="space-y-2">
        {sources.map((source, i) => (
          <a 
            key={i}
            href={source.web?.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all text-xs group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <span className="truncate flex-1 text-slate-300 group-hover:text-blue-400">
              {source.web?.title || source.web?.uri}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default GroundingResults;
