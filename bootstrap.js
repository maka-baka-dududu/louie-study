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
      const script=document.createElement('script');script.src='app.js?v=province-cards';
      const onError=event=>{if(event.filename&&new URL(event.filename,location.href).pathname.endsWith('/app.js'))startupError=event.message};
      window.addEventListener('error',onError);
      const timeout=setTimeout(()=>finish(Error('页面程序加载超时，请检查启动窗口。')),10000);
      function finish(error){clearTimeout(timeout);window.removeEventListener('error',onError);script.onload=null;script.onerror=null;if(error){script.remove();reject(error)}else resolve()}
      script.onerror=()=>finish(Error('学习站页面文件读取失败，请保留整个文件夹后重新启动。'));
      script.onload=()=>finish(window.LouieAppReady?null:Error(startupError||'页面启动失败，请重新启动学习站。'));
      document.body.appendChild(script);
    });
  }
  const extensions=[
    ['algorithm-problems.js','LouieAlgorithmProblemsReady'],
    ['algorithms-ui.js','LouieAlgorithmsReady'],
    ['personal-ui.js?v=excerpts-1','LouiePersonalReady'],
    ['practice-ui.js?v=chord-memory','LouiePracticeReady'],
    ['language-ui.js?v=sentence-categories','LouieLanguageReady'],
    ['studio-ui.js?v=travel-direct-2','LouieStudioReady'],
    ['profile-files-ui.js?v=excerpts-1','LouieProfileFilesReady'],
    ['travel-model.js?v=admin-footprints','LouieTravelModel'],
    ['travel-plan.js?v=province-cards','LouieTravelPlanReady'],
    ['travel-ui.js?v=province-cards','LouieTravelReady']
  ];

  function loadExtension(src,flag){
    return new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.async=false;
      script.src=src;
      const timeout=setTimeout(()=>finish('功能组件加载超时'),10000);
      function finish(message){
        clearTimeout(timeout);
        script.onload=null;
        script.onerror=null;
        if(message)reject(Error(message));
        else resolve();
      }
      script.onload=()=>finish(window[flag]?'':'功能组件暂未加载');
      script.onerror=()=>finish('功能组件文件未读取');
      document.body.appendChild(script);
    });
  }

  async function loadApp(){
    await loadCore();
    // Download extensions concurrently while keeping their shared globals in execution order.
    const results=await Promise.allSettled(extensions.map(([src,flag])=>loadExtension(src,flag)));
    document.body.classList.remove('booting');
    const failure=results.find(result=>result.status==='rejected');
    if(failure)window.toast?.(failure.reason.message+'，部分功能可刷新后重试。');
  }

  window.LouiePublicSite=true;
  window.LouieLocal=null;
  try{
    const response=await fetch('site-public.json',{cache:'no-cache'});
    if(!response.ok)throw Error('网站内容暂时无法读取，请刷新后重试。');
    const snapshot=await response.json();
    if(snapshot.version!==1)throw Error('网站内容格式有误。');
    window.LouiePublished=snapshot;
    await loadApp();
  }catch(error){showError(error.message)}
})();
