import React, { useState, useEffect } from 'react';
import { Player, GameState, DEFAULT_RULES } from '../types';
import { Layout } from './Layout';
import { Scoreboard } from './Scoreboard';
import { Button } from './Button';
import { safeSet, safeGet } from '../utils/storage';
import { playSound, triggerConfetti } from '../utils/audio';
import { Undo2, Settings, Users, X } from 'lucide-react';

interface Props { initialPlayers: Player[]; onBack: () => void; }

export const TienLenGame: React.FC<Props> = ({ initialPlayers, onBack }) => {
  const [state, setState] = useState<GameState>(() => safeGet('tienlen', { players: initialPlayers, history: [], tienLenRules: DEFAULT_RULES }));
  const [ranks, setRanks] = useState<string[]>([]);
  const [mode, setMode] = useState<'NONE'|'RANK'|'PIG'|'CONFIG'>('NONE');
  const [pigData, setPigData] = useState({ winner: '', loser: '', type: 'BLACK' });
  const rules = state.tienLenRules || DEFAULT_RULES;

  useEffect(() => safeSet('tienlen', state), [state]);

  const updateScore = (deltas: Record<string, number>, desc: string) => {
    const nextPlayers = state.players.map(p => ({ ...p, score: p.score + (deltas[p.id] || 0) }));
    const round = { id: Date.now().toString(), timestamp: Date.now(), description: desc, scoreChanges: deltas };
    setState(s => ({ ...s, players: nextPlayers, history: [round, ...s.history] }));
  };

  const submitRank = () => {
    const deltas: Record<string, number> = {};
    const count = ranks.length;
    if (count < 2) return;
    deltas[ranks[0]] = rules.FIRST;
    deltas[ranks[count-1]] = rules.LAST;
    if (count >= 4) { deltas[ranks[1]] = rules.SECOND; deltas[ranks[2]] = rules.THIRD; }
    else if (count === 3) { deltas[ranks[1]] = 0; } // 3 người chơi: Nhì hòa
    updateScore(deltas, 'Xếp hạng');
    setRanks([]); setMode('NONE'); triggerConfetti(); playSound('win');
  };

  const submitPig = () => {
    if (!pigData.winner || !pigData.loser) return;
    const pts = pigData.type === 'BLACK' ? rules.PIG_BLACK : rules.PIG_RED;
    updateScore({ [pigData.winner]: pts, [pigData.loser]: -pts }, `Phạt ${pigData.type === 'BLACK' ? 'Heo Đen' : 'Heo Đỏ'}`);
    setMode('NONE'); playSound('coin');
  };

  const undo = () => {
    if (!state.history.length) return;
    const last = state.history[0];
    const nextPlayers = state.players.map(p => ({ ...p, score: p.score - (last.scoreChanges[p.id] || 0) }));
    setState(s => ({ ...s, players: nextPlayers, history: s.history.slice(1) }));
    playSound('click');
  };

  return (
    <Layout title="Tiến Lên" onBack={onBack} onReset={() => setState({...state, players: state.players.map(p=>({...p, score:0})), history: []})}>
      <Scoreboard players={state.players} />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Button onClick={() => setMode('RANK')} className="h-24 flex-col text-lg"><span className="text-3xl mb-1">🏆</span>Xếp Hạng</Button>
        <div className="flex flex-col gap-3">
          <Button variant="secondary" onClick={() => setMode('PIG')} className="flex-1"><span className="mr-2">🐷</span> Heo/Hàng</Button>
          <div className="flex gap-2 h-10">
            <Button variant="outline" onClick={undo} disabled={!state.history.length} className="flex-1 px-0"><Undo2 size={16}/></Button>
            <Button variant="outline" onClick={() => setMode('CONFIG')} className="flex-1 px-0"><Settings size={16}/></Button>
          </div>
        </div>
      </div>
      
      {/* List History */}
      <div className="space-y-2 text-sm">
        {state.history.map(h => (
          <div key={h.id} className="bg-white dark:bg-dark-card p-3 rounded-xl border border-gray-100 dark:border-gray-700">
             <div className="flex justify-between text-xs text-gray-400 mb-1"><span>{new Date(h.timestamp).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</span><span>{h.description}</span></div>
             <div className="flex flex-wrap gap-x-3">{Object.entries(h.scoreChanges).map(([pid, v]) => {
                const p = state.players.find(x => x.id === pid);
                return p && v !== 0 ? <span key={pid} className={v>0?'text-green-600 font-bold':'text-red-500 font-bold'}>{p.name}: {v>0?'+':''}{v}</span> : null;
             })}</div>
          </div>
        ))}
      </div>

      {/* Ranking Modal */}
      {mode === 'RANK' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-2xl p-6 animate-zoom-in">
            <h3 className="font-bold text-xl mb-4 dark:text-white">Chọn thứ hạng</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {state.players.map(p => {
                const idx = ranks.indexOf(p.id);
                return (
                  <button key={p.id} onClick={() => idx > -1 ? setRanks(ranks.filter(id=>id!==p.id)) : setRanks([...ranks, p.id])}
                    className={`p-4 rounded-xl font-bold relative ${idx > -1 ? 'bg-tet-gold text-white' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'}`}>
                    {p.name}
                    {idx > -1 && <span className="absolute top-2 right-2 bg-white text-yellow-600 w-5 h-5 rounded-full text-xs flex items-center justify-center">{idx+1}</span>}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => {setMode('NONE'); setRanks([]);}}>Hủy</Button>
              <Button fullWidth onClick={submitRank} disabled={ranks.length < 2}>Lưu</Button>
            </div>
          </div>
        </div>
      )}

      {/* Pig Modal */}
      {mode === 'PIG' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-2xl p-6 animate-zoom-in">
             <div className="flex justify-between mb-4"><h3 className="font-bold text-xl dark:text-white">Phạt Heo</h3><button onClick={()=>setMode('NONE')}><X/></button></div>
             <div className="grid grid-cols-2 gap-4 mb-4">
               <div><div className="text-xs text-green-600 font-bold mb-1">Người Ăn</div><div className="flex flex-col gap-2">{state.players.map(p=><button key={p.id} onClick={()=>setPigData({...pigData, winner: p.id})} className={`p-2 rounded border-2 text-sm font-bold ${pigData.winner===p.id?'border-green-500 bg-green-50 text-green-700':'border-transparent bg-gray-100 dark:bg-gray-800 dark:text-gray-300'}`}>{p.name}</button>)}</div></div>
               <div><div className="text-xs text-red-600 font-bold mb-1">Người Chung</div><div className="flex flex-col gap-2">{state.players.map(p=><button key={p.id} onClick={()=>setPigData({...pigData, loser: p.id})} className={`p-2 rounded border-2 text-sm font-bold ${pigData.loser===p.id?'border-red-500 bg-red-50 text-red-700':'border-transparent bg-gray-100 dark:bg-gray-800 dark:text-gray-300'}`}>{p.name}</button>)}</div></div>
             </div>
             <div className="flex gap-2">
               <Button fullWidth onClick={()=>{setPigData({...pigData, type:'BLACK'}); setTimeout(submitPig, 0);}} className="bg-gray-700">Heo Đen ({rules.PIG_BLACK})</Button>
               <Button fullWidth onClick={()=>{setPigData({...pigData, type:'RED'}); setTimeout(submitPig, 0);}}>Heo Đỏ ({rules.PIG_RED})</Button>
             </div>
          </div>
        </div>
      )}

      {/* Config Modal */}
      {mode === 'CONFIG' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-2xl p-6">
              <h3 className="font-bold text-xl mb-4 dark:text-white">Cài đặt điểm</h3>
              <div className="space-y-3 mb-6">
                {[
                  {k:'FIRST', l:'Nhất'}, {k:'SECOND', l:'Nhì'}, {k:'THIRD', l:'Ba'}, {k:'LAST', l:'Chót'},
                  {k:'PIG_BLACK', l:'Heo Đen'}, {k:'PIG_RED', l:'Heo Đỏ'}
                ].map(r => (
                  <div key={r.k} className="flex justify-between items-center">
                    <label className="dark:text-gray-300 font-medium">{r.l}</label>
                    <input type="number" className="w-20 p-2 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-700"
                      value={(state.tienLenRules || DEFAULT_RULES)[r.k as keyof typeof DEFAULT_RULES]}
                      onChange={(e) => setState({...state, tienLenRules: {...(state.tienLenRules || DEFAULT_RULES), [r.k]: Number(e.target.value)}})}
                    />
                  </div>
                ))}
              </div>
              <Button fullWidth onClick={() => setMode('NONE')}>Đóng</Button>
           </div>
        </div>
      )}
    </Layout>
  );
};