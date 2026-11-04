/* interaction.js: feature functions using shared app.js state. */
        function onPointerDown(event) {
            if (event.target !== renderer.domElement) return;

            initAudio(); 
            resetUITimer();
            
            if (document.getElementById('message-container').style.display === 'flex' || 
                document.getElementById('compose-container').style.display === 'flex' ||
                document.getElementById('notebook-container').style.display === 'flex') {
                return;
            }

            pointerDownPos.x = event.clientX;
            pointerDownPos.y = event.clientY;
        }

        function getFloaterAudioGain(group) {
            const worldPosition=new THREE.Vector3();group.getWorldPosition(worldPosition);
            const distance=camera.position.distanceTo(worldPosition),normalized=THREE.MathUtils.clamp(distance/180,0,1);
            return .12+.88*Math.pow(1-normalized,1.45);
        }

        function playSoftFloaterTap(distanceGain=1) {
            if(!audioCtx||audioCtx.state!=='running')return;
            const now=audioCtx.currentTime;
            [740,988].forEach((frequency,index)=>{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='sine';osc.frequency.setValueAtTime(frequency,now+index*.035);gain.gain.setValueAtTime(.0001,now+index*.035);gain.gain.linearRampToValueAtTime(.035*distanceGain,now+index*.035+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+index*.035+.28);osc.connect(gain);gain.connect(audioCtx.destination);osc.start(now+index*.035);osc.stop(now+index*.035+.32);});
        }

        function onPointerUp(event) {
            if (event.target !== renderer.domElement) return;

            if (document.getElementById('message-container').style.display === 'flex' || 
                document.getElementById('compose-container').style.display === 'flex' ||
                document.getElementById('notebook-container').style.display === 'flex') {
                return;
            }

            const dx = event.clientX - pointerDownPos.x;
            const dy = event.clientY - pointerDownPos.y;
            
            if (dx * dx + dy * dy > 400) return;

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const activeFloaters = floaters.filter(f => !f.userData.isSinking);
            let tappedGroup = null;
            let nearestHitDistance = Infinity;
            for (const group of activeFloaters) {
                const intersects = raycaster.intersectObjects(group.children, true);
                if (intersects.length && intersects[0].distance < nearestHitDistance) {
                    nearestHitDistance = intersects[0].distance;
                    tappedGroup = group;
                }
                const hitRadius = group.userData.tapHitRadius || 0;
                if (hitRadius > 0) {
                    const center = group.position.clone();
                    center.y += group.userData.tapHitCenterY || 0;
                    const hitPoint = raycaster.ray.intersectSphere(new THREE.Sphere(center, hitRadius), new THREE.Vector3());
                    if (hitPoint) {
                        const distance = raycaster.ray.origin.distanceTo(hitPoint);
                        if (distance < nearestHitDistance) { nearestHitDistance = distance; tappedGroup = group; }
                    }
                }
            }
            if (tappedGroup) {
                const group = tappedGroup;
                    recordFloaterDiscovery(group);
                    const distanceGain=getFloaterAudioGain(group);
                    if (group.userData.isBottle) {
                        playSoftFloaterTap(distanceGain);
                        showMessage(group.userData.message);
                        group.userData.isSinking = true; 
                        
                        spawnRipple(group.position); 

                        const cork = group.getObjectByName("cork");
                        const letter = group.getObjectByName("letter");
                        const string = group.getObjectByName("string");
                        if (cork) cork.visible = false;
                        if (letter) letter.visible = false;
                        if (string) string.visible = false;

                    } else if (group.userData.isLantern) {
                        playChimeSound(distanceGain);
                        group.userData.glowStartTime = performance.now();
                        group.userData.isGlowing = true;
                        spawnLanternParticles(group.position);
                    } else if (group.userData.isWatch) {
                        playWatchSoundAndShowTime(distanceGain);
                        spawnRipple(group.position);
                        group.userData.rotSpeed += (Math.random() - 0.5) * 0.15;
                    } else if (group.userData.isRecord) {
                        playRecordSound(distanceGain);
                        spawnRipple(group.position);
                        group.userData.rotSpeed += 0.2; 
                    } else if (group.userData.isGlassBall) {
                        playGlassSound(distanceGain);
                        spawnRipple(group.position);
                        group.userData.rotSpeed += (Math.random() - 0.5) * 0.3; 
                    } else if (group.userData.isBoat) {
                        playSoftFloaterTap(distanceGain);
                        showMessage("小さな木の船が、静かな波に揺られている。\n\nこの船にも、まだ見ぬ海の向こうへ続く旅があるのだろう。", false);
                        spawnRipple(group.position);
                        group.userData.rotSpeed += (Math.random() - 0.5) * 0.04;
                    } else {
                        playSoftFloaterTap(distanceGain * .72);
                        group.userData.isPushed = true;
                        group.userData.pushStartTime = performance.now();
                        group.userData.rotSpeed += (Math.random() - 0.5) * 0.1; 
                    }
            }
        }

        function showMessage(text, countBottle = true) {
            const msgText = document.getElementById('message-text');
            if (msgText) msgText.innerText = text;
            
            const msgContainer = document.getElementById('message-container');
            if (msgContainer) msgContainer.style.display = 'flex';
            
            // ノートに記録
            if (!readMessagesList.includes(text)) {
                readMessagesList.push(text);
            }
            
            // 瓶のメッセージを読んだ場合だけカウンターを増やす
            if (countBottle) {
                readBottlesCount++;
                const counterElement = document.getElementById('bottle-counter');
                if (counterElement) {
                    counterElement.innerHTML = '🍾 <span class="bottle-count-num">' + readBottlesCount + '</span>';
                    counterElement.style.textShadow = '0 0 15px rgba(255, 255, 255, 1)';
                    setTimeout(() => {
                        counterElement.style.textShadow = '0px 2px 4px rgba(0, 0, 0, 0.9)';
                    }, 500);
                }
            }
            saveProgress();
        }
