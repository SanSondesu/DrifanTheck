(function(g){'use strict';function removeFromArray(a,o){if(!Array.isArray(a))return false;const i=a.indexOf(o);if(i<0)return false;a.splice(i,1);return true;}
function removeSceneObject(scene,obj,opts){if(!obj)return false;opts=opts||{};const parent=obj.parent||scene;if(parent&&typeof parent.remove==='function')parent.remove(obj);if(opts.dispose&&g.DrifanResources)g.DrifanResources.disposeTree(obj,scene);if(opts.array)removeFromArray(opts.array,obj);return true;}
g.DrifanObjects=Object.freeze({removeFromArray,removeSceneObject});})(window);
