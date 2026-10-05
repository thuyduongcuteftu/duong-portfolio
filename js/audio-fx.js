/**
 * WEB AUDIO API SYNTHESIZER
 * Airport Boarding Chime & Jet Aerodynamic Sound Effects
 * Zero external audio files required.
 */

class SoundFXEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  setMuted(muted) {
    this.isMuted = muted;
  }

  /**
   * Classic Airport Ding-Dong Boarding Chime
   */
  playAirportChime() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // First Tone: F5 (698.46 Hz)
    this.playTone(ctx, 698.46, now, 0.8, 0.22);

    // Second Tone: C5 (523.25 Hz) after 0.38s
    this.playTone(ctx, 523.25, now + 0.38, 1.2, 0.24);
  }

  playTone(ctx, freq, startTime, duration, masterGain) {
    // Primary Tone Oscillator (Sine wave for pure chime)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Subtle Overtone Harmonic (Triangle wave for rich bell ring)
    const harmonic = ctx.createOscillator();
    harmonic.type = 'triangle';
    harmonic.frequency.setValueAtTime(freq * 2, startTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(masterGain, startTime + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    const harmGain = ctx.createGain();
    harmGain.gain.setValueAtTime(0.001, startTime);
    harmGain.gain.exponentialRampToValueAtTime(masterGain * 0.3, startTime + 0.03);
    harmGain.gain.exponentialRampToValueAtTime(0.001, startTime + (duration * 0.6));

    osc.connect(gainNode);
    harmonic.connect(harmGain);
    harmGain.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    harmonic.start(startTime);

    osc.stop(startTime + duration + 0.05);
    harmonic.stop(startTime + duration + 0.05);
  }

  /**
   * Aerodynamic Jet Whoosh Sound
   */
  playTakeoffWhoosh() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 2.5;

    // Filtered noise generator
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.45;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass Filter sweeping up and down gently
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2.5;
    filter.frequency.setValueAtTime(280, now);
    filter.frequency.exponentialRampToValueAtTime(1100, now + 1.1);
    filter.frequency.exponentialRampToValueAtTime(320, now + duration);

    // Gain Envelope
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.16, now + 0.9);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration + 0.05);
  }
}

window.SoundFXEngine = SoundFXEngine;
