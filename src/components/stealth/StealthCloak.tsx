import React, { useState } from 'react';
import { ShieldCheck, FileText, Share2, MessageSquare, ArrowLeft } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface StealthCloakProps {
  onDeactivate: () => void;
  preset?: 'classroom' | 'docs' | 'khan';
}

export const StealthCloak: React.FC<StealthCloakProps> = ({ onDeactivate, preset = 'docs' }) => {
  const [docContent, setDocContent] = useState(
    `AP Biology - Unit 4: Cellular Energetics & Respiration\nDate: October 2026\nInstructor: Dr. Harrison\n\nAbstract:\nCellular respiration is the biochemical process through which eukaryotic cells convert biochemical energy from nutrients into adenosine triphosphate (ATP), releasing metabolic waste products. The overarching biochemical equation for aerobic respiration involves glucose oxidation:\n\nC6H12O6 + 6 O2 → 6 CO2 + 6 H2O + ~36-38 ATP\n\nKey Stages of Glycolysis and Krebs Cycle:\n1. Glycolysis takes place in the cytoplasmic matrix yielding 2 net ATP and 2 NADH molecules.\n2. The link reaction converts pyruvate into Acetyl-CoA within the mitochondrial matrix.\n3. The Citric Acid Cycle systematically drives electron carriers (NADH, FADH2) towards oxidative phosphorylation.`
  );

  return (
    <div className="fixed inset-0 z-[999999] bg-white text-slate-900 font-sans select-text overflow-y-auto">
      {/* Top Stealth Disguise Bar */}
      <div className="sticky top-0 bg-[#f9fbfd] border-b border-[#dadce0] px-4 py-2 flex items-center justify-between text-xs text-slate-700 select-none shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-[#4285f4] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium text-slate-800 text-sm flex items-center gap-2">
              <span>Cellular Energetics & Respiration Lab Notes</span>
              <span className="text-xs text-slate-400 font-normal">Saved to Drive</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
              <span className="hover:text-slate-800 cursor-pointer">File</span>
              <span className="hover:text-slate-800 cursor-pointer">Edit</span>
              <span className="hover:text-slate-800 cursor-pointer">View</span>
              <span className="hover:text-slate-800 cursor-pointer">Insert</span>
              <span className="hover:text-slate-800 cursor-pointer">Format</span>
              <span className="hover:text-slate-800 cursor-pointer">Tools</span>
              <span className="hover:text-slate-800 cursor-pointer">Extensions</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#c2e7ff] text-[#001d35] font-medium rounded-full text-xs cursor-pointer">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </div>

          {/* Discreet Revive OS uncloak toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onDeactivate();
            }}
            title="Press ] or Escape to exit stealth mode"
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs rounded transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Revive OS</span>
            <kbd className="text-[10px] bg-white border border-slate-300 px-1 rounded">]</kbd>
          </button>
        </div>
      </div>

      {/* Docs Toolbar styling */}
      <div className="bg-[#edf2fa] border-b border-[#dadce0] px-4 py-1.5 flex items-center gap-4 text-xs text-slate-600 select-none">
        <span className="font-semibold text-slate-800">Arial</span>
        <span>11 pt</span>
        <div className="h-4 w-px bg-slate-300" />
        <span className="font-bold">B</span>
        <span className="italic">I</span>
        <span className="underline">U</span>
        <div className="h-4 w-px bg-slate-300" />
        <span>Align: Left</span>
        <span>Line spacing: 1.15</span>
      </div>

      {/* Realistic Document Paper Body */}
      <div className="max-w-[850px] mx-auto my-8 bg-white shadow-[0_1px_3px_1px_rgba(60,64,67,0.15)] min-h-[900px] p-12 sm:p-16 border border-[#dadce0] outline-none">
        <textarea
          value={docContent}
          onChange={e => setDocContent(e.target.value)}
          className="w-full h-[750px] resize-none outline-none text-slate-900 font-sans text-sm sm:text-base leading-relaxed bg-transparent"
        />
      </div>
    </div>
  );
};
