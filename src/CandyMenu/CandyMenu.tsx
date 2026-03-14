import './CandyMenu.css';
import { useState } from 'react';
import { PROCEDURAL_LEVELS } from '../engine/procedural/ProceduralLevels';

interface CandyMenuProps {
  onSelectLevel: (index: number) => void;
  onExplore: () => void;
}

export default function CandyMenu({ onSelectLevel, onExplore }: CandyMenuProps) {
  const [ showCredits, setShowCredits ] = useState(false);

  // Gradient stops cycling through the Candy Apocalypse palette per level
  const levelColors = [
    'linear-gradient(135deg, #32FF00 0%, #00D4FF 100%)',
    'linear-gradient(135deg, #00D4FF 0%, #9B5DE5 100%)',
    'linear-gradient(135deg, #9B5DE5 0%, #FFB7C5 100%)',
    'linear-gradient(135deg, #FFB7C5 0%, #FFE135 100%)',
    'linear-gradient(135deg, #FFE135 0%, #FF6B35 100%)',
    'linear-gradient(135deg, #FF6B35 0%, #FF0044 100%)',
    'linear-gradient(135deg, #FF0044 0%, #9B5DE5 100%)',
    'linear-gradient(135deg, #9B5DE5 0%, #FF0044 100%)',
    'linear-gradient(135deg, #FF0044 0%, #1A1A2E 100%)',
    'linear-gradient(135deg, #1A1A2E 0%, #FF0044 100%)',
  ];

  return (
    <div className="candy-menu-container">
      <div className="candy-menu-bg">
        <div className="candy-confetti" />
      </div>

      <div className="candy-menu-content">
        <h1 className="candy-title">
          <span className="candy-title-candy">CANDY</span>
          <span className="candy-title-apocalypse">APOCALYPSE</span>
        </h1>

        <p className="candy-tagline">
          What if DOOM was a Saturday Morning Cartoon?
        </p>

        {!showCredits ?
          <>
            <p className="candy-select-label">— SELECT LEVEL —</p>

            <div className="candy-level-grid">
              {PROCEDURAL_LEVELS.map((meta, i) =>
                <button
                  key={i}
                  className="candy-level-button"
                  style={{ background: levelColors[i] }}
                  onClick={() => onSelectLevel(i)}
                  title={meta.description}
                >
                  <span className="candy-level-number">{i + 1}</span>
                  <span className="candy-level-label">{meta.label}</span>
                  <span className="candy-level-desc">{meta.description}</span>
                </button>,
              )}
            </div>

            <div className="candy-menu-buttons candy-menu-buttons--secondary">
              <button
                className="candy-button candy-button-secondary"
                onClick={onExplore}
              >
                <span className="candy-button-text">🔍 EXPLORE WAD</span>
                <span className="candy-button-effect">✨</span>
              </button>

              <button
                className="candy-button candy-button-tertiary"
                onClick={() => setShowCredits(true)}
              >
                <span className="candy-button-text">ℹ️ ABOUT</span>
              </button>
            </div>

            <div className="candy-footer">
              <p className="candy-disclaimer">
                🎨 SVG Graphics Mode Active • Procedural Levels
              </p>
              <p className="candy-instruction">
                WASD to move • Mouse to aim • Click to fire • Find the exit portal
              </p>
            </div>
          </>
          :
          <div className="candy-credits">
            <h2 className="candy-credits-title">🎨 About Candy Apocalypse</h2>

            <div className="candy-credits-content">
              <p>
                A delightfully chaotic browser game reimagining the classic FPS
                as a vibrant, comic-style shooting gallery.
              </p>

              <p>
                <strong>Visual Style:</strong> Pure SVG, Candy Apocalypse color
                theme, exaggerated effects
              </p>

              <p>
                <strong>Gameplay:</strong> Fast-paced, joyful destruction with
                instant resume after death
              </p>

              <p>
                <strong>Tech Stack:</strong> TypeScript, Vite, HTML5 Canvas, Web
                Audio API
              </p>

              <div className="candy-colors">
                <h3>Candy Apocalypse Palette:</h3>
                <div className="candy-palette">
                  <div className="candy-color" style={{ background: '#00D4FF' }}><span>Sky Pop</span></div>
                  <div className="candy-color" style={{ background: '#FFB7C5' }}><span>Cotton Cloud</span></div>
                  <div className="candy-color" style={{ background: '#FFE135' }}><span>Solar Burst</span></div>
                  <div className="candy-color" style={{ background: '#32FF00' }}><span>Toxic Lime</span></div>
                  <div className="candy-color" style={{ background: '#FF6B35' }}><span>Rage Orange</span></div>
                  <div className="candy-color" style={{ background: '#9B5DE5' }}><span>Mystic Violet</span></div>
                  <div className="candy-color" style={{ background: '#FF0044' }}><span>Cherry Bomb</span></div>
                </div>
              </div>

              <p className="candy-license">
                Based on DOOM by id Software • GPL 3 License
              </p>
            </div>

            <button
              className="candy-button candy-button-back"
              onClick={() => setShowCredits(false)}
            >
              ← Back to Menu
            </button>
          </div>
        }
      </div>
    </div>
  );
}
