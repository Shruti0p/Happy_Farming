import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

function createWindNoise(ctx: AudioContext, gainNode: GainNode) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(Math.random(), 3);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(200, ctx.currentTime);
  filter.Q.setValueAtTime(0.5, ctx.currentTime);

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
  lfoGain.gain.setValueAtTime(80, ctx.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  source.connect(filter);
  filter.connect(gainNode);
  source.start();

  return () => {
    source.stop();
    lfo.stop();
  };
}

function createBirdChirps(ctx: AudioContext, gainNode: GainNode) {
  const intervals: number[] = [];
  for (let i = 0; i < 5; i++) {
    const interval = setInterval(() => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(gainNode);
      osc.type = 'sine';
      const freq = 1800 + Math.random() * 1200;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq + 200 + Math.random() * 400, ctx.currentTime + 0.05);
      osc.frequency.exponentialRampToValueAtTime(freq - 100, ctx.currentTime + 0.1);
          g.gain.setValueAtTime(0.05, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    }, 3000 + Math.random() * 5000);
    intervals.push(interval);
  }
  return () => intervals.forEach(clearInterval);
}

function createCrickets(ctx: AudioContext, gainNode: GainNode) {
  const interval = setInterval(() => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g);
        g.connect(gainNode);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(4000 + Math.random() * 1000, ctx.currentTime);
        g.gain.setValueAtTime(0.01, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.04);
      }, i * 80);
    }
  }, 800);

  return () => clearInterval(interval);
}

export function AmbientSound() {
  const { gl } = useThree();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.15, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const cleanups: (() => void)[] = [];

    const onInteraction = () => {
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    };
    document.addEventListener('click', onInteraction);

    setTimeout(() => {
      cleanups.push(createWindNoise(ctx, masterGain));
      cleanups.push(createBirdChirps(ctx, masterGain));
      cleanups.push(createCrickets(ctx, masterGain));
    }, 500);

    return () => {
      cleanups.forEach(fn => fn());
      document.removeEventListener('click', onInteraction);
      ctx.close();
    };
  }, []);

  return null;
}
