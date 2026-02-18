import React, { useState } from 'react';
import { Player } from '../types';
import { Button } from './Button';
import { Plus, X, Crown } from 'lucide-react';

interface Props { onStart: (p: Player[], d?: string) => void; mode: 'TIENLEN' | 'XIDACH'; }

export const PlayerSetup: React.FC<Props> = ({ onStart, mode }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState('');
  const [dealerId, setDealerId] = useState('');

  const add = () => {
    if (!name.trim()) return;
    const newP = { id: Date.now().toString(), name: name.trim(), score: 0 };
    const list = [...players, newP];
    setPlayers(list);
    if (mode === 'XIDACH' && list.length === 1) setDealerId(newP.id);
    setName('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-sm font-bold text-gray-400 uppercase mb-4">Danh sách thành viên</h2>
        <div className="flex gap-2 mb-4">
          <input className="flex-1 bg-gray-50 dark:bg-gray-800 dark:text-white px-4 py-3 rounded-xl outline-none border border-transparent focus:border-tet-gold" 
            placeholder="Nhập tên..." value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} />
          <Button onClick={add} disabled={!name.trim()} className="w-12 !px-0"><Plus/></Button>
        </div>
        <div className="space-y-2 max-h-[40vh] overflow-y-auto">
          {players.length === 0 && <div className="text-center text-gray-400 py-4 italic">Chưa có ai cả...</div>}
          {players.map(p => (
            <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
               <div className="flex items-center gap-3">
                  {mode === 'XIDACH' && (
                    <button onClick={() => setDealerId(p.id)} className={`w-6 h-6 rounded-full border flex items-center justify-center ${dealerId===p.id?'bg-tet-red border-tet-red text-white':'border-gray-300'}`}>
                      <Crown size={12}/>
                    </button>
                  )}
                  <span className="font-bold dark:text-white">{p.name}</span>
               </div>
               <button onClick={() => {
                 const next = players.filter(x=>x.id!==p.id);
                 setPlayers(next);
                 if(dealerId===p.id && next.length) setDealerId(next[0].id);
               }} className="text-gray-400 hover:text-red-500"><X size={18}/></button>
            </div>
          ))}
        </div>
      </div>
      <div className="sticky bottom-0 bg-gray-50 dark:bg-dark-bg py-4 border-t dark:border-gray-800">
        <Button fullWidth onClick={() => onStart(players, dealerId)} disabled={players.length < 2} className="h-14 text-lg shadow-floating">
          Bắt Đầu ({players.length})
        </Button>
      </div>
    </div>
  );
};