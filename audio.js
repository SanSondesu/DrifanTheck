/* audio.js: feature functions using shared app.js state. */
        async function initAudio() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return; 
                
                if (!audioCtx) {
                    audioCtx = new AudioContext();
                    const bufferSize = audioCtx.sampleRate * 2; 
                    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                    const output = noiseBuffer.getChannelData(0);
                    
                    let lastOut = 0;
                    for (let i = 0; i < bufferSize; i++) {
                        const white = Math.random() * 2 - 1;
                        output[i] = (lastOut + (0.02 * white)) / 1.02;
                        lastOut = output[i];
                        output[i] *= 3.5; 
                    }
                    
                    noiseNode = audioCtx.createBufferSource();
                    noiseNode.buffer = noiseBuffer;
                    noiseNode.loop = true;
                    
                    biquadFilter = audioCtx.createBiquadFilter();
                    biquadFilter.type = "lowpass";
                    biquadFilter.frequency.value = 400; 
                    
                    gainNode = audioCtx.createGain();
                    gainNode.gain.value = 0; 
                    
                    noiseNode.connect(biquadFilter);
                    biquadFilter.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    
                    noiseNode.start();
                    
                    playWaveSound();
                    scheduleNextWave();
                }

                if (audioCtx.state === 'suspended' || audioCtx.state === 'interrupted') {
                    await audioCtx.resume();
                }
                
                const instruction = document.getElementById('instruction');
                if (instruction && instruction.style.opacity !== '0') {
                    instruction.style.opacity = '0';
                    setTimeout(() => { instruction.style.display = 'none'; }, 1000);
                }
            } catch(e) {
                console.error("Audio init failed", e);
            }
        }

        function scheduleNextWave() {
            if(!audioCtx) return;
            const interval = ((window.DrifanConfig && DrifanConfig.audio.waveIntervalMin) || 6600) + Math.random() * ((window.DrifanConfig && DrifanConfig.audio.waveIntervalRange) || 1000); 
            setTimeout(() => {
                playWaveSound();
                scheduleNextWave();
            }, interval);
        }

        function playChimeSound(distanceGain = 1) {
            if(!audioCtx) return;
            if(audioCtx.state === 'suspended' || audioCtx.state === 'interrupted') {
                audioCtx.resume().catch(e => console.log("Audio resume prevented:", e));
            }
            const now = audioCtx.currentTime;
            // A soft, layered bell tone with a complete natural decay.
            const partials = [
                { frequency: 1046.5, gain: 0.105, decay: 3.15, delay: 0.00 },
                { frequency: 1568.0, gain: 0.048, decay: 2.65, delay: 0.018 },
                { frequency: 2093.0, gain: 0.024, decay: 3.55, delay: 0.042 }
            ];

            partials.forEach(partial => {
                const start = now + partial.delay;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(partial.frequency * (0.997 + Math.random() * 0.006), start);
                gain.gain.setValueAtTime(0.0001, start);
                gain.gain.linearRampToValueAtTime(partial.gain * distanceGain, start + 0.014);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + partial.decay);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(start);
                osc.stop(start + partial.decay + 0.14);
            });
        }

        function playWhaleSound() {
            if(!audioCtx || audioCtx.state !== 'running') return;
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(120, now); 
            osc.frequency.exponentialRampToValueAtTime(60, now + 5.0);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.3, now + 2.0); 
            gain.gain.linearRampToValueAtTime(0.3, now + 4.0);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 7.0); 
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(now);
            osc.stop(now + 7.0);
        }

        function playWatchSoundAndShowTime(distanceGain = 1) {
            if(!audioCtx) return;
            if(audioCtx.state === 'suspended') audioCtx.resume();
            
            const now = new Date();
            const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
            showMessage("古い時計の針が、静かに時を刻んでいる。\n\n[ " + timeStr + " ]");

            let count = 0;
            const tick = () => {
                if(count >= 12 || audioCtx.state !== 'running') {
                    clearInterval(watchSoundInterval);
                    return;
                }
                const t = audioCtx.currentTime;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                const filter = audioCtx.createBiquadFilter();
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(count % 2 === 0 ? 900 : 1200, t);
                
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(1500, t);
                
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.05 * distanceGain, t + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.start(t);
                osc.stop(t + 0.1);
                count++;
            };
            
            clearInterval(watchSoundInterval);
            tick();
            watchSoundInterval = setInterval(tick, 1000);
        }

        function playRecordSound(distanceGain = 1) {
            if(!audioCtx || audioCtx.state !== 'running') return;
            const now = audioCtx.currentTime;
            
            showMessage("古いレコード盤から、\n波の音に混じってノスタルジックなメロディが聴こえる…");

            const noiseOsc = audioCtx.createOscillator();
            noiseOsc.type = 'sawtooth';
            noiseOsc.frequency.setValueAtTime(50, now);
            const noiseFilter = audioCtx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(6000, now);
            const noiseGain = audioCtx.createGain();
            noiseGain.gain.setValueAtTime(0.01 * distanceGain, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 8.0);
            
            noiseOsc.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(audioCtx.destination);
            noiseOsc.start(now);
            noiseOsc.stop(now + 8.0);

            const notes = [329.63, 392.00, 440.00, 523.25, 659.25, 587.33, 440.00, 392.00]; 
            let startTime = now;
            
            for(let i = 0; i < notes.length; i++) {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                const filter = audioCtx.createBiquadFilter();
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(notes[i], startTime);
                
                const lfo = audioCtx.createOscillator();
                lfo.type = 'sine';
                lfo.frequency.setValueAtTime(2.5, startTime);
                const lfoGain = audioCtx.createGain();
                lfoGain.gain.setValueAtTime(6, startTime); 
                lfo.connect(lfoGain);
                lfoGain.connect(osc.frequency);
                lfo.start(startTime);
                lfo.stop(startTime + 1.5);
                
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(600, startTime);
                
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.08 * distanceGain, startTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);
                
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.start(startTime);
                osc.stop(startTime + 1.5);
                
                startTime += 0.8 + Math.random() * 0.2; 
            }
        }

        function playGlassSound(distanceGain = 1) {
            if(!audioCtx || audioCtx.state !== 'running') return;
            const now = audioCtx.currentTime;

            showMessage("波に揺られて、\nガラスの浮き玉が「カラン…」と涼しげな音を立てた。");

            // Two soft, consonant C-major glass chimes: "ta-tan...".
            // Keep every partial at or below 3000 Hz for a gentler, less piercing tone.
            const strikes = [
                { delay: 0.00, frequencies: [1046.5, 1318.5, 1568, 2093], level: 0.048, decay: 0.88 },
                { delay: 0.065, frequencies: [1318.5, 1568, 2093, 2637], level: 0.043, decay: 1.16 }
            ];

            strikes.forEach(strike => {
                strike.frequencies.forEach((frequency, index) => {
                    const start = now + strike.delay + index * 0.008;
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(frequency * (0.999 + Math.random() * 0.002), start);
                    gain.gain.setValueAtTime(0.0001, start);
                    gain.gain.linearRampToValueAtTime((strike.level / (1 + index * 0.65)) * distanceGain, start + 0.009);
                    gain.gain.exponentialRampToValueAtTime(0.0001, start + strike.decay * (1 + index * 0.12));
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(start);
                    osc.stop(start + strike.decay * (1 + index * 0.12) + 0.12);
                });
            });
        }

        async function playWaveSound() {
            if(!audioCtx) return;
            if(audioCtx.state === 'suspended' || audioCtx.state === 'interrupted') {
                try {
                   await audioCtx.resume();
                } catch(e) {
                   console.log("Audio resume prevented:", e);
                }
            }
            const now = audioCtx.currentTime;
            
            gainNode.gain.cancelScheduledValues(now);
            biquadFilter.frequency.cancelScheduledValues(now);
            
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            biquadFilter.frequency.setValueAtTime(biquadFilter.frequency.value, now);
            
            gainNode.gain.linearRampToValueAtTime(0.035 + Math.random() * 0.02, now + 1.5);
            biquadFilter.frequency.linearRampToValueAtTime(600 + Math.random() * 200, now + 1.5);
            
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 4.5);
            biquadFilter.frequency.exponentialRampToValueAtTime(200, now + 4.5);
            gainNode.gain.setValueAtTime(0, now + 4.6);
        }
