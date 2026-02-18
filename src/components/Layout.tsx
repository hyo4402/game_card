import React, { useState, useEffect } from 'react';
import { Moon, Sun, Volume2, VolumeX, ChevronLeft, RotateCcw } from 'lucide-react';
import { playSound } from '../utils/audio';

interface Props { title: string; onBack?: () => void; onReset?: () => void; children: React.ReactNode; }

export const Layout: React.FC<Props> = ({ title, onBack, onReset, children }) => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sound, setSound] = useState(() => localStorage.getItem('sound_enabled') !== 'false');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => localStorage.setItem('sound_enabled', String(sound)), [sound]);

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-gray-50 dark:bg-dark-bg border-x border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden relative">
      <header className="bg-white/90 dark:bg-dark-card/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 h-14 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          {onBack && <button onClick={() => { playSound('click'); onBack(); }} className="p-2 -ml-2 rounded-full text-gray-600 dark:text-gray-300"><ChevronLeft size={24} /></button>}
          <h1 className="font-bold text-lg dark:text-white truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setSound(!sound)} className="p-2 text-gray-500 dark:text-gray-400">{sound ? <Volume2 size={20} /> : <VolumeX size={20} />}</button>
          <button onClick={() => setIsDark(!isDark)} className="p-2 text-gray-500 dark:text-gray-400">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button>
          {onReset && <button onClick={() => { if(confirm('Chơi lại từ đầu?')) onReset(); }} className="p-2 text-gray-500 dark:text-gray-400"><RotateCcw size={20} /></button>}
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar">{children}</main>
    </div>
  );
};