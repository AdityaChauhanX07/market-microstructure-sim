import * as Tone from 'tone';

class SoundManager {
  constructor() {
    this.isStarted = false;
    this.isMuted = false;

    // Synthesizer for trade sounds
    this.tradeSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
    }).toDestination();

    // Synthesizer for ambient market noise
    const filter = new Tone.Filter(400, "lowpass").toDestination();
    this.ambientNoise = new Tone.Noise("pink").connect(filter);
    this.ambientNoise.volume.value = -40; // Start very quiet
  }

  // Audio must be started by a user action (e.g., a click)
  async start() {
    if (!this.isStarted) {
      await Tone.start();
      this.ambientNoise.start();
      this.isStarted = true;
      console.log("Audio context started.");
    }
  }

  playTradeSound(side) {
    if (!this.isStarted || this.isMuted) return;
    const pitch = side === 'buy' ? 'G4' : 'C4';
    this.tradeSynth.triggerAttackRelease(pitch, '8n');
  }

  updateAmbientNoise(volume) {
    if (!this.isStarted || this.isMuted) return;
    // Map trade volume to audio volume (logarithmically)
    const newVolume = -40 + Math.log(volume + 1) * 2;
    this.ambientNoise.volume.rampTo(newVolume, 0.5);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      Tone.Destination.mute = true;
    } else {
      Tone.Destination.mute = false;
    }
    return this.isMuted;
  }
}

// Export a single instance of the sound manager
const soundManager = new SoundManager();
export default soundManager;