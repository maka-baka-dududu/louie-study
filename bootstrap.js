(async function(){
  const root=document.querySelector('#view');
  function showError(message){
    root.replaceChildren();
    const box=document.createElement('section');box.className='card';box.style.marginTop='32px';
    const title=document.createElement('h2');title.textContent='学习站暂时未能打开';
    const detail=document.createElement('p');detail.textContent=message;
    const note=document.createElement('p');note.className='muted';note.textContent='请刷新网页后重试。';
    const retry=document.createElement('button');retry.className='primary';retry.textContent='重新加载';retry.onclick=()=>location.reload();
    box.append(title,detail,note,retry);root.appendChild(box);
  }
  async function loadCore(){
    window.LouieAppReady=false;
    return new Promise((resolve,reject)=>{
      let startupError='';
      const script=document.createElement('script');script.src='app.js';
      const onError=event=>{if(event.filename&&new URL(event.filename,location.href).pathname.endsWith('/app.js'))startupError=event.message};
      window.addEventListener('error',onError);
      const timeout=setTimeout(()=>finish(Error('页面程序加载超时，请检查启动窗口。')),10000);
      function finish(error){clearTimeout(timeout);window.removeEventListener('error',onError);script.onload=null;script.onerror=null;if(error){script.remove();reject(error)}else resolve()}
      script.onerror=()=>finish(Error('学习站页面文件读取失败，请保留整个文件夹后重新启动。'));
      script.onload=()=>finish(window.LouieAppReady?null:Error(startupError||'页面启动失败，请重新启动学习站。'));
      document.body.appendChild(script);
    });
  }
  async function loadApp(){await loadCore();for(const [src,flag] of [['algorithm-problems.js','LouieAlgorithmProblemsReady'],['algorithms-ui.js','LouieAlgorithmsReady'],['personal-ui.js?v=compact-nav','LouiePersonalReady'],['practice-ui.js','LouiePracticeReady'],['language-ui.js?v=word-tasks','LouieLanguageReady'],['studio-ui.js?v=travel-direct-2','LouieStudioReady'],['profile-files-ui.js','LouieProfileFilesReady'],['travel-model.js','LouieTravelModel'],['travel-ui.js?v=compact-nav','LouieTravelReady']]){try{await new Promise((resolve,reject)=>{const extension=document.createElement('script');extension.src=src;const timeout=setTimeout(()=>reject(Error('功能组件加载超时')),10000);extension.onload=()=>{clearTimeout(timeout);window[flag]?resolve():reject(Error('功能组件暂未加载'))};extension.onerror=()=>{clearTimeout(timeout);reject(Error('功能组件文件未读取'))};document.body.appendChild(extension)})}catch(error){if(window.toast)window.toast(error.message+'，其他学习功能可继续使用。')}}document.body.classList.remove('booting')}

  window.LouieLocal=null;
  try{await loadApp()}catch(error){showError(error.message)}
})();
