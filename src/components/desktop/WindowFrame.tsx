import React, { useRef, useState, useEffect } from 'react';
import { Minus, Square, X, Maximize2 } from 'lucide-react';
import { WindowItem, OSTheme } from '../../types/os';
import { sounds } from '../../utils/soundEffects';

interface WindowFrameProps {
  window: WindowItem;
  theme: OSTheme;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  window: win,
  theme,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  children
}) => {
  const [pos, setPos] = useState({ x: win.x, y: win.y });
  const [size, setSize] = useState({ w: win.width, h: win.height });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    onFocus();
    if (win.isMaximized) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: pos.x,
      initialY: pos.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || win.isMaximized) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 120, dragRef.current.initialX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 80, dragRef.current.initialY + dy))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, win.isMaximized]);

  if (win.isMinimized) return null;

  return (
    <div
      onClick={onFocus}
      style={{
        zIndex: win.zIndex,
        left: win.isMaximized ? 0 : pos.x,
        top: win.isMaximized ? 0 : pos.y,
        width: win.isMaximized ? '100vw' : size.w,
        height: win.isMaximized ? 'calc(100vh - 48px)' : size.h
      }}
      className={`fixed flex flex-col rounded-xl overflow-hidden transition-all duration-75 shadow-2xl ${
        win.isMaximized ? 'rounded-none' : 'border border-slate-700/80'
      } ${theme.glass} ${isActive ? 'ring-1 ring-cyan-500/40 shadow-[0_15px_35px_rgba(0,0,0,0.6)]' : 'opacity-95'}`}
    >
      {/* Window Titlebar */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={onToggleMaximize}
        className={`h-10 px-3.5 flex items-center justify-between border-b select-none cursor-grab active:cursor-grabbing ${theme.windowHeader}`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="text-base">{win.icon}</span>
          <span className="text-xs font-semibold text-slate-200 truncate">{win.title}</span>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-1.5 shrink-0" onMouseDown={e => e.stopPropagation()}>
          {/* Minimize */}
          <button
            onClick={() => {
              sounds.playBlip(380, 'sine', 0.02);
              onMinimize();
            }}
            title="Minimize"
            className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Maximize */}
          <button
            onClick={() => {
              sounds.playBlip(440, 'sine', 0.02);
              onToggleMaximize();
            }}
            title={win.isMaximized ? 'Restore' : 'Maximize'}
            className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {win.isMaximized ? <Square className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>

          {/* Close */}
          <button
            onClick={() => {
              sounds.playBlip(280, 'sine', 0.03);
              onClose();
            }}
            title="Close"
            className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 w-full h-[calc(100%-40px)] overflow-hidden bg-slate-950/70">
        {children}
      </div>
    </div>
  );
};
