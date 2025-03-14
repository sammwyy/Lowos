export class AudioDriver {
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new AudioContext();
  }

  playBeep(
    frequency: number = 440,
    duration: number = 0.1,
    volume: number = 0.1
  ) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = "square";
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;

    oscillator.start();

    setTimeout(() => {
      oscillator.stop();
    }, duration * 1000);
  }

  playSound(
    type: OscillatorType,
    frequency: number,
    duration: number,
    volume: number = 0.1
  ) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;

    oscillator.start();

    setTimeout(() => {
      oscillator.stop();
    }, duration * 1000);
  }
}
