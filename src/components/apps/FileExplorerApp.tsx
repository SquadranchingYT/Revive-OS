import React, { useState } from 'react';
import { Folder, FileText, Image, HardDrive, Plus, Trash2, ArrowLeft, Download } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface VirtualFile {
  name: string;
  size: string;
  date: string;
  type: 'txt' | 'img' | 'sys';
  content?: string;
}

interface VirtualFolder {
  name: string;
  files: VirtualFile[];
}

export const FileExplorerApp: React.FC = () => {
  const [folders, setFolders] = useState<Record<string, VirtualFolder>>({
    Documents: {
      name: 'Documents',
      files: [
        { name: 'cheatsheet.txt', size: '2.4 KB', date: 'Oct 20, 2026', type: 'txt', content: 'Slope 3D: High speed record achieved at 840m. Keep ball centered!\nTetris: Hold straight piece with C key.' },
        { name: 'homework_biology.txt', size: '14.1 KB', date: 'Oct 19, 2026', type: 'txt', content: 'Cellular respiration notes for lab report.' },
        { name: 'wifi_keys.txt', size: '0.8 KB', date: 'Oct 15, 2026', type: 'txt', content: 'Guest Network: ReviveNet_5G\nSecurity: WPA3-Enterprise' }
      ]
    },
    Games: {
      name: 'Games',
      files: [
        { name: 'slope_3d.save', size: '1.2 KB', date: 'Today', type: 'sys', content: 'Highscore: 840m' },
        { name: 'tetris_scores.dat', size: '3.4 KB', date: 'Today', type: 'sys', content: 'Level 12 Cleared' },
        { name: 'core_clicker.dat', size: '8.9 KB', date: 'Today', type: 'sys', content: 'Quantum Reactor Save State' }
      ]
    },
    System: {
      name: 'System',
      files: [
        { name: 'kernel_revive.sys', size: '42.8 MB', date: 'System', type: 'sys', content: 'Revive OS Microkernel v2.4.0' },
        { name: 'stealth_cloak.dll', size: '12.4 MB', date: 'System', type: 'sys', content: 'Emergency Google Docs Cloak Engine' }
      ]
    }
  });

  const [currentFolder, setCurrentFolder] = useState<string>('Documents');
  const [selectedFile, setSelectedFile] = useState<VirtualFile | null>(null);

  const folderNames = Object.keys(folders);
  const activeFiles = folders[currentFolder]?.files || [];

  const createNewFile = () => {
    sounds.playClick();
    const title = prompt('Enter new document name:', 'new_note.txt');
    if (!title) return;

    const newF: VirtualFile = {
      name: title.endsWith('.txt') ? title : `${title}.txt`,
      size: '1.0 KB',
      date: 'Just now',
      type: 'txt',
      content: 'Empty document created in Revive OS.'
    };

    setFolders(prev => ({
      ...prev,
      [currentFolder]: {
        ...prev[currentFolder],
        files: [...prev[currentFolder].files, newF]
      }
    }));
  };

  const deleteFile = (fileName: string) => {
    sounds.playBlip(280, 'sine', 0.04);
    setFolders(prev => ({
      ...prev,
      [currentFolder]: {
        ...prev[currentFolder],
        files: prev[currentFolder].files.filter(f => f.name !== fileName)
      }
    }));
    if (selectedFile?.name === fileName) setSelectedFile(null);
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Top action bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
          <span>Root / {currentFolder}</span>
        </div>

        <button
          onClick={createNewFile}
          className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded font-bold text-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New File</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Folder Nav Sidebar */}
        <div className="w-40 sm:w-48 border-r border-slate-800 bg-slate-950 p-2 space-y-1">
          {folderNames.map(fName => (
            <button
              key={fName}
              onClick={() => {
                sounds.playBlip(480, 'sine', 0.02);
                setCurrentFolder(fName);
                setSelectedFile(null);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                currentFolder === fName
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Folder className="w-4 h-4 text-cyan-400" />
              <span>{fName}</span>
            </button>
          ))}
        </div>

        {/* Right Content Files View */}
        <div className="flex-1 flex flex-col bg-slate-900/40 overflow-hidden">
          {selectedFile ? (
            /* File Viewer / Editor */
            <div className="flex-1 flex flex-col p-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to {currentFolder}</span>
                </button>

                <div className="text-xs font-mono text-cyan-400">{selectedFile.name}</div>
              </div>

              <textarea
                value={selectedFile.content || ''}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedFile(prev => prev ? { ...prev, content: val } : null);
                }}
                className="flex-1 w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 outline-none resize-none leading-relaxed"
              />
            </div>
          ) : (
            /* File List Grid */
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {activeFiles.map(file => (
                <div
                  key={file.name}
                  onDoubleClick={() => {
                    sounds.playClick();
                    setSelectedFile(file);
                  }}
                  onClick={() => sounds.playBlip(540, 'triangle', 0.02)}
                  className="group relative p-3 rounded-xl border border-slate-800/80 bg-slate-900/80 hover:bg-slate-800/80 hover:border-cyan-500/50 flex flex-col items-center text-center transition-all cursor-pointer"
                >
                  <FileText className="w-8 h-8 text-cyan-400 mb-2 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-medium text-white truncate max-w-full mb-1">{file.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{file.size}</span>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      deleteFile(file.name);
                    }}
                    title="Delete file"
                    className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {activeFiles.length === 0 && (
                <div className="col-span-full p-8 text-center text-xs text-slate-500">
                  Folder is empty
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
