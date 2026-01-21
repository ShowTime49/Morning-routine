// Audio context for playing sounds
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

// Generate sounds programmatically
export const playTone = (frequency: number, duration: number, volume: number, type: OscillatorType = 'sine') => {
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    } catch (err) {
        console.error('Audio playback failed', err);
    }
};

export const playCompleteSound = (volume: number) => {
    // Pleasant ascending chime
    playTone(523.25, 0.15, volume); // C5
    setTimeout(() => playTone(659.25, 0.15, volume), 100); // E5
    setTimeout(() => playTone(783.99, 0.3, volume), 200); // G5
};

export const playAlarmSound = (volume: number) => {
    // Gentle wake-up melody
    playTone(440, 0.2, volume); // A4
    setTimeout(() => playTone(523.25, 0.2, volume), 250); // C5
    setTimeout(() => playTone(659.25, 0.2, volume), 500); // E5
    setTimeout(() => playTone(783.99, 0.4, volume), 750); // G5
};

export const playUrgentSound = (volume: number) => {
    // Attention-grabbing alert
    playTone(880, 0.1, volume, 'square'); // A5
    setTimeout(() => playTone(988, 0.1, volume, 'square'), 150); // B5
    setTimeout(() => playTone(880, 0.1, volume, 'square'), 300); // A5
    setTimeout(() => playTone(988, 0.1, volume, 'square'), 450); // B5
};

export const speak = (message: string) => {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1.0;
        utterance.pitch = 1.1; // Slightly higher pitch for child-friendly tone
        window.speechSynthesis.speak(utterance);
    }
};
