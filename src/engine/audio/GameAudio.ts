/**
 * GameAudio — procedural Web Audio synthesizer for Candy Apocalypse.
 *
 * All sounds are generated via the Web Audio API using oscillators and
 * noise buffers, so no external audio files are needed.
 */

type SoundName =
  | 'shoot_pistol'
  | 'shoot_shotgun'
  | 'shoot_chaingun'
  | 'shoot_chainsaw'
  | 'enemy_hurt'
  | 'enemy_death'
  | 'player_hurt'
  | 'player_death'
  | 'pickup'
  | 'weapon_switch'
  | 'menu_select';

export class GameAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxVolume = 0.6;
  private isMuted = false;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.sfxVolume;
      this.masterGain.connect(this.ctx.destination);
    }
    // Resume if suspended (browser autoplay policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => undefined);
    }
    return this.ctx;
  }

  private out(): GainNode {
    this.getCtx();
    return this.masterGain!;
  }

  /** White noise buffer (1s) */
  private makeNoise(): AudioBufferSourceNode {
    const ctx = this.getCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    return src;
  }

  play(name: SoundName | string): void {
    if (this.isMuted) {
      return;
    }
    try {
      this.synth(name as SoundName);
    } catch {
      // Silently ignore audio errors (common on first interaction)
    }
  }

  private synth(name: SoundName): void {
    switch (name) {
    case 'shoot_pistol':
      this.synthPistol();
      break;
    case 'shoot_shotgun':
      this.synthShotgun();
      break;
    case 'shoot_chaingun':
      this.synthChaingun();
      break;
    case 'shoot_chainsaw':
      this.synthChainsaw();
      break;
    case 'enemy_hurt':
      this.synthEnemyHurt();
      break;
    case 'enemy_death':
      this.synthEnemyDeath();
      break;
    case 'player_hurt':
      this.synthPlayerHurt();
      break;
    case 'player_death':
      this.synthPlayerDeath();
      break;
    case 'pickup':
      this.synthPickup();
      break;
    case 'weapon_switch':
      this.synthWeaponSwitch();
      break;
    case 'menu_select':
      this.synthMenuSelect();
      break;
    }
  }

  /** Pistol: sharp pop — sawtooth burst descending 900→100Hz, 80ms */
  private synthPistol(): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.out());
    osc.start(now);
    osc.stop(now + 0.09);
  }

  /** Shotgun: noise burst + low-pass 350Hz, 0.25s */
  private synthShotgun(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    const noise = this.makeNoise();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3500, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.25);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.out());
    noise.start(now);
    noise.stop(now + 0.26);
  }

  /** Chaingun: tight rapid tick — square wave 280Hz */
  private synthChaingun(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 280;
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.out());
    osc.start(now);
    osc.stop(now + 0.055);
  }

  /** Chainsaw: buzzing sawtooth at 80Hz with vibrato */
  private synthChainsaw(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 80;
    lfo.type = 'sine';
    lfo.frequency.value = 20;
    lfoGain.gain.value = 15;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.out());
    osc.start(now);
    osc.stop(now + 0.13);
    lfo.start(now);
    lfo.stop(now + 0.13);
  }

  /** Enemy hurt: cartoon "Ouch!" — sine 400→150Hz with vibrato, 0.15s */
  private synthEnemyHurt(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.out());
    osc.start(now);
    osc.stop(now + 0.16);
  }

  /** Enemy death: noise burst + descending tone 600→30Hz, 0.4s */
  private synthEnemyDeath(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    // Noise
    const noise = this.makeNoise();
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    noise.connect(noiseGain);
    noiseGain.connect(this.out());
    noise.start(now);
    noise.stop(now + 0.16);

    // Descending tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(this.out());
    osc.start(now);
    osc.stop(now + 0.41);
  }

  /** Player hurt: low buzzing thud, 0.12s */
  private synthPlayerHurt(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.out());
    osc.start(now);
    osc.stop(now + 0.13);
  }

  /** Player death: slow descending sweep 300→20Hz, 0.8s */
  private synthPlayerDeath(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.8);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(gain);
    gain.connect(this.out());
    osc.start(now);
    osc.stop(now + 0.81);
  }

  /** Pickup: rising major arpeggio C4→E4→G4→C5 */
  private synthPickup(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    const notes = [ 261.6, 329.6, 392, 523.3 ];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.06;
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain);
      gain.connect(this.out());
      osc.start(t);
      osc.stop(t + 0.11);
    });
  }

  /** Weapon switch: short 500Hz click */
  private synthWeaponSwitch(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 500;
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.out());
    osc.start(now);
    osc.stop(now + 0.045);
  }

  /** Menu select: rising 700→1000Hz chime */
  private synthMenuSelect(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.out());
    osc.start(now);
    osc.stop(now + 0.16);
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.sfxVolume;
    }
  }

  mute(): void {
    this.isMuted = true;
    if (this.masterGain) {
      this.masterGain.gain.value = 0;
    }
  }

  unmute(): void {
    this.isMuted = false;
    if (this.masterGain) {
      this.masterGain.gain.value = this.sfxVolume;
    }
  }

  toggleMute(): void {
    this.isMuted ? this.unmute() : this.mute();
  }

  dispose(): void {
    this.ctx?.close().catch(() => undefined);
    this.ctx = null;
    this.masterGain = null;
  }
}

let gameAudioInstance: GameAudio | null = null;

export function initializeGameAudio(): GameAudio {
  if (gameAudioInstance) {
    gameAudioInstance.dispose();
  }
  gameAudioInstance = new GameAudio();
  return gameAudioInstance;
}

export function getGameAudio(): GameAudio | null {
  return gameAudioInstance;
}

export function playSound(name: string): void {
  gameAudioInstance?.play(name);
}

/** No-op positional — keep the same interface for callers */
export function playPositionalSound(name: string, _x: number, _y: number, _z: number): void {
  gameAudioInstance?.play(name);
}
