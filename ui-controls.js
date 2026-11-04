/* ui-controls.js: feature functions using shared app.js state. */
        function setupUI() {
            const writeBtn = document.getElementById('write-btn');
            if (writeBtn) writeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                initAudio(); 
                document.getElementById('compose-container').style.display = 'flex';
            });
            
            const notebookBtn = document.getElementById('notebook-btn');
            if (notebookBtn) notebookBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                initAudio();
                updateNotebookUI();
                document.getElementById('notebook-container').style.display = 'flex';
                animatePreview();
                // 表示直後にリサイズを走らせることでCanvasサイズを確実に合わせる
                setTimeout(resizePreview, 20);
            });

            const uiToggleBtn = document.getElementById('ui-toggle-btn');
            const uiContainer = document.getElementById('ui-container');
            if (uiToggleBtn && uiContainer) {
                uiToggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    initAudio();
                    uiContainer.classList.toggle('collapsed');
                    resetUITimer();
                });
            }
            
            const cancelBtn = document.getElementById('cancel-btn');
            if (cancelBtn) cancelBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('compose-container').style.display = 'none';
                document.getElementById('compose-textarea').value = '';
            });

            const closeMsgBtn = document.getElementById('close-msg-btn');
            if (closeMsgBtn) closeMsgBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('message-container').style.display = 'none';
            });
            
            const closeNbBtn = document.getElementById('close-notebook-btn');
            if (closeNbBtn) closeNbBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('notebook-container').style.display = 'none';
                stopPreviewAnimation();
            });
            
            const sendBtn = document.getElementById('send-btn');
            if (sendBtn) sendBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const textarea = document.getElementById('compose-textarea');
                const text = textarea ? textarea.value.trim() : '';
                if (text) {
                    createNewBottle(text);
                    document.getElementById('compose-container').style.display = 'none';
                    if (textarea) textarea.value = '';
                }
            });
            
            ['ui-container', 'message-container', 'compose-container', 'notebook-container'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('pointerdown', (e) => {
                        e.stopPropagation();
                    });
                }
            });
            
            initCircularSlider();
            initDialPicker();
            initPreview();
        }

        function initDialPicker() {
            const hText = document.getElementById('hour-text');
            const mText = document.getElementById('minute-text');
            const dialPicker = document.getElementById('dial-picker');
            const dialContainer = document.querySelector('.dial-wheel-container');
            
            if (hText) {
                hText.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openDial('hour');
                });
                hText.addEventListener('pointerdown', e => e.stopPropagation());
            }
            if (mText) {
                mText.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openDial('minute');
                });
                mText.addEventListener('pointerdown', e => e.stopPropagation());
            }
            
            if (dialPicker) {
                dialPicker.addEventListener('click', (e) => {
                    if (e.target !== dialContainer && !e.target.closest('#dial-wheel')) {
                        confirmDial();
                    }
                });
            }
            
            if (dialContainer) {
                dialContainer.addEventListener('scroll', () => {
                    const centerIndex = Math.round(dialContainer.scrollTop / 26);
                    const lis = document.getElementById('dial-wheel').querySelectorAll('li');
                    lis.forEach((li, idx) => {
                        if (idx === centerIndex) {
                            li.style.color = '#fff';
                            li.style.fontSize = '1.3rem';
                            li.style.fontWeight = 'bold';
                        } else {
                            li.style.color = 'rgba(255,255,255,0.3)';
                            li.style.fontSize = '1.1rem';
                            li.style.fontWeight = 'normal';
                        }
                    });
                });
                
                dialContainer.addEventListener('click', (e) => {
                    if(e.target === dialContainer || e.target.classList.contains('dial-selector')) {
                        confirmDial();
                    }
                });
            }
        }

        function openDial(mode) {
            isHourMode = (mode === 'hour');
            const picker = document.getElementById('dial-picker');
            const wheel = document.getElementById('dial-wheel');
            
            wheel.innerHTML = '';
            const max = isHourMode ? 24 : 60; 
            
            for (let i = 0; i < max; i++) {
                const li = document.createElement('li');
                li.innerText = i.toString().padStart(2, '0');
                li.addEventListener('click', (e) => {
                    e.stopPropagation();
                    confirmDial(i);
                });
                wheel.appendChild(li);
            }
            
            picker.style.display = 'flex';
            
            setTimeout(() => {
                const container = document.querySelector('.dial-wheel-container');
                const targetValue = isHourMode ? currentHours : currentMinutes;
                container.scrollTop = targetValue * 26;
                container.dispatchEvent(new Event('scroll'));
            }, 10);
        }

        function confirmDial(selectedValue) {
            const container = document.querySelector('.dial-wheel-container');
            let val = selectedValue !== undefined ? selectedValue : Math.round(container.scrollTop / 26);
            
            if (isHourMode) {
                currentHours = val;
            } else {
                currentMinutes = val;
            }
            
            let newProgress = (currentHours + currentMinutes / 60) / 24;
            setSliderToProgress(newProgress);
            saveProgress();
            
            document.getElementById('dial-picker').style.display = 'none';
        }
        
        let isDraggingSlider = false;

        function initCircularSlider() {
            const circularSlider = document.getElementById('circular-slider');
            if (!circularSlider) return;

            circularSlider.addEventListener('pointerdown', (e) => {
                isDraggingSlider = true;
                updateSliderFromEvent(e);
                e.stopPropagation();
                initAudio();
                resetUITimer();
            });
            
            window.addEventListener('pointermove', (e) => {
                if (!isDraggingSlider) return;
                updateSliderFromEvent(e);
                resetUITimer();
            });
            
            window.addEventListener('pointerup', () => {
                if (isDraggingSlider) saveProgress();
                isDraggingSlider = false;
            });
        }

        function setSliderToProgress(progress) {
            const totalMinutes = ((progress % 1) + 1) % 1 * 1440;
            const clockAngle = ((totalMinutes % 720) / 720) * Math.PI * 2 - Math.PI / 2;
            updateSliderThumb(clockAngle, progress);
            updateTimeOfDay(progress);
        }

        function updateSliderFromEvent(e) {
            const circularSlider = document.getElementById('circular-slider');
            if (!circularSlider) return;
            const rect = circularSlider.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const angle = Math.atan2(e.clientY - cy, e.clientX - cx);

            // 文字盤の角度を12時間時計として読み取り、現在の午前/午後を維持する
            let clockProgress = (angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
            let minutesInHalfDay = clockProgress / (Math.PI * 2) * 720;
            let totalMinutes = minutesInHalfDay + (currentHours >= 12 ? 720 : 0);
            const progress = totalMinutes / 1440;

            updateSliderThumb(angle, progress);
            updateTimeOfDay(progress);
        }

        function updateSliderThumb(angle, progress) {
            const sliderThumb = document.getElementById('slider-thumb');
            const timeDisplay = document.getElementById('time-display');
            if (!sliderThumb || !timeDisplay) return;

            let totalMinutes = (((progress % 1) + 1) % 1) * 1440;
            const hours = Math.floor(totalMinutes / 60) % 24;
            const minutes = Math.floor(totalMinutes % 60);
            const exactMinutesInHalfDay = totalMinutes % 720;
            const handAngle = (exactMinutesInHalfDay / 720) * Math.PI * 2 - Math.PI / 2;
            const r = 50;
            const thumbX = 50 + Math.cos(handAngle) * r;
            const thumbY = 50 + Math.sin(handAngle) * r;

            sliderThumb.style.left = thumbX + 'px';
            sliderThumb.style.top = thumbY + 'px';

            currentHours = hours;
            currentMinutes = minutes;

            // つまみと時計の針を同じ12時間角度から計算して、常に位置を一致させる
            const hourHand = document.getElementById('hour-hand');
            const minuteHand = document.getElementById('minute-hand');
            const minuteAngle = (totalMinutes % 60) * 6;
            const hourAngle = (exactMinutesInHalfDay / 720) * 360;
            if (hourHand) hourHand.style.transform = 'translate(-50%, -100%) rotate(' + hourAngle + 'deg)';
            if (minuteHand) minuteHand.style.transform = 'translate(-50%, -100%) rotate(' + minuteAngle + 'deg)';

            const hText = document.getElementById('hour-text');
            const mText = document.getElementById('minute-text');
            if (hText) hText.innerText = hours.toString().padStart(2, '0');
            if (mText) mText.innerText = minutes.toString().padStart(2, '0');
        }
