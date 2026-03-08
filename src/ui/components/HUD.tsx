import { useGameStore } from "../../game/state/gameStore";
import "./HUD.css";

export function HUD() {
  const { health, ammo, score, isLoading, isPaused, isPlaying } =
    useGameStore();

  if (isLoading) {
    return (
      <div className="hud hud-loading">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  // Only show death screen if not playing AND health is 0 or less
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

  // Don't show HUD if game hasn't started
  if (!isPlaying) {
    return null;
  }

  return (
    <div className="hud">
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
    </div>
  );
}
