let scene, camera, renderer, water, sky;
        let sun, sunMesh, moon, moonMesh;
        let directionalLight, ambientLight;
        let rock, stars;
        let bioluminescence;
        let controls;
        let pmremGenerator;
        let floaters = [];
        let currentProgress = 0;

        let shootingStar;
        let lastShootingStarTime = 0;
        let isShootingStarActive = false;
        let shootingStarStartTime = 0;
        let shootingStarStartPos = new THREE.Vector3();
        let shootingStarDir = new THREE.Vector3();
        const SHOOTING_STAR_DURATION = 0.55; 
        let nextShootingStarInterval = 15000;
        
        let readBottlesCount = 0;
        
        // --- 記録ノート用データ ---
        let readMessagesList = [];
        let touchedItemsSet = new Set();
        let discoveredFloaterInstances = new Set();
        let floaterEncounterSerial = 0;
        let floaterDiscovery = {};
        let seaObservationEntries = [];
        const FLOATER_DESCRIPTIONS = {"波間を漂う古い流木":{"lines":["どこから流れてきたかわからない、波間を漂う古い流木。","長い時間を海の上で過ごし、角が取れて丸くなったその姿には、","遠い森の記憶が、今も静かに残っているようだ。"],"echoes":["潮風に撫でられながら、今日もゆっくりと流れていく。","かつて根を張っていた場所を、まだ覚えているのだろうか。","波に揺られる音だけが、その長い旅を知っている。","海辺にたどり着く日を、急ぐ様子もなく待っている。","木目の奥には、知らない季節が幾重にも眠っている。","同じ形のものは、ひとつとしてない。","その旅路は、まだ海の途中にある。"]},"海を漂う古いランタン":{"lines":["どこから流れてきたかわからない、海を漂う古いランタン。","長いあいだ暗い海を旅してきたのだろうか、","その小さな灯りは、今も誰かの帰りを待っているようだ。"],"echoes":["灯りが揺れるたび、波の表情も少しだけ変わる。","誰かが最後に火をともした夜は、どんな夜だったのだろう。","遠くから見れば、星のひとつに見えるかもしれない。","暗い海にも、帰る場所を思い出させる光がある。","この灯りを見つけた誰かも、同じ海を眺めているのだろうか。","夜が明けても、旅の記憶は消えない。","小さな光は、今日も静かに海を渡る。"]},"時を刻むアンティーク時計":{"lines":["どこから流れてきたかわからない、時を刻むアンティーク時計。","針が刻んできた時間も、かつて持ち主が眺めていた景色も、","今となっては、波の向こうに置き去りにされてしまった。"],"echoes":["止まった針の先にも、過ぎ去った時間が続いている。","誰かの大切な一日を、そっと覚えているのかもしれない。","海の上では、時間さえ少しゆっくり流れる。","もう鳴らない音を、波だけが聞いている。","針が指す時刻には、どんな思い出があったのだろう。","失われた時間も、ここでは静かに漂っている。","次の時を告げる声は、まだ聞こえない。"]},"ノスタルジックな古いレコード盤":{"lines":["どこから流れてきたかわからない、ノスタルジックな古いレコード盤。","かつて誰かの部屋に音楽を届けていたのだろうか、","溝のひとつひとつに、遠い日の旋律が眠っている。"],"echoes":["針を落とせば、知らない誰かの午後がよみがえるだろうか。","波の音に混じって、かすかな旋律が聞こえる気がする。","音楽を聴いていた部屋には、どんな光が差していたのだろう。","回り続ける円の中に、懐かしい時間が閉じ込められている。","遠い日の歌は、まだ誰かに届くことを待っている。","海は音を運び、記憶を遠くへ連れていく。","静かな針音だけが、旅の続きを奏でている。"]},"波間を漂うガラスの浮き玉":{"lines":["どこから流れてきたかわからない、波間を漂うガラスの浮き玉。","透き通った表面には、空や海の色が淡く映り込み、","まるで海そのものを閉じ込めた、小さな宝石のようだ。"],"echoes":["光の角度が変わるたび、違う色の海を映し出す。","かつて誰かの船を、静かに支えていたのかもしれない。","遠くの空まで、小さな丸い世界に映っている。","波にぶつかっても、その透明な輝きは失われない。","海の色を集めながら、今日も漂い続けている。","手のひらに乗せれば、潮騒まで聞こえてきそうだ。","その中には、まだ見ぬ景色が映っている。"]},"小さな木製の船":{"lines":["どこから流れてきたかわからない、小さな木製の船。","かつて誰かを乗せて、遠い海へ向かっていたのだろうか、","今はただ、静かな波に身を任せて漂っている。"],"echoes":["小さな帆は、まだ行き先を決めていない。","この船が見てきた海は、どんな色をしていたのだろう。","帆を揺らす風だけが、旅の始まりを覚えている。","遠い水平線の向こうにも、静かな海が続いている。","誰かの手で作られた温もりが、木肌に残っている。","波に揺られても、小さな船は進むことをやめない。","いつかまた、どこかの岸辺に出会うだろう。"]},"手紙の入った古いボトル":{"lines":["どこから流れてきたかわからない、手紙の入った古いボトル。","誰かが遠い海の向こうへ届けようとした言葉を抱えたまま、","長い旅の果てに、この静かな海辺へたどり着いた。"],"echoes":["宛名のない手紙にも、届けたい誰かがいたのだろう。","栓の向こうには、まだ読まれていない言葉が眠っている。","この海を渡った時間だけ、手紙にも物語が増えていく。","誰かの願いは、波に消えずに残っているのかもしれない。","遠くへ流した言葉が、思いがけない岸辺に届くこともある。","瓶の内側には、海の青さが淡く映っている。","まだ見ぬ誰かへ、静かな便りを運び続けている。"]}};
        
        let ripples = [];
        
        let whaleGroup;
        let isWhaleActive = false;
        let whaleStartTime = 0;
        const WHALE_DURATION = 16.0; 
        let lastWhaleTime = 0;
        let nextWhaleInterval = 20000; // 初回は約20秒後に発生
        let whaleParticles = [];
        
        let birdsGroup;
        let targetBirdOpacity = 0;
        let currentBirdOpacity = 0;

        let watchSoundInterval;

        let currentNightRatio = 0;
        let currentHours = 12;
        let currentMinutes = 0;
        let isHourMode = true;
        
        let raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();
        let pointerDownPos = new THREE.Vector2();
        
        // --- プレビュー機能用変数 ---
        let previewScene, previewCamera, previewRenderer, previewModel;
        let previewReqId;
        let previewIsDragging = false;
        let previewPrevMouse = {x: 0, y: 0};
        let previewPinchDist = 0;
        
        const PRESET_MESSAGES = [
            "君の今日が良い一日でありますように。",
            "遠い海から、名もなき旅人より。",
            "時には立ち止まって、星を見るのも悪くないよ。",
            "明日は明日の風が吹く。",
            "この広い海で、このメッセージを見つけてくれてありがとう。",
            "大丈夫、きっと上手くいくさ。",
            "静けさの中で、本当の自分の声が聞こえるかもしれない。",
            "どこかで誰かが、あなたの幸せを祈っています。",
            "波の音に耳をすませば、心のざわめきも消えていく。",
            "今日という日は、二度と来ない贈り物。"
        ];

        const SUNSET_COLOR = new THREE.Color(0xff6600);
        const DAY_LIGHT_COLOR = new THREE.Color(0xfff0dd); 
        const MOONLIGHT_COLOR = new THREE.Color(0xafd5ff);
        const WATER_BASE_DAY = new THREE.Color(0x003554); 
        const WATER_BASE_SUNSET = new THREE.Color(0x1a0f05);
        const WATER_BASE_NIGHT = new THREE.Color(0x0d2035); 

        let particles = [];
        let particleTexture;
        let particleGeo; 

        let audioCtx;
        let noiseNode;
        let biquadFilter;
        let gainNode;

        let uiTimeout;
        const UI_HIDE_DELAY = DrifanConfig.timing.uiHideDelay;

        window.onload = function () {
            try {
                if (window.DrifanDiagnostics) {
                    const diagnostic = DrifanDiagnostics.run({ storage: true });
                    if (!diagnostic.passed) console.warn('DrifanTheck startup diagnostics:', diagnostic);
                }
                restoreSavedProgress();
                const initialized = init();
                if (initialized === false) return;
                animate();
                initAudio();
            } catch (error) {
                console.error('DrifanTheck initialization failed:', error);
                if (window.DrifanRuntime) DrifanRuntime.show('3D空間の初期化に失敗しました。ページを再読み込みしてお試しください。');
                return;
            }
            
            const startScreen = document.getElementById('start-screen');
            const startBtn = document.getElementById('start-btn');
            
            if (startBtn && startScreen) {
                startBtn.addEventListener('click', () => {
                    const logoWrapper = document.querySelector('.logo-wrapper');
                    if(logoWrapper) logoWrapper.style.opacity = '0';
                    
                    startBtn.style.opacity = '0';
                    startBtn.style.pointerEvents = 'none';

                    setTimeout(() => {
                        startScreen.style.opacity = '0';
                    }, DrifanConfig.timing.startFadeDelay);

                    initAudio(); 
                    resetUITimer();
                    
                    setTimeout(() => {
                        startScreen.style.display = 'none';
                    }, DrifanConfig.timing.startHideDelay);
                });
            }
        };

        function restoreSavedProgress() {
            if (!window.DrifanStorage) return;
            const saved = DrifanStorage.load();
            readMessagesList = saved.messages.slice();
            readBottlesCount = saved.bottleCount;
            floaterDiscovery = {};
            seaObservationEntries = Array.isArray(saved.journal) ? saved.journal.slice(-90) : [];
            touchedItemsSet = new Set();
            Object.keys(saved.discoveries).forEach(name => {
                const count = Number(saved.discoveries[name] && saved.discoveries[name].count);
                if (Number.isFinite(count) && count > 0) {
                    floaterDiscovery[name] = { count: Math.floor(count), firstAt: saved.discoveries[name].firstAt || null, lastAt: saved.discoveries[name].lastAt || null };
                    touchedItemsSet.add(name);
                }
            });
            currentProgress = Number.isFinite(saved.settings.timeProgress)
                ? saved.settings.timeProgress
                : ((window.DrifanConfig && DrifanConfig.world.defaultTimeProgress) || (17.5 / 24));
        }

        function saveProgress() {
            if (!window.DrifanStorage) return;
            DrifanStorage.save({
                messages: readMessagesList,
                discoveries: floaterDiscovery,
                bottleCount: readBottlesCount,
                timeProgress: currentProgress,
                journal: seaObservationEntries
            });
        }

        function resetUITimer() {
            const uiContainer = document.getElementById('ui-container');
            const writeBtn = document.getElementById('write-btn');
            const notebookBtn = document.getElementById('notebook-btn');
            
            if (uiContainer) uiContainer.classList.remove('hidden-ui');
            if (writeBtn) writeBtn.classList.remove('hidden-ui');
            if (notebookBtn) notebookBtn.classList.remove('hidden-ui');
            
            clearTimeout(uiTimeout);
            uiTimeout = setTimeout(() => {
                const msgContainer = document.getElementById('message-container');
                const compContainer = document.getElementById('compose-container');
                const nbContainer = document.getElementById('notebook-container');
                
                if ((!msgContainer || msgContainer.style.display !== 'flex') &&
                    (!compContainer || compContainer.style.display !== 'flex') &&
                    (!nbContainer || nbContainer.style.display !== 'flex')) {
                    if (uiContainer) uiContainer.classList.add('hidden-ui');
                    if (writeBtn) writeBtn.classList.add('hidden-ui');
                    if (notebookBtn) notebookBtn.classList.add('hidden-ui');
                }
            }, UI_HIDE_DELAY);
        }

        function init() {
            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera(DrifanConfig.world.cameraFov, window.innerWidth / window.innerHeight, DrifanConfig.world.cameraNear, DrifanConfig.world.cameraFar);
            camera.position.set(...DrifanConfig.world.cameraStart);

            try {
                renderer = new THREE.WebGLRenderer({ antialias: DrifanConfig.quality.antialias });
            } catch (error) {
                console.error('WebGL renderer creation failed:', error);
                if (window.DrifanRuntime) DrifanRuntime.show('WebGLを利用できないため、3D表示を開始できませんでした。ブラウザの設定や対応状況をご確認ください。');
                return false;
            }
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DrifanConfig.limits.pixelRatio));
            renderer.domElement.addEventListener('webglcontextlost', (event) => {
                event.preventDefault();
                console.error('WebGL context lost.');
                if (window.DrifanRuntime) DrifanRuntime.show('3D表示が一時停止しました。復旧を待つか、再読み込みしてください。');
            });
            renderer.domElement.addEventListener('webglcontextrestored', () => {
                try {
                    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DrifanConfig.limits.pixelRatio));
                    renderer.setSize(window.innerWidth, window.innerHeight);
                    if (controls) controls.update();
                    if (window.DrifanRuntime) DrifanRuntime.hide();
                    console.info('DrifanTheck: WebGL context restored.');
                } catch (error) {
                    console.error('WebGL restoration failed:', error);
                    if (window.DrifanRuntime) DrifanRuntime.show('3D表示の復旧に失敗しました。ページを再読み込みしてください。');
                }
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 0.6; 
            document.body.appendChild(renderer.domElement);

            pmremGenerator = new THREE.PMREMGenerator(renderer);

            sun = new THREE.Vector3();
            moon = new THREE.Vector3();

            const waterGeometry = new THREE.PlaneGeometry(40000, 40000, 512, 512);
            water = new THREE.Water(
                waterGeometry,
                {
                    textureWidth: DrifanConfig.world.waterTextureSize,
                    textureHeight: DrifanConfig.world.waterTextureSize,
                    waterNormals: new THREE.TextureLoader().load(
                        'https://threejs.org/examples/textures/waternormals.jpg',
                        function (texture) {
                            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                        }
                    ),
                    sunDirection: new THREE.Vector3(),
                    sunColor: SUNSET_COLOR.getHex(),
                    waterColor: WATER_BASE_SUNSET.getHex(),
                    distortionScale: 1.5,
                    fog: true
                }
            );
            water.rotation.x = -Math.PI / 2;

            // 水面の頂点位置そのものを変形。worldPositionだけでなく、
            // 反射座標と最終描画座標(gl_Position)にも同じ変形後座標を使う。
            const oceanWaveTime = { value: 0 };
            water.userData.waveTimeUniform = oceanWaveTime;
            water.material.onBeforeCompile = (shader) => {
                shader.uniforms.uOceanWaveTime = oceanWaveTime;
                shader.vertexShader = 'uniform float uOceanWaveTime;\n' + shader.vertexShader;

                const waveVertexCode = `
                    vec3 displacedPosition = position;
                    float oceanWaveA = sin(position.x * 0.0068 + position.y * 0.0042 + uOceanWaveTime * 0.72) * 0.72;
                    float oceanWaveB = sin(position.x * 0.0034 - position.y * 0.0072 - uOceanWaveTime * 0.52) * 0.42;
                    float oceanWaveC = sin((position.x - position.y) * 0.0085 + uOceanWaveTime * 0.88) * 0.18;
                    displacedPosition.z += oceanWaveA + oceanWaveB + oceanWaveC;
                `;
                shader.vertexShader = shader.vertexShader.replace('void main() {', 'void main() {\n' + waveVertexCode);

                const positionPattern = /vec4\(\s*position\s*,\s*1\.0\s*\)/g;
                const positionCalls = shader.vertexShader.match(positionPattern) || [];
                if (positionCalls.length < 3) {
                    console.error('DrifanTheck: water vertex shader layout changed; geometric waves were not applied.', positionCalls.length);
                    return;
                }
                shader.vertexShader = shader.vertexShader.replace(
                    positionPattern,
                    'vec4( displacedPosition, 1.0 )'
                );
            };
            water.material.customProgramCacheKey = () => 'drifantheck-geometric-ocean-waves-v3';
            water.material.needsUpdate = true;
            scene.add(water);

            scene.fog = new THREE.FogExp2(0x8899aa, 0.000);

            sky = new THREE.Sky();
            sky.scale.setScalar(10000);
            scene.add(sky);
            
            const skyUniforms = sky.material.uniforms;
            skyUniforms['turbidity'].value = 10;
            skyUniforms['rayleigh'].value = 3;
            skyUniforms['mieCoefficient'].value = 0.000; 
            skyUniforms['mieDirectionalG'].value = 0.8; 

            particleGeo = new THREE.SphereGeometry(0.4, 16, 16); 

            createSunAndMoon();
            createStars();
            createShootingStar(); 
            createParticleTexture();
            createBioluminescence();
            createWhale(); 
            createBirds();

            ambientLight = new THREE.AmbientLight(0x404040, 0.5); 
            scene.add(ambientLight);
            
            directionalLight = new THREE.DirectionalLight(SUNSET_COLOR.getHex(), 1); 
            scene.add(directionalLight);

            createRock();
            createFloaters(DrifanConfig.population.bottles, DrifanConfig.population.driftwood, DrifanConfig.population.lanterns, DrifanConfig.population.watches, DrifanConfig.population.records, DrifanConfig.population.glassFloats, DrifanConfig.population.boats);

            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enablePan = false; 
            controls.minDistance = DrifanConfig.world.minCameraDistance; 
            controls.maxDistance = DrifanConfig.world.maxCameraDistance; 
            controls.maxPolarAngle = DrifanConfig.world.maxPolarAngle; 
            
            if (window.DrifanEnhancements) DrifanEnhancements.init();
            window.addEventListener('pagehide', saveProgress);
            document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveProgress(); });
            window.addEventListener('resize', onWindowResize);
            window.addEventListener('pointerdown', onPointerDown);
            window.addEventListener('pointerup', onPointerUp);
            window.addEventListener('mousemove', resetUITimer);
            window.addEventListener('touchstart', resetUITimer);
            window.addEventListener('wheel', resetUITimer);
            
            setupUI();
            setSliderToProgress(Number.isFinite(currentProgress) ? currentProgress : 17.5 / 24);
            const counter = document.getElementById('bottle-counter');
            if (counter) counter.innerHTML = '<svg class="bottle-icon" viewBox="0 0 32 52" role="img" aria-label="ボトルのイラスト" xmlns="http://www.w3.org/2000/svg"><path d="M12 3.5h8v5l-1.2 2.2v6.1c0 1.8 1 3.1 3 4.7 2.2 1.8 3.2 3.6 3.2 6.6v16.2c0 2.2-1.8 4-4 4H11c-2.2 0-4-1.8-4-4V28.1c0-3 1-4.8 3.2-6.6 2-1.6 3-2.9 3-4.7v-6.1L12 8.5z" fill="rgba(153,190,190,.22)" stroke="#d9c69b" stroke-width="1.35" stroke-linejoin="round"/><path d="M12 3.5h8v4.8h-8z" fill="#c6a875" stroke="#ead9b7" stroke-width="1"/><path d="M10 28.5c4 1.2 8 1.2 12 0M10 39.5c4 1.2 8 1.2 12 0" fill="none" stroke="rgba(226,218,194,.58)" stroke-width=".9"/><path d="M12.2 23.5c2.1-1.3 5.5-1.3 7.6 0" fill="none" stroke="#e5d7b8" stroke-width="1" stroke-linecap="round"/><path d="M11 30.5v6" stroke="rgba(235,245,239,.55)" stroke-width="1.2" stroke-linecap="round"/></svg><span class="bottle-count-num">' + readBottlesCount + '</span>';
            updateNotebookUI();
            return true;
        }
        
