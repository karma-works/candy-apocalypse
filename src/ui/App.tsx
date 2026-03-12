import { GameCanvas } from "./components/GameCanvas";
import { HUD } from "./components/HUD";
import CandyMenu from "../CandyMenu/CandyMenu";
import { useGameStore } from "../game/state/gameStore";
import { WeaponHUD } from "./components/WeaponHUD";
import "./App.css";

export function App() {
  const { isPlaying } = useGameStore();

  return (
    <div className="app">
      <GameCanvas />
      {!isPlaying && (
        <CandyMenu
          onStartGame={() => {
            const { startGame, setPlaying, reset } = useGameStore.getState();
            reset();
            startGame();
            setPlaying(true);
          }}
          onExplore={() => {
            // Not implemented yet
            console.log("Explore WAD clicked");
          }}
        />
      )}
      {isPlaying && (
        <>
          <WeaponHUD />
          <HUD />
        </>
      )}
    </div>
  );
}
