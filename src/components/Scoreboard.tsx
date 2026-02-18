import React, { useState } from 'react';
import { Player } from '../types';
import { Trophy, Wallet, X } from 'lucide-react';

interface Props { players: Player[]; dealerId?: string; }

export const Scoreboard: React.FC<Props> = ({ players, dealerId }) => {
  const [showSettlement, setShow] = useState(false);
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

  return (
    <>
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
        <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <span className="text-xs font-bold text-gray-500 uppercase flex gap-1"><Trophy size={14}/> Bảng Vàng</span>
          <button onClick={() => setShow(true)} className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded flex gap-1"><Wallet size={14}/> Tổng Kết</button>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {sorted.map((p, i) => (
            <div key={p.id} className="flex justify-between px-4 py-3 items-center">
              <div className="flex items-center gap-3">
                <span className={`font-bold w-6 text-center ${i===0 ? 'text-xl' : 'text-gray-400 text-sm'}`}>{i===0 ? '🥇' : i+1}</span>
                <span className={`font-medium ${dealerId===p.id ? 'text-tet-red font-bold' : 'dark:text-gray-200'}`}>{p.name} {dealerId===p.id && '(Cái)'}</span>
              </div>
              <span className={`font-mono font-bold ${p.score > 0 ? 'text-tet-win' : p.score < 0 ? 'text-tet-lose' : 'text-gray-400'}`}>{p.score > 0 ? '+' : ''}{p.score}</span>
            </div>
          ))}
        </div>
      </div>
      {showSettlement && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-2xl p-6 relative">
            <button onClick={() => setShow(false)} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full"><X size={20} className="dark:text-white"/></button>
            <h2 className="text-xl font-bold mb-4 dark:text-white text-center">Tổng Kết Tiền</h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <h3 className="text-xs font-bold text-green-600 uppercase mb-2">Người Thắng (Thu tiền)</h3>
                {sorted.filter(p=>p.score>0).map(p=><div key={p.id} className="flex justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded mb-1"><span className="dark:text-white">{p.name}</span><span className="font-bold text-green-600">+{fmt(p.score)}</span></div>)}
              </div>
              <div>
                <h3 className="text-xs font-bold text-red-600 uppercase mb-2">Người Thua (Chung tiền)</h3>
                {sorted.filter(p=>p.score<0).map(p=><div key={p.id} className="flex justify-between bg-red-50 dark:bg-red-900/20 p-2 rounded mb-1"><span className="dark:text-white">{p.name}</span><span className="font-bold text-red-600">{fmt(p.score)}</span></div>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};