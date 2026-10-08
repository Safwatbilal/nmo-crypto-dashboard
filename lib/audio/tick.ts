let context: AudioContext | null = null;

/**
 * Plays a short, soft sweep synthesised with the Web Audio API, so no audio
 * asset has to be shipped. Must be called from a user gesture (e.g. a click).
 */
function playSweep(from: number, to: number, duration: number, volume: number) {
  if (typeof window === "undefined" || !window.AudioContext) return;

  try {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(from, now);
    oscillator.frequency.exponentialRampToValueAtTime(to, now + duration * 0.7);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.01);
  } catch {
    // Audio is a nicety; never let it break the interaction.
  }
}

/** Bright, high "tick" for a successful add. */
export function playTick() {
  playSweep(1320, 880, 0.12, 0.18);
}

/** Lower, falling "tock" for a removal. */
export function playRemove() {
  playSweep(520, 260, 0.16, 0.16);
}
