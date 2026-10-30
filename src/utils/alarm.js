export const playSiren = (tone = 'classic') => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Safe volume

    let intervalId;

    if (tone === 'classic') {
      // 1. Classic Hollywood Siren
      osc.type = 'sawtooth';
      let freq = 400, up = true;
      intervalId = setInterval(() => {
        freq += up ? 50 : -50;
        if (freq > 800) up = false;
        if (freq < 400) up = true;
        if (osc.frequency) osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      }, 100);
    } else if (tone === 'digital') {
      // 2. Fast Digital Beeps (High Tech)
      osc.type = 'square';
      let freq = 800;
      intervalId = setInterval(() => {
        freq = freq === 800 ? 1200 : 800;
        if (osc.frequency) osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      }, 200);
    } else if (tone === 'nuclear') {
      // 3. Low Frequency Nuclear Pulse
      osc.type = 'triangle';
      let freq = 300;
      intervalId = setInterval(() => {
        freq = freq === 300 ? 350 : 300;
        if (osc.frequency) osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      }, 500);
    }

    osc.start();

    // Auto stop this burst after 3 seconds
    setTimeout(() => {
      clearInterval(intervalId);
      osc.stop();
      audioCtx.close();
    }, 3000);

  } catch (e) {
    console.log("Audio Context blocked", e);
  }
};