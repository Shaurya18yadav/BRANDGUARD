import React from 'react';

interface DiffViewerProps {
  original: string;
  suggested: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ original, suggested }) => {
  return (
    <div className="font-mono text-xs rounded-xl overflow-hidden border border-slate-200 bg-slate-900 text-slate-100 shadow-inner">
      <div className="bg-slate-800/80 px-3 py-1.5 border-b border-slate-700/80 text-[10px] font-sans font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
        <span>Suggested Correction Diff</span>
        <span className="text-amber-400">Minimal change</span>
      </div>
      <div className="p-3 space-y-1.5 leading-relaxed overflow-x-auto">
        <div className="flex items-start gap-2 bg-red-950/40 text-red-300 px-2 py-1 rounded border-l-2 border-red-500">
          <span className="select-none font-bold text-red-500 shrink-0">-</span>
          <span className="line-through opacity-80 break-words">{original}</span>
        </div>
        <div className="flex items-start gap-2 bg-emerald-950/40 text-emerald-300 px-2 py-1 rounded border-l-2 border-emerald-500 font-semibold">
          <span className="select-none font-bold text-emerald-400 shrink-0">+</span>
          <span className="break-words">{suggested}</span>
        </div>
      </div>
    </div>
  );
};
