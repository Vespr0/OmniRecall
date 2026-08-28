import { App, TFile } from 'obsidian';

export async function playDrillComboSound(app: App, comboCount: number): Promise<void> {
  if (comboCount <= 0) return;

  // Cap at 6 (streak-6 plays for 6 and all subsequent consecutive correct answers)
  const soundLevel = Math.min(Math.max(1, comboCount), 6);
  
  // Candidates in vault sounds folder
  const candidatePaths = soundLevel === 1 
    ? [
        'sounds/streak.wav', 
        'sounds/streak.mp3', 
        'sounds/streak-1.wav', 
        'sounds/streak-1.mp3',
        'streak.wav',
        'streak.mp3'
      ]
    : [
        `sounds/streak-${soundLevel}.wav`, 
        `sounds/streak-${soundLevel}.mp3`,
        `streak-${soundLevel}.wav`, 
        `streak-${soundLevel}.mp3`
      ];

  for (const soundPath of candidatePaths) {
    const file = app.vault.getAbstractFileByPath(soundPath);
    if (file instanceof TFile) {
      try {
        const resourcePath = app.vault.getResourcePath(file);
        const audio = new Audio(resourcePath);
        audio.volume = 0.5; // Half volume
        await audio.play();
        return;
      } catch (err) {
        console.error(`Failed to play streak audio: ${soundPath}`, err);
      }
    }
  }

  // Fallback to synthesizer chime if no audio file found
  playSuccessSound();
}

export function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playOscillator = (freq: number, startTime: number, duration: number, type: OscillatorType = 'sine') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.005, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // A nice stimulating major third chime
    playOscillator(523.25, now, 0.4);       // C5
    playOscillator(659.25, now + 0.1, 0.6); // E5
  } catch (e) {
    console.error("Failed to play audio", e);
  }
}

export function playFailSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error("Failed to play audio", e);
  }
}

export function playFlipSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.error("Failed to play audio", e);
  }
}
