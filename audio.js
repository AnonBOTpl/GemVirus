// audio.js
let audioCtx;
function initAudio() {
    if (!settings.sound) return; // Wyciszenie
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
}

function playSound(type, combo = 1) {
    if (!settings.sound || !audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    switch(type) {
        case 'click':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, now);
            oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.05);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            oscillator.start(now); oscillator.stop(now + 0.05); break;
        case 'swap':
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(300, now);
            oscillator.frequency.linearRampToValueAtTime(400, now + 0.1);
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.1);
            oscillator.start(now); oscillator.stop(now + 0.1); break;
        case 'match':
            oscillator.type = 'sine';
            const freq = 400 + (combo * 100); 
            oscillator.frequency.setValueAtTime(freq, now);
            oscillator.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.1);
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            oscillator.start(now); oscillator.stop(now + 0.3); break;
        case 'explosion': 
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(100, now);
            oscillator.frequency.exponentialRampToValueAtTime(10, now + 0.4);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            oscillator.start(now); oscillator.stop(now + 0.4); break;
        case 'electric': 
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.linearRampToValueAtTime(200, now + 0.6);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.6);
            oscillator.start(now); oscillator.stop(now + 0.6); break;
        case 'ice': 
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(1200, now);
            oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            oscillator.start(now); oscillator.stop(now + 0.1); break;
        case 'gameover':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(300, now);
            oscillator.frequency.exponentialRampToValueAtTime(50, now + 1);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 1);
            oscillator.start(now); oscillator.stop(now + 1); break;
        case 'error':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(150, now);
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            oscillator.start(now); oscillator.stop(now + 0.15); break;
    }
}