/* notebook-preview.js: feature functions using shared app.js state. */
        function getFloaterItemName(group) {
            const d = group.userData || {};
            if (d.isBottle) return "手紙の入った古いボトル";
            if (d.isLantern) return "海を漂う古いランタン";
            if (d.isWatch) return "時を刻むアンティーク時計";
            if (d.isRecord) return "ノスタルジックな古いレコード盤";
            if (d.isGlassBall) return "波間を漂うガラスの浮き玉";
            if (d.isBoat) return "小さな木製の船";
            return "波間を漂う古い流木";
        }

        function recordFloaterDiscovery(group) {
            const itemName = getFloaterItemName(group);
            if (!group.userData.encounterId) group.userData.encounterId = ++floaterEncounterSerial;
            const discoveredAt = new Date().toISOString();
            const key = itemName + ":" + group.userData.encounterId;
            if (discoveredFloaterInstances.has(key)) return false;
            discoveredFloaterInstances.add(key);
            touchedItemsSet.add(itemName);
            if (!floaterDiscovery[itemName]) floaterDiscovery[itemName] = { count: 0, firstAt: discoveredAt, lastAt: discoveredAt };
            floaterDiscovery[itemName].count += 1;
            floaterDiscovery[itemName].lastAt = discoveredAt;
            if (!floaterDiscovery[itemName].firstAt) floaterDiscovery[itemName].firstAt = discoveredAt;
            if (window.DrifanEnhancements) DrifanEnhancements.recordObservation('discovery', itemName);
            saveProgress();
            updateNotebookUI(itemName);
            return true;
        }

        function createNotebookSketch(itemName) {
            const ns="http://www.w3.org/2000/svg", svg=document.createElementNS(ns,"svg");
            svg.setAttribute("viewBox","0 0 180 72"); svg.setAttribute("class","page-sketch"); svg.setAttribute("aria-hidden","true");
            const add=(tag,attrs)=>{const el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));svg.appendChild(el);return el;};
            const p=(d,extra={})=>add("path",{d,...extra});
            if(itemName==="小さな木製の船"){p("M35 43 Q82 52 139 42 L126 56 Q83 62 48 55 Z",{class:"sketch-fill"});p("M83 43 L83 8 M84 12 L116 38 L84 38 Z M78 13 L51 35 L78 35 Z M84 8 L103 12 L84 16 Z M25 63 Q55 58 82 63 T145 63");}
            else if(itemName==="波間を漂う古い流木"){p("M26 43 Q54 35 83 41 T145 36 M62 40 L54 20 L42 16 M93 40 L108 22 L123 18 M52 38 L45 31 M111 38 L121 32 M25 57 Q54 52 83 57 T145 57");}
            else if(itemName==="海を漂う古いランタン"){p("M68 19 L112 19 L108 51 L72 51 Z M75 19 L80 9 L100 9 L105 19 M80 51 L78 58 L102 58 L100 51 M90 27 Q78 38 90 45 Q102 38 90 27 M90 9 L90 4 M60 62 Q90 57 120 62");}
            else if(itemName==="時を刻むアンティーク時計"){add("circle",{cx:90,cy:35,r:24,class:"sketch-fill"});add("circle",{cx:90,cy:35,r:19});p("M90 35 L90 20 M90 35 L103 42 M90 7 L90 11 M90 59 L90 63 M62 35 L66 35 M114 35 L118 35 M78 8 L102 8");}
            else if(itemName==="ノスタルジックな古いレコード盤"){add("circle",{cx:90,cy:35,r:27,class:"sketch-fill"});add("circle",{cx:90,cy:35,r:20});add("circle",{cx:90,cy:35,r:13});add("circle",{cx:90,cy:35,r:5});p("M116 16 Q132 8 143 18");}
            else if(itemName==="波間を漂うガラスの浮き玉"){add("circle",{cx:90,cy:34,r:25,class:"sketch-fill"});p("M74 20 Q90 30 106 20 M72 44 Q90 34 108 45 M90 9 L90 59 M65 34 L115 34 M30 60 Q55 55 75 60 T130 60");}
            else{p("M48 17 L132 17 L132 54 L48 54 Z M48 17 L90 7 L132 17 M58 54 L58 61 L122 61 L122 54 M90 20 L90 49 M82 31 Q90 25 98 31 M80 36 Q90 43 100 36");}
            return svg;
        }

        function renderItemDescription(itemName) {
            const panel=document.getElementById('item-description'), page=document.getElementById('notebook-container');
            if(!panel||!itemName)return;
            const data=FLOATER_DESCRIPTIONS[itemName], count=floaterDiscovery[itemName]?floaterDiscovery[itemName].count:0;
            const stage=count>=10?3:count>=7?2:count>=4?1:0;
            panel.className=stage?'notebook-stage-'+stage:'';
            if(page)page.className='paper-modal notebook-page-stage-'+stage;
            panel.textContent='';
            const progress=document.createElement('span');progress.className='description-progress';
            progress.textContent='FIELD NOTES  ·  出会い '+count+' 回  ·  記録 '+Math.min(count,3)+'/3';panel.appendChild(progress);
            if(data){
                for(let i=0;i<Math.min(count,3);i++){const line=document.createElement('div');line.className='description-line';line.textContent=data.lines[i];panel.appendChild(line);}
                if(count>=4){
                    const echoCount=Math.min(count-3,data.echoes.length);
                    for(let i=0;i<echoCount;i++){const echo=document.createElement('div');echo.className='description-echo';echo.textContent=data.echoes[i];panel.appendChild(echo);}
                    panel.appendChild(createNotebookSketch(itemName));
                }
                if(count>3+data.echoes.length){const completed=document.createElement('div');completed.className='description-echo';completed.textContent='このページに、たくさんの出会いが綴られました。';panel.appendChild(completed);}
            }
            if(stage>=2){const stamp=document.createElement('span');stamp.className='page-stamp';stamp.textContent=stage===2?'SEA\\nARCHIVE':'SEA\\nARCHIVE\\n✧  完  ✧';panel.appendChild(stamp);}
            if(stage>0){const ornament=document.createElement('div');ornament.className='page-decoration';ornament.textContent=stage===1?'⌁  ✧  ❧  ✧  ⌁':stage===2?'❧  ✧  ❖  ✧  ❧':'✧  ❖  ❧  ❖  ✧';panel.appendChild(ornament);}
        }

        function updateNotebookUI(selectedItem = null) {
            const msgUl = document.getElementById('notebook-messages');
            const itemsUl = document.getElementById('notebook-items');
            if (msgUl) {
                msgUl.innerHTML = '';
                if (readMessagesList.length === 0) {
                    msgUl.innerHTML = '<li>まだメッセージを拾っていません。</li>';
                } else {
                    for (let i = readMessagesList.length - 1; i >= 0; i--) {
                        const li = document.createElement('li');
                        li.innerText = readMessagesList[i];
                        msgUl.appendChild(li);
                    }
                }
            }
            if (!itemsUl) return;
            itemsUl.innerHTML = '';
            if (touchedItemsSet.size === 0) {
                itemsUl.innerHTML = '<li class="item-li" style="cursor:default;">特別な漂流物にはまだ触れていません。</li>';
                showPreviewModel("");
                const panel = document.getElementById('item-description');
                if (panel) panel.textContent = "漂流物の名前を選ぶと、出会いの記録がここに綴られます。";
                return;
            }
            const names = Array.from(touchedItemsSet);
            names.forEach(item => {
                const li = document.createElement('li');
                const count = floaterDiscovery[item] ? floaterDiscovery[item].count : 0;
                const stage = count >= 10 ? 3 : count >= 7 ? 2 : count >= 4 ? 1 : 0;
                li.className = 'item-li' + (stage ? ' notebook-stage-' + stage : '');
                li.textContent = item;
                const countLabel = document.createElement('span');
                countLabel.className = 'item-count';
                countLabel.textContent = '出会い ' + count + ' 回';
                li.appendChild(countLabel);
                li.addEventListener('click', () => {
                    showPreviewModel(item);
                    document.querySelectorAll('.item-li').forEach(el => el.style.background = '');
                    li.style.background = 'rgba(212, 175, 55, 0.2)';
                    renderItemDescription(item);
                });
                itemsUl.appendChild(li);
            });
            const chosen = selectedItem && touchedItemsSet.has(selectedItem) ? selectedItem : names[0];
            const selectedLi = Array.from(itemsUl.children).find(li => li.firstChild && li.firstChild.textContent === chosen);
            if (selectedLi) selectedLi.click();
        }

        // --- プレビュー用3D空間の初期化 ---

        function initPreview() {
            const canvas = document.getElementById('preview-canvas');
            if(!canvas) return;
            
            previewRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
            previewScene = new THREE.Scene();
            previewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
            previewCamera.position.z = 6;

            const ambient = new THREE.AmbientLight(0xffffff, 0.8);
            previewScene.add(ambient);
            
            // レコードの溝や時計の金属が綺麗に反射するようにライトを調整
            const dirLight = new THREE.DirectionalLight(0xffeedd, 1.5);
            dirLight.position.set(5, 10, 7); 
            previewScene.add(dirLight);
            
            const pointLight = new THREE.PointLight(0xffffff, 1.2, 20); // 反射・ハイライト用
            pointLight.position.set(0, 5, 2);
            previewScene.add(pointLight);

            const fillLight = new THREE.DirectionalLight(0x88bbff, 0.8);
            fillLight.position.set(-5, 2, -5);
            previewScene.add(fillLight);

            // タッチ・マウス操作の手動実装（スワイプ回転）
            canvas.addEventListener('pointerdown', (e) => {
                previewIsDragging = true;
                previewPrevMouse.x = e.clientX;
                previewPrevMouse.y = e.clientY;
                e.stopPropagation();
            });
            window.addEventListener('pointermove', (e) => {
                if(!previewIsDragging || !previewModel) return;
                const dx = e.clientX - previewPrevMouse.x;
                const dy = e.clientY - previewPrevMouse.y;
                previewModel.rotation.y += dx * 0.015;
                previewModel.rotation.x += dy * 0.015;
                previewPrevMouse.x = e.clientX;
                previewPrevMouse.y = e.clientY;
            });
            window.addEventListener('pointerup', () => {
                previewIsDragging = false;
            });
            
            // ホイールでズーム
            canvas.addEventListener('wheel', (e) => {
                previewCamera.position.z += e.deltaY * 0.005;
                previewCamera.position.z = THREE.MathUtils.clamp(previewCamera.position.z, 2.5, 15);
                e.preventDefault();
            }, {passive: false});
            
            // スマホのピンチ操作（2本指ズーム）
            canvas.addEventListener('touchstart', (e) => {
                if(e.touches.length === 2) {
                    previewPinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                }
            }, {passive: false});
            canvas.addEventListener('touchmove', (e) => {
                if(e.touches.length === 2) {
                    const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                    const diff = previewPinchDist - dist;
                    previewCamera.position.z += diff * 0.03;
                    previewCamera.position.z = THREE.MathUtils.clamp(previewCamera.position.z, 2.5, 15);
                    previewPinchDist = dist;
                    e.preventDefault();
                }
            }, {passive: false});
        }

        function resizePreview() {
            const container = document.getElementById('preview-area');
            if(!container || !previewRenderer) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w === 0 || h === 0) return;
            previewRenderer.setSize(w, h);
            previewCamera.aspect = w / h;
            previewCamera.updateProjectionMatrix();
        }

        // --- プレビュー用メッシュの生成関数 ---

        function createPreviewWood() {
            const group=new THREE.Group(), palette=[0x4a3b32,0x594333,0x66503b,0x3e352f,0x71583f];
            const mat=new THREE.MeshStandardMaterial({color:palette[Math.floor(Math.random()*palette.length)],roughness:.94,flatShading:true});
            const variant=Math.floor(Math.random()*5);
            const add=(length,radius,x,y,z,angle=0)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius*.68,radius,length,7),mat);mesh.rotation.z=Math.PI/2+angle;mesh.position.set(x,y,z);group.add(mesh);};
            if(variant===0){add(4.8,.18,0,0,0);add(1.9,.07,.8,.35,0,-.7);}
            else if(variant===1){add(2.2,.3,0,0,0);add(1.1,.11,-.3,.3,.08,.8);}
            else if(variant===2){add(5.6,.12,0,0,0);add(1.7,.06,-1.1,.22,.04,-.55);add(1.4,.055,1.1,-.18,.03,.6);}
            else if(variant===3){add(3.6,.28,0,0,0);add(2.1,.12,.5,.35,.06,-.85);}
            else{add(2.8,.18,-.5,0,0,.25);add(2.2,.14,.8,.25,.04,-.55);add(1.3,.07,-.9,.5,.02,.75);}
            group.position.x=-1;return group;
        }

        function createPreviewLantern() {
            const group = new THREE.Group();
            const metalMat = new THREE.MeshStandardMaterial({ color: 0x2a3035, roughness: 0.6, metalness: 0.5, flatShading: true });
            
            group.add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.6), metalMat));
            
            // ガラス自体を少し発光させて透明感を出す
            const glassMat = new THREE.MeshStandardMaterial({ 
                color: 0xffeedd, transparent: true, opacity: 0.25, 
                roughness: 0.1, side: THREE.DoubleSide, emissive: 0xffaa00, emissiveIntensity: 0.1 
            });
            const glass = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.72, 0.52), glassMat);
            glass.position.y = 0.43; group.add(glass);
            
            // 柱を少し長くして隙間をなくす
            const pGeo = new THREE.BoxGeometry(0.04, 0.76, 0.04);
            [[-0.28, 0.28], [0.28, 0.28], [-0.28, -0.28], [0.28, -0.28]].forEach(p => {
                const pillar = new THREE.Mesh(pGeo, metalMat); pillar.position.set(p[0], 0.43, p[1]); group.add(pillar);
            });
            
            // 屋根の土台（隙間を埋めるため厚くする）
            const roofBase = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.06, 0.66), metalMat);
            roofBase.position.y = 0.82; group.add(roofBase);
            
            // 屋根
            const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.33, 0.4, 4), metalMat);
            roof.rotateY(Math.PI / 4); roof.position.y = 1.05; group.add(roof);
            
            // 屋根の上のキャップ
            const cap = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.16), metalMat);
            cap.position.y = 1.29; group.add(cap);
            
            // リング
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.015, 8, 16), metalMat);
            ring.position.y = 1.48; group.add(ring);
            
            // ろうそく
            const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 16), new THREE.MeshStandardMaterial({ color: 0xffddaa, emissive: 0xff6600, emissiveIntensity: 0.8 }));
            candle.position.y = 0.25; group.add(candle);
            
            // 炎の表現
            const flame = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
            flame.position.y = 0.48; group.add(flame);
            
            // 光源
            const pLight = new THREE.PointLight(0xff7700, 2.0, 5.0);
            pLight.position.y = 0.48;
            group.add(pLight);
            
            group.scale.set(1.5, 1.5, 1.5);
            group.position.y = -0.5;
            return group;
        }

        function createPreviewWatch() {
            const group = new THREE.Group();
            const brassMat = new THREE.MeshStandardMaterial({ color: 0xb5a642, roughness: 0.3, metalness: 0.8 });
            group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16), brassMat));
            group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 16), new THREE.MeshStandardMaterial({ color: 0xfffae6, roughness: 0.9 })));
            
            const handsMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 });
            const hHand = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.005, 0.12).translate(0, 0, 0.05), handsMat);
            hHand.position.set(0, 0.065, 0); hHand.rotation.y = 1.5; group.add(hHand);
            const mHand = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.005, 0.18).translate(0, 0, 0.08), handsMat);
            mHand.position.set(0, 0.07, 0); mHand.rotation.y = 0.5; group.add(mHand);
            
            const glass = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, opacity: 1, transparent: true, roughness: 0.1 }));
            glass.position.y = 0.05; glass.scale.y = 0.3; group.add(glass);
            
            const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8), brassMat);
            crown.position.set(0, 0, -0.34); crown.rotation.x = Math.PI / 2; group.add(crown);
            
            group.scale.set(3.5, 3.5, 3.5);
            group.rotation.x = Math.PI / 4;
            return group;
        }

        function createPreviewRecord() {
            const group = new THREE.Group();
            
            // ベース円盤のroughnessを下げてツヤを出す
            const baseMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.15, metalness: 0.2 });
            const vinyl = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.02, 64), baseMat);
            group.add(vinyl);
            
            // 溝（リング）をはっきりさせるために色を明るく、数を増やす
            const ringMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.2, metalness: 0.8 });
            for(let r = 0; r < 8; r++) {
                const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18 + r * 0.035, 0.003, 4, 64), ringMat);
                ring.rotation.x = Math.PI / 2; 
                ring.position.y = 0.012; // 確実にベースより上に出す
                group.add(ring);
            }
            
            const labelColors = [0x8b0000, 0xdaa520, 0x2f4f4f];
            const labelColor = labelColors[Math.floor(Math.random() * labelColors.length)];
            const labelMat = new THREE.MeshStandardMaterial({ color: labelColor, roughness: 0.8 });
            const label = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.022, 32), labelMat);
            group.add(label);
            
            const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.025, 16), holeMat);
            group.add(hole);
            
            group.scale.set(3, 3, 3);
            group.rotation.x = Math.PI / 3;
            return group;
        }

        function createBoatModel(scale = 1, variantIndex = Math.floor(Math.random() * 5)) {
            const boat = new THREE.Group();
            const variants=[{size:.88,sail:0xe9dfc9,flag:0x9b5540,mast:1.75,cabin:false,secondSail:false},{size:1.08,sail:0xd8e0d0,flag:0x607b73,mast:1.95,cabin:true,secondSail:false},{size:1.18,sail:0xe4d3b5,flag:0x9a7440,mast:1.65,cabin:false,secondSail:true},{size:.96,sail:0xd7dce5,flag:0x647b9b,mast:2.05,cabin:false,secondSail:false},{size:1.12,sail:0xe8dfc9,flag:0x8d654e,mast:1.8,cabin:true,secondSail:true}];
            const variant=variants[((variantIndex%variants.length)+variants.length)%variants.length];
            const woodMat=new THREE.MeshStandardMaterial({color:variantIndex%2?0x68462f:0x765033,roughness:.92,flatShading:true});
            const edgeMat=new THREE.MeshStandardMaterial({color:0x4b3021,roughness:.95,flatShading:true});
            const sailMat=new THREE.MeshStandardMaterial({color:variant.sail,roughness:.98,side:THREE.DoubleSide});
            const ropeMat=new THREE.MeshStandardMaterial({color:0x8b765c,roughness:1.0});

            // 船底は先端を絞った木製の船形に
            const hullShape = new THREE.Shape();
            hullShape.moveTo(-1.25, -0.42);
            hullShape.lineTo(0.82, -0.42);
            hullShape.lineTo(1.48, 0);
            hullShape.lineTo(0.82, 0.42);
            hullShape.lineTo(-1.25, 0.42);
            hullShape.closePath();
            const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(hullShape, {
                depth: 0.24, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.035, bevelThickness: 0.035
            }), woodMat);
            hull.rotation.x = -Math.PI / 2;
            hull.position.y = -0.12;
            boat.add(hull);

            // 船べりと船尾板
            for (const side of [-1, 1]) {
                const rail = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.09, 0.07), edgeMat);
                rail.position.set(-0.12, 0.04, side * 0.36);
                boat.add(rail);
            }
            const stern = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.78), edgeMat);
            stern.position.set(-1.18, 0.02, 0);
            boat.add(stern);

            // 座席
            for (const x of [-0.78, -0.12, 0.5]) {
                const seat = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.62), edgeMat);
                seat.position.set(x, 0.09, 0);
                boat.add(seat);
            }

            // マストは船体に差し込み、帆の縦辺をマストにぴったり合わせる
            const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, variant.mast, 8), edgeMat);
            mast.position.set(-0.18, variant.mast / 2 + 0.005, 0);
            boat.add(mast);

            const sailShape = new THREE.Shape();
            sailShape.moveTo(0.015, 0.12);
            sailShape.lineTo(0.015, variant.mast - 0.13);
            sailShape.lineTo(variantIndex % 2 === 0 ? 0.92 : 0.72, 0.34);
            sailShape.closePath();
            const sail = new THREE.Mesh(new THREE.ShapeGeometry(sailShape), sailMat);
            sail.position.set(-0.18, 0.02, 0.025);
            boat.add(sail);

            // マスト先端の小さな三角旗。旗の根元も棒に接続
            const flagShape = new THREE.Shape();
            flagShape.moveTo(0.015, 0);
            flagShape.lineTo(0.015, 0.28);
            flagShape.lineTo(0.42 + (variantIndex % 2) * 0.12, 0.19);
            flagShape.closePath();
            const flag = new THREE.Mesh(new THREE.ShapeGeometry(flagShape), new THREE.MeshStandardMaterial({
                color: variant.flag, roughness: 0.95, side: THREE.DoubleSide
            }));
            flag.position.set(-0.18, variant.mast + 0.005, 0.035);
            boat.add(flag);

            // 控えめな帆の支え綱
            const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.25, 5), ropeMat);
            rope.position.set(0.24, 0.72, -0.015);
            rope.rotation.z = -0.42;
            boat.add(rope);

            if(variant.cabin){const cabin=new THREE.Mesh(new THREE.BoxGeometry(.42,.25,.42),woodMat);cabin.position.set(-.72,.22,0);boat.add(cabin);const roof=new THREE.Mesh(new THREE.BoxGeometry(.5,.06,.48),edgeMat);roof.position.set(-.72,.38,0);boat.add(roof);}
            if(variant.secondSail){const smallMast=new THREE.Mesh(new THREE.CylinderGeometry(.022,.03,.85,7),edgeMat);smallMast.position.set(.62,.48,0);boat.add(smallMast);const smallShape=new THREE.Shape();smallShape.moveTo(0,.08);smallShape.lineTo(0,.78);smallShape.lineTo(.42,.22);smallShape.closePath();const smallSail=new THREE.Mesh(new THREE.ShapeGeometry(smallShape),sailMat);smallSail.position.set(.62,.04,.035);boat.add(smallSail);}
            boat.scale.setScalar(scale*variant.size);boat.userData.modelVariant=variantIndex;return boat;
        }

        function createPreviewBoat(){return createBoatModel(1.6,Math.floor(Math.random()*5));}

        function createPreviewGlassBall() {
            const group = new THREE.Group();
            
            // 透過と反射を持つガラスの質感
            const glassMat = new THREE.MeshPhysicalMaterial({
                color: 0xaaccff, transmission: 0.9, opacity: 0.9, transparent: true, roughness: 0.1, metalness: 0.1, ior: 1.5
            });
            const glassGeo = new THREE.SphereGeometry(0.35, 32, 32);
            const glassMesh = new THREE.Mesh(glassGeo, glassMat);
            group.add(glassMesh);
            
            // 麻縄の網目
            const ropeMat = new THREE.MeshStandardMaterial({
                color: 0x8b5a2b, roughness: 1.0
            });
            for(let r = 0; r < 4; r++) {
                const ropeGeo = new THREE.TorusGeometry(0.355, 0.012, 8, 32);
                const rope = new THREE.Mesh(ropeGeo, ropeMat);
                rope.rotation.y = (Math.PI / 4) * r;
                group.add(rope);
            }
            const ropeGeoH = new THREE.TorusGeometry(0.355, 0.012, 8, 32);
            const ropeH = new THREE.Mesh(ropeGeoH, ropeMat);
            ropeH.rotation.x = Math.PI / 2;
            group.add(ropeH);

            // 結び目
            const knot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), ropeMat);
            knot.position.y = 0.35;
            group.add(knot);

            group.scale.set(3.5, 3.5, 3.5);
            group.position.y = -0.2;
            return group;
        }

        function createPreviewBottle() {
            const group = new THREE.Group();
            const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.25, 20),
                new THREE.MeshPhysicalMaterial({ color: 0x9bc4c8, transmission: 0.72, transparent: true, opacity: 0.55, roughness: 0.12 }));
            glass.rotation.z = Math.PI / 2;
            group.add(glass);
            const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.28, 12),
                new THREE.MeshStandardMaterial({ color: 0x9a6841, roughness: 0.9 }));
            cork.rotation.z = Math.PI / 2;
            cork.position.x = 0.73;
            group.add(cork);
            const letter = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.42, 12),
                new THREE.MeshStandardMaterial({ color: 0xf2e3c6, roughness: 0.8 }));
            letter.rotation.z = -Math.PI / 2;
            letter.position.x = -0.02;
            group.add(letter);
            group.scale.setScalar(2.0);
            return group;
        }

        function showPreviewModel(itemName) {
            if(previewModel) {
                previewScene.remove(previewModel);
                previewModel = null;
            }
            
            if(itemName === "波間を漂う古い流木") previewModel = createPreviewWood();
            else if(itemName === "海を漂う古いランタン") previewModel = createPreviewLantern();
            else if(itemName === "時を刻むアンティーク時計") previewModel = createPreviewWatch();
            else if(itemName === "ノスタルジックな古いレコード盤") previewModel = createPreviewRecord();
            else if(itemName === "波間を漂うガラスの浮き玉") previewModel = createPreviewGlassBall();
            else if(itemName === "小さな木製の船") previewModel = createPreviewBoat();
            else if(itemName === "手紙の入った古いボトル") previewModel = createPreviewBottle();

            const canvas = document.getElementById('preview-canvas');
            const text = document.getElementById('preview-text');
            
            if(previewModel) {
                previewScene.add(previewModel);
                previewCamera.position.z = 6;
                canvas.style.display = 'block';
                text.style.display = 'block';
            } else {
                canvas.style.display = 'none';
                text.style.display = 'none';
            }
        }

        let previewLastFrame = 0;

        function animatePreview() {
            if (previewReqId) return;
            previewLastFrame = performance.now();
            function renderP(now) {
                const notebook = document.getElementById('notebook-container');
                if (!notebook || notebook.style.display !== 'flex') {
                    previewReqId = null;
                    previewLastFrame = 0;
                    return;
                }
                previewReqId = requestAnimationFrame(renderP);
                const delta = Math.min((now - previewLastFrame) / 1000, 0.05);
                previewLastFrame = now;
                if (previewModel && !previewIsDragging) previewModel.rotation.y += 0.3 * delta;
                if (previewRenderer) previewRenderer.render(previewScene, previewCamera);
            }
            previewReqId = requestAnimationFrame(renderP);
        }

        function stopPreviewAnimation() {
            if (previewReqId) cancelAnimationFrame(previewReqId);
            previewReqId = null;
            previewLastFrame = 0;
        }
