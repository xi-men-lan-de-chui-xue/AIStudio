
import React from 'react';
import { Task } from '../types';

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  title: string;
  pendingText: string;
  emptyText: string;
}

const TaskBoard: React.FC<Props> = ({ tasks, onToggle, title, pendingText, emptyText }) => {
  return (
    <div className="dark-glass rounded-2xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{title}</h2>
        <span className="text-xs font-medium bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">
          {tasks.filter(t => !t.completed).length} {pendingText}
        </span>
      </div>
      
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-slate-500 text-center py-8">{emptyText}</p>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id}
              onClick={() => onToggle(task.id)}
              className={`
                p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4
                ${task.completed 
                  ? 'bg-slate-900/30 border-slate-800/50 opacity-50' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 shadow-sm'}
              `}
            >
              <div className={`
                w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors
                ${task.completed ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}
              `}>
                {task.completed && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${task.completed ? 'line-through text-slate-500' : ''}`}>
                  {task.title}
                </p>
                <div className="flex gap-2 mt-1">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${
                    task.priority === 'high' ? 'text-red-400' : 
                    task.priority === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskBoard;
