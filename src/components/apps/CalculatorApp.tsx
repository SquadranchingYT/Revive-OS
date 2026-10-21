import React, { useState } from 'react';
import { Delete, RotateCcw } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const handleNum = (n: string) => {
    sounds.playBlip(520, 'sine', 0.02);
    setDisplay(prev => (prev === '0' || prev === 'Error' ? n : prev + n));
  };

  const handleOp = (op: string) => {
    sounds.playBlip(440, 'triangle', 0.02);
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    sounds.playClick();
    setDisplay('0');
    setEquation('');
  };

  const handleBackspace = () => {
    sounds.playBlip(350, 'sine', 0.02);
    setDisplay(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const calculate = () => {
    sounds.playScore();
    try {
      const fullExpr = equation + display;
      // Sanitize expression
      const sanitized = fullExpr.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${sanitized})`)();
      const formatted = Number.isFinite(result) ? String(parseFloat(result.toFixed(8))) : 'Error';
      setHistory(h => [`${fullExpr} = ${formatted}`, ...h.slice(0, 4)]);
      setDisplay(formatted);
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  const handleSpecial = (fn: string) => {
    sounds.playBlip(600, 'triangle', 0.03);
    const val = parseFloat(display);
    if (isNaN(val)) return;

    let res = 0;
    if (fn === 'sqrt') res = Math.sqrt(val);
    else if (fn === 'sq') res = Math.pow(val, 2);
    else if (fn === 'sin') res = Math.sin((val * Math.PI) / 180);
    else if (fn === 'cos') res = Math.cos((val * Math.PI) / 180);
    else if (fn === 'tan') res = Math.tan((val * Math.PI) / 180);
    else if (fn === 'neg') res = -val;

    setDisplay(String(parseFloat(res.toFixed(8))));
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col p-4 select-none font-mono">
      {/* Screen Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 text-right">
        <div className="text-xs text-slate-400 h-4 overflow-hidden truncate">{equation}</div>
        <div className="text-3xl font-extrabold text-cyan-400 font-mono tracking-wider tabular-nums overflow-x-auto">
          {display}
        </div>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        {/* Row 1 */}
        <button onClick={() => handleSpecial('sqrt')} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-bold">√</button>
        <button onClick={() => handleSpecial('sq')} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-bold">x²</button>
        <button onClick={handleBackspace} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg text-xs font-bold flex items-center justify-center"><Delete className="w-4 h-4" /></button>
        <button onClick={handleClear} className="p-2.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-bold">C</button>

        {/* Row 2 */}
        <button onClick={() => handleSpecial('sin')} className="p-2.5 bg-slate-800/60 hover:bg-slate-700 text-slate-300 rounded-lg text-xs">sin</button>
        <button onClick={() => handleSpecial('cos')} className="p-2.5 bg-slate-800/60 hover:bg-slate-700 text-slate-300 rounded-lg text-xs">cos</button>
        <button onClick={() => handleSpecial('tan')} className="p-2.5 bg-slate-800/60 hover:bg-slate-700 text-slate-300 rounded-lg text-xs">tan</button>
        <button onClick={() => handleOp('/')} className="p-2.5 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 rounded-lg text-sm font-bold">÷</button>

        {/* Row 3 */}
        <button onClick={() => handleNum('7')} className="p-3 bg-slate-900 hover:bg-slate-800 rounded-lg text-sm font-bold">7</button>
        <button onClick={() => handleNum('8')} className="p-3 bg-slate-900 hover:bg-slate-800 rounded-lg text-sm font-bold">8</button>
        <button onClick={() => handleNum('9')} className="p-3 bg-slate-900 hover:bg-slate-800 rounded-lg text-sm font-bold">9</button>
        <button onClick={() => handleOp('*')} className="p-2.5 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 rounded-lg text-sm font-bold">×</button>

        {/* Row 4 */}
        <button onClick={() => handleNum('4')} className="p-3 bg-slate-900 hover:bg-slate-800 rounded-lg text-sm font-bold">4</button>
        <button onClick={() => handleNum('5')} className="p-3 bg-slate-900 hover:bg-slate-800 rounded-lg text-sm font-bold">5</button>
        <button onClick={() => handleNum('6')} className="p-3 bg-slate-900 hover:bg-slate-800 rounded-lg text-sm font-bold">6</button>
        <button onClick={() => handleOp('-')} className="p-2.5 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 rounded-lg text-sm font-bold">-</button>

        {/* Row 5 */}
        <button onClick={() => handleNum('1')} className="p-3 bg-slate-900 hover:bg-slate-800 rounded-lg text-sm font-bold">1</button>
        <button onClick={() => handleNum('2')} className="p-3 bg-slate-900 hover:bg-slate-800 rounded-lg text-sm font-bold">2</button>
        <button onClick={() => handleNum('3')} className="p-3 bg-slate-900 hover:bg-slate-800 rounded-lg text-sm font-bold">3</button>
        <button onClick={() => handleOp('+')} className="p-2.5 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 rounded-lg text-sm font-bold">+</button>

        {/* Row 6 */}
        <button onClick={() => handleSpecial('neg')} className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold">±</button>
        <button onClick={() => handleNum('0')} className="p-3 bg-slate-900 hover:bg-slate-800 rounded-lg text-sm font-bold">0</button>
        <button onClick={() => handleNum('.')} className="p-3 bg-slate-900 hover:bg-slate-800 rounded-lg text-sm font-bold">.</button>
        <button onClick={calculate} className="p-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-base font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.5)]">=</button>
      </div>

      {/* History Log */}
      {history.length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="truncate">Last: {history[0]}</span>
        </div>
      )}
    </div>
  );
};
