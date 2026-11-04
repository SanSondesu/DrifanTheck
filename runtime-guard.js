(function(global){
 'use strict';let shown=false;
 function show(message){
  if(shown||!global.document)return;shown=true;
  const panel=document.createElement('div');panel.id='runtime-fallback';panel.setAttribute('role','alert');
  panel.textContent=message||'この端末またはブラウザでは3D表示を開始できませんでした。ブラウザを更新するか、WebGLに対応した環境でお試しください。';
  Object.assign(panel.style,{position:'fixed',inset:'auto 16px 16px',zIndex:'99999',padding:'16px 18px',borderRadius:'12px',color:'#fff',background:'rgba(8,22,35,.94)',border:'1px solid rgba(255,255,255,.25)',font:'14px/1.7 system-ui,sans-serif',textAlign:'center',boxShadow:'0 8px 32px rgba(0,0,0,.35)'});
  (document.body||document.documentElement).appendChild(panel);
 }
 global.DrifanRuntime=Object.freeze({show});
 global.addEventListener('error',e=>{const t=e&&e.target;if(t&&t!==global&&(t.tagName==='SCRIPT'||t.tagName==='LINK'))show('必要なファイルを読み込めませんでした。通信状態を確認して、ページを再読み込みしてください。');else if(e&&e.error)show('アプリの初期化中に問題が発生しました。ページを再読み込みしてお試しください。');},true);
 global.addEventListener('unhandledrejection',e=>console.warn('DrifanTheck: async error.',e.reason));
})(window);
