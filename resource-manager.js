(function(global){
 'use strict';
 function disposeTree(root){
  if(!root||typeof root.traverse!=='function')return;
  const geometries=new Set(),materials=new Set(),textures=new Set();
  root.traverse(node=>{
   if(!node||!node.isMesh)return;
   if(node.geometry)geometries.add(node.geometry);
   const list=Array.isArray(node.material)?node.material:(node.material?[node.material]:[]);
   list.forEach(m=>{if(!m||materials.has(m))return;materials.add(m);
    Object.keys(m).forEach(k=>{const v=m[k];if(v&&v.isTexture)textures.add(v);});
   });
  });
  textures.forEach(x=>x.dispose());materials.forEach(x=>x.dispose());geometries.forEach(x=>x.dispose());
 }
 global.DrifanResources=Object.freeze({disposeTree});
})(window);
