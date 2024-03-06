import { createContext, useContext } from 'react';
import { SAMPLE_RATE } from './doom/interfaces/sound';

const audioContext = createContext(new window.AudioContext({
  sampleRate: SAMPLE_RATE,
}))

export const useAudio = () => useContext(audioContext)
