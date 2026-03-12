import { useEffect, useState } from "react";
import { useGameStore } from "../../game/state/gameStore";

export function WeaponHUD() {
    const currentWeapon = useGameStore((state) => state.currentWeapon);
    const [isFiring, setIsFiring] = useState(false);
    const [flashVisible, setFlashVisible] = useState(false);

    const weaponId = currentWeapon || "pistol";

    const spriteMap: Record<string, string> = {
        "pistol": "pistol",
        "shotgun": "shotgun",
        "chaingun": "chaingun",
        "chainsaw": "chainsaw",
        "rocket_launcher": "rocket_launcher",
        "plasma_rifle": "plasma_rifle",
        "bfg9000": "bfg",
    };

    const spriteId = spriteMap[weaponId] || "pistol";

    useEffect(() => {
        // Listen to weaponFired event dispatched by WeaponSystem on every shot
        const handleFired = () => {
            setIsFiring(true);
            setFlashVisible(true);
            setTimeout(() => setIsFiring(false), 120);
            setTimeout(() => setFlashVisible(false), 80);
        };

        window.addEventListener("weaponFired", handleFired);
        return () => window.removeEventListener("weaponFired", handleFired);
    }, []);

    return (
        <>
            {/* Muzzle flash screen flare — brief bright overlay on every shot */}
            {flashVisible && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(255, 220, 100, 0.18)",
                        pointerEvents: "none",
                        zIndex: 50,
                    }}
                />
            )}

            {/* Weapon sprite */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    pointerEvents: "none",
                    width: "400px",
                    height: "400px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    zIndex: 10,
                }}
            >
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        transformOrigin: "bottom center",
                        transform: isFiring
                            ? "translateY(20px) scale(1.05)"
                            : "translateY(0px) scale(1)",
                        transition: isFiring
                            ? "transform 0.05s ease-out"
                            : "transform 0.1s ease-in",
                    }}
                >
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 64 64"
                        preserveAspectRatio="xMidYMax meet"
                        style={{
                            filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.5))",
                        }}
                    >
                        <use href={`/assets/spritemap.svg#${spriteId}`} />
                    </svg>
                </div>
            </div>
        </>
    );
}
