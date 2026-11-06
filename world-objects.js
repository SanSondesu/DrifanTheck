/* world-objects.js: feature functions using shared app.js state. */
        function createRock() {
            const geometry = new THREE.IcosahedronGeometry(3.5, 4);
            const pos = geometry.attributes.position;

            for (let i = 0; i < pos.count; i++) {
                let x = pos.getX(i);
                let y = pos.getY(i);
                let z = pos.getZ(i);

                const len = Math.sqrt(x * x + y * y + z * z);
                const nx = x / len;
                const ny = y / len;
                const nz = z / len;

                const warp = Math.sin(nx * 3.2 + ny * 2.1 + nz * 1.8) * 2.0 
                           + Math.cos(nx * 1.8 - nz * 3.8) * 1.6;

                const sharpSpike = Math.pow(Math.abs(Math.sin(nx * 5.2 + ny * 3.5)), 2.5) * 1.85
                                 + Math.pow(Math.abs(Math.cos(nz * 6.0 + nx * 3.8)), 2.6) * 1.65;

                const crag = Math.sin(nx * 8.5 + ny * 6.5) * Math.cos(nz * 7.5 + ny * 4.0) * 0.4;
                const gouge = Math.sin(nx * 2.2 + 0.8) * Math.cos(nz * 2.8) * 2.0;

                const radiusScale = 0.72 + (warp * 0.28) + (sharpSpike * 0.28) + (crag * 0.15) + (gouge * 0.22);

                x = nx * len * radiusScale;
                y = ny * len * radiusScale;
                z = nz * len * radiusScale;

                if (y > 0) {
                    y *= 1.25;
                    y += Math.pow(Math.max(0, ny), 1.8) * 1.35 * (1.0 + Math.sin(nx * 4.5) * 0.5);
                } else {
                    y *= 0.85;
                }

                x += Math.sin(y * 0.45) * 1.3;
                z += Math.cos(y * 0.35) * 1.0;

                pos.setXYZ(i, x, y, z);
            }

            geometry.computeVertexNormals();

            // 岩肌にごく細かな色むらを加え、形や基調色はそのままに自然な石質感へ
            const colors = [];
            const baseRockColor = new THREE.Color(0x546270);
            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
                const broad = Math.sin(x * 1.7 + z * 0.8) * Math.cos(y * 1.25 - z * 1.1);
                const fine = Math.sin(x * 5.1 + y * 3.7) * Math.cos(z * 4.4 - x * 2.2);
                const shade = 0.94 + broad * 0.035 + fine * 0.018;
                colors.push(baseRockColor.r * shade, baseRockColor.g * shade, baseRockColor.b * shade);
            }
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            const material = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                vertexColors: true,
                roughness: 0.94,
                metalness: 0.0,
                emissive: 0x080d12,
                flatShading: false
            });

            rock = new THREE.Mesh(geometry, material);
            rock.position.set(0, 1.4, 0);
            rock.castShadow = true;
            rock.receiveShadow = true;
            scene.add(rock);

            // 水面に落ちる、輪郭の柔らかい接地影
            const shadowCanvas = document.createElement('canvas');
            shadowCanvas.width = shadowCanvas.height = 128;
            const ctx = shadowCanvas.getContext('2d');
            const gradient = ctx.createRadialGradient(64, 64, 5, 64, 64, 62);
            gradient.addColorStop(0, 'rgba(5,12,20,0.42)');
            gradient.addColorStop(0.45, 'rgba(5,12,20,0.24)');
            gradient.addColorStop(1, 'rgba(5,12,20,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 128, 128);
            const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
            const shadow = new THREE.Mesh(
                new THREE.PlaneGeometry(22, 15),
                new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: 0.72 })
            );
            shadow.rotation.x = -Math.PI / 2;
            shadow.position.set(1.5, 0.025, 1.5);
            shadow.renderOrder = 2;
            scene.add(shadow);
            rock.userData.waterShadow = shadow;
        }

        function createSingleBottle(message, startPos) {
            const bottleGroup = new THREE.Group();

            const bottlePoints = [
                new THREE.Vector2(0.00, 0.00),
                new THREE.Vector2(0.12, 0.02),
                new THREE.Vector2(0.15, 0.08),
                new THREE.Vector2(0.15, 0.55),
                new THREE.Vector2(0.14, 0.65),
                new THREE.Vector2(0.09, 0.75),
                new THREE.Vector2(0.06, 0.85),
                new THREE.Vector2(0.06, 1.10),
                new THREE.Vector2(0.075, 1.13),
                new THREE.Vector2(0.075, 1.17),
                new THREE.Vector2(0.055, 1.18)
            ];

            const bottleGeo = new THREE.LatheGeometry(bottlePoints, 24);
            const glassColor = 0x8c5e35; 

            const glassMat = new THREE.MeshPhysicalMaterial({
                color: glassColor,
                transmission: 0.9,
                opacity: 0.95,
                transparent: true,
                roughness: 0.05,
                metalness: 0.0,
                ior: 1.52,
                thickness: 0.25,
                clearcoat: 1.0,
                clearcoatRoughness: 0.08
            });

            const bottleMesh = new THREE.Mesh(bottleGeo, glassMat);
            bottleGroup.add(bottleMesh);

            const corkGeo = new THREE.CylinderGeometry(0.054, 0.048, 0.16, 16);
            const corkMat = new THREE.MeshStandardMaterial({ color: 0x8c5933, roughness: 0.92 });
            const corkMesh = new THREE.Mesh(corkGeo, corkMat);
            corkMesh.position.y = 1.16;
            corkMesh.name = "cork";
            bottleGroup.add(corkMesh);

            const letterGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.46, 16);
            const letterMat = new THREE.MeshStandardMaterial({ color: 0xf2e3c6, roughness: 0.75 });
            const letterMesh = new THREE.Mesh(letterGeo, letterMat);
            letterMesh.position.set(0, 0.32, 0);
            letterMesh.rotation.z = 0.08;
            letterMesh.name = "letter";
            bottleGroup.add(letterMesh);

            const stringGeo = new THREE.TorusGeometry(0.054, 0.009, 8, 16);
            const stringMat = new THREE.MeshStandardMaterial({ color: 0xa8201a, roughness: 0.6 });
            const stringMesh = new THREE.Mesh(stringGeo, stringMat);
            stringMesh.rotation.x = Math.PI / 2;
            stringMesh.position.set(0, 0.32, 0);
            stringMesh.name = "string";
            bottleGroup.add(stringMesh);

            bottleMesh.rotation.z = -Math.PI / 2;
            corkMesh.rotation.z = -Math.PI / 2;
            corkMesh.position.set(1.16, 0, 0);
            letterMesh.rotation.z = -Math.PI / 2;
            letterMesh.position.set(0.32, -0.01, 0);
            stringMesh.rotation.y = Math.PI / 2;
            stringMesh.position.set(0.32, -0.01, 0);

            bottleGroup.scale.set(3.5, 3.5, 3.5);

            if (startPos) {
                bottleGroup.position.copy(startPos);
            } else {
                bottleGroup.position.set((Math.random() - 0.5) * 300, -0.05, (Math.random() - 0.5) * 200 - 20);
            }
            
            bottleGroup.userData = {
                baseSpeedX: -0.015 + (Math.random() - 0.5) * 0.01,
                baseSpeedZ: 0.022 + (Math.random() - 0.5) * 0.01,
                vx: 0,
                vz: 0,
                baseRotSpeed: 0.002 + (Math.random() - 0.5) * 0.002,
                rotSpeed: 0.002,
                phase: Math.random() * Math.PI * 2,
                bobHeight: 0.07 + Math.random() * 0.03,
                isBottle: true,
                encounterId: null,
                message: message || PRESET_MESSAGES[Math.floor(Math.random() * PRESET_MESSAGES.length)],
                isSinking: false
            };
            
            scene.add(bottleGroup);
            floaters.push(bottleGroup);
            return bottleGroup;
        }

        function createNewBottle(message) {
            const dir = new THREE.Vector3(0, 0, -1);
            dir.applyQuaternion(camera.quaternion);
            dir.y = 0;
            
            if (dir.lengthSq() < 0.0001) {
                dir.set(0, 0, -1);
            } else {
                dir.normalize();
            }
            
            const pos = camera.position.clone().add(dir.multiplyScalar(8));
            pos.y = -0.05;
            
            createSingleBottle(message, pos);
            spawnRipple(pos); 

            const maxBottles = (window.DrifanConfig && DrifanConfig.limits.maxPlayerBottles) || 40; 
            let currentBottleCount = 0;
            for (let i = 0; i < floaters.length; i++) {
                if (floaters[i].userData.isBottle) currentBottleCount++;
            }
            
            if (currentBottleCount > maxBottles) {
                for (let i = 0; i < floaters.length; i++) {
                    if (floaters[i].userData.isBottle && !floaters[i].userData.isSinking) {
                        const oldBottle = floaters[i];
                        if (window.DrifanObjects) {
                            DrifanObjects.removeSceneObject(scene, oldBottle, { dispose: true, array: floaters });
                        } else {
                            scene.remove(oldBottle);
                            floaters.splice(i, 1);
                        }
                        break;
                    }
                }
            }
        }

        function createFloaters(bottleCount = 12, woodCount = 120, lanternCount = 15, watchCount = 4, recordCount = 4, glassBallCount = 15, boatCount = 5) {
            floaters = [];

            for(let i=0; i<bottleCount; i++) {
                createSingleBottle();
            }

            function createBentSegment(woodMaterial, radiusBase, radiusMid, radiusTip, len1, len2, bendAngleY, bendAngleZ) {
                const group = new THREE.Group();

                const geo1 = new THREE.CylinderGeometry(radiusMid, radiusBase, len1, 8);
                const mesh1 = new THREE.Mesh(geo1, woodMaterial);
                mesh1.rotation.z = -Math.PI / 2;
                mesh1.position.x = len1 / 2;
                group.add(mesh1);

                const joint = new THREE.Group();
                joint.position.set(len1, 0, 0);
                joint.rotation.y = bendAngleY;
                joint.rotation.z = bendAngleZ;

                const geo2 = new THREE.CylinderGeometry(radiusTip, radiusMid, len2, 8);
                const mesh2 = new THREE.Mesh(geo2, woodMaterial);
                mesh2.rotation.z = -Math.PI / 2;
                mesh2.position.x = len2 / 2;
                joint.add(mesh2);

                group.add(joint);
                group.position.x = -(len1 + len2 * Math.cos(bendAngleY)) / 2;
                return { group, joint };
            }

            for (let i = 0; i < woodCount; i++) {
                const floaterGroup = new THREE.Group();
                const typeChoice = Math.random();
                const woodMaterial = new THREE.MeshStandardMaterial({
                    color: new THREE.Color().setHSL(0.075 + Math.random() * 0.025, 0.28 + Math.random() * 0.18, 0.19 + Math.random() * 0.13),
                    roughness: 0.94,
                    metalness: 0.02,
                    flatShading: true
                });

                const addLog = (parent, length, radius, x, y, z, taper = 0.72) => {
                    const geo = new THREE.CylinderGeometry(radius * taper, radius, length, 7);
                    const mesh = new THREE.Mesh(geo, woodMaterial);
                    mesh.rotation.z = Math.PI / 2;
                    mesh.position.set(x, y, z);
                    parent.add(mesh);
                    return mesh;
                };

                if (typeChoice < 0.22) {
                    // 細長い流木：枝の根元を幹に重ね、一本につながった形にする
                    const mainLength = 5.8 + Math.random() * 2.8;
                    const mainRadius = 0.11 + Math.random() * 0.06;
                    addLog(floaterGroup, mainLength, mainRadius, 0, 0, 0, 0.5);

                    if (Math.random() < 0.55) {
                        const branchLength = 1.35 + Math.random() * 0.55;
                        const branchAngle = 0.55 + Math.random() * 0.28;
                        const attachX = -0.2 + Math.random() * 1.5;
                        const attachY = mainRadius * 0.72;
                        const branch = addLog(
                            floaterGroup,
                            branchLength,
                            0.045 + Math.random() * 0.018,
                            attachX + Math.cos(branchAngle) * branchLength * 0.43,
                            attachY + Math.sin(branchAngle) * branchLength * 0.43,
                            0.015,
                            0.35
                        );
                        branch.rotation.z = -branchAngle;
                    }
                    floaterGroup.scale.set(1, 0.9, 0.9);
                } else if (typeChoice < 0.42) {
                    // 小さく短い枝
                    addLog(floaterGroup, 1.5 + Math.random() * 1.0, 0.13 + Math.random() * 0.06, 0, 0, 0, 0.55);
                    if (Math.random() < 0.65) {
                        const twig = addLog(floaterGroup, 1.0 + Math.random() * 0.6, 0.065, 0.15, 0.28, 0, 0.35);
                        twig.rotation.z = Math.PI / 2 - 0.55;
                    }
                    floaterGroup.scale.setScalar(0.72 + Math.random() * 0.18);
                } else if (typeChoice < 0.64) {
                    // 太くて大きな丸太
                    addLog(floaterGroup, 3.2 + Math.random() * 1.8, 0.32 + Math.random() * 0.12, 0, 0, 0, 0.78);
                    addLog(floaterGroup, 1.2, 0.12, -0.35, 0.28, 0.08, 0.5);
                    floaterGroup.scale.setScalar(1.15 + Math.random() * 0.25);
                } else if (typeChoice < 0.84) {
                    // 二股・三股に分かれた枝
                    addLog(floaterGroup, 3.5 + Math.random() * 1.4, 0.22, -0.1, 0, 0, 0.62);
                    const branchA = addLog(floaterGroup, 2.0, 0.105, 0.75, 0.48, 0, 0.45);
                    branchA.rotation.z = Math.PI / 2 - 0.58;
                    const branchB = addLog(floaterGroup, 1.65, 0.09, -0.55, -0.35, 0.05, 0.4);
                    branchB.rotation.z = Math.PI / 2 + 0.65;
                } else {
                    // これまでの雰囲気に近い、標準的な曲がり枝
                    const angleY = (0.3 + Math.random() * 0.55) * (Math.random() < 0.5 ? 1 : -1);
                    const { group, joint } = createBentSegment(
                        woodMaterial,
                        0.2 + Math.random() * 0.08,
                        0.14 + Math.random() * 0.06,
                        0.07 + Math.random() * 0.04,
                        2.2 + Math.random() * 1.0,
                        1.8 + Math.random() * 1.0,
                        angleY,
                        (Math.random() - 0.5) * 0.22
                    );
                    floaterGroup.add(group);
                    if (Math.random() < 0.6) {
                        const twig = addLog(joint, 1.3, 0.07, 0.5, 0.22, 0, 0.35);
                        twig.rotation.z = Math.PI / 2 - 0.5;
                    }
                    floaterGroup.scale.setScalar(0.85 + Math.random() * 0.35);
                }

                floaterGroup.position.x = (Math.random() - 0.5) * 300;
                floaterGroup.position.z = (Math.random() - 0.5) * 200 - 20;
                floaterGroup.position.y = 0;
                floaterGroup.rotation.y = Math.random() * Math.PI * 2;

                const baseRot = (Math.random() - 0.5) * 0.004;
                floaterGroup.userData = {
                    baseSpeedX: -0.015 - Math.random() * 0.015,
                    baseSpeedZ: 0.02 + Math.random() * 0.02,
                    vx: 0,
                    vz: 0,
                    baseRotSpeed: baseRot,
                    rotSpeed: baseRot,
                    phase: Math.random() * Math.PI * 2,
                    bobHeight: 0.05 + Math.random() * 0.04,
                    isBottle: false
                };

                scene.add(floaterGroup);
                floaters.push(floaterGroup);
            }
            const glowMat = new THREE.ShaderMaterial({
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
                    varying vec3 vNormal;
                    varying vec3 vViewPosition;
                    uniform float glowOpacity;
                    void main() {
                        vec3 normal = normalize(vNormal);
                        vec3 viewDir = normalize(vViewPosition);
                        
                        float intensity = max(dot(normal, viewDir), 0.0);
                        intensity = pow(intensity, 2.5);
                        vec3 color = vec3(1.0, 0.45, 0.05);
                        gl_FragColor = vec4(color, intensity * 0.3 * glowOpacity);
                    }
                `,
                uniforms: { glowOpacity: { value: 1.0 } },
                blending: THREE.AdditiveBlending, 
                transparent: true,
                depthWrite: false,
                depthTest: true, 
                side: THREE.FrontSide
            });
            
            const glowGeo = new THREE.SphereGeometry(3.2, 16, 16);

            // ランタン全体でGeometryとMaterialを共有し、重複生成を避ける
            const lanternMetalMat = new THREE.MeshStandardMaterial({
                color: 0x15181a, roughness: 0.7, metalness: 0.3, flatShading: true
            });
            const lanternGlassMat = new THREE.MeshStandardMaterial({
                color: 0xffffff, transparent: true, opacity: 0.15,
                roughness: 0.02, metalness: 0.9, side: THREE.DoubleSide
            });
            const lanternCandleMat = new THREE.MeshBasicMaterial({ color: 0xffb766 });
            const lanternBaseGeo = new THREE.BoxGeometry(0.6, 0.08, 0.6);
            const lanternGlassGeo = new THREE.BoxGeometry(0.52, 0.72, 0.52);
            const lanternPillarGeo = new THREE.BoxGeometry(0.04, 0.7, 0.04);
            const lanternRoofBaseGeo = new THREE.BoxGeometry(0.66, 0.04, 0.66);
            const lanternRoofGeo = new THREE.CylinderGeometry(0.08, 0.33, 0.4, 4);
            lanternRoofGeo.rotateY(Math.PI / 4);
            const lanternCapGeo = new THREE.BoxGeometry(0.16, 0.08, 0.16);
            const lanternRingGeo = new THREE.TorusGeometry(0.15, 0.015, 8, 16);
            const lanternCandleGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.35, 16);

            for(let i=0; i<lanternCount; i++) {
                const lanternGroup = new THREE.Group();

                const baseGeo = lanternBaseGeo;
                const base = new THREE.Mesh(baseGeo, lanternMetalMat);
                base.position.y = 0.04;
                lanternGroup.add(base);

                const glassGeo = lanternGlassGeo;
                const glassMat = lanternGlassMat;
                const glass = new THREE.Mesh(glassGeo, glassMat);
                glass.position.y = 0.43; 
                lanternGroup.add(glass);

                const pillarGeo = lanternPillarGeo;
                const positions = [
                    [-0.28, 0.28], [0.28, 0.28], 
                    [-0.28, -0.28], [0.28, -0.28]
                ];
                positions.forEach(pos => {
                    const pillar = new THREE.Mesh(pillarGeo, lanternMetalMat);
                    pillar.position.set(pos[0], 0.43, pos[1]);
                    lanternGroup.add(pillar);
                });

                const roofBaseGeo = lanternRoofBaseGeo;
                const roofBase = new THREE.Mesh(roofBaseGeo, lanternMetalMat);
                roofBase.position.y = 0.8;
                lanternGroup.add(roofBase);

                const roofGeo = lanternRoofGeo; 
                const roof = new THREE.Mesh(roofGeo, lanternMetalMat);
                roof.position.y = 1.02;
                lanternGroup.add(roof);

                const capGeo = lanternCapGeo;
                const cap = new THREE.Mesh(capGeo, lanternMetalMat);
                cap.position.y = 1.26;
                lanternGroup.add(cap);

                const ringGeo = lanternRingGeo;
                const ring = new THREE.Mesh(ringGeo, lanternMetalMat);
                ring.position.y = 1.45;
                lanternGroup.add(ring);

                const candleGeo = lanternCandleGeo;
                const candleMat = lanternCandleMat;
                const candle = new THREE.Mesh(candleGeo, candleMat);
                candle.position.y = 0.25;
                lanternGroup.add(candle);

                const pLight = new THREE.PointLight(0xff7700, 0.5, 12.0);
                pLight.position.y = 0.4;
                pLight.name = "pLight";
                lanternGroup.add(pLight);

                const isNightExtra = i >= lanternCount - 2;
                const individualGlowMat = isNightExtra ? glowMat.clone() : glowMat;
                if (isNightExtra) individualGlowMat.uniforms.glowOpacity.value = 0;
                const glow = new THREE.Mesh(glowGeo, individualGlowMat);
                glow.position.y = 0.4;
                glow.name = "glow";
                glow.frustumCulled = false; 
                glow.renderOrder = 1;       
                glow.raycast = function() {}; 
                lanternGroup.add(glow);

                lanternGroup.scale.set(1.5, 1.5, 1.5);
                lanternGroup.position.x = (Math.random() - 0.5) * 300;
                lanternGroup.position.z = (Math.random() - 0.5) * 200 - 20;
                lanternGroup.position.y = 0;
                lanternGroup.userData = {
                    baseSpeedX: -0.01 + (Math.random() - 0.5) * 0.005,
                    baseSpeedZ: 0.015 + (Math.random() - 0.5) * 0.01,
                    vx: 0,
                    vz: 0,
                    baseRotSpeed: (Math.random() - 0.5) * 0.01,
                    rotSpeed: 0,
                    phase: Math.random() * Math.PI * 2,
                    bobHeight: 0.03 + Math.random() * 0.02,
                    isBottle: false,
                    isLantern: true,
                    isNightExtra: isNightExtra
                };
                scene.add(lanternGroup);
                floaters.push(lanternGroup);
            }

            for(let i=0; i<watchCount; i++) {
                const watchGroup = new THREE.Group();
                
                const brassMat = new THREE.MeshStandardMaterial({
                    color: 0xb5a642, roughness: 0.3, metalness: 0.8
                });
                const faceMat = new THREE.MeshStandardMaterial({
                    color: 0xfffae6, roughness: 0.9, metalness: 0.1
                });
                
                const bodyGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
                const body = new THREE.Mesh(bodyGeo, brassMat);
                watchGroup.add(body);
                
                const faceGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.12, 16);
                const face = new THREE.Mesh(faceGeo, faceMat);
                watchGroup.add(face);
                
                const handsMat = new THREE.MeshStandardMaterial({
                    color: 0x1a1a1a, roughness: 0.6, metalness: 0.4
                });
                
                const hourHandGeo = new THREE.BoxGeometry(0.015, 0.005, 0.12);
                hourHandGeo.translate(0, 0, 0.05); 
                const hourHand = new THREE.Mesh(hourHandGeo, handsMat);
                hourHand.position.set(0, 0.065, 0); 
                hourHand.rotation.y = Math.PI * (Math.random() * 2); 
                watchGroup.add(hourHand);
                
                const minuteHandGeo = new THREE.BoxGeometry(0.01, 0.005, 0.18);
                minuteHandGeo.translate(0, 0, 0.08);
                const minuteHand = new THREE.Mesh(minuteHandGeo, handsMat);
                minuteHand.position.set(0, 0.07, 0); 
                minuteHand.rotation.y = Math.PI * (Math.random() * 2);
                watchGroup.add(minuteHand);
                
                const pinGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.02, 8);
                const pin = new THREE.Mesh(pinGeo, brassMat);
                pin.position.set(0, 0.075, 0);
                watchGroup.add(pin);
                
                const glassGeo = new THREE.SphereGeometry(0.26, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
                const glassMat = new THREE.MeshPhysicalMaterial({
                    color: 0xffffff, transmission: 0.9, opacity: 1, transparent: true, roughness: 0.1, metalness: 0.1
                });
                const glass = new THREE.Mesh(glassGeo, glassMat);
                glass.position.y = 0.05;
                glass.scale.y = 0.3; 
                watchGroup.add(glass);
                
                const crownGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8);
                const crown = new THREE.Mesh(crownGeo, brassMat);
                crown.position.set(0, 0, -0.34);
                crown.rotation.x = Math.PI / 2;
                watchGroup.add(crown);
                
                const ringGeo = new THREE.TorusGeometry(0.1, 0.02, 8, 16);
                const ring = new THREE.Mesh(ringGeo, brassMat);
                ring.position.set(0, 0, -0.46);
                watchGroup.add(ring);

                watchGroup.scale.set(1.5, 1.5, 1.5);
                watchGroup.position.x = (Math.random() - 0.5) * 300;
                watchGroup.position.z = (Math.random() - 0.5) * 200 - 20;
                watchGroup.position.y = 0;
                
                watchGroup.userData = {
                    baseSpeedX: -0.01 + (Math.random() - 0.5) * 0.005,
                    baseSpeedZ: 0.015 + (Math.random() - 0.5) * 0.01,
                    vx: 0, vz: 0,
                    baseRotSpeed: (Math.random() - 0.5) * 0.01,
                    rotSpeed: 0,
                    phase: Math.random() * Math.PI * 2,
                    bobHeight: 0.04 + Math.random() * 0.02,
                    isBottle: false,
                    isWatch: true
                };
                scene.add(watchGroup);
                floaters.push(watchGroup);
            }

            for(let i = 0; i < recordCount; i++) {
                const recordGroup = new THREE.Group();
                
                const vinylMat = new THREE.MeshStandardMaterial({
                    color: 0x050505, roughness: 0.3, metalness: 0.1
                });
                const vinylGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.02, 32);
                const vinyl = new THREE.Mesh(vinylGeo, vinylMat);
                recordGroup.add(vinyl);
                
                for(let r = 0; r < 6; r++) {
                    const ringGeo = new THREE.TorusGeometry(0.18 + r * 0.045, 0.003, 4, 32);
                    const ringMat = new THREE.MeshStandardMaterial({
                        color: 0x1a1a1a, roughness: 0.3, metalness: 0.8
                    });
                    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
                    ringMesh.rotation.x = Math.PI / 2;
                    ringMesh.position.y = 0.011; 
                    recordGroup.add(ringMesh);
                }

                const labelColors = [0x8b0000, 0xdaa520, 0x2f4f4f, 0x696969];
                const labelMat = new THREE.MeshStandardMaterial({
                    color: labelColors[i % labelColors.length], roughness: 0.9, metalness: 0.0
                });
                const labelGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.025, 32);
                const label = new THREE.Mesh(labelGeo, labelMat);
                recordGroup.add(label);
                
                const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
                const holeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.03, 16);
                const hole = new THREE.Mesh(holeGeo, holeMat);
                recordGroup.add(hole);

                recordGroup.scale.set(2.0, 2.0, 2.0);
                recordGroup.position.x = (Math.random() - 0.5) * 300;
                recordGroup.position.z = (Math.random() - 0.5) * 200 - 20;
                recordGroup.position.y = 0;
                
                recordGroup.userData = {
                    baseSpeedX: -0.01 + (Math.random() - 0.5) * 0.005,
                    baseSpeedZ: 0.015 + (Math.random() - 0.5) * 0.01,
                    vx: 0, vz: 0,
                    baseRotSpeed: (Math.random() - 0.5) * 0.02, 
                    rotSpeed: 0,
                    phase: Math.random() * Math.PI * 2,
                    bobHeight: 0.02 + Math.random() * 0.02,
                    isBottle: false,
                    isRecord: true
                };
                scene.add(recordGroup);
                floaters.push(recordGroup);
            }

            const rareGlassBallIndex = Math.random() < 0.38 ? Math.floor(Math.random() * glassBallCount) : -1;
            for(let i = 0; i < glassBallCount; i++) {
                const ballGroup = new THREE.Group();
                
                // ガラス玉を見つけやすいように、少し明るく、ほんのり発光（反射）させる
                const glassMat = new THREE.MeshPhysicalMaterial({
                    color: 0x88ccff, transmission: 0.9, opacity: 0.9, transparent: true, 
                    roughness: 0.1, metalness: 0.2, emissive: 0x002255, emissiveIntensity: 0.8
                });
                const glassGeo = new THREE.SphereGeometry(0.35, 16, 16);
                const glassMesh = new THREE.Mesh(glassGeo, glassMat);
                ballGroup.add(glassMesh);
                
                const ropeMat = new THREE.MeshStandardMaterial({
                    color: 0x8b5a2b, roughness: 1.0, flatShading: true
                });
                for(let r=0; r<4; r++) {
                    const ropeGeo = new THREE.TorusGeometry(0.355, 0.015, 4, 16);
                    const rope = new THREE.Mesh(ropeGeo, ropeMat);
                    rope.rotation.y = (Math.PI / 4) * r;
                    ballGroup.add(rope);
                }
                const ropeGeoH = new THREE.TorusGeometry(0.355, 0.015, 4, 16);
                const ropeH = new THREE.Mesh(ropeGeoH, ropeMat);
                ropeH.rotation.x = Math.PI / 2;
                ballGroup.add(ropeH);

                const knot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), ropeMat);
                knot.position.y = 0.35;
                ballGroup.add(knot);

                const isRareGlassBall = i === rareGlassBallIndex;
                if (isRareGlassBall) {
                    const rareRingMat = new THREE.MeshStandardMaterial({ color: 0xd9bd83, metalness: 0.72, roughness: 0.28, emissive: 0x493316, emissiveIntensity: 0.16 });
                    const rareRing = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.018, 8, 48), rareRingMat);
                    rareRing.rotation.x = Math.PI / 2;
                    rareRing.position.y = 0.02;
                    rareRing.name = "starlit-ring";
                    ballGroup.add(rareRing);
                    const rareCore = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffe8b0 }));
                    rareCore.position.set(0.12, 0.31, 0.12);
                    rareCore.name = "starlit-core";
                    ballGroup.add(rareCore);
                }

                // サイズも少しだけ大きくして見つけやすく
                ballGroup.scale.set(2.2, 2.2, 2.2);
                ballGroup.position.x = (Math.random() - 0.5) * 300;
                ballGroup.position.z = (Math.random() - 0.5) * 200 - 20;
                ballGroup.position.y = 0;
                
                ballGroup.userData = {
                    baseSpeedX: -0.01 + (Math.random() - 0.5) * 0.005,
                    baseSpeedZ: 0.015 + (Math.random() - 0.5) * 0.01,
                    vx: 0, vz: 0,
                    baseRotSpeed: (Math.random() - 0.5) * 0.02, 
                    rotSpeed: 0,
                    phase: Math.random() * Math.PI * 2,
                    bobHeight: 0.04 + Math.random() * 0.02,
                    isBottle: false,
                    isGlassBall: true,
                    isRareGlassBall: isRareGlassBall
                };
                scene.add(ballGroup);
                floaters.push(ballGroup);
            }

            // 小さな木製の船：素朴な帆船を少数だけ漂わせる
            for (let i = 0; i < boatCount; i++) {
                const boat = createBoatModel(1.12, Math.floor(Math.random() * 5));
                boat.position.set((Math.random() - 0.5) * 300, 0, (Math.random() - 0.5) * 200 - 20);
                boat.rotation.y = Math.random() * Math.PI * 2;
                boat.userData = {
                    baseSpeedX: -0.008 - Math.random() * 0.006,
                    baseSpeedZ: 0.012 + (Math.random() - 0.5) * 0.006,
                    vx: 0, vz: 0,
                    baseRotSpeed: (Math.random() - 0.5) * 0.002,
                    rotSpeed: 0,
                    phase: Math.random() * Math.PI * 2,
                    bobHeight: 0.035 + Math.random() * 0.02,
                    isBottle: false,
                    isBoat: true
                };
                scene.add(boat);
                floaters.push(boat);
            }

            // 実際のモデル寸法から衝突半径を求める（種類ごとの拡大率も反映）
            floaters.forEach(f => {
                f.updateMatrixWorld(true);
                const bounds = new THREE.Box3().setFromObject(f);
                const size = bounds.getSize(new THREE.Vector3());
                f.userData.collisionRadius = Math.max(size.x, size.z) * 0.46 + 0.28;
                f.userData.tapHitRadius = Math.max(size.x, size.y, size.z) * 0.52 + 0.35;
                f.userData.tapHitCenterY = bounds.getCenter(new THREE.Vector3()).y - f.position.y;
            });
        }
