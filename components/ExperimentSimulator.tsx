
import React, { useState, useMemo } from 'react';
import { Experiment } from '../types';

interface Props {
  experiment: Experiment;
  onClose: () => void;
}

const ExperimentSimulator: React.FC<Props> = ({ experiment, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'moving' | 'reacting' | 'result'>('idle');
  
  const [waterLevel, setWaterLevel] = useState(30); 
  const [liquidColor, setLiquidColor] = useState(experiment.initialLiquidColor || '#3b82f666');
  const [isGlowing, setIsGlowing] = useState(false);
  const [smokeOpacity, setSmokeOpacity] = useState(0);
  const [toolY, setToolY] = useState(-200); 
  const [showEquation, setShowEquation] = useState(false);

  const isCompleted = currentStep >= experiment.steps.length;
  const step = !isCompleted ? experiment.steps[currentStep] : null;

  const handleAction = async () => {
    if (isProcessing || !step) return;
    setIsProcessing(true);
    
    // 阶段 1: 移入 (进入视角)
    setPhase('moving');
    setToolY(50); 
    await new Promise(r => setTimeout(r, 800));

    // 阶段 2: 动作 (执行特定操作)
    setPhase('reacting');
    const actionDepth = experiment.vesselType === 'test_tube' ? 120 : 150;
    setToolY(actionDepth);

    if (step.visualEffect === 'flame') {
      setIsGlowing(true);
      setShowEquation(true);
      setTimeout(() => setSmokeOpacity(0.8), 300);
    } else if (step.visualEffect === 'color_change' && step.liquidColor) {
      setTimeout(() => setLiquidColor(step.liquidColor!), 600);
    }

    await new Promise(r => setTimeout(r, 1500));
    setPhase('result');
    
    if (step.visualEffect === 'water_rise') {
      const target = 55;
      const inv = setInterval(() => {
        setWaterLevel(prev => {
          if (prev >= target) { clearInterval(inv); return target; }
          return prev + 0.3;
        });
      }, 40);
    }

    setTimeout(() => {
      if (currentStep < experiment.steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        setIsProcessing(false);
        setPhase('idle');
        setToolY(-200);
        setIsGlowing(false);
        setShowEquation(false);
        setSmokeOpacity(0);
      } else {
        setIsProcessing(false);
        setCurrentStep(experiment.steps.length); 
      }
    }, 2500);
  };

  const vesselGeometries = {
    beaker: {
      path: "M180,100 L180,470 Q180,480 190,480 L310,480 Q320,480 320,470 L320,100",
      liquidPath: "M185,110 L185,470 Q185,475 190,475 L310,475 Q315,475 315,470 L315,110 Z",
      vesselX: 180, vesselY: 280, liquidY: 400
    },
    test_tube: {
      path: "M220,50 L220,450 Q220,490 250,490 Q280,490 280,450 L280,50",
      liquidPath: "M225,60 L225,445 Q225,480 250,480 Q275,480 275,445 L275,60 Z",
      vesselX: 220, vesselY: 250, liquidY: 420
    },
    jar: {
      path: "M200,80 L200,100 Q200,120 160,150 L160,450 Q160,480 190,480 L310,480 Q340,480 340,450 L340,150 Q300,120 300,100 L300,80",
      liquidPath: "M165,155 L165,445 Q165,475 190,475 L310,475 Q335,475 335,445 L335,155 Q300,125 305,100 Z",
      vesselX: 160, vesselY: 300, liquidY: 400
    }
  };

  const geo = vesselGeometries[experiment.vesselType] || vesselGeometries.jar;

  const callout = useMemo(() => {
    if (isCompleted || !step) return null;
    let tx = 250, ty = 250;
    const target = step.targetComponent || 'vessel';
    
    if (target === 'tool') { ty = toolY + 50; tx = 250; }
    else if (target === 'liquid') { ty = 500 - (500 * (waterLevel / 100)) + 30; tx = 250; }
    else { ty = geo.vesselY; tx = geo.vesselX; }

    const side = tx > 250 ? -1 : 1;
    const points = `${tx},${ty} ${tx + 40 * side},${ty - 50} ${tx + 100 * side},${ty - 50}`;
    const labelStyle = { 
      left: `${((tx + 100 * side) / 500) * 100}%`, 
      top: `${((ty - 50) / 500) * 100}%`,
      transform: side === 1 ? 'translate(10px, -50%)' : 'translate(-110%, -50%)'
    };

    return { points, labelStyle, targetX: tx, targetY: ty };
  }, [step, isCompleted, geo, waterLevel, toolY]);

  return (
    <div className="dark-glass rounded-[2rem] p-6 md:p-10 shadow-2xl border-white/5 animate-in zoom-in-95 duration-500 relative overflow-visible">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] rounded-[2rem]" />

      <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-50 p-2 hover:bg-white/5 rounded-full">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 relative z-10">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h2 className="text-3xl font-black text-white mb-1">{experiment.title}</h2>
            <p className="text-sm text-slate-400 italic opacity-80">{experiment.objective}</p>
          </div>

          <div className="relative aspect-square w-full max-h-[500px] bg-slate-950/60 rounded-[3rem] border border-white/5 shadow-2xl overflow-visible self-center">
            <svg viewBox="0 0 500 500" className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
              <defs>
                <clipPath id="vesselClip"><path d={geo.liquidPath} /></clipPath>
                <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={liquidColor} stopOpacity="0.85" />
                  <stop offset="100%" stopColor={liquidColor} stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* 标注线 */}
              {callout && !isProcessing && (
                <g className="animate-in fade-in duration-500">
                  <polyline points={callout.points} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" className="animate-draw-line" />
                  <circle cx={callout.targetX} cy={callout.targetY} r="5" fill="#3b82f6" />
                </g>
              )}

              {/* 液体层 */}
              <g clipPath="url(#vesselClip)">
                <rect x="0" y={500 - (500 * (waterLevel / 100))} width="500" height="500" fill="url(#liquidGrad)" className="transition-all duration-1000 ease-in-out" />
                <path d={`M0,${500 - (500 * (waterLevel / 100))} Q125,${500 - (500 * (waterLevel / 100)) - 6} 250,${500 - (500 * (waterLevel / 100))} T500,${500 - (500 * (waterLevel / 100))}`}
                  fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" className="animate-wave" />
                {(step?.visualEffect === 'bubbles' || phase === 'reacting') && Array.from({length: 8}).map((_, i) => (
                  <circle key={i} r={Math.random() * 3 + 1} fill="white" opacity="0.3" className="animate-bubble-rise"
                    style={{ cx: 200 + Math.random() * 100, cy: 480, animationDelay: `${Math.random() * 2}s` }} />
                ))}
              </g>

              {/* 容器外壳 */}
              <path d={geo.path} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />

              {/* 工具组件 (SVG 渲染解决溢出) */}
              <g transform={`translate(250, ${toolY})`} className={`transition-all duration-1000 ${phase === 'reacting' ? 'tool-active' : ''}`}>
                {experiment.toolType === 'spoon' && (
                  <g className={phase === 'reacting' ? 'animate-spoon-pour' : ''}>
                    <rect x="-2" y="-150" width="4" height="150" fill="url(#metalGrad)" />
                    <path d="M-15,0 Q0,20 15,0 L15,-5 Q0,10 -15,-5 Z" fill="#94a3b8" />
                    {isGlowing && <circle r="20" fill="rgba(245,158,11,0.3)" filter="blur(10px)" />}
                  </g>
                )}
                {experiment.toolType === 'dropper' && (
                  <g className={phase === 'reacting' ? 'animate-dropper-squeeze' : ''}>
                    <path d="M-12,-150 Q0,-180 12,-150 L12,-130 L-12,-130 Z" fill="#991b1b" />
                    <rect x="-4" y="-130" width="8" height="120" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1" />
                    {phase === 'reacting' && <circle cx="0" cy="0" r="4" fill="#60a5fa" className="animate-drip-svg" />}
                  </g>
                )}
                {experiment.toolType === 'stirrer' && (
                  <rect x="-2" y="-150" width="4" height="200" fill="rgba(255,255,255,0.3)" rx="2" className={phase === 'reacting' ? 'animate-stir-svg' : ''} />
                )}
                <defs>
                  <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="50%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#475569" />
                  </linearGradient>
                </defs>
              </g>
            </svg>

            {/* 标注标签 */}
            {callout && !isProcessing && (
              <div className="absolute z-50 pointer-events-none" style={callout.labelStyle}>
                <div className="px-4 py-2 bg-blue-600/30 backdrop-blur-xl border border-blue-400/40 rounded-xl shadow-2xl flex flex-col items-start min-w-[110px] animate-in slide-in-from-top-1">
                  <span className="text-[12px] font-black text-white">{step?.materialName}</span>
                  {step?.chemicalFormula && <span className="text-[10px] font-mono text-blue-200">{step.chemicalFormula}</span>}
                </div>
              </div>
            )}

            {smokeOpacity > 0 && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
                {Array.from({length: 10}).map((_, i) => (
                  <div key={i} className="absolute bg-white/10 blur-3xl rounded-full animate-smoke-rise"
                    style={{ left: `${35 + Math.random() * 30}%`, bottom: '30%', width: '80px', height: '80px', animationDelay: `${i * 0.4}s`, opacity: smokeOpacity }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右侧面板 */}
        <div className="lg:col-span-5 flex flex-col justify-start pt-10">
          {!isCompleted && step ? (
            <div className="space-y-8 animate-in slide-in-from-right-8">
              <div className="p-8 rounded-[2.5rem] bg-slate-950/50 border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 group-hover:bg-blue-400 transition-colors" />
                <div className="flex items-center gap-5 mb-6">
                  <span className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-2xl">
                    {currentStep + 1}
                  </span>
                  <h3 className="text-2xl font-black text-white">{step.title}</h3>
                </div>
                <p className="text-slate-300 text-lg leading-relaxed mb-10">{step.instruction}</p>
                
                <div className="min-h-[100px] flex flex-col justify-end">
                  {isProcessing ? (
                    <div className="flex items-center gap-5 p-6 bg-blue-500/5 border border-blue-500/10 rounded-[1.5rem] animate-pulse">
                      <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-blue-100 font-bold italic">{step.observation}</p>
                    </div>
                  ) : (
                    <button onClick={handleAction} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] font-black text-xl shadow-xl active:scale-95 transition-all">
                      {step.action}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-5 rounded-[1.5rem] bg-slate-900/60 border border-white/5">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest block mb-1">Reagent</span>
                    <span className="text-sm font-bold text-slate-200">{step.materialName}</span>
                 </div>
                 <div className="p-5 rounded-[1.5rem] bg-slate-900/60 border border-white/5">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest block mb-1">Tool In Use</span>
                    <span className="text-sm font-bold text-blue-400 capitalize">{experiment.toolType}</span>
                 </div>
              </div>
            </div>
          ) : (
            <div className="animate-in zoom-in-95 h-full flex flex-col justify-center">
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-10 rounded-[3rem] shadow-2xl">
                <h3 className="text-3xl font-black text-white mb-6">实验成功完成</h3>
                <p className="text-emerald-50/70 text-lg leading-relaxed mb-10 border-l-4 border-emerald-500/40 pl-6 italic">{experiment.conclusion}</p>
                <button onClick={onClose} className="w-full py-5 rounded-[1.5rem] bg-white/5 border border-white/10 text-slate-400 font-black uppercase text-sm hover:bg-white/10">
                  返回实验室
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes draw-line { from { stroke-dashoffset: 300; } to { stroke-dashoffset: 0; } }
        @keyframes smoke-rise { 0% { transform: translateY(0) scale(1); opacity: 0; } 20% { opacity: 0.6; } 100% { transform: translateY(-400px) scale(5); opacity: 0; } }
        @keyframes bubble-rise { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-280px); opacity: 0; } }
        @keyframes wave { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-10px); } }
        
        /* SVG 工具动作 */
        @keyframes spoon-pour-svg {
          0% { transform: rotate(0deg); } 50% { transform: rotate(40deg); } 100% { transform: rotate(0deg); }
        }
        @keyframes dropper-squeeze-svg {
          0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.9); }
        }
        @keyframes stir-svg {
          0% { transform: translateX(0); } 25% { transform: translateX(-20px); } 75% { transform: translateX(20px); } 100% { transform: translateX(0); }
        }
        @keyframes drip-svg {
          0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(150px); opacity: 0; }
        }

        .animate-draw-line { stroke-dasharray: 300; animation: draw-line 1s forwards; }
        .animate-smoke-rise { animation: smoke-rise 6s linear infinite; }
        .animate-bubble-rise { animation: bubble-rise 2s ease-in infinite; }
        .animate-wave { animation: wave 4s ease-in-out infinite; }
        
        .animate-spoon-pour { animation: spoon-pour-svg 1.2s ease-in-out infinite; }
        .animate-dropper-squeeze { animation: dropper-squeeze-svg 0.8s ease-in-out infinite; }
        .animate-stir-svg { animation: stir-svg 0.6s ease-in-out infinite; }
        .animate-drip-svg { animation: drip-svg 0.8s ease-in infinite; }
      `}</style>
    </div>
  );
};

export default ExperimentSimulator;
