(function (global) {
 'use strict';
 const cfg=global.DrifanConfig||{storage:{key:'drifantheck-save-v1',version:1}};
 const key=cfg.storage.key, version=cfg.storage.version;
 let available=true;
 function defaults(){return {version,messages:[],discoveries:{},bottleCount:0,settings:{timeProgress:null}};}
 function load(){
  const d=defaults();
  try{
   const raw=global.localStorage&&global.localStorage.getItem(key); if(!raw)return d;
   const p=JSON.parse(raw); if(!p||p.version!==version)return d;
   return {version,messages:Array.isArray(p.messages)?p.messages.filter(x=>typeof x==='string').slice(-300):[],
    discoveries:p.discoveries&&typeof p.discoveries==='object'?p.discoveries:{},
    bottleCount:Number.isFinite(p.bottleCount)?Math.max(0,Math.floor(p.bottleCount)):0,
    settings:{timeProgress:Number.isFinite(p.settings&&p.settings.timeProgress)?Math.max(0,Math.min(1,p.settings.timeProgress)):null}};
  }catch(e){available=false;console.warn('DrifanTheck: saved data could not be read.',e);return d;}
 }
 function save(data){
  try{
   if(!global.localStorage)return false;
   global.localStorage.setItem(key,JSON.stringify({version,messages:Array.isArray(data.messages)?data.messages.slice(-300):[],
    discoveries:data.discoveries&&typeof data.discoveries==='object'?data.discoveries:{},
    bottleCount:Number.isFinite(data.bottleCount)?data.bottleCount:0,
    settings:{timeProgress:Number.isFinite(data.timeProgress)?Math.max(0,Math.min(1,data.timeProgress)):null}}));
   available=true;return true;
  }catch(e){available=false;console.warn('DrifanTheck: saving unavailable.',e);return false;}
 }
 global.DrifanStorage=Object.freeze({load,save,isAvailable:()=>available});
})(window);
