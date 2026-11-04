(function(global){
 'use strict';
 function removeFromArray(array,obj){if(!Array.isArray(array))return false;const i=array.indexOf(obj);if(i<0)return false;array.splice(i,1);return true;}
 function removeSceneObject(scene,obj,opts){
  if(!obj)return false;opts=opts||{};
  if(obj.parent&&typeof obj.parent.remove==='function')obj.parent.remove(obj);else if(scene)scene.remove(obj);
  if(opts.dispose&&global.DrifanResources)global.DrifanResources.disposeTree(obj);
  if(opts.array)removeFromArray(opts.array,obj);
  return true;
 }
 global.DrifanObjects=Object.freeze({removeFromArray,removeSceneObject});
})(window);
