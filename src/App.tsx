import React, { useState } from 'react';
import { GameMode, Player } from './types';
import { GameSelector } from './components/GameSelector';
import { PlayerSetup } from './components/PlayerSetup';
import { TienLenGame } from './components/TienLenGame';
import { XiDachGame } from './components/XiDachGame';
import { Layout } from './components/Layout';
import { safeGet } from './utils/storage';

const App: React.FC = () => {
  const [mode, setMode] = useState<GameMode>('HOME');
  const [step, setStep] = useState<'SELECT' | 'SETUP' | 'PLAY'>('SELECT');
  const [players, setPlayers] = useState<Player[]>([]);
  const [dealerId, setDealerId] = useState('');

  const handleSelect = (m: GameMode) => {
    setMode(m);
    // Check saved game
    const key = m === 'TIENLEN' ? 'tienlen' : 'xidach';
    const saved = safeGet<any>(key, null);
    if (saved && saved.players && saved.players.length > 0) {
      setPlayers(saved.players);
      if (saved.dealerId) setDealerId(saved.dealerId);
      setStep('PLAY');
    } else {
      setStep('SETUP');
    }
  };

  const handleStart = (p: Player[], dId?: string) => {
    setPlayers(p);
    if (dId) setDealerId(dId);
    setStep('PLAY');
  };

  const back = () => { setStep('SELECT'); setMode('HOME'); setPlayers([]); };

  if (step === 'SELECT') return <GameSelector onSelect={handleSelect} />;
  
  if (step === 'SETUP') return (
    <Layout title={`Thiết Lập ${mode==='TIENLEN'?'Tiến Lên':'Xì Dách'}`} onBack={back}>
      <PlayerSetup onStart={handleStart} mode={mode as any} />
    </Layout>
  );

  if (mode === 'TIENLEN') return <TienLenGame initialPlayers={players} onBack={back} />;
  if (mode === 'XIDACH') return <XiDachGame initialPlayers={players} dealerId={dealerId} onBack={back} />;

  return null;
};

export default App;