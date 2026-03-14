import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../../game/state/gameStore";
import "./WeaponHUD.css";

// Per-weapon customisation
const WEAPON_META: Record<
  string,
  {
    sprite: string;
    flashColor: string;
    flashSize: number;
    hasLongFlash: boolean;
  }
> = {
  pistol: {
    sprite: "pistol",
    flashColor: "#FFE870",
    flashSize: 80,
    hasLongFlash: false,
  },
  shotgun: {
    sprite: "shotgun",
    flashColor: "#FFD040",
    flashSize: 140,
    hasLongFlash: false,
  },
  chaingun: {
    sprite: "chaingun",
    flashColor: "#FFF080",
    flashSize: 80,
    hasLongFlash: false,
  },
  chainsaw: {
    sprite: "chainsaw",
    flashColor: "#FF8040",
    flashSize: 60,
    hasLongFlash: true,
  },
  rocket_launcher: {
    sprite: "rocket_launcher",
    flashColor: "#FF6020",
    flashSize: 180,
    hasLongFlash: true,
  },
  plasma_rifle: {
    sprite: "plasma_rifle",
    flashColor: "#40FFFF",
    flashSize: 120,
    hasLongFlash: true,
  },
  bfg9000: {
    sprite: "bfg",
    flashColor: "#40FF80",
    flashSize: 220,
    hasLongFlash: true,
  },
};

export function WeaponHUD() {
  const currentWeapon = useGameStore((state) => state.currentWeapon);

  // Animation state
  const [firing, setFiring] = useState(false);
  const [muzzleFlash, setMuzzleFlash] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);
  const kickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const weaponId = currentWeapon || "pistol";
  const meta = WEAPON_META[weaponId] ?? WEAPON_META.pistol;

  useEffect(() => {
    const handleFired = (e: Event) => {
      const weapon = (e as CustomEvent).detail?.weapon ?? weaponId;
      const m = WEAPON_META[weapon] ?? WEAPON_META.pistol;
      const kickDuration = m.hasLongFlash ? 200 : 140;
      const flashDuration = m.hasLongFlash ? 160 : 90;

      // Cancel any running timers so rapid fire keeps feeling snappy
      if (kickTimeoutRef.current) {
        clearTimeout(kickTimeoutRef.current);
      }
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }

      setFiring(true);
      setMuzzleFlash(true);
      setScreenFlash(true);

      kickTimeoutRef.current = setTimeout(() => setFiring(false), kickDuration);
      flashTimeoutRef.current = setTimeout(() => {
        setMuzzleFlash(false);
        setScreenFlash(false);
      }, flashDuration);
    };

    window.addEventListener("weaponFired", handleFired);
    return () => {
      window.removeEventListener("weaponFired", handleFired);
      if (kickTimeoutRef.current) {
        clearTimeout(kickTimeoutRef.current);
      }
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }
    };
  }, [weaponId]);

  return (
    <>
      {/* ── Screen flash overlay ── */}
      <div
        className={`weapon-screen-flash ${screenFlash ? "weapon-screen-flash--active" : ""}`}
        style={{ "--flash-color": meta.flashColor } as React.CSSProperties}
      />

      {/* ── Weapon sprite + muzzle flash container ── */}
      <div className="weapon-hud-root">
        {/* Muzzle flash: sits at the top of the weapon container (near barrel) */}
        <div
          className={`muzzle-flash ${muzzleFlash ? "muzzle-flash--active" : ""}`}
          style={
            {
              "--flash-color": meta.flashColor,
              "--flash-size": `${meta.flashSize}px`,
            } as React.CSSProperties
          }
        >
          {/* Star rays — pure CSS, no image needed */}
          <div className="muzzle-flash__rays" />
          <div className="muzzle-flash__core" />
        </div>

        {/* Weapon sprite */}
        <div
          className={`weapon-sprite ${firing ? "weapon-sprite--firing" : ""}`}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 64 64"
            preserveAspectRatio="xMidYMax meet"
            className="weapon-svg"
          >
            <use
              href={`${import.meta.env.BASE_URL}assets/spritemap.svg#${meta.sprite}`}
            />
          </svg>
        </div>
      </div>
    </>
  );
}
