import "./CandyMenu.css";
import { useState } from "react";

interface CandyMenuProps {
  onStartGame: () => void;
  onExplore: () => void;
}

export default function CandyMenu({ onStartGame, onExplore }: CandyMenuProps) {
  const [showCredits, setShowCredits] = useState(false);

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

        {!showCredits ? (
          <>
            <div className="candy-menu-buttons">
              <button
                className="candy-button candy-button-primary"
                onClick={onStartGame}
              >
                <span className="candy-button-text">🎮 START GAME</span>
                <span className="candy-button-effect">💥</span>
              </button>

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
                🎨 SVG Graphics Mode Active • Using DOOM 1 Shareware
              </p>
              <p className="candy-instruction">
                Click to start • WASD to move • Mouse to aim • Click to fire
              </p>
            </div>
          </>
        ) : (
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
                  <div
                    className="candy-color"
                    style={{ background: "#00D4FF" }}
                  >
                    <span>Sky Pop</span>
                  </div>
                  <div
                    className="candy-color"
                    style={{ background: "#FFB7C5" }}
                  >
                    <span>Cotton Cloud</span>
                  </div>
                  <div
                    className="candy-color"
                    style={{ background: "#FFE135" }}
                  >
                    <span>Solar Burst</span>
                  </div>
                  <div
                    className="candy-color"
                    style={{ background: "#32FF00" }}
                  >
                    <span>Toxic Lime</span>
                  </div>
                  <div
                    className="candy-color"
                    style={{ background: "#FF6B35" }}
                  >
                    <span>Rage Orange</span>
                  </div>
                  <div
                    className="candy-color"
                    style={{ background: "#9B5DE5" }}
                  >
                    <span>Mystic Violet</span>
                  </div>
                  <div
                    className="candy-color"
                    style={{ background: "#FF0044" }}
                  >
                    <span>Cherry Bomb</span>
                  </div>
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
        )}
      </div>
    </div>
  );
}
