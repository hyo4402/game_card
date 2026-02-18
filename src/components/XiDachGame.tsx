import React, { useState, useEffect } from 'react';
import { Player, GameState } from '../types';
import { Layout } from './Layout';
import { Scoreboard } from './Scoreboard';
import { Button } from './Button';
import { safeSet, safeGet } from '../utils/storage';
import { playSound, triggerConfetti, vibrate } from '../utils/audio';
import { Crown, Undo2, X, Zap, Copy, Users, ArrowRightLeft } from 'lucide-react';

interface Props { initialPlayers: Player[]; dealerId: string; onBack: () => void; }

export const XiDachGame: React.FC<Props> = ({ initialPlayers, dealerId, onBack }) => {
  const [state, setState] = useState<GameState>(() => {
    const s = safeGet<GameState|null>('xidach', null);
    if (s && s.players.length) return s;
    return { players: initialPlayers, history: [], dealerId, defaultBets: {} };
  });
  
  const [bets, setBets] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, 'WIN'|'LOSE'|'DRAW'>>({});
  const [mults, setMults] = useState<Record<string, 1|2|3>>({});
  const [dealerMult, setDealerMult] = useState<1|2|3>(1);
  const [isRoundOpen, setOpen] = useState(false);
  const [showDealerSelect, setShowDealerSelect] = useState(false);

  useEffect(() => safeSet('xidach', state), [state]);

  // Init round state
  useEffect(() => {
    if (isRoundOpen) {
      const active = state.players.filter(p => p.id !== state.dealerId);
      const newBets = {...bets};
      const newRes = {...results};
      const newMults = {...mults};
      active.forEach(p => {
        if (!newBets[p.id]) newBets[p.id] = (state.defaultBets?.[p.id] || 10).toString();
        if (!newRes[p.id]) newRes[p.id] = 'LOSE';
        if (!newMults[p.id]) newMults[p.id] = 1;
      });
      setBets(newBets); setResults(newRes); setMults(newMults);
    }
  }, [isRoundOpen, state.dealerId]);

  const submitRound = () => {
    const deltas: Record<string, number> = {};
    const nextDefaults = {...(state.defaultBets || {})};
    let dealerDelta = 0;
    let bigWin = false;

    state.players.forEach(p => {
      if (p.id === state.dealerId || !bets[p.id]) return;
      const bet = parseInt(bets[p.id], 10) || 0;
      nextDefaults[p.id] = bet;
      const pm = mults[p.id] || 1;
      const res = results[p.id] || 'LOSE';
      let delta = 0;

      if (dealerMult > 1) {
        // Dealer has logic
        if (pm === dealerMult) delta = 0; // Draw
        else if (pm > dealerMult) { delta = bet * pm; bigWin = true; } // Player wins bigger
        else delta = -(bet * dealerMult); // Player loses by dealer factor
      } else {
        // Normal dealer
        if (pm > 1) { delta = bet * pm; bigWin = true; }
        else if (res === 'WIN') delta = bet;
        else if (res === 'LOSE') delta = -bet;
      }
      
      if (delta !== 0) {
        deltas[p.id] = delta;
        dealerDelta -= delta;
      }
    });

    if (state.dealerId) deltas[state.dealerId] = dealerDelta;
    if (dealerDelta > 100 || dealerMult > 1) bigWin = true;
    if (bigWin) { triggerConfetti(); playSound('win'); } else playSound('coin');

    updateState(deltas, dealerMult > 1 ? 'Chủ Xị thắng lớn' : 'Kết quả ván', nextDefaults);
    setOpen(false); setDealerMult(1);
  };

  const updateState = (deltas: Record<string, number>, desc: string, defs?: Record<string, number>) => {
    const nextPlayers = state.players.map(p => ({ ...p, score: p.score + (deltas[p.id] || 0) }));
    const round = { id: Date.now().toString(), timestamp: Date.now(), description: desc, scoreChanges: deltas };
    setState(s => ({ ...s, players: nextPlayers, history: [round, ...s.history], defaultBets: defs || s.defaultBets }));
  };

  const undo = () => {
    if (!state.history.length) return;
    const last = state.history[0];
    const nextPlayers = state.players.map(p => ({ ...p, score: p.score - (last.scoreChanges[p.id] || 0) }));
    setState(s => ({ ...s, players: nextPlayers, history: s.history.slice(1) }));
    playSound('click');
  };

  const dealerName = state.players.find(p => p.id === state.dealerId)?.name;

  return (
    <Layout title="Xì Dách" onBack={onBack} onReset={() => setState({...state, players: state.players.map(p=>({...p, score:0})), history: []})}>
      <Scoreboard players={state.players} dealerId={state.dealerId} />
      
      {!isRoundOpen ? (
        <div className="space-y-4">
          <Button fullWidth onClick={() => setOpen(true)} className="h-16 text-lg bg-gradient-to-r from-tet-red to-orange-500 shadow-floating border-0">Bắt đầu ván mới</Button>
          <div className="grid grid-cols-2 gap-3">
             <Button variant="outline" onClick={() => setShowDealerSelect(true)} className="h-10 text-xs"><ArrowRightLeft size={16} className="mr-2"/> Đổi Cái</Button>
             <Button variant="outline" onClick={undo} disabled={!state.history.length} className="h-10 text-xs"><Undo2 size={16} className="mr-2"/> Hoàn tác</Button>
          </div>
          <div className="space-y-2 mt-4">
             {state.history.map(h => (
               <div key={h.id} className="bg-white dark:bg-dark-card p-3 rounded-xl border border-gray-100 dark:border-gray-700 text-sm">
                  <div className="flex justify-between text-xs text-gray-400"><span>{new Date(h.timestamp).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</span><span>{h.description}</span></div>
                  <div className="flex flex-wrap gap-x-3 mt-1">{Object.entries(h.scoreChanges).map(([pid, v]) => {
                     const p = state.players.find(x => x.id === pid);
                     if (!p || v === 0) return null;
                     return <span key={pid} className={v>0?'text-tet-win font-bold':'text-tet-lose font-bold'}>{p.name}: {v>0?'+':''}{v}</span>
                  })}</div>
               </div>
             ))}
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 bg-gray-50 dark:bg-dark-bg z-50 flex flex-col">
           {/* Round Header */}
           <div className="bg-white dark:bg-dark-card p-4 shadow-sm border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                 <div className="bg-tet-gold/20 p-2 rounded-full"><Crown className="text-yellow-600" size={24}/></div>
                 <div><div className="text-[10px] text-gray-400 font-bold uppercase">Nhà Cái</div><div className="font-bold text-lg dark:text-white leading-none">{dealerName}</div></div>
              </div>
              <button onClick={() => setOpen(false)} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full"><X/></button>
           </div>
           
           {/* Dealer Options */}
           <div className="bg-white dark:bg-dark-card p-4 pt-0 shadow-sm shrink-0">
              <div className="grid grid-cols-3 gap-2 mt-3">
                 {[1, 2, 3].map(m => (
                    <button key={m} onClick={() => setDealerMult(m as any)} 
                      className={`py-2 rounded-lg font-bold text-xs border-2 transition-all ${dealerMult === m ? (m===1?'border-gray-800 bg-gray-800 text-white':m===2?'border-indigo-500 bg-indigo-500 text-white':'border-purple-500 bg-purple-500 text-white') : 'border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}`}>
                      {m===1?'Thường':m===2?'Xì Dách (x2)':'Xì Bàn (x3)'}
                    </button>
                 ))}
              </div>
           </div>

           {/* Quick Actions */}
           <div className="bg-gray-100 dark:bg-gray-900 p-2 flex gap-2 overflow-x-auto shrink-0 no-scrollbar">
              <button onClick={() => {const r={};state.players.forEach(p=>r[p.id]='LOSE');setResults(r);playSound('lose');}} className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold whitespace-nowrap"><Zap size={14} className="inline mr-1"/>Cái Ăn Hết</button>
              <button onClick={() => {const r={};state.players.forEach(p=>r[p.id]='DRAW');setResults(r);playSound('click');}} className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold whitespace-nowrap">Hòa Cả Làng</button>
              <button onClick={() => {const active=state.players.filter(p=>p.id!==dealerId);if(active.length){const b=bets[active[0].id];const n={...bets};active.forEach(p=>n[p.id]=b);setBets(n);playSound('coin');}}} className="px-3 py-2 bg-white border rounded-lg text-xs font-bold whitespace-nowrap"><Copy size={14} className="inline mr-1"/>Copy Cược</button>
           </div>

           {/* Player List */}
           <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {state.players.filter(p => p.id !== state.dealerId).map(p => {
                 const pm = mults[p.id] || 1;
                 const isSpecial = pm > 1 || dealerMult > 1;
                 let bg = "bg-white dark:bg-dark-card border-gray-200 dark:border-gray-700";
                 if (dealerMult > 1) {
                    if (pm === dealerMult) bg = "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20";
                    else if (pm > dealerMult) bg = "bg-green-50 border-green-200 dark:bg-green-900/20";
                    else bg = "bg-red-50 border-red-200 dark:bg-red-900/20";
                 } else if (pm > 1 || results[p.id] === 'WIN') bg = "bg-green-50 border-green-200 dark:bg-green-900/20";
                 else if (results[p.id] === 'LOSE') bg = "bg-red-50 border-red-200 dark:bg-red-900/20";

                 return (
                    <div key={p.id} className={`p-4 rounded-xl border shadow-sm transition-all ${bg}`}>
                       <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-lg dark:text-white">{p.name}</span>
                          <div className="flex items-center gap-1 bg-white/50 dark:bg-black/20 p-1 rounded-lg">
                             <input type="number" inputMode="numeric" value={bets[p.id]||''} 
                                onChange={e => setBets({...bets, [p.id]: e.target.value})}
                                className="w-14 text-right font-mono font-bold text-lg bg-transparent outline-none dark:text-white"
                             />
                             <span className="text-xs font-bold text-gray-400 pr-1">điểm</span>
                          </div>
                       </div>
                       <div className="space-y-2">
                          {!isSpecial && (
                             <div className="grid grid-cols-3 gap-2">
                                {['LOSE', 'DRAW', 'WIN'].map((r) => (
                                   <button key={r} onClick={() => {setResults({...results, [p.id]: r as any}); playSound(r==='WIN'?'win':r==='LOSE'?'lose':'click')}}
                                      className={`py-2 rounded-lg text-xs font-bold ${results[p.id]===r 
                                         ? (r==='WIN'?'bg-tet-win text-white':r==='LOSE'?'bg-tet-red text-white':'bg-tet-gold text-white') 
                                         : 'bg-white dark:bg-gray-800 dark:text-gray-400 shadow-sm'}`}>
                                      {r==='LOSE'?'Thua':r==='WIN'?'Thắng':'Hòa'}
                                   </button>
                                ))}
                             </div>
                          )}
                          <div className="flex gap-2">
                             {[2, 3].map(m => (
                                <button key={m} onClick={() => {setMults({...mults, [p.id]: mults[p.id]===m ? 1 : m as any}); if(dealerMult===1) setResults({...results, [p.id]: 'WIN'}); playSound('click');}}
                                   className={`flex-1 py-1 rounded-lg text-[10px] font-bold uppercase border ${mults[p.id]===m 
                                      ? (m===2?'bg-indigo-500 text-white border-indigo-600':'bg-purple-500 text-white border-purple-600') 
                                      : 'bg-transparent border-gray-300 text-gray-400 dark:border-gray-600'}`}>
                                   {m===2?'Xì Dách (x2)':'Xì Bàn (x3)'}
                                </button>
                             ))}
                          </div>
                       </div>
                    </div>
                 );
              })}
           </div>

           {/* Footer Action */}
           <div className="p-4 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-gray-800 shrink-0">
              <Button fullWidth onClick={submitRound} className="h-14 text-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900">Xác Nhận</Button>
           </div>
        </div>
      )}

      {/* Select Dealer Modal */}
      {showDealerSelect && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-dark-card w-full max-w-xs rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 dark:text-white">Chọn Chủ Xị Mới</h3>
              <div className="space-y-2 mb-4">
                 {state.players.map(p => (
                    <button key={p.id} onClick={() => {setState({...state, dealerId: p.id}); setShowDealerSelect(false);}}
                       className={`w-full p-3 rounded-xl border-2 font-bold flex justify-between ${state.dealerId===p.id?'border-tet-red bg-red-50 text-tet-red':'border-gray-100 dark:border-gray-700 dark:text-white'}`}>
                       {p.name} {state.dealerId===p.id && <Crown size={16}/>}
                    </button>
                 ))}
              </div>
              <Button fullWidth variant="ghost" onClick={() => setShowDealerSelect(false)}>Hủy</Button>
           </div>
        </div>
      )}
    </Layout>
  );
};