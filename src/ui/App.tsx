import { GameCanvas } from "./components/GameCanvas";
import { HUD } from "./components/HUD";
import { MainMenu } from "./components/MainMenu";
import { useGameStore } from "../game/state/gameStore";
import "./App.css";

export function App() {
  const { isPlaying } = useGameStore();

  return (
    <div className="app">
      <GameCanvas />
      {!isPlaying && <MainMenu />}
      {isPlaying && <HUD />}
    </div>
  );
}
