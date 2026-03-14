import { useGameStore } from '../../game/state/gameStore';
import { useState } from 'react';
import './MainMenu.css';

export function MainMenu() {
  const [ isVisible, setIsVisible ] = useState(true);
  const { startGame, setPlaying, reset } = useGameStore();

  const handleStart = () => {
    setIsVisible(false);
    reset();
    startGame();
    setPlaying(true);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="main-menu">
      <div className="menu-content">
        <h1 className="game-title">CANDY APOCALYPSE</h1>
        <p className="game-subtitle">A Babylon.js FPS Experience</p>

        <div className="menu-buttons">
          <button className="menu-button start-button" onClick={handleStart}>
            START GAME
          </button>
        </div>

        <div className="controls-info">
          <h3>Controls</h3>
          <div className="control-item">
            <span className="key">WASD</span>
            <span className="action">Move</span>
          </div>
          <div className="control-item">
            <span className="key">Mouse</span>
            <span className="action">Look around</span>
          </div>
          <div className="control-item">
            <span className="key">Left Click</span>
            <span className="action">Fire weapon</span>
          </div>
          <div className="control-item">
            <span className="key">1 / 2</span>
            <span className="action">Switch weapons</span>
          </div>
          <div className="control-item">
            <span className="key">ESC</span>
            <span className="action">Pause game</span>
          </div>
        </div>

        <div className="game-info">
          <p>Kill enemies for points</p>
          <p>Collect pickups to survive</p>
          <p>Don't die!</p>
        </div>

        <div className="tech-info">
          Built with Babylon.js + React + TypeScript
        </div>
      </div>
    </div>
  );
}
