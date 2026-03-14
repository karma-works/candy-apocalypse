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

    const { reset, setProceduralLevelIndex, startGame, setPlaying } =
      useGameStore.getState();

    reset();

    if (param === 'test') {
      setProceduralLevelIndex(-1);
    } else {
      const n = parseInt(param, 10);
      if (!isNaN(n)) {
        setProceduralLevelIndex(Math.max(0, Math.min(9, n - 1)));
      }
    }

    startGame();
    setPlaying(true);
  }, []);

  return (
    <div className="app">
      <GameCanvas />
      {!isPlaying &&
        <CandyMenu
          onSelectLevel={(index) => {
            const { reset, setProceduralLevelIndex, startGame, setPlaying } =
              useGameStore.getState();
            reset();
            setProceduralLevelIndex(index);
            startGame();
            setPlaying(true);
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
