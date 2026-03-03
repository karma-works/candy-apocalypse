import { useEffect, useRef } from "react";
import { Doom as RawDoom } from "../doom/doom";

export default function CandyHud({
  doomInst,
}: {
  doomInst: RawDoom | undefined;
}) {
  const hudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!doomInst) return;

    const interval = setInterval(() => {
      if (!hudRef.current) return;

      const player = doomInst.game.player;
      const health = player.health;
      const ammo = player.ammo[player.readyWeapon];

      const healthEl = hudRef.current.querySelector(".health-value");
      const ammoEl = hudRef.current.querySelector(".ammo-value");

      if (healthEl) {
        healthEl.textContent = String(health);
        const healthContainer =
          hudRef.current.querySelector(".health-container");
        if (healthContainer) {
          healthContainer.classList.remove(
            "health-high",
            "health-medium",
            "health-low",
          );
          if (health > 50) healthContainer.classList.add("health-high");
          else if (health > 25) healthContainer.classList.add("health-medium");
          else healthContainer.classList.add("health-low");
        }
      }

      if (ammoEl) {
        ammoEl.textContent = String(ammo);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [doomInst]);

  return (
    <div ref={hudRef} className="candy-hud">
      <div className="hud-item health-container health-high">
        <span className="hud-icon">♥</span>
        <span className="hud-label">HEALTH</span>
        <span className="hud-value health-value">100</span>
      </div>
      <div className="hud-item ammo-container">
        <span className="hud-icon">⚡</span>
        <span className="hud-label">AMMO</span>
        <span className="hud-value ammo-value">50</span>
      </div>
    </div>
  );
}
