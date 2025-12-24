
import React, { useState, useRef } from 'react';
import { AppState, AppTheme, Task, Language, Experiment } from './types';
import { processCommand } from './services/gemini';
import CommandInput from './components/CommandInput';
import TaskBoard from './components/TaskBoard';
import Visualizer from './components/Visualizer';
import HistoryPanel from './components/HistoryPanel';
import GroundingResults from './components/GroundingResults';
import ExperimentSimulator from './components/ExperimentSimulator';

const translations = {
  en: {
    subtitle: 'A natural language workspace. Try "Measure oxygen content in air experiment", "Add task: Lab report", or "Search for Einstein".',
    liveContext: 'Live Context',
    lastResponse: 'Last response:',
    noCommand: 'No commands executed yet. Describe what you want to do.',
    quickCommands: 'Quick Commands',
    placeholder: 'What would you like to do?',
    execute: 'Execute',
    processing: 'Processing',
    tasks: 'Tasks',
    pending: 'Pending',
    noTasks: 'No tasks found. Try adding some!',
    activityLog: 'Activity Log',
    waiting: 'Waiting for commands...',
    sources: 'Sources'
  },
  zh: {
    subtitle: '自然语言工作空间。尝试 “空气中氧气含量的测定实验”、“添加任务：实验报告” 或 “搜索爱因斯坦”。',
    liveContext: '实时上下文',
    lastResponse: '最后回复：',
    noCommand: '尚未执行任何命令。描述你想执行的操作。',
    quickCommands: '快捷命令',
    placeholder: '你想做点什么？',
    execute: '执行',
    processing: '处理中',
    tasks: '任务列表',
    pending: '待办',
    noTasks: '暂无任务。尝试添加一个！',
    activityLog: '活动日志',
    waiting: '等待命令输入...',
    sources: '参考来源'
  }
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    theme: AppTheme.DARK,
    language: 'zh',
    tasks: [
      { id: '1', title: '开始你的第一个 AI 实验模拟', priority: 'medium', completed: false }
    ],
    chart: null,
    experiment: null,
    history: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const t = translations[state.language];

  const handleCommand = async (input: string) => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await processCommand(input, state.language);
      
      if (result.functionCalls) {
        for (const call of result.functionCalls) {
          const args = call.args as any;
          switch (call.name) {
            case 'set_theme':
              setState(prev => ({ ...prev, theme: args.theme as AppTheme }));
              break;
            case 'add_task':
              const newTask: Task = {
                id: Math.random().toString(36).substr(2, 9),
                title: args.title,
                priority: args.priority || 'medium',
                completed: false
              };
              setState(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
              break;
            case 'create_chart':
              setState(prev => ({ 
                ...prev, 
                chart: { data: args.data, type: args.type, title: args.title } 
              }));
              break;
            case 'create_experiment':
              setState(prev => ({ ...prev, experiment: args as Experiment }));
              break;
            case 'clear_workspace':
              if (args.target === 'tasks' || args.target === 'all') setState(prev => ({ ...prev, tasks: [] }));
              if (args.target === 'chart' || args.target === 'all') setState(prev => ({ ...prev, chart: null }));
              if (args.target === 'experiment' || args.target === 'all') setState(prev => ({ ...prev, experiment: null }));
              break;
          }
        }
      }

      setState(prev => ({
        ...prev,
        history: [{
          command: input,
          response: result.text,
          timestamp: Date.now(),
          grounding: result.grounding
        }, ...prev.history]
      }));

    } catch (err) {
      console.error(err);
      setState(prev => ({
        ...prev,
        history: [{
          command: input,
          response: state.language === 'zh' ? "抱歉，处理该请求时遇到错误。" : "Sorry, I encountered an error processing that request.",
          timestamp: Date.now()
        }, ...prev.history]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const toggleLanguage = () => {
    setState(prev => ({ ...prev, language: prev.language === 'en' ? 'zh' : 'en' }));
  };

  const themeClasses = {
    [AppTheme.DARK]: 'bg-slate-950 text-slate-100',
    [AppTheme.LIGHT]: 'bg-slate-50 text-slate-900',
    [AppTheme.NEBULA]: 'bg-indigo-950 text-indigo-100',
    [AppTheme.FOREST]: 'bg-emerald-950 text-emerald-100'
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ${themeClasses[state.theme]}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[120px]" />
      </div>

      <nav className="relative z-20 max-w-6xl mx-auto px-4 pt-6 flex justify-end">
        <button 
          onClick={toggleLanguage}
          className="dark-glass px-4 py-2 rounded-full text-sm font-medium border border-white/10 hover:border-blue-500/50 transition-all flex items-center gap-2 group active:scale-95"
        >
          <span className={state.language === 'en' ? 'text-blue-400' : 'text-slate-400'}>EN</span>
          <span className="w-px h-3 bg-slate-700"></span>
          <span className={state.language === 'zh' ? 'text-blue-400' : 'text-slate-400'}>中</span>
        </button>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-4 pb-8 md:pb-16 pt-4">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 animate-in fade-in slide-in-from-top-4 duration-1000">
            OmniCmd <span className="text-blue-500">AI</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            {t.subtitle}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            <CommandInput 
              onCommand={handleCommand} 
              isLoading={isLoading} 
              placeholder={t.placeholder}
              executeText={t.execute}
              processingText={t.processing}
            />
            
            {state.experiment && (
              <ExperimentSimulator 
                experiment={state.experiment} 
                onClose={() => setState(p => ({...p, experiment: null}))}
              />
            )}

            {state.chart && (
              <section className="animate-in fade-in zoom-in-95 duration-500">
                <Visualizer chart={state.chart} />
              </section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <TaskBoard 
                tasks={state.tasks} 
                onToggle={toggleTask} 
                title={t.tasks} 
                pendingText={t.pending}
                emptyText={t.noTasks}
              />
              <HistoryPanel 
                history={state.history} 
                title={t.activityLog}
                emptyText={t.waiting}
              />
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="dark-glass rounded-2xl p-6 shadow-xl sticky top-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                {t.liveContext}
              </h2>
              <div className="space-y-4">
                {state.history.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm border-l-2 border-blue-500/30 pl-3 py-1">
                      <p className="text-slate-400 mb-1">{t.lastResponse}</p>
                      <p className="line-clamp-6">{state.history[0].response}</p>
                    </div>
                    {state.history[0].grounding && (
                      <GroundingResults chunks={state.history[0].grounding} title={t.sources} />
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">{t.noCommand}</p>
                )}
              </div>
            </div>

            <div className="dark-glass rounded-2xl p-6 opacity-60 hover:opacity-100 transition-opacity">
              <h3 className="font-semibold mb-3">{t.quickCommands}</h3>
              <ul className="text-sm space-y-2 text-slate-400">
                {state.language === 'zh' ? (
                  <>
                    <li>• "空气中氧气含量的测定"</li>
                    <li>• "将主题切换为森林"</li>
                    <li>• "生成柱状图：苹果 10，橙子 25"</li>
                    <li>• "搜索 SpaceX 的最新发射动态"</li>
                  </>
                ) : (
                  <>
                    <li>• "Measure oxygen content in air"</li>
                    <li>• "Set the theme to forest"</li>
                    <li>• "Add task: Record meeting notes"</li>
                    <li>• "Search for the latest SpaceX launch"</li>
                  </>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-20 py-8 text-center text-slate-600 text-sm border-t border-white/5">
        &copy; 2024 OmniCmd AI Workspace. Powered by Gemini 3.
      </footer>
    </div>
  );
};

export default App;
