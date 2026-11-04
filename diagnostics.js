(function(g){'use strict';
function run(options){
 options=options||{};
 const checks={
  config:!!g.DrifanConfig,
  storage:!!g.DrifanStorage,
  resources:!!g.DrifanResources,
  objects:!!g.DrifanObjects,
  runtime:!!g.DrifanRuntime,
  audio:typeof g.initAudio==='function',
  notebook:typeof g.updateNotebookUI==='function',
  interaction:typeof g.onPointerDown==='function',
  world:typeof g.createFloaters==='function',
  animation:typeof g.animate==='function'
 };
 let persistence={passed:false,storagePassed:null};
 try{persistence=g.DrifanStorage.selfTest(!!options.storage);}catch(e){persistence={passed:false,storagePassed:false,error:String(e)};}
 const passed=Object.values(checks).every(Boolean)&&persistence.passed&&(persistence.storagePassed!==false);
 const result={passed,checks,persistence,checkedAt:new Date().toISOString()};
 if(!passed)console.error('DrifanTheck diagnostics failed:',result);else console.info('DrifanTheck diagnostics passed:',result);
 return result;
}
g.DrifanDiagnostics=Object.freeze({run});
})(window);
