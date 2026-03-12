import { useEffect, useState } from "react";
import { useGameStore } from "../../game/state/gameStore";
import { ComboHUD } from "./ComboHUD";
import "./HUD.css";

const DEATH_MESSAGES = [
  "WRONG WAY! 😅",
  "OOPS! 🙈",
  "TRY AGAIN! 💪",
  "SO CLOSE! 🎯",
  "NOT TODAY! 😈",
  "YIKES! 🌟",
];

export function HUD() {
  const { health, ammo, score, isLoading, isPaused, isPlaying, isVictory, setHealth, setPlaying, reset } =
    useGameStore();
  const [showVignette, setShowVignette] = useState(false);
  const [respawnCounter, setRespawnCounter] = useState(0);
  const [deathMessage] = useState(
    () => DEATH_MESSAGES[Math.floor(Math.random() * DEATH_MESSAGES.length)],
  );

  const isDead = isPlaying && health <= 0;

  // Auto-respawn countdown when health hits 0 while playing
  useEffect(() => {
    if (!isDead) return;

    setRespawnCounter(3);
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setRespawnCounter(count);
      if (count <= 0) {
        clearInterval(interval);
        // Respawn: restore health and keep playing
        setHealth(100);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isDead, setHealth, setPlaying]);

  // Damage vignette flash
  useEffect(() => {
    const onDamaged = () => {
      setShowVignette(true);
      setTimeout(() => setShowVignette(false), 200);
    };
    window.addEventListener("playerDamaged", onDamaged);
    return () => window.removeEventListener("playerDamaged", onDamaged);
  }, []);

  if (isLoading) {
    return (
      <div className="hud hud-loading">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  // Victory screen
  if (isVictory) {
    return (
      <div className="hud hud-victory">
        <div className="victory-overlay">
          <div className="victory-title">LEVEL COMPLETE! 🍭</div>
          <div className="victory-score">Final Score: {score}</div>
          <div className="victory-hint">Press SPACE to play again</div>
        </div>
      </div>
    );
  }

  // Game over (player exited game, not just death)
  if (!isPlaying && health <= 0) {
    return (
      <div className="hud hud-death">
        <div className="death-overlay">
          <div className="death-text">YOU DIED</div>
          <div className="death-score">Score: {score}</div>
          <div className="death-hint">Press SPACE to restart</div>
        </div>
      </div>
    );
  }

  if (!isPlaying) {
    return null;
  }

  return (
    <div className="hud">
      {/* Death + auto-respawn overlay */}
      {isDead && (
        <div
          className="hud-death"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "16px",
            zIndex: 80,
          }}
        >
          <div
            className="death-text"
            style={{ fontSize: "3rem", animation: "deathPulse 0.4s ease-in-out infinite" }}
          >
            {deathMessage}
          </div>
          <div style={{ fontSize: "1.4rem", color: "#ccc" }}>
            Respawning in {respawnCounter}...
          </div>
        </div>
      )}

      <div className="hud-top">
        <div className="score">Score: {score}</div>
      </div>

      <div className="hud-bottom">
        <div className="health-bar">
          <div className="health-fill" style={{ width: `${health}%` }} />
          <span className="health-text">{health}</span>
        </div>

        <div className="ammo-display">
          {Object.entries(ammo).map(([type, count]) => (
            <div key={type} className="ammo-item">
              <span className="ammo-type">{type}</span>
              <span className="ammo-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-text">PAUSED</div>
          <div className="pause-hint">Press ESC to resume</div>
        </div>
      )}

      <div className="crosshair">+</div>

      {/* Damage Vignette */}
      {showVignette && <div className="damage-vignette" />}

      {/* Combo popups and score/kills counter */}
      <ComboHUD />
    </div>
  );
}
