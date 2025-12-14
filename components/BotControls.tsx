
import React, { useState, useEffect } from 'react';
import { Zap, MousePointer2, Timer, PlayCircle, RefreshCw, Clock, Layers } from 'lucide-react';

declare const chrome: any;

interface BotControlsProps {
  isAutoClickerEnabled: boolean;
  onToggleAutoClicker: (enabled: boolean) => void;
  delay: number;
  onDelayChange: (delay: number) => void;
  onStartTraining: () => void;
  lastReactionTime: number | null;
  isTraining: boolean;
}

export const BotControls: React.FC<BotControlsProps> = ({
  isAutoClickerEnabled,
  onToggleAutoClicker,
  delay,
  onDelayChange,
  onStartTraining,
  lastReactionTime,
  isTraining
}) => {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [dropTime, setDropTime] = useState("12:00");
  const [multiOrder, setMultiOrder] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['autoRefreshEnabled', 'dropTime', 'multiOrderEnabled'], (result: any) => {
        if (result.autoRefreshEnabled !== undefined) setAutoRefresh(result.autoRefreshEnabled);
        if (result.dropTime !== undefined) setDropTime(result.dropTime);
        if (result.multiOrderEnabled !== undefined) setMultiOrder(result.multiOrderEnabled);
      });
    }
  }, []);

  const handleRefreshToggle = (val: boolean) => {
    setAutoRefresh(val);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ autoRefreshEnabled: val });
    }
  };

  const handleMultiOrderToggle = (val: boolean) => {
    setMultiOrder(val);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ multiOrderEnabled: val });
    }
  };

  const handleTimeChange = (val: string) => {
    setDropTime(val);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ dropTime: val });
    }
  };

  return (
    <div className="bg-[#1A1C21] text-white rounded-2xl p-6 lg:p-8 shadow-2xl border border-gray-800">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-6">
        <Zap className="text-yellow-400 w-6 h-6 fill-yellow-400" />
        <div>
          <h3 className="font-bold text-xl">Ariel Bot Dashboard</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Control Panel & Optimizer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#0D66CE]/20 rounded-lg flex items-center justify-center">
                <MousePointer2 className="text-[#0D66CE] w-4 h-4" />
              </div>
              <span className="font-bold text-sm lg:text-base text-gray-200">Автокликер</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isAutoClickerEnabled}
                onChange={(e) => onToggleAutoClicker(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#0D66CE] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
              <label>Задержка клика</label>
              <span className="text-[#0D66CE]">{delay} мс</span>
            </div>
            <input 
              type="range" min="0" max="500" step="5"
              value={delay}
              onChange={(e) => onDelayChange(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#0D66CE]"
            />
          </div>

          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <RefreshCw className={`w-4 h-4 text-blue-400 ${autoRefresh ? 'animate-spin-slow' : ''}`} />
                   <span className="text-sm font-bold text-gray-200">Умное обновление</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoRefresh}
                    onChange={(e) => handleRefreshToggle(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-10 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
             </div>
             
             <div className="flex items-center gap-3">
                <div className="flex-1">
                   <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">Время старта</div>
                   <input 
                     type="time" step="1" value={dropTime}
                     onChange={(e) => handleTimeChange(e.target.value)}
                     className="w-full bg-gray-800 border-none rounded-lg py-2 px-3 text-xs text-white"
                   />
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6 md:border-l md:border-gray-800 md:pl-8">
           <div className="flex items-center justify-between bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Layers className="text-purple-400 w-4 h-4" />
                </div>
                <div>
                   <span className="font-bold text-sm text-gray-200 block">Конвейер</span>
                   <span className="text-[9px] text-gray-500">Повтор после успеха</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={multiOrder}
                  onChange={(e) => handleMultiOrderToggle(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-10 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
           </div>

           <button
             onClick={onStartTraining}
             disabled={isTraining}
             className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all
               ${isTraining ? 'bg-gray-800 text-gray-600' : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'}
             `}
           >
             <PlayCircle className="w-5 h-5" />
             {isTraining ? 'Ожидание...' : 'Тренажер'}
           </button>

           {lastReactionTime !== null && (
              <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase font-black block mb-1">Реакция</span>
                <span className="text-3xl font-black text-green-400">{lastReactionTime} <span className="text-sm font-normal">мс</span></span>
              </div>
           )}
        </div>
      </div>
      <style>{`.animate-spin-slow { animation: spin 3s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
