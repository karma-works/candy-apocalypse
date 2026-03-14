const MUSIC_TRACKS = [
  `${import.meta.env.BASE_URL}assets/music/Moorhuhn_Mania_Schiess_los_.mp3`,
  `${import.meta.env.BASE_URL}assets/music/Die_Süße_Apokalypse.mp3`,
  `${import.meta.env.BASE_URL}assets/music/Sugar_Rush_Apocalypse.mp3`,
];

class MusicManager {
  private audio: HTMLAudioElement | null = null;
  private currentTrackIndex = -1;
  private _enabled = true;
  private volume = 0.5;

  get enabled(): boolean {
    return this._enabled;
  }

  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
    if (this.audio) {
      this.audio.muted = !enabled;
    }
    if (!enabled) {
      this.stop();
    }
  }

  private pickRandomTrack(): number {
    let index: number;
    do {
      index = Math.floor(Math.random() * MUSIC_TRACKS.length);
    } while (index === this.currentTrackIndex && MUSIC_TRACKS.length > 1);
    return index;
  }

  playRandomTrack(): void {
    if (!this._enabled) {
      return;
    }

    this.stop();

    this.currentTrackIndex = this.pickRandomTrack();
    this.audio = new Audio(MUSIC_TRACKS[this.currentTrackIndex]);
    this.audio.volume = this.volume;
    this.audio.muted = !this._enabled;
    this.audio.loop = true;
    this.audio.play().catch(() => undefined);
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  dispose(): void {
    this.stop();
  }
}

export const musicManager = new MusicManager();
