import React, { useRef, useState, useEffect } from 'react';
import { Download, Trash2, Sparkles, Eraser, Circle } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

const PALETTE = [
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#a855f7', // Purple
  '#ffffff', // White
  '#334155'  // Slate
];

export const PaintApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState('#06b6d4');
  const [brushSize, setBrushSize] = useState(4);
  const [isGlow, setIsGlow] = useState(true);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Set initial dark slate background
    ctx.fillStyle = '#060a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isEraser) {
      ctx.strokeStyle = '#060a14';
      ctx.shadowBlur = 0;
    } else {
      ctx.strokeStyle = color;
      if (isGlow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
      } else {
        ctx.shadowBlur = 0;
      }
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    sounds.playBlip(320, 'sine', 0.05);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#060a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadArt = () => {
    sounds.playScore();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `revive_sketch_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Paint Tools Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/90 gap-2 text-xs">
        {/* Colors */}
        <div className="flex items-center gap-1.5">
          {PALETTE.map(c => (
            <button
              key={c}
              onClick={() => {
                sounds.playBlip(540, 'triangle', 0.02);
                setColor(c);
                setIsEraser(false);
              }}
              style={{ backgroundColor: c }}
              className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                color === c && !isEraser ? 'scale-110 border-white ring-2 ring-cyan-400' : 'border-white/20'
              }`}
            />
          ))}

          <button
            onClick={() => {
              sounds.playClick();
              setIsEraser(prev => !prev);
            }}
            title="Eraser"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ml-1 ${
              isEraser ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Brush Sizes & Glow */}
        <div className="flex items-center gap-2">
          {[2, 5, 10, 18].map(sz => (
            <button
              key={sz}
              onClick={() => setBrushSize(sz)}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                brushSize === sz ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {sz}px
            </button>
          ))}

          <button
            onClick={() => setIsGlow(prev => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
              isGlow ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-700' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Neon Glow</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearCanvas}
            title="Clear Canvas"
            className="p-1.5 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 border border-slate-700 rounded-lg text-slate-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={downloadArt}
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg font-bold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export PNG
          </button>
        </div>
      </div>

      {/* Main Drawing Area */}
      <div className="flex-1 w-full h-full flex items-center justify-center p-3 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={760}
          height={500}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          className="w-full h-full object-contain bg-[#060a14] border border-slate-800 rounded-xl shadow-2xl cursor-crosshair touch-none"
        />
      </div>
    </div>
  );
};
