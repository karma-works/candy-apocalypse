import { useNavigate } from "react-router-dom";
import CandyMenu from "../CandyMenu";
import { useAudio } from "../AudioContext";

export default function StartUp() {
  const navigate = useNavigate();
  const audioCtx = useAudio();

  const handleStartGame = () => {
    audioCtx.resume();
    navigate("/play?iwad=doom1.wad&episode=1&map=1");
  };

  const handleExplore = () => {
    audioCtx.resume();
    navigate("/explorer?iwad=doom1.wad");
  };

  return <CandyMenu onStartGame={handleStartGame} onExplore={handleExplore} />;
}
