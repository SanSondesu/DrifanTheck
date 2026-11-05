/* enhancements.js: deeper sea atmosphere, item individuality and persistent field journal. */
(function(g){
'use strict';
const lore={
"波間を漂う古い流木":{origin:"遠い森か、古い桟橋か。木目に残る痕跡だけでは、かつての場所を決められない。",clue:"片側だけが丸く摩耗している。長いあいだ、同じ向きで波を受けていたのかもしれない。"},
"海を漂う古いランタン":{origin:"港の小屋、船の甲板、あるいは誰かの窓辺。灯りの持ち主は、もう確かめようがない。",clue:"金属の縁には塩の跡が残る。最後に灯された夜は、穏やかだったのだろうか。"},
"時を刻むアンティーク時計":{origin:"誰かの机の上にあったのか、それとも旅の荷物に入っていたのか。針だけが時間を覚えている。",clue:"文字盤の縁に細かな擦れがある。長く使われていた品のようにも見える。"},
"ノスタルジックな古いレコード盤":{origin:"音楽を聴く部屋から、遠い船の荷物まで。どこで海に出たのかは分からない。",clue:"ラベルの色は少し褪せている。溝の奥には、まだ旋律が残っているようだ。"},
"波間を漂うガラスの浮き玉":{origin:"漁の道具だったのか、飾りだったのか。透明な球体は、空と海の色だけを映している。",clue:"表面に小さな気泡が見える。ひとつずつ違う表情を持つガラスだ。"},
"小さな木製の船":{origin:"子どもの手で作られた模型か、船乗りのお守りか。帆はまだ、行き先を知らない。",clue:"船体の木目や帆の形は一隻ずつ異なる。作り手の癖が残っているのかもしれない。"},
"手紙の入った古いボトル":{origin:"誰かが届けたかった言葉を抱えたまま、長い時間を海の上で過ごしてきた。",clue:"栓は閉じたまま。手紙の宛先も、差出人も、まだ分からない。"}
};
let reflections=[],reflectionTexture=null,initialized=false;
function smooth(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
function makeTexture(){
 const c=document.createElement('canvas');c.width=128;c.height=64;
 const x=c.getContext('2d'),grad=x.createRadialGradient(64,32,1,64,32,62);
 grad.addColorStop(0,'rgba(255,207,139,0.42)');grad.addColorStop(.28,'rgba(255,183,115,0.20)');grad.addColorStop(1,'rgba(255,160,90,0)');
 x.fillStyle=grad;x.fillRect(0,0,128,64);return new THREE.CanvasTexture(c);
}
function individualize(){
 (g.floaters||[]).forEach(obj=>{
  const ud=obj.userData||(obj.userData={}),seed=Math.random();
  ud.appearanceSeed=seed;ud.appearanceScale=.975+seed*.05;
  obj.scale.multiplyScalar(ud.appearanceScale);
  ud.bobHeight=(ud.bobHeight||.03)*(.92+seed*.16);
  ud.appearanceNote=seed>.82?'潮に磨かれた跡':seed<.12?'淡い色むら':'';
  const clones=new Map();
  obj.traverse(child=>{
   if(!child.isMesh||!child.material)return;
   const cloneOne=m=>{
    if(!clones.has(m.uuid)){
     const cp=m.clone();
     if(cp.color&&cp.color.isColor)cp.color.offsetHSL((seed-.5)*.018,(seed-.5)*.035,(seed-.5)*.025);
     clones.set(m.uuid,cp);
    }
    return clones.get(m.uuid);
   };
   child.material=Array.isArray(child.material)?child.material.map(cloneOne):cloneOne(child.material);
  });
 });
}
function init(){
 if(initialized||!g.scene||!g.THREE)return;
 initialized=true;individualize();
 const lanterns=(g.floaters||[]).filter(o=>o.userData&&o.userData.isLantern);
 if(lanterns.length){
  reflectionTexture=makeTexture();const geo=new THREE.PlaneGeometry(1,1);
  lanterns.forEach(lantern=>{
   const mat=new THREE.MeshBasicMaterial({map:reflectionTexture,color:0xffc18a,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
   const plane=new THREE.Mesh(geo,mat);plane.rotation.x=-Math.PI/2;plane.position.set(lantern.position.x,.035,lantern.position.z);plane.scale.set(9,4,1);plane.renderOrder=2;plane.raycast=()=>{};
   g.scene.add(plane);reflections.push({lantern,plane,phase:Math.random()*Math.PI*2});
  });
 }
 recordObservation('session');renderJournal();
}
function updateTime(progress,dayRatio,sunsetRatio,nightRatio){
 if(!g.water||!g.scene)return;
 const dawn=smooth(.72,.96,progress)*(1-smooth(.12,.28,progress)),twilight=Math.max(sunsetRatio,dawn*.72);
 const sunColor=g.water.material.uniforms&&g.water.material.uniforms.sunColor;
 if(sunColor&&sunColor.value&&sunColor.value.isColor)sunColor.value.lerp(new THREE.Color(0xffbd91),twilight*.10);
 if(g.water.material.uniforms&&g.water.material.uniforms.distortionScale)g.water.material.uniforms.distortionScale.value=1.5+twilight*.07+nightRatio*.025;
 if(g.scene.fog&&g.scene.fog.isFogExp2){g.scene.fog.color.set(0x8899aa).lerp(new THREE.Color(0x9bb4c8),dawn*.12+nightRatio*.05);g.scene.fog.density=.000012+dawn*.000018;}
}
function updateFrame(now,nightRatio){
 const t=now*.001;
 reflections.forEach(({lantern,plane,phase})=>{
  if(!lantern.parent)return;
  plane.position.x=lantern.position.x+Math.sin(t*.45+phase)*.7;
  plane.position.z=lantern.position.z+Math.cos(t*.38+phase)*.45;
  plane.material.opacity=nightRatio*(.035+.025*(.5+.5*Math.sin(t*1.1+phase)));
  plane.rotation.z=Math.sin(t*.35+phase)*.08;
  const pulse=1+.06*Math.sin(t*.8+phase);plane.scale.set(9*pulse,4*pulse,1);
 });
}
function makeObservationText(reason,itemName){
 const progress=Number.isFinite(g.currentProgress)?g.currentProgress:.5,hour=Math.floor(progress*24);
 const period=hour<5?'夜更け':hour<9?'朝':hour<16?'昼':hour<19?'夕暮れ':'夜';
 const counts=Object.values(g.floaterDiscovery||{}).reduce((n,v)=>n+(v&&v.count||0),0);
 if(reason==='discovery')return period+'、'+itemName+'との出会いが記録された。海にはまだ、知らない旅の続きがある。';
 const lines=['静かな'+period+'の海を眺めた。水面の光は、ゆっくりと姿を変えていた。',period+'の海には、これまでに'+counts+'回の出会いが積み重なっている。漂流物はそれぞれの速さで流れていく。','波の音だけが続く'+period+'。遠くの景色は変わらなくても、海の表情は少しずつ違って見える。'];
 return lines[new Date().getDate()%lines.length];
}
function recordObservation(reason,itemName){
 const entries=g.seaObservationEntries||(g.seaObservationEntries=[]),date=new Date().toLocaleDateString('ja-JP');
 let entry=entries.find(x=>x.date===date);
 if(entry){
  if(reason==='discovery'&&itemName&&!entry.text.includes(itemName))entry.text+=' '+itemName+'との出会いもあった。';
 }else entries.push({date,text:makeObservationText(reason,itemName),createdAt:new Date().toISOString()});
 while(entries.length>90)entries.shift();
 renderJournal();if(typeof g.saveProgress==='function')g.saveProgress();
}
function renderJournal(){
 const root=document.getElementById('sea-observation-list');if(!root)return;
 const entries=(g.seaObservationEntries||[]).slice(-7).reverse();root.textContent='';
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
 if(((g.floaterDiscovery[itemName]||{}).count||0)<3)return;
 const note=document.createElement('div');note.className='lore-note';
 const origin=document.createElement('span');origin.textContent='来歴の仮説：'+data.origin;
 const clue=document.createElement('span');clue.style.display='block';clue.style.marginTop='6px';clue.textContent='観察メモ：'+data.clue;
 note.append(origin,clue);
 const instance=(g.floaters||[]).find(o=>typeof g.getFloaterItemName==='function'&&g.getFloaterItemName(o)===itemName);
 if(instance&&instance.userData.appearanceNote){const detail=document.createElement('span');detail.style.display='block';detail.style.marginTop='6px';detail.textContent='個体の特徴：'+instance.userData.appearanceNote;note.appendChild(detail);}
 panel.appendChild(note);
}
g.DrifanEnhancements=Object.freeze({init,updateTime,updateFrame,recordObservation,renderJournal,renderLore});
})(window);
