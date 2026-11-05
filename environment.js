/* environment.js: feature functions using shared app.js state. */
        function createSunAndMoon() {
            const sunGeo = new THREE.SphereGeometry(35, 32, 32); 
            const sunMat = new THREE.MeshBasicMaterial({
                color: 0xffffee,
                transparent: true,
                opacity: 1,
                fog: false
            });
            sunMesh = new THREE.Mesh(sunGeo, sunMat);
            scene.add(sunMesh);

            const moonGeo = new THREE.SphereGeometry(35, 32, 32);
            const moonMat = new THREE.MeshBasicMaterial({
                color: 0xeeffff,
                transparent: true,
                opacity: 0,
                fog: false
            });
            moonMesh = new THREE.Mesh(moonGeo, moonMat);
            scene.add(moonMesh);
        }

        function createStars() {
            const starsGeometry = new THREE.BufferGeometry();
            const starsCount = DrifanConfig.population.stars; 
            const posArray = new Float32Array(starsCount * 3);
            const colorArray = new Float32Array(starsCount * 3);
            const sizeArray = new Float32Array(starsCount);
            const phaseArray = new Float32Array(starsCount);

            for(let i = 0; i < starsCount; i++) {
                let x, y, z;
                do {
                    x = (Math.random() - 0.5) * 2;
                    y = (Math.random() - 0.5) * 2;
                    z = (Math.random() - 0.5) * 2;
                } while (y < 0.05 || (x*x + y*y + z*z) > 1);
                
                const baseDist = 1500 + Math.random() * 1500;
                const normalize = baseDist / Math.sqrt(x*x + y*y + z*z);
                
                posArray[i*3] = x * normalize;
                posArray[i*3+1] = y * normalize;
                posArray[i*3+2] = z * normalize;
                
                const starType = Math.random();
                let color = new THREE.Color();
                if(starType > 0.90) color.setHex(0xb0d5ff); 
                else if(starType > 0.75) color.setHex(0xffe2be); 
                else if(starType > 0.50) color.setHex(0xffffff); 
                else color.setHex(0x88bbff); 
                
                const brightness = 0.15 + Math.random() * 0.35;
                colorArray[i*3] = color.r * brightness;
                colorArray[i*3+1] = color.g * brightness;
                colorArray[i*3+2] = color.b * brightness;
                
                sizeArray[i] = 1.5 + Math.random() * 3.5;
                phaseArray[i] = Math.random() * Math.PI * 2;
            }

            starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            starsGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
            starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));
            starsGeometry.setAttribute('phase', new THREE.BufferAttribute(phaseArray, 1));

            const starsMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    globalOpacity: { value: 0 },
                    pixelRatio: { value: renderer.getPixelRatio() }
                },
                vertexShader: `
                    attribute float size;
                    attribute float phase;
                    varying vec3 vColor;
                    varying float vPhase;
                    uniform float pixelRatio;
                    
                    void main() {
                        vColor = color;
                        vPhase = phase;
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = size * pixelRatio * (800.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform float globalOpacity;
                    varying vec3 vColor;
                    varying float vPhase;
                    
                    void main() {
                        float twinkle = (sin(time * 2.5 + vPhase) + 1.0) * 0.5;
                        float alpha = (0.3 + 0.7 * twinkle) * globalOpacity;
                        
                        vec2 coord = gl_PointCoord - vec2(0.5);
                        if(length(coord) > 0.5) discard;
                        
                        float dist = length(coord);
                        float core = smoothstep(0.5, 0.0, dist);
                        vec3 finalColor = mix(vColor, vec3(1.0), core * 0.8);
                        
                        gl_FragColor = vec4(finalColor, alpha * core * 0.6);
                    }
                `,
                transparent: true,
                vertexColors: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                fog: false
            });

            stars = new THREE.Points(starsGeometry, starsMaterial);
            scene.add(stars);
        }

        function createShootingStar() {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(6); 
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const material = new THREE.LineBasicMaterial({
                color: 0xddf4ff,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending,
                fog: false
            });

            shootingStar = new THREE.Line(geometry, material);
            scene.add(shootingStar);
        }

        function createParticleTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 32; canvas.height = 32;
            const ctx = canvas.getContext('2d');
            const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            grad.addColorStop(0, 'rgba(255, 230, 180, 1)');
            grad.addColorStop(0.3, 'rgba(255, 150, 50, 0.8)');
            grad.addColorStop(1, 'rgba(255, 100, 0, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 32, 32);
            particleTexture = new THREE.CanvasTexture(canvas);
        }

        function createBioluminescence() {
            const count = 1000;
            const geo = new THREE.BufferGeometry();
            const positions = new Float32Array(count * 3);
            const phases = new Float32Array(count);

            for (let i = 0; i < count; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 400; 
                positions[i * 3 + 1] = 0; 
                positions[i * 3 + 2] = (Math.random() - 0.5) * 300 - 50; 
                phases[i] = Math.random() * Math.PI * 2;
            }
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

            const canvas = document.createElement('canvas');
            canvas.width = 16;
            canvas.height = 16;
            const ctx = canvas.getContext('2d');
            const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
            grad.addColorStop(0, 'rgba(180, 230, 255, 1)');
            grad.addColorStop(0.4, 'rgba(100, 200, 255, 0.9)');
            grad.addColorStop(1, 'rgba(0, 80, 150, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 16, 16);
            const tex = new THREE.CanvasTexture(canvas);

            const mat = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    globalOpacity: { value: 0 },
                    map: { value: tex }
                },
                vertexShader: `
                    attribute float phase;
                    varying float vPhase;
                    uniform float time;
                    void main() {
                        vPhase = phase;
                        vec3 pos = position;
                        float driftX = sin(time * 0.3 + phase * 2.0) * 3.0;
                        float driftZ = cos(time * 0.25 + phase * 1.5) * 3.0;
                        pos.x += driftX;
                        pos.z += driftZ;
                        pos.y = sin(pos.x * 0.15 + time * 1.5 + phase) * 0.15 + cos(pos.z * 0.15 + time * 1.2) * 0.15 - 0.05;
                        
                        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                        gl_PointSize = 20.0 * (10.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    uniform sampler2D map;
                    uniform float time;
                    uniform float globalOpacity;
                    varying float vPhase;
                    void main() {
                        float alpha = (sin(time * 2.5 + vPhase) * 0.4 + 0.6) * globalOpacity * 1.5;
                        vec4 texColor = texture2D(map, gl_PointCoord);
                        gl_FragColor = vec4(texColor.rgb, texColor.a * alpha);
                    }
                `,
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthWrite: false
            });

            bioluminescence = new THREE.Points(geo, mat);
            scene.add(bioluminescence);
        }

        function createWhale() {
            whaleGroup = new THREE.Group();
            
            const bodyGeo = new THREE.SphereGeometry(15, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
            bodyGeo.scale(1, 0.4, 2.5);
            const whaleMat = new THREE.MeshStandardMaterial({
                color: 0x1a2b3c, roughness: 0.8, metalness: 0.1
            });
            const body = new THREE.Mesh(bodyGeo, whaleMat);
            whaleGroup.add(body);
            
            const tailGeo = new THREE.ConeGeometry(8, 15, 4);
            tailGeo.rotateX(Math.PI / 2);
            tailGeo.scale(1, 0.2, 1);
            const tail = new THREE.Mesh(tailGeo, whaleMat);
            tail.position.set(0, -2, 25); 
            tail.rotation.x = -Math.PI / 6;
            whaleGroup.add(tail);
            
            whaleGroup.visible = false;
            scene.add(whaleGroup);
        }

        function createBirds() {
            birdsGroup = new THREE.Group();
            const mat = new THREE.MeshBasicMaterial({ color: 0x050505, side: THREE.DoubleSide, transparent: true, opacity: 0, fog: true });
            
            const wingGeo = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                0, 0, -1.5,    // 頭側 (-Z方向が正面)
                0, 0, 0.5,     // 尻尾側 (+Z)
                4, 0, 0        // 翼の先端 (+X)
            ]);
            wingGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            wingGeo.computeVertexNormals();

            for (let i = 0; i < 7; i++) {
                const bird = new THREE.Group();
                
                const rightWing = new THREE.Mesh(wingGeo, mat);
                const leftWing = new THREE.Mesh(wingGeo, mat);
                leftWing.scale.x = -1;
                
                bird.add(rightWing);
                bird.add(leftWing);
                
                bird.userData = {
                    rightWing: rightWing,
                    leftWing: leftWing,
                    phase: Math.random() * Math.PI * 2,
                    flapSpeed: 10.0 + Math.random() * 5.0,
                    baseY: (Math.random() - 0.5) * 80,
                    orbitRadius: 150 + Math.random() * 120,
                    orbitSpeed: 0.15 + Math.random() * 0.1,
                    orbitPhase: Math.random() * Math.PI * 2,
                    mat: mat
                };
                
                birdsGroup.add(bird);
            }
            
            // 西の空高くに配置
            birdsGroup.position.set(400, 250, 0); 
            scene.add(birdsGroup);
        }

        function triggerWhale(now) {
            isWhaleActive = true;
            whaleStartTime = now;
            lastWhaleTime = now;
            
            const angle = (Math.random() - 0.5) * Math.PI * 0.8 + Math.PI; 
            const dist = 700 + Math.random() * 500; 
            
            whaleGroup.position.set(Math.sin(angle) * dist, -15, Math.cos(angle) * dist);
            whaleGroup.rotation.y = angle + Math.PI / 2;
            whaleGroup.userData.hasSung = false;
            whaleGroup.visible = true;
        }

        function updateWhale(now) {
            if (!whaleGroup) return;
            
            if (!isWhaleActive) {
                if (now - lastWhaleTime > nextWhaleInterval) {
                    triggerWhale(now);
                    nextWhaleInterval = 45000 + Math.random() * 30000; 
                }
                return;
            }
            
            const elapsed = (now - whaleStartTime) * 0.001;
            const t = elapsed / WHALE_DURATION;
            
            if (t >= 1.0) {
                isWhaleActive = false;
                whaleGroup.visible = false;
                return;
            }
            
            const height = Math.sin(t * Math.PI) * 16 - 15;
            whaleGroup.position.y = height;
            whaleGroup.translateZ(-0.6); 
            whaleGroup.rotation.x = Math.cos(t * Math.PI) * 0.2; 
            
            if (elapsed >= 4.0 && elapsed < 4.1 && !whaleGroup.userData.hasSung) {
                playWhaleSound();
                spawnWhaleSpout(whaleGroup.position);
                whaleGroup.userData.hasSung = true;
            }
        }

        function spawnWhaleSpout(originPos) {
            const count = 40;
            for (let i = 0; i < count; i++) {
                const mat = new THREE.MeshBasicMaterial({
                    color: 0xffffff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending
                });
                const mesh = new THREE.Mesh(particleGeo, mat);
                
                mesh.position.copy(originPos);
                mesh.position.z -= 15; 
                mesh.position.y += 2;
                
                const vx = (Math.random() - 0.5) * 0.6;
                const vy = 1.5 + Math.random() * 2.0; 
                const vz = (Math.random() - 0.5) * 0.6;
                
                scene.add(mesh);
                whaleParticles.push({
                    mesh: mesh, vx: vx, vy: vy, vz: vz,
                    life: 1.0, decay: 0.015 + Math.random() * 0.01 
                });
            }
        }

        function spawnRipple(originPos) {
            const mat = new THREE.ShaderMaterial({
                uniforms: {
                    progress: { value: 0.0 },
                    color: { value: new THREE.Color(0xffffff) } 
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float progress;
                    uniform vec3 color;
                    varying vec2 vUv;
                    void main() {
                        vec2 uv = vUv - 0.5;
                        float dist = length(uv) * 2.0; 
                        
                        float ring = 1.0 - smoothstep(0.0, 0.08, abs(dist - progress));
                        float alpha = ring * pow(1.0 - progress, 1.5) * smoothstep(1.0, 0.8, dist);
                        
                        gl_FragColor = vec4(color, alpha * 0.5);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            });

            const geo = new THREE.PlaneGeometry(18, 18); 
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.x = -Math.PI / 2; 
            mesh.position.copy(originPos);
            mesh.position.y = 0.02; 
            scene.add(mesh);

            ripples.push({
                mesh: mesh,
                life: 0.0,
                speed: 0.003 + Math.random() * 0.002 
            });
        }

        function spawnLanternParticles(originPos) {
            const count = 5 + Math.floor(Math.random() * 4); 
            for (let i = 0; i < count; i++) {
                const mat = new THREE.ShaderMaterial({
                    uniforms: { opacity: { value: 1.0 } },
                    vertexShader: `
                        varying vec3 vNormal;
                        varying vec3 vViewPosition;
                        void main() {
                            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                            vViewPosition = -mvPosition.xyz;
                            vNormal = normalize(normalMatrix * normal);
                            gl_Position = projectionMatrix * mvPosition;
                        }
                    `,
                    fragmentShader: `
                        uniform float opacity;
                        varying vec3 vNormal;
                        varying vec3 vViewPosition;
                        void main() {
                            vec3 normal = normalize(vNormal);
                            vec3 viewDir = normalize(vViewPosition);
                            float intensity = max(dot(normal, viewDir), 0.0);
                            intensity = pow(intensity, 2.5);
                            vec3 color = vec3(1.0, 0.45, 0.05);
                            gl_FragColor = vec4(color, intensity * opacity);
                        }
                    `,
                    blending: THREE.NormalBlending,
                    transparent: true,
                    depthWrite: false,
                    side: THREE.FrontSide
                });
                
                const mesh = new THREE.Mesh(particleGeo, mat);
                mesh.position.copy(originPos);
                mesh.position.x += (Math.random() - 0.5) * 1.2;
                mesh.position.y += 0.8 + Math.random() * 0.5;
                mesh.position.z += (Math.random() - 0.5) * 1.2;
                
                const vx = (Math.random() - 0.5) * 0.015;
                const vy = 0.015 + Math.random() * 0.015; 
                const vz = (Math.random() - 0.5) * 0.015;
                
                scene.add(mesh);
                particles.push({
                    mesh: mesh, vx: vx, vy: vy, vz: vz,
                    life: 1.0, decay: 0.008 + Math.random() * 0.01, 
                    phase: Math.random() * Math.PI * 2 
                });
            }
        }

        function triggerShootingStar(now) {
            isShootingStarActive = true;
            shootingStarStartTime = now;
            lastShootingStarTime = now;

            const angle = Math.random() * Math.PI * 2;
            const radius = 1000 + Math.random() * 800;
            const height = 500 + Math.random() * 700;

            shootingStarStartPos.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius - 300
            );

            const dirAngle = angle + Math.PI + (Math.random() - 0.5) * 0.8;
            const length = 500 + Math.random() * 400;
            shootingStarDir.set(
                Math.cos(dirAngle) * length,
                -200 - Math.random() * 250,
                Math.sin(dirAngle) * length
            );
        }

        function updateShootingStar(now) {
            if (!shootingStar) return;

            if (!isShootingStarActive) {
                const isDarkEnough = stars && stars.material.uniforms.globalOpacity.value > 0.2;
                if (isDarkEnough && (now - lastShootingStarTime > nextShootingStarInterval)) {
                    triggerShootingStar(now);
                    if (Math.random() < 0.25) {
                        nextShootingStarInterval = 800 + Math.random() * 2000; 
                    } else {
                        nextShootingStarInterval = 8000 + Math.random() * 30000;
                    }
                }
                return;
            }

            const elapsed = (now - shootingStarStartTime) * 0.001;
            const t = elapsed / SHOOTING_STAR_DURATION;

            if (t >= 1.0) {
                isShootingStarActive = false;
                shootingStar.material.opacity = 0;
                return;
            }

            const headT = t;
            const tailT = Math.max(0, t - 0.28);

            const headPos = shootingStarStartPos.clone().addScaledVector(shootingStarDir, headT);
            const tailPos = shootingStarStartPos.clone().addScaledVector(shootingStarDir, tailT);

            const positions = shootingStar.geometry.attributes.position.array;
            positions[0] = headPos.x;
            positions[1] = headPos.y;
            positions[2] = headPos.z;
            positions[3] = tailPos.x;
            positions[4] = tailPos.y;
            positions[5] = tailPos.z;

            shootingStar.geometry.attributes.position.needsUpdate = true;

            let opacity = 1.0;
            if (t < 0.15) {
                opacity = t / 0.15;
            } else if (t > 0.65) {
                opacity = (1.0 - t) / 0.35;
            }
            
            shootingStar.material.opacity = opacity;
        }

        function updateTimeOfDay(progress) {
            currentProgress = progress;
            
            const hourAngle = (progress - 0.5) * Math.PI * 2;
            const distance = 4000;
            
            const latitude = 35.0; 
            const maxAltitude = (90 - latitude) * Math.PI / 180; 

            sun.x = Math.sin(hourAngle) * distance; 
            sun.y = Math.cos(hourAngle) * Math.sin(maxAltitude) * distance; 
            sun.z = -Math.cos(hourAngle) * Math.cos(maxAltitude) * distance; 
            
            moon.x = Math.sin(hourAngle + Math.PI) * distance;
            moon.y = Math.cos(hourAngle + Math.PI) * Math.sin(maxAltitude) * distance;
            moon.z = -Math.cos(hourAngle + Math.PI) * Math.cos(maxAltitude) * distance;

            if (sunMesh) sunMesh.position.copy(sun).multiplyScalar(0.25);
            if (moonMesh) moonMesh.position.copy(moon).multiplyScalar(0.25);

            const elevationRatio = Math.cos(hourAngle);
            const sunElevation = elevationRatio * 90; 
            
            let dayRatio = THREE.MathUtils.clamp((sunElevation + 15) / 30, 0, 1);
            let nightRatio = 1.0 - dayRatio;
            currentNightRatio = nightRatio;
            
            let sunsetRaw = THREE.MathUtils.clamp(1.0 - Math.abs(sunElevation - 5) / 35.0, 0, 1);
            let sunsetRatio = Math.pow(sunsetRaw, 1.5);
            
            // 夕暮れ時に海鳥をフェードイン
            let isEvening = progress > 0.5 && progress < 0.85;
            if (isEvening && sunsetRatio > 0.05) {
                targetBirdOpacity = Math.min(sunsetRatio * 1.5, 0.85);
            } else {
                targetBirdOpacity = 0;
            }

            const skyUniforms = sky.material.uniforms;
            if (skyUniforms['sunPosition']) skyUniforms['sunPosition'].value.copy(sun);
            
            let sunMeshColor = new THREE.Color(4.0, 4.0, 4.0).lerp(new THREE.Color(1.0, 0.35, 0.0), sunsetRatio);
            sunMesh.material.color.copy(sunMeshColor);
            let sunOpacity = THREE.MathUtils.clamp((sunElevation + 5) / 10, 0, 1);
            sunOpacity *= (1.0 - Math.pow(sunsetRatio, 0.6)); 
            sunMesh.material.opacity = sunOpacity;
            
            if (bioluminescence) bioluminescence.material.uniforms.globalOpacity.value = nightRatio * 0.8;
            if (stars) stars.material.uniforms.globalOpacity.value = nightRatio;
            if (moonMesh) moonMesh.material.opacity = nightRatio;

            if (sunElevation > -10) {
                directionalLight.position.copy(sun);
                let dirColor = new THREE.Color(0xffffff).lerp(new THREE.Color(0xff4400), sunsetRatio);
                directionalLight.color.copy(dirColor);
                
                let lightInt = Math.max(0, (sunElevation + 10) / 20) * (2.0 - sunsetRatio * 1.5); 
                directionalLight.intensity = lightInt;
            } else {
                directionalLight.position.copy(moon);
                directionalLight.color.copy(MOONLIGHT_COLOR);
                directionalLight.intensity = nightRatio * 0.95; 
            }
            
            if (sunElevation > -2) {
                water.material.uniforms['sunDirection'].value.copy(sun).normalize();
                let intenseSunColor = new THREE.Color(0xffffff).lerp(new THREE.Color(0xff3300), sunsetRatio);
                water.material.uniforms['sunColor'].value.copy(intenseSunColor);
            } else {
                water.material.uniforms['sunDirection'].value.set(0, 1, 0).normalize(); 
                let starlightColor = new THREE.Color(0x77aaff).multiplyScalar(nightRatio * 0.35); 
                water.material.uniforms['sunColor'].value.copy(starlightColor);
            }

            const ambientDay = new THREE.Color(0x77aaff); 
            const ambientNight = new THREE.Color(0x283a4e); 
            const ambientSunset = new THREE.Color(0x442211); 
            
            let clearAmbient = new THREE.Color().lerpColors(ambientNight, ambientDay, dayRatio).lerp(ambientSunset, sunsetRatio);
            ambientLight.color.copy(clearAmbient);
            
            let baseAmbientInt = 0.35 + (dayRatio * 0.25) - (sunsetRatio * 0.3);
            ambientLight.intensity = baseAmbientInt;

            let clearWater = new THREE.Color().lerpColors(WATER_BASE_NIGHT, WATER_BASE_DAY, dayRatio).lerp(WATER_BASE_SUNSET, sunsetRatio);
            water.material.uniforms['waterColor'].value.copy(clearWater);

            let baseExp = 0.5 + (dayRatio * 0.2) - (sunsetRatio * 0.25); 
            renderer.toneMappingExposure = baseExp;

            if (scene.environment) scene.environment.dispose();
            scene.environment = pmremGenerator.fromScene(sky).texture;
            if (window.DrifanEnhancements) DrifanEnhancements.updateTime(progress, dayRatio, sunsetRatio, nightRatio);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        let lastRenderTime = 0;

        function animate(now) {
            requestAnimationFrame(animate);
            render(now);
        }

        function render(now = performance.now()) {
            const deltaSeconds = lastRenderTime ? Math.min((now - lastRenderTime) / 1000, (window.DrifanConfig && DrifanConfig.limits.maxFrameDelta) || 0.05) : 1 / 60;
            lastRenderTime = now;
            const frameScale = deltaSeconds * 60;
            const time = now * 0.001;
            const nowMs = now;
            if (window.DrifanEnhancements) DrifanEnhancements.updateFrame(nowMs, currentNightRatio);

            water.material.uniforms['time'].value += 0.2 * deltaSeconds; 
            
            if (bioluminescence) {
                bioluminescence.material.uniforms['time'].value = time;
            }

            if (stars) {
                stars.material.uniforms['time'].value = time;
                stars.rotation.y = time * 0.004;
            }

            for (let i = ripples.length - 1; i >= 0; i--) {
                let r = ripples[i];
                r.life += r.speed * frameScale;
                if (r.life >= 1.0) {
                    if (window.DrifanObjects) DrifanObjects.removeSceneObject(scene, r.mesh, { dispose: true });
                    else {
                        scene.remove(r.mesh);
                        if (r.mesh.material) r.mesh.material.dispose();
                        if (r.mesh.geometry) r.mesh.geometry.dispose();
                    }
                    ripples.splice(i, 1);
                } else {
                    r.mesh.material.uniforms.progress.value = r.life;
                }
            }

            // 海鳥の更新
            currentBirdOpacity += (targetBirdOpacity - currentBirdOpacity) * (1 - Math.pow(0.98, frameScale));
            if (birdsGroup) {
                if (currentBirdOpacity > 0.01) {
                    birdsGroup.visible = true;
                    birdsGroup.children[0].userData.mat.opacity = currentBirdOpacity;
                    
                    const nextWorldPos = new THREE.Vector3();
                    
                    birdsGroup.children.forEach(bird => {
                        const ud = bird.userData;
                        ud.orbitPhase -= ud.orbitSpeed * 0.01 * frameScale; 
                        
                        bird.position.x = Math.cos(ud.orbitPhase) * ud.orbitRadius;
                        bird.position.z = Math.sin(ud.orbitPhase) * ud.orbitRadius;
                        bird.position.y = ud.baseY + Math.sin(time * 0.5 + ud.phase) * 15;
                        
                        // 進行方向を向く
                        const nextX = Math.cos(ud.orbitPhase - 0.1) * ud.orbitRadius;
                        const nextZ = Math.sin(ud.orbitPhase - 0.1) * ud.orbitRadius;
                        nextWorldPos.set(nextX, bird.position.y, nextZ);
                        birdsGroup.localToWorld(nextWorldPos);
                        bird.lookAt(nextWorldPos);
                        
                        // 羽ばたき (時々滑空)
                        const flapAmount = Math.sin(time * ud.flapSpeed + ud.phase);
                        const glide = Math.sin(time * 0.4 + ud.phase) > 0.3 ? 0.1 : 1.0; 
                        const angle = flapAmount * 0.5 * glide + 0.2;
                        
                        ud.rightWing.rotation.z = angle;
                        ud.leftWing.rotation.z = -angle;
                        
                        // 滑空時は少し体を傾ける
                        bird.rotation.z = Math.sin(time * 0.2 + ud.phase) * 0.3 * (1.0 - glide);
                    });
                } else {
                    birdsGroup.visible = false;
                }
            }

            if (rock) {
                 rock.position.y = 1.3 + Math.sin(time * 0.5) * 0.04;
                 rock.rotation.y = 0.75 + Math.sin(time * 0.1) * 0.01;
                 const waterShadow = rock.userData.waterShadow;
                 if (waterShadow) {
                     waterShadow.position.x = rock.position.x + 1.5 + sun.x * 0.0015;
                     waterShadow.position.z = rock.position.z + 1.5 + sun.z * 0.0015;
                     waterShadow.material.opacity = 0.34 + Math.max(0, directionalLight.intensity) * 0.22;
                     waterShadow.rotation.z = Math.atan2(sun.z, sun.x);
                 }
            }

            const rockX = rock ? rock.position.x : 0;
            const rockZ = rock ? rock.position.z : 0;
            const avoidRadius = 12.0; 

            floaters.forEach(f => {
                let forceX = 0, forceZ = 0;
                
                if (!f.userData.isBottle || !f.userData.isSinking) {
                    if (rock) {
                        const dx = f.position.x - rockX;
                        const dz = f.position.z - rockZ;
                        const distSq = dx * dx + dz * dz;

                        if (distSq < avoidRadius * avoidRadius && distSq > 0.001) {
                            const dist = Math.sqrt(distSq);
                            const pushFactor = Math.pow(1.0 - (dist / avoidRadius), 2.0) * 0.15;
                            forceX = (dx / dist) * pushFactor;
                            forceZ = (dz / dist) * pushFactor;
                            f.userData.rotSpeed += (Math.random() - 0.5) * 0.001 * frameScale;
                        }
                    }

                    f.userData.rotSpeed += (f.userData.baseRotSpeed - f.userData.rotSpeed) * (1 - Math.pow(0.95, frameScale));

                    f.userData.vx += (f.userData.baseSpeedX + forceX - f.userData.vx) * (1 - Math.pow(0.94, frameScale));
                    f.userData.vz += (f.userData.baseSpeedZ + forceZ - f.userData.vz) * (1 - Math.pow(0.94, frameScale));
                    f.position.x += f.userData.vx * frameScale;
                    f.position.z += f.userData.vz * frameScale;
                    
                    if (f.position.x < -150) { 
                        f.userData.encounterId = null;
                        f.position.x = 150; 
                        f.position.z = (Math.random() - 0.5) * 200 - 20; 
                        f.userData.vx = f.userData.baseSpeedX;
                        f.userData.vz = f.userData.baseSpeedZ;
                        f.userData.rotSpeed = f.userData.baseRotSpeed;
                    }
                    if (f.position.z > 80) { 
                        f.userData.encounterId = null;
                        f.position.z = -120; 
                        f.position.x = (Math.random() - 0.5) * 300; 
                        f.userData.vx = f.userData.baseSpeedX;
                        f.userData.vz = f.userData.baseSpeedZ;
                        f.userData.rotSpeed = f.userData.baseRotSpeed;
                    }
                }

                if (f.userData.isBottle) {
                    if (f.userData.isSinking) {
                        f.position.y -= 0.015 * frameScale; 
                        f.rotation.x += 0.01 * frameScale;  
                        f.rotation.z += 0.01 * frameScale;
                        
                        if (f.position.y < -5.0) {
                            f.userData.isSinking = false;
                            
                            f.position.x = (Math.random() - 0.5) * 300;
                            f.position.z = (Math.random() - 0.5) * 200 - 20;
                            f.position.y = -0.05;
                            
                            f.rotation.set(0, 0, 0);
                            f.userData.vx = f.userData.baseSpeedX;
                            f.userData.vz = f.userData.baseSpeedZ;
                            
                            f.userData.message = PRESET_MESSAGES[Math.floor(Math.random() * PRESET_MESSAGES.length)];
                            f.userData.encounterId = null;

                            const cork = f.getObjectByName("cork");
                            const letter = f.getObjectByName("letter");
                            const string = f.getObjectByName("string");
                            if (cork) cork.visible = true;
                            if (letter) letter.visible = true;
                            if (string) string.visible = true;
                        }
                    } else {
                        f.position.y = -0.05 + Math.sin(time * 1.6 + f.userData.phase) * f.userData.bobHeight;
                        f.rotation.x = Math.sin(time * 1.4 + f.userData.phase) * 0.12;
                        f.rotation.z = Math.cos(time * 1.8 + f.userData.phase) * 0.08;
                        f.rotation.y += f.userData.rotSpeed * frameScale;
                    }
                } else if (f.userData.isLantern) {
                    let glowScale = 1.0;
                    const nightLightFactor = f.userData.isNightExtra
                        ? THREE.MathUtils.smoothstep(currentNightRatio, 0.25, 0.75)
                        : 1.0;
                    let lightIntensity = 0.5 * nightLightFactor;
                    
                    if (f.userData.isGlowing) {
                        const elapsed = nowMs - f.userData.glowStartTime;
                        const duration = 4000; 
                        
                        if (elapsed < duration) {
                            const intensityPhase = Math.sin((elapsed / duration) * Math.PI);
                            glowScale = 1.0 + intensityPhase * 1.5; 
                            lightIntensity = 0.5 + intensityPhase * 3.0; 
                        } else {
                            f.userData.isGlowing = false;
                        }
                    }
                    
                    const pLight = f.getObjectByName("pLight");
                    const glow = f.getObjectByName("glow");
                    if (pLight) pLight.intensity = lightIntensity;
                    if (glow) {
                        glow.scale.set(glowScale, glowScale, glowScale);
                        if (f.userData.isNightExtra && glow.material.uniforms && glow.material.uniforms.glowOpacity) {
                            glow.material.uniforms.glowOpacity.value = nightLightFactor;
                        }
                    }

                    f.position.y = Math.sin(time * 1.8 + f.userData.phase) * f.userData.bobHeight;
                    f.rotation.x = Math.sin(time * 1.2 + f.userData.phase) * 0.08; 
                    f.rotation.z = Math.cos(time * 1.5 + f.userData.phase) * 0.06; 
                    f.rotation.y += f.userData.rotSpeed * frameScale;
                } else if (f.userData.isBoat) {
                    f.position.y = Math.sin(time * 1.5 + f.userData.phase) * f.userData.bobHeight;
                    f.rotation.x = Math.sin(time * 1.1 + f.userData.phase) * 0.055;
                    f.rotation.z = Math.cos(time * 1.3 + f.userData.phase) * 0.045;
                    f.rotation.y += f.userData.rotSpeed * frameScale;
                } else {
                    let pushOffset = 0;
                    if (f.userData.isPushed) {
                        const elapsed = nowMs - f.userData.pushStartTime;
                        if (elapsed < 800) {
                            pushOffset = -Math.sin((elapsed / 800) * Math.PI) * 0.25;
                        } else {
                            f.userData.isPushed = false;
                        }
                    }

                    f.position.y = Math.sin(time * 1.8 + f.userData.phase) * f.userData.bobHeight + pushOffset;
                    f.rotation.x = Math.sin(time * 1.2 + f.userData.phase) * 0.08; 
                    f.rotation.z = Math.cos(time * 1.5 + f.userData.phase) * 0.06; 
                    f.rotation.y += f.userData.rotSpeed * frameScale;
                }
            });

            // 漂流物同士の重なりを防ぐ。衝突時は押し分け、進行方向も少しだけ補正する
            // 3回の解決パスで密集時の押し戻し不足を減らす
            for (let pass = 0; pass < 3; pass++) {
                for (let i = 0; i < floaters.length; i++) {
                    const a = floaters[i];
                    if (a.userData.isBottle && a.userData.isSinking) continue;
                    for (let j = i + 1; j < floaters.length; j++) {
                        const b = floaters[j];
                        if (b.userData.isBottle && b.userData.isSinking) continue;
                        const dx = b.position.x - a.position.x, dz = b.position.z - a.position.z;
                        const minDist = (a.userData.collisionRadius || 1.5) + (b.userData.collisionRadius || 1.5);
                        const distSq = dx * dx + dz * dz;
                        if (distSq >= minDist * minDist) continue;
                        const dist = Math.sqrt(Math.max(distSq, 0.0001));
                        const nx = distSq < 0.0001 ? (Math.random() < 0.5 ? 1 : -1) : dx / dist;
                        const nz = distSq < 0.0001 ? 0 : dz / dist;
                        const push = (minDist - dist) * 0.52;
                        a.position.x -= nx * push; a.position.z -= nz * push;
                        b.position.x += nx * push; b.position.z += nz * push;
                        if (pass === 0) {
                            const relativeSpeed = (b.userData.vx - a.userData.vx) * nx + (b.userData.vz - a.userData.vz) * nz;
                            if (relativeSpeed < 0) {
                                const impulse = -relativeSpeed * 0.32;
                                a.userData.vx -= nx * impulse * 0.5; a.userData.vz -= nz * impulse * 0.5;
                                b.userData.vx += nx * impulse * 0.5; b.userData.vz += nz * impulse * 0.5;
                            }
                        }
                    }
                }
            }

            updateShootingStar(nowMs);
            updateWhale(nowMs); 

            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.life -= p.decay * frameScale;
                if (p.life <= 0) {
                    scene.remove(p.mesh);
                    p.mesh.material.dispose();
                    particles.splice(i, 1);
                } else {
                    p.mesh.position.x += (p.vx + Math.sin(time * 2.0 + p.phase) * 0.006) * frameScale;
                    p.mesh.position.y += p.vy * frameScale;
                    p.mesh.position.z += (p.vz + Math.cos(time * 1.5 + p.phase) * 0.006) * frameScale;
                    
                    if (p.mesh.material.uniforms) {
                        p.mesh.material.uniforms.opacity.value = p.life;
                    } else {
                        p.mesh.material.opacity = p.life;
                    }
                    const scale = p.life * 0.8;
                    p.mesh.scale.set(scale, scale, scale);
                }
            }

            for (let i = whaleParticles.length - 1; i >= 0; i--) {
                let p = whaleParticles[i];
                p.life -= p.decay * frameScale;
                p.vy -= 0.03 * frameScale; 
                if (p.life <= 0) {
                    scene.remove(p.mesh);
                    p.mesh.material.dispose();
                    whaleParticles.splice(i, 1);
                } else {
                    p.mesh.position.x += p.vx * frameScale;
                    p.mesh.position.y += p.vy;
                    p.mesh.position.z += p.vz * frameScale;
                    p.mesh.material.opacity = p.life * 0.6;
                    const scale = p.life * 2.5;
                    p.mesh.scale.set(scale, scale, scale);
                }
            }

            controls.update(); 
            renderer.render(scene, camera);
        }
