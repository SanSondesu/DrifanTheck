/* enhancements.js: deeper sea atmosphere, item individuality and persistent field journal. */
(function(g){
'use strict';
const lore={
"星屑を宿したガラスの浮き玉":{origin:"夜の海を長く漂い、星明かりを閉じ込めたように見える。不思議な輪は、誰かが後から添えたものかもしれない。",clue:"光の角度で青白くも淡い金色にも見える。表面の小さな輝きは、海水の反射か、それとも別の何かだろうか。"},
"波間を漂う古い流木":{origin:"遠い森か、古い桟橋か。木目に残る痕跡だけでは、かつての場所を決められない。",clue:"片側だけが丸く摩耗している。長いあいだ、同じ向きで波を受けていたのかもしれない。"},
"海を漂う古いランタン":{origin:"港の小屋、船の甲板、あるいは誰かの窓辺。灯りの持ち主は、もう確かめようがない。",clue:"金属の縁には塩の跡が残る。最後に灯された夜は、穏やかだったのだろうか。"},
"時を刻むアンティーク時計":{origin:"誰かの机の上にあったのか、それとも旅の荷物に入っていたのか。針だけが時間を覚えている。",clue:"文字盤の縁に細かな擦れがある。長く使われていた品のようにも見える。"},
"ノスタルジックな古いレコード盤":{origin:"音楽を聴く部屋から、遠い船の荷物まで。どこで海に出たのかは分からない。",clue:"ラベルの色は少し褪せている。溝の奥には、まだ旋律が残っているようだ。"},
"波間を漂うガラスの浮き玉":{origin:"漁の道具だったのか、飾りだったのか。透明な球体は、空と海の色だけを映している。",clue:"表面に小さな気泡が見える。ひとつずつ違う表情を持つガラスだ。"},
"小さな木製の船":{origin:"子どもの手で作られた模型か、船乗りのお守りか。帆はまだ、行き先を知らない。",clue:"船体の木目や帆の形は一隻ずつ異なる。作り手の癖が残っているのかもしれない。"},
"手紙の入った古いボトル":{origin:"誰かが届けたかった言葉を抱えたまま、長い時間を海の上で過ごしてきた。",clue:"栓は閉じたまま。手紙の宛先も、差出人も、まだ分からない。"},
"蛍火をまとったランタン":{origin:"夜の港に置かれていた灯りが、いつしか海へ流れ出したのかもしれない。周りに集まる光は、帰る場所を探す蛍のようにも見える。",clue:"淡い光の粒はそれぞれ違う間隔で瞬き、ランタンの周囲を静かに巡っている。"},
"月光を映すレコード":{origin:"月明かりの差し込む部屋で聴かれていた一枚だろうか。ラベルには、夜の色が深く残っている。",clue:"中央の金色は光を受けると柔らかく輝き、薄い銀色の三日月が盤面に浮かんで見える。"},
"星航りの小舟":{origin:"小さな船旅のお守りとして作られたのかもしれない。帆の星は、どちら側から見ても同じように光を受ける。",clue:"船尾には貝殻をかたどった飾りが取り付けられている。小さな真珠のような点が中央で光る。"},
"星屑を宿したガラスの浮き玉":{origin:"星明かりの強い夜に、海へ落ちた光を閉じ込めたような浮き玉。",clue:"ガラスの内側に淡い光が宿り、周囲の輪と小さな輝きが角度によって表情を変える。"},
"潮風の懐中時計":{origin:"遠い船旅に持ち出された懐中時計だろうか。持ち主の手を離れたあとも、細い鎖を揺らしながら海を渡ってきた。",clue:"少しくすんだ真鍮のケースとアイボリーの文字盤。鎖には潮風に磨かれたような柔らかな光沢がある。"}
};
let reflections=[],reflectionTexture=null,initialized=false;
let wind={x:0,z:0,strength:.012,phase:Math.random()*Math.PI*2};
let lastWindLabel='そよ風';
function smooth(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
function makeTexture(){
 const c=document.createElement('canvas');c.width=128;c.height=64;
 const x=c.getContext('2d'),grad=x.createRadialGradient(64,32,1,64,32,62);
 grad.addColorStop(0,'rgba(255,207,139,0.42)');grad.addColorStop(.28,'rgba(255,183,115,0.20)');grad.addColorStop(1,'rgba(255,160,90,0)');
 x.fillStyle=grad;x.fillRect(0,0,128,64);return new THREE.CanvasTexture(c);
}
let surfaceTexture=null;
function makeSurfaceTexture(){
 if(surfaceTexture)return surfaceTexture;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
 const ctx=canvas.getContext('2d'),image=ctx.createImageData(128,128);
 let state=0x51f15e;
 for(let y=0;y<128;y++){
  for(let x=0;x<128;x++){
   state=(state*1664525+1013904223)>>>0;
   const broad=((Math.sin(x*.31)+Math.cos(y*.27))*2.2);
   const grain=Math.max(224,Math.min(255,239+(state>>>27)%12+broad));
   const offset=(y*128+x)*4;
   image.data[offset]=grain;image.data[offset+1]=grain;image.data[offset+2]=grain;image.data[offset+3]=255;
  }
 }
 ctx.putImageData(image,0,0);
 surfaceTexture=new THREE.CanvasTexture(canvas);
 surfaceTexture.wrapS=surfaceTexture.wrapT=THREE.RepeatWrapping;
 surfaceTexture.repeat.set(2,2);
 surfaceTexture.anisotropy=Math.min(4,renderer&&renderer.capabilities?renderer.capabilities.getMaxAnisotropy():2);
 surfaceTexture.generateMipmaps=true;
 surfaceTexture.minFilter=THREE.LinearMipmapLinearFilter;
 surfaceTexture.magFilter=THREE.LinearFilter;
 surfaceTexture.needsUpdate=true;
 return surfaceTexture;
}
function finishMaterial(material,seed){
 const cp=material.clone();
 if(cp.color&&cp.color.isColor)cp.color.offsetHSL((seed-.5)*.018,(seed-.5)*.035,(seed-.5)*.025);
 if((cp.isMeshStandardMaterial||cp.isMeshPhysicalMaterial)&&cp.roughness>=.42){
  if(!cp.roughnessMap)cp.roughnessMap=makeSurfaceTexture();
  if(!cp.bumpMap)cp.bumpMap=makeSurfaceTexture();
  cp.bumpScale=0.0035;
  cp.roughness=THREE.MathUtils.clamp(cp.roughness+(seed-.5)*.025,.35,1);
 }
 cp.needsUpdate=true;
 return cp;
}
function applySurfaceFinish(root,seed=.48){
 if(!root||!g.THREE)return;
 const clones=new Map();
 root.traverse(child=>{
  if(!child.isMesh||!child.material)return;
  const cloneOne=m=>{
   if(!clones.has(m.uuid))clones.set(m.uuid,finishMaterial(m,seed));
   return clones.get(m.uuid);
  };
  child.material=Array.isArray(child.material)?child.material.map(cloneOne):cloneOne(child.material);
 });
}
function individualize(){
 (typeof floaters!=='undefined'?floaters:[]).forEach(obj=>{
  const ud=obj.userData||(obj.userData={}),seed=Math.random();
  ud.appearanceSeed=seed;ud.appearanceScale=.975+seed*.05;
  obj.scale.multiplyScalar(ud.appearanceScale);
  ud.bobHeight=(ud.bobHeight||.03)*(.92+seed*.16);
  ud.wavePhase=seed*Math.PI*2;
  ud.waveSpeed=.9+seed*.42;
  // 重心と水面での安定性に合わせ、形状を変えず揺れの量だけを個別化。
  const motionScale = ud.isBoat ? 0.58 : ud.isRecord ? 0.68 : ud.isLantern ? 0.78 : ud.isWatch ? 0.72 : ud.isDriftwood ? 1.12 : ud.isGlassBall ? 1.08 : ud.isBottle ? 0.88 : 1;
  ud.collisionMass = ud.isBoat ? 2.2 : ud.isDriftwood ? 1.65 : ud.isLantern ? 1.15 : ud.isRecord ? 1.2 : ud.isWatch ? 1.05 : ud.isGlassBall ? 0.72 : ud.isBottle ? 0.82 : 1;
  ud.waveAmplitude=(.018+seed*.022)*motionScale;
  ud.waveTilt = (.012 + seed * .014) * (ud.isBoat ? 0.62 : ud.isRecord ? 0.72 : ud.isDriftwood ? 1.08 : 1);
  if(Number.isFinite(ud.baseRotSpeed)){
   const rotationScale = ud.isBoat ? 0.48 : ud.isRecord ? 0.58 : ud.isLantern ? 0.72 : ud.isDriftwood ? 1.12 : ud.isGlassBall ? 1.08 : 1;
   ud.baseRotSpeed*=rotationScale;
   ud.rotSpeed=ud.baseRotSpeed;
  }
  ud.waveLastOffset=0;
  ud.appearanceNote=seed>.82?'潮に磨かれた跡':seed<.12?'淡い色むら':'';
  const clones=new Map();
  obj.traverse(child=>{
   if(!child.isMesh||!child.material)return;
   const cloneOne=m=>{
    if(!clones.has(m.uuid))clones.set(m.uuid,finishMaterial(m,seed));
    return clones.get(m.uuid);
   };
   child.material=Array.isArray(child.material)?child.material.map(cloneOne):cloneOne(child.material);
  });
 });
}
function init(){
 if(initialized||!scene||!g.THREE)return;
 initialized=true;individualize();
 const lanterns=(typeof floaters!=='undefined'?floaters:[]).filter(o=>o.userData&&o.userData.isLantern);
 if(lanterns.length){
  reflectionTexture=makeTexture();const geo=new THREE.PlaneGeometry(1,1);
  lanterns.forEach(lantern=>{
   const mat=new THREE.MeshBasicMaterial({map:reflectionTexture,color:0xffc18a,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
   const plane=new THREE.Mesh(geo,mat);plane.rotation.x=-Math.PI/2;plane.position.set(lantern.position.x,.035,lantern.position.z);plane.scale.set(9,4,1);plane.renderOrder=2;plane.raycast=()=>{};
   scene.add(plane);reflections.push({lantern,plane,phase:Math.random()*Math.PI*2});
  });
 }
 recordObservation('session');renderJournal();
}
function updateTime(progress,dayRatio,sunsetRatio,nightRatio){
 if(!water||!scene)return;
 const dawn=smooth(.16,.24,progress)*(1-smooth(.30,.38,progress)),twilight=Math.max(sunsetRatio,dawn*.72);
 const dusk=smooth(.68,.76,progress)*(1-smooth(.82,.90,progress));
 if(water.material.uniforms&&water.material.uniforms.distortionScale){
  water.material.uniforms.distortionScale.value=2.35+twilight*.18+nightRatio*.12;
 }
 if(scene.fog&&scene.fog.isFogExp2){
  const mistColor=new THREE.Color(0x9fb6c5)
   .lerp(new THREE.Color(0xd6ae9a),Math.min(.28,twilight*.24))
   .lerp(new THREE.Color(0x71839e),nightRatio*.28);
  scene.fog.color.copy(mistColor);
  // 早朝だけ、ごく薄い霧を出し、朝の進行とともに自然に晴らす。
  // 既存の岩・波・漂流物の色や形を変えないため、濃度は控えめに制限。
  scene.fog.density=0.00016*dawn;
 }
}
function updateFrame(now,nightRatio,deltaSeconds=1/60){
 const t=now*.001;
 const dt=Math.min(Math.max(deltaSeconds||0,0),.1);
 const targetStrength=.016+.018*(.5+.5*Math.sin(t*.035+wind.phase))+.010*(.5+.5*Math.sin(t*.013+wind.phase*1.7));
 wind.strength+=(targetStrength-wind.strength)*(1-Math.exp(-dt/5));
 const direction=t*.018+Math.sin(t*.009+wind.phase)*.22;
 wind.x=Math.cos(direction)*wind.strength;
 wind.z=Math.sin(direction)*wind.strength;
 lastWindLabel=wind.strength<.024?'そよ風':wind.strength<.034?'やわらかな風':'強めの風';
 reflections.forEach(({lantern,plane,phase})=>{
  if(!lantern.parent)return;
  plane.position.x=lantern.position.x+Math.sin(t*.45+phase)*.7;
  plane.position.z=lantern.position.z+Math.cos(t*.38+phase)*.45;
  const waveTime=water&&water.userData&&water.userData.waveTimeUniform?water.userData.waveTimeUniform.value:t*.2;
  const waveHeight=typeof getOceanWaveHeight==='function'?getOceanWaveHeight(plane.position.x,plane.position.z,waveTime):0;
  plane.position.y=waveHeight+.035;
  if(typeof getOceanWaveHeight==='function'){
   const step=3;
   const slopeX=(getOceanWaveHeight(plane.position.x+step,plane.position.z,waveTime)-getOceanWaveHeight(plane.position.x-step,plane.position.z,waveTime))/(2*step);
   plane.rotation.z=-Math.atan(slopeX)*.55+Math.sin(t*.35+phase)*.025;
  }
  const tapGlow=lantern.userData&&lantern.userData.isGlowing?0.035:0;
  plane.material.opacity=nightRatio*(.045+.03*(.5+.5*Math.sin(t*1.1+phase))+tapGlow);
  plane.rotation.z=Math.sin(t*.35+phase)*.08;
  const pulse=1+.075*Math.sin(t*.8+phase);plane.scale.set(9.5*pulse,4.5*pulse,1);
 });
}
const discoveryEffects=[];
let discoveryGeometry=null;
function playDiscoveryEffect(target){
 if(!target||!scene||!THREE)return;
 const ud=target.userData||(target.userData={});
 if(ud.discoverySparkleShown)return;
 ud.discoverySparkleShown=true;
 if(!discoveryGeometry)discoveryGeometry=new THREE.OctahedronGeometry(.045,0);
 const rare=!!(ud.isRareLantern||ud.isRareWatch||ud.isRareRecord||ud.isRareGlassBall||ud.isRareBoat);
 const count=rare?9:6;
 const origin=new THREE.Vector3();
 target.getWorldPosition(origin);
 for(let i=0;i<count;i++){
  const angle=(i/count)*Math.PI*2+(Math.random()-.5)*.28;
  const lift=.18+Math.random()*.34;
  const material=new THREE.MeshBasicMaterial({
   color:rare?(i%3===0?0xf4dfad:0xc7dfff):0xd9e9f4,
   transparent:true,opacity:0,depthWrite:false,
   blending:THREE.AdditiveBlending
  });
  const mesh=new THREE.Mesh(discoveryGeometry,material);
  const radius=.28+Math.random()*.34;
  mesh.position.set(origin.x+Math.cos(angle)*radius,origin.y+lift,origin.z+Math.sin(angle)*radius);
  mesh.scale.setScalar(.55+Math.random()*.55);
  scene.add(mesh);
  discoveryEffects.push({
   mesh,life:0,maxLife:rare?1.55:1.15,
   vx:Math.cos(angle)*(.003+Math.random()*.004),
   vy:.002+Math.random()*.003,
   vz:Math.sin(angle)*(.003+Math.random()*.004),
   phase:Math.random()*Math.PI*2
  });
 }
}
function makeObservationText(reason,itemName){
 const progress=Number.isFinite(currentProgress)?currentProgress:.5,hour=Math.floor(progress*24);
 const period=hour<5?'夜更け':hour<9?'朝':hour<16?'昼':hour<19?'夕暮れ':'夜';
 const counts=Object.values(floaterDiscovery||{}).reduce((n,v)=>n+(v&&v.count||0),0);
 if(reason==='discovery')return period+'、'+itemName+'との出会いが記録された。海にはまだ、知らない旅の続きがある。';
 if(reason==='rare')return period+'、'+(itemName||'特別な漂流物')+'が流れてきた。いつもの漂流物とは少し違う、静かな輝きをまとっていた。';
 const lines=['静かな'+period+'の海を眺めた。水面の光は、ゆっくりと姿を変えていた。',period+'の海には、これまでに'+counts+'回の出会いが積み重なっている。漂流物はそれぞれの速さで流れていく。','波の音だけが続く'+period+'。遠くの景色は変わらなくても、海の表情は少しずつ違って見える。'];
 return lines[new Date().getDate()%lines.length];
}
function recordObservation(reason,itemName){
 const entries=seaObservationEntries||(seaObservationEntries=[]),date=new Date().toLocaleDateString('ja-JP');
 let entry=entries.find(x=>x.date===date);
 if(entry){
  if((reason==='discovery'||reason==='rare')&&itemName&&!entry.text.includes(itemName)){
   const detail=reason==='rare'?'特別な漂流物「'+itemName+'」との出会いもあった。':'「'+itemName+'」との出会いもあった。';
   entry.text+=' '+detail;
  }
 }else entries.push({date,text:makeObservationText(reason,itemName),createdAt:new Date().toISOString()});
 while(entries.length>90)entries.shift();
 renderJournal();if(typeof saveProgress==='function')saveProgress();
}
function renderJournal(){
 const root=document.getElementById('sea-observation-list');if(!root)return;
 const entries=(seaObservationEntries||[]).slice(-7).reverse();root.textContent='';
 if(!entries.length){const p=document.createElement('p');p.textContent='海で過ごした時間が、ここに記録されます。';root.appendChild(p);return;}
 entries.forEach(e=>{
  const article=document.createElement('div');article.className='observation-entry';
  const date=document.createElement('span');date.className='observation-date';date.textContent=e.date;
  const body=document.createElement('span');body.className='observation-text';body.textContent=e.text;
  article.append(date,body);root.appendChild(article);
 });
}
function renderLore(itemName){
 const panel=document.getElementById('item-description'),data=lore[itemName];if(!panel||!data)return;
 if(((floaterDiscovery[itemName]||{}).count||0)<3)return;
 const note=document.createElement('div');note.className='lore-note';
 const origin=document.createElement('span');origin.textContent='来歴の仮説：'+data.origin;
 const clue=document.createElement('span');clue.style.display='block';clue.style.marginTop='6px';clue.textContent='観察メモ：'+data.clue;
 note.append(origin,clue);
 const instance=(typeof floaters!=='undefined'?floaters:[]).find(o=>typeof getFloaterItemName==='function'&&getFloaterItemName(o)===itemName);
 if(instance&&instance.userData.appearanceNote){const detail=document.createElement('span');detail.style.display='block';detail.style.marginTop='6px';detail.textContent='個体の特徴：'+instance.userData.appearanceNote;note.appendChild(detail);}
 panel.appendChild(note);
}
function updateDiscoveryEffects(deltaSeconds){
 const dt=Math.min(Math.max(deltaSeconds||0,0),.05)*60;
 for(let i=discoveryEffects.length-1;i>=0;i--){
  const effect=discoveryEffects[i],mesh=effect.mesh;
  effect.life+=dt/60;
  const progress=effect.life/effect.maxLife;
  if(progress>=1){
   scene.remove(mesh);
   mesh.material.dispose();
   discoveryEffects.splice(i,1);
   continue;
  }
  mesh.position.x+=effect.vx*dt;
  mesh.position.y+=effect.vy*dt;
  mesh.position.z+=effect.vz*dt;
  const pulse=.72+.28*Math.sin(effect.life*8+effect.phase);
  mesh.scale.setScalar((.42+.42*(1-progress))*pulse);
  mesh.material.opacity=(1-progress)*(.36+.28*Math.sin(effect.life*5+effect.phase));
  mesh.rotation.x+=.018*dt;
  mesh.rotation.y+=.024*dt;
 }
}
g.DrifanEnhancements=Object.freeze({init,updateTime,updateFrame,updateDiscoveryEffects,playDiscoveryEffect,recordObservation,renderJournal,renderLore,applySurfaceFinish,getWind:()=>wind,getWindLabel:()=>lastWindLabel});
})(window);
