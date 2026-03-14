import { useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import CandyMenu from '../CandyMenu/CandyMenu';
import { useGameStore } from '../game/state/gameStore';
import { WeaponHUD } from './components/WeaponHUD';
import './App.css';

export function App() {
  const { isPlaying } = useGameStore();

  // Handle ?level= URL param: auto-start the specified level on page load
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('level');
    if (!param) {
      return;
    }

    const { startLevel } = useGameStore.getState();

    if (param === 'test') {
      startLevel(-1);
    } else {
      const n = parseInt(param, 10);
      if (!isNaN(n)) {
        startLevel(Math.max(0, Math.min(9, n - 1)));
      }
    }
  }, []);

  return (
    <div className="app">
      <GameCanvas />
      {!isPlaying &&
        <CandyMenu
          onSelectLevel={(index) => {
            useGameStore.getState().startLevel(index);
          }}
          onExplore={() => {
            console.log('Explore WAD clicked');
          }}
        />
      }
      {isPlaying &&
        <>
          <WeaponHUD />
          <HUD />
        </>
      }
    </div>
  );
}
