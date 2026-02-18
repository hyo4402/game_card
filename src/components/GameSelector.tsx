import React from 'react';
import { GameMode } from '../types';

interface Props { onSelect: (m: GameMode) => void; }

export const GameSelector: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gray-50 dark:bg-dark-bg">
       <div className="absolute top-[-10%] right-[-20%] w-64 h-64 bg-tet-red/20 rounded-full blur-3xl animate-bounce-subtle"></div>
       <div className="relative z-10 w-full max-w-sm space-y-8">
          <div className="text-center">
             <div className="inline-block p-4 bg-gradient-to-br from-tet-red to-orange-500 rounded-2xl shadow-xl mb-4 text-4xl">🌸</div>
             <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Sổ Điểm Vui Xuân</h1>
             <p className="text-gray-500 dark:text-gray-400">Ghi điểm sum vầy, Tết thêm gắn kết</p>
          </div>
          <div className="grid gap-4">
             <button onClick={() => onSelect('TIENLEN')} className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-lg border-2 border-transparent hover:border-tet-red transition-all text-left group">
                <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">🃏</span>
                <h3 className="font-bold text-lg dark:text-white">Tiến Lên</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Xếp hạng Nhất, Nhì, Ba. Tính điểm chặt heo.</p>
             </button>
             <button onClick={() => onSelect('XIDACH')} className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-lg border-2 border-transparent hover:border-tet-gold transition-all text-left group">
                <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">✨</span>
                <h3 className="font-bold text-lg dark:text-white">Xì Dách</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Chủ Xị & Tay Con. Hỗ trợ đặt cược và Xì Bàn.</p>
             </button>
          </div>
       </div>
    </div>
  );
};