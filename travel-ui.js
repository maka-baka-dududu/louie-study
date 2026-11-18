'use strict';
const Travel=window.LouieTravelModel;
const publicTravel = window.LouiePublicSite === true;
let publicFootprintsRequest;

function readPublicFootprints() {
  return publicFootprintsRequest ??= fetch('travel-public.json', {cache:'no-cache'}).then(async response => {
    if (!response.ok) throw Error('公开足迹暂时无法读取，请刷新后重试。');
    const snapshot = await response.json();
    if (snapshot.version !== 1 || !Array.isArray(snapshot.entries) || snapshot.entries.length > 3000) {
      throw Error('公开足迹格式有误。');
    }
    return snapshot.entries.flatMap(raw => {
      if (!raw || typeof raw !== 'object') return [];
      const {id,place,lat,lng,status,date,markerStyle,visitCount,adminId,title='',story=''} = raw;
      const entry = {id,place,lat,lng,status,date,markerStyle,visitCount,adminId,title,story,photos:[]};
      if (!Travel.entry(entry)) return [];
      entry.photos = Array.isArray(raw.photos) ? raw.photos.slice(0,12)
        .filter(path => typeof path === 'string' && /^travel-media\/[a-f0-9]{64}\.(jpg|png|webp)$/.test(path))
        .map(path => new URL(path,location.href).href) : [];
      return [entry];
    });
  }).catch(error => { publicFootprintsRequest = null; throw error; });
}

function openTravelPublication() {
  if (publicTravel || !localDisk) return;
  const entries = db.travel.entries;
  let previous = [];
  let includeDetails = false;
  try {
    previous = JSON.parse(localStorage.getItem('louie-public-footprint-selection') || '[]');
    includeDetails = localStorage.getItem('louie-public-footprint-details') === 'true';
  } catch (_) {}
  const selected = new Set(Array.isArray(previous) ? previous : []);
  show(`<h2>发布公开足迹</h2>
    <p>网站会显示勾选足迹的地点、坐标、日期、状态、图标和手动设置的到访次数。本次发布会替换公开足迹列表。</p>
    <form id="travelPublishForm">
      <div class="actions"><button type="button" id="travelPublishAll">全选</button><button type="button" id="travelPublishNone">清空选择</button></div>
      <div class="travel-publish-list">${entries.length ? entries.map(entry => `<label class="check">
        <input type="checkbox" name="footprint" value="${esc(entry.id)}" ${selected.has(entry.id) ? 'checked' : ''}>
        <span>${esc(entry.place)} <small class="muted">${esc(entry.date)} · ${entry.status === 'visited' ? '去过' : '想去'} · ${entry.photoIds.length} 张照片</small></span></label>`).join('') :
        '<p class="muted">本地暂无足迹。可以先在旅行星球新增，或导入旧记录。</p>'}</div>
      <label class="check"><input type="checkbox" name="includeDetails" ${includeDetails ? 'checked' : ''}>同时公开勾选足迹的标题、正文和照片</label>
      <button class="primary" id="travelPublishSubmit">发布到网站</button>
      <p role="status" id="travelPublishStatus"></p>
    </form>`);
  const form = $('#travelPublishForm');
  for (const [button, checked] of [['#travelPublishAll',true],['#travelPublishNone',false]]) {
    $(button).onclick = () => form.querySelectorAll('[name="footprint"]').forEach(box => { box.checked = checked; });
  }
  form.onsubmit = async event => {
    event.preventDefault();
    const submit = $('#travelPublishSubmit'), status = $('#travelPublishStatus');
    const data = new FormData(form);
    const ids = data.getAll('footprint');
    const publishDetails = data.has('includeDetails');
    if (publishDetails && !localDisk.travelDetailsPublish) {
      status.textContent = '当前运行的是旧版学习站服务。请关闭原启动窗口，重新打开「启动学习站.command」，再发布正文和照片。';
      return;
    }
    if (!ids.length && !confirm('清除网站上的全部公开足迹？')) return;
    submit.disabled = true;
    status.textContent = '正在提交到 GitHub…';
    try {
      await travelQueue.catch(() => {});
      await diskQueue;
      if (diskError) throw Error('本地有未保存的记录，请保存后重试。');
      const response = await diskRequest('/api/travel/publish', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ids,includeDetails:publishDetails})
      });
      const result = await response.json();
      try {
        localStorage.setItem('louie-public-footprint-selection',JSON.stringify(ids));
        localStorage.setItem('louie-public-footprint-details',String(publishDetails));
      } catch (_) {}
      const description = result.details ? `足迹与正文（含 ${result.photoCount} 张照片）` : '足迹基本信息';
      status.textContent = result.changed ? `已提交 ${result.count} 枚${description}，部署完成后可见。` : `网站上的${description}与这次提交一致。`;
    } catch (error) {
      status.textContent = error.message;
    } finally { submit.disabled = false; }
  };
}
function normalizeTravel() {
  db.travel ??= Travel.blank();
  const tracks = db.personal.tracks;
  const position = tracks.findIndex(track => track.id === 'travel');
  if (position > 0) {
    const [travelProject] = tracks.splice(position, 1);
    tracks.unshift(travelProject);
  } else if (position === -1 && tracks.length < 30) {
    tracks.unshift({
      id: 'travel', name: '旅行星球', icon: '◎', kind: 'life',
      subjects: ['旅行日记', '地球足迹', '行程轨迹'],
      goal: '', milestones: [], paused: false
    });
  }
}
normalizeTravel();Object.assign(labels,{travelGlobe:'旅行星球',travelJournal:'旅行日记'});Object.assign(navGlyph,{travelGlobe:'◎',travelJournal:'▧'});projectTools.travel=['travelGlobe','travelJournal'];
if (window.LouieTravelPlanReady) {
  labels.travelPlan = '旅行计划';
  navGlyph.travelPlan = '☷';
  projectTools.travel.push('travelPlan');
}
let travelFrame=null,travelNonce=null,travelEditing=false,travelIsReady=false,travelBusy=0,travelQueue=Promise.resolve();const travelPhotoCache=new Map();
const projectNavItemsBeforeTravel = projectNavItems;
projectNavItems = function () {
  return navigationProject === 'travel' ? projectTools.travel : projectNavItemsBeforeTravel();
};
const travelLegacyPages = ['track', 'today', 'library', 'tracking', 'teacher'];
function isTravelPage(p=page){return projectTools.travel.includes(p)}
function sendTravel(message){if(message.kind==='reload'){travelIsReady=false;travelEditing=false;if(travelFrame){travelNonce=uid();travelFrame.src='travel-assets/frame.html?view='+(page==='travelJournal'?'journal':'travel')+'&v=round-stars'+(publicTravel?'&readonly=1':'')+'#'+travelNonce;}return}travelFrame?.contentWindow?.postMessage({channel:'louie-travel',nonce:travelNonce,...message},'*')}
function guardTravelLeave(){if(travelBusy){toast('正在保存旅行记录，请稍候。');return false}if(travelEditing){if(!confirm('旅行编辑尚未保存，离开会丢弃本次填写。继续？'))return false;travelEditing=false;sendTravel({kind:'discard-editors'})}return true}
const openTrackBeforeTravel = openTrack;
openTrack = function (id) {
  if (guardTravelLeave()) openTrackBeforeTravel(id);
};
const openPracticeBeforeTravel=openPractice;openPractice=function(id){if(guardTravelLeave())openPracticeBeforeTravel(id)};
const openStudioBeforeTravel=openStudio;openStudio=function(id){if(guardTravelLeave())openStudioBeforeTravel(id)};
const goBeforeTravel=go;
go = function (target) {
  const before = page;
  if (navigationProject === 'travel' && travelLegacyPages.includes(target)) {
    target = 'travelGlobe';
  }
  if (isTravelPage(before) && target !== before && !guardTravelLeave()) return;
  const toolsMenu = $('#travelTools');
  if (toolsMenu && target !== before) toolsMenu.open = false;
  goBeforeTravel(target);
  if (isTravelPage(before) && !isTravelPage(page)) {
    travelFrame?.remove();
    travelFrame = null;
    travelNonce = null;
    travelEditing = false;
    travelPhotoCache.clear();
  }
};
const navigationContextBeforeTravel=renderNavigationContext;renderNavigationContext=function(){navigationContextBeforeTravel();if(page==='travelGlobe'&&navigationProject==='travel')$('#crumb').innerHTML='<button data-page="directions">我的项目</button><span class="crumb-separator" aria-hidden="true">/</span><span>旅行星球</span>'};
const renderBeforeTravel=render;
render = function () {
  normalizeTravel();
  if (navigationProject === 'travel' && travelLegacyPages.includes(page)) page = 'travelGlobe';
  const target = page;
  if (!isTravelPage(target)) {
    document.body.classList.remove('travel-page');
    renderBeforeTravel();
    return;
  }
  if (target === 'travelPlan') {
    document.body.classList.remove('travel-page');
    if ($('#tripPlanner')) {
      refreshTripPlanner();
      renderPersonalNav();
      renderNavigationContext();
      return;
    }
    if (travelFrame) {
      travelFrame.remove();
      travelFrame = null;
      travelNonce = null;
      travelIsReady = false;
      travelPhotoCache.clear();
    }
    page = 'directions';
    renderBeforeTravel();
    page = target;
    renderTravelPlan();
    renderPersonalNav();
    renderNavigationContext();
    return;
  }
  document.body.classList.add('travel-page');
  if (travelFrame?.isConnected && !$('#tripPlanner')) {
    updateTravelHeading();
    renderPersonalNav();
    renderNavigationContext();
    sendTravel({kind:'navigate', view:target === 'travelJournal' ? 'journal' : 'travel'});
    return;
  }
  if (travelFrame?.isConnected) {
    travelFrame.remove();
    travelFrame = null;
    travelNonce = null;
    travelIsReady = false;
  }
  page = 'directions';
  renderBeforeTravel();
  page = target;
  $('#view').innerHTML = `<div class="travel-heading">
    <h1 id="travelPageTitle"></h1>
    <div class="actions">
      ${publicTravel ? `<span class="muted">访客模式</span>${db.travel.entries.length || db.travel.routes.length || db.travel.legacyNotes.length
        ? '<button type="button" onclick="exportTravelBackup()">导出此浏览器的旧旅行记录</button>' : ''}` : `
      <button id="travelJournalAdd" type="button" hidden onclick="travelNewEntry()">＋ 记录旅行</button>
      <details id="travelTools" class="travel-tools">
        <summary>记录管理</summary>
        <div class="travel-tools-menu">
          <button type="button" onclick="this.closest('details').open=false;chooseTravelImport()">导入旧记录</button>
          <button type="button" onclick="this.closest('details').open=false;exportTravelBackup()">导出旅行备份</button>
          <button type="button" onclick="this.closest('details').open=false;travelTrashForm()">已删除记录</button>
          ${localDisk ? `<button type="button" onclick="this.closest('details').open=false;openTravelPublication()">发布公开足迹</button>` : ''}
        </div>
      </details>
      <input id="travelImportFile" type="file" accept="application/json,.json" hidden onchange="importTravelBackup(this.files[0]);this.value=''">
      `}
    </div>
  </div><section class="travel-frame-wrap"><p class="travel-frame-loading" id="travelFrameLoading">正在打开离线旅行星球…</p></section>`;
  updateTravelHeading();
  mountTravelFrame($('.travel-frame-wrap'), target === 'travelJournal' ? 'journal' : 'travel');
  renderPersonalNav();
  renderNavigationContext();
};

function mountTravelFrame(container, view) {
  const frame = document.createElement('iframe');
  frame.title = view === 'plan' ? '旅行计划地球仪' : '旅行星球';
  frame.sandbox = 'allow-scripts allow-forms allow-modals';
  frame.referrerPolicy = 'no-referrer';
  travelIsReady = false;
  travelNonce = uid();
  frame.src = 'travel-assets/frame.html?view=' + view + '&v=round-stars'+(publicTravel?'&readonly=1':'')+'#' + travelNonce;
  travelFrame = frame;
  container.append(frame);
}

function updateTravelHeading() {
  $('#travelPageTitle').textContent = labels[page];
  if (!publicTravel) $('#travelJournalAdd').hidden = page !== 'travelJournal';
}
function travelNewEntry(){if(!travelIsReady)return toast('离线地图还在加载，请稍候。');if(guardTravelLeave())sendTravel({kind:'new-entry'})}
function chooseTravelImport(){if(guardTravelLeave())$('#travelImportFile')?.click()}
async function photoData(id){if(travelPhotoCache.has(id))return travelPhotoCache.get(id);const m=db.materials.find(m=>m.id===id);if(!m?.fileId)throw Error('旅行照片附件缺失，请检查完整备份。');const raw=await fileOp('get',m.fileId);const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('旅行照片未能读取'));r.readAsDataURL(new Blob([raw],{type:m.mime}))});if(!Travel.image(data))throw Error('旅行照片格式无效。');travelPhotoCache.set(id,data);return data}
async function hydrateRecord(item){const {photoIds,...rest}=item;return {...rest,photos:await Promise.all((photoIds||[]).map(photoData))}}
async function hydrateProfile(p){if(!p)return undefined;const {avatarId,...rest}=p;return {...rest,avatar:avatarId?await photoData(avatarId):''}}
async function stageTravelPhoto(data,candidate,staged){if(!Travel.image(data))throw Error('照片必须是完整的 JPG、PNG 或 WebP 数据。');const comma=data.indexOf(','),mime=data.slice(5,data.indexOf(';')),bytes=Uint8Array.from(atob(data.slice(comma+1)),c=>c.charCodeAt(0));const magic=mime==='image/jpeg'?bytes[0]===255&&bytes[1]===216:mime==='image/png'?bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71:bytes[0]===82&&bytes[1]===73&&bytes[2]===70&&bytes[8]===87&&bytes[9]===69&&bytes[10]===66&&bytes[11]===80;if(!magic)throw Error('照片文件内容与格式不一致。');const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');const existing=candidate.materials.find(m=>m.trackId==='travel'&&m.photoHash===hash&&m.fileId);if(existing)return existing.id;const fileId=uid(),id=uid(),extension=mime==='image/png'?'png':mime==='image/webp'?'webp':'jpg';await fileOp('put',fileId,new Blob([bytes],{type:mime}));staged.push(fileId);candidate.materials.push({id,fileId,trackId:'travel',photoHash:hash,title:'旅行照片 · '+today(),subject:'旅行照片',tags:'旅行相册',fileName:id+'.'+extension,mime,size:bytes.length,current:0,total:0,unit:'张',status:'已完成',created:today(),note:''});return id}
async function stageTravelPhotos(photos,candidate,staged){const ids=[];for(const p of photos)ids.push(await stageTravelPhoto(p,candidate,staged));return ids}
async function canonicalEntry(raw,candidate,staged){if(!Travel.entry(raw))throw Error('旅行记录格式不正确。');return {id:raw.id,place:raw.place,lat:raw.lat,lng:raw.lng,...(raw.adminId ? {adminId:raw.adminId} : {}),date:raw.date,endDate:raw.endDate||'',markerStyle:raw.markerStyle||'auto',...(raw.status==='visited'&&raw.visitCount ? {visitCount:raw.visitCount} : {}),status:raw.status,title:raw.title,story:raw.story,photoIds:await stageTravelPhotos(raw.photos,candidate,staged),updatedAt:new Date().toISOString()}}
async function canonicalNote(raw,candidate,staged){if(!Travel.note(raw))throw Error('旧随手记录格式不正确。');const {photos,...rest}=raw;return {...rest,photoIds:await stageTravelPhotos(photos,candidate,staged)}}
function mergeIds(old,items){const map=new Map(old.map(x=>[x.id,x]));for(const x of items)map.set(x.id,x);return [...map.values()]}
const saveBeforeTravel=save;
// Other app writers may still finish a focus session while photos are uploading.
// Defer their disk snapshots; patch only travel-owned fields after a successful write.
save=function(){return travelBusy?travelQueue.catch(()=>{}).then(()=>saveBeforeTravel()):saveBeforeTravel()};
function travelCommit(change, nextPlan){if(publicTravel)return Promise.reject(Error('公开旅行记录只能查看。'));travelBusy++;const job=travelQueue.catch(()=>{}).then(async()=>{await diskQueue;if(diskError)throw Error('本地记录尚未保存，请先处理保存问题。');const candidate=JSON.parse(JSON.stringify(db)),originalMaterialIds=new Set(candidate.materials.map(m=>m.id)),staged=[];try{const result=change ? await change(candidate,staged) : undefined;if(!Travel.canonical(candidate.travel))throw Error('旅行数据未通过检查，原记录未修改。');const added=candidate.materials.filter(m=>!originalMaterialIds.has(m.id)),latest=JSON.parse(JSON.stringify(db));latest.travel=candidate.travel;if(nextPlan)latest.travelPlan=nextPlan;latest.materials.push(...added.filter(m=>!latest.materials.some(x=>x.id===m.id)));await persistCandidate(latest);db.travel=candidate.travel;if(nextPlan)db.travelPlan=nextPlan;db.materials.push(...added.filter(m=>!db.materials.some(x=>x.id===m.id)));travelPhotoCache.clear();return result}catch(error){for(const fileId of staged)await fileOp('delete',fileId).catch(()=>{});throw error}});travelQueue=job;return job.finally(()=>travelBusy--)}
async function travelBridge(op,data){
 if(publicTravel){
   if(op==='api'&&data.path==='/api/entries'&&(data.options?.method||'GET')==='GET')return readPublicFootprints();
   if(op==='read-store'){
     if(data.name==='notes'||data.key==='routes')return [];
     if(data.key==='profile')return null;
     return db.travel.preferences[data.key];
   }
   if(op==='write-store'&&data.name==='meta'&&['globeScene','markerMetric'].includes(data.key))return data.value;
   throw Error('公开旅行记录只能查看。');
 }
 const t=db.travel;if(op==='api'){const path=data.path,options=data.options||{},method=options.method||'GET';if(path==='/api/photos'&&method==='POST'){const p=JSON.parse(options.body);if(!Travel.image(p.data))throw Error('照片格式不正确。');return {url:p.data}}if(path==='/api/entries'&&method==='GET')return Promise.all(t.entries.map(hydrateRecord));if(!/^\/api\/entries(?:\/[A-Za-z0-9_-]{1,100})?$/.test(path))throw Error('旅行接口不存在。');if(method==='DELETE'){const id=path.split('/')[3];return travelCommit(c=>{const entry=c.travel.entries.find(e=>e.id===id);if(!entry)throw Error('旅行记录不存在。');c.travel.entries=c.travel.entries.filter(e=>e.id!==id);c.travel.trash.entries=mergeIds(c.travel.trash.entries,[entry]);return {ok:true}})}if(!['POST','PUT'].includes(method))throw Error('不支持的旅行操作。');const raw=JSON.parse(options.body);raw.id=method==='PUT'?path.split('/')[3]:uid();const result=await travelCommit(async(c,staged)=>{if(method==='PUT'&&!c.travel.entries.some(e=>e.id===raw.id))throw Error('旅行记录已不存在。');const entry=await canonicalEntry(raw,c,staged);c.travel.entries=mergeIds(c.travel.entries,[entry]);
if(entry.status==='visited'&&entry.visitCount){
  for(const item of c.travel.entries){
    if(item.status==='visited'&&(entry.adminId ? item.adminId===entry.adminId : !item.adminId&&item.lat.toFixed(3)===entry.lat.toFixed(3)&&item.lng.toFixed(3)===entry.lng.toFixed(3))){
      item.visitCount=entry.visitCount;
    }
  }
}
return entry});return hydrateRecord(result)}
 if(op==='read-store'){if(data.name==='notes')return Promise.all(t.legacyNotes.map(hydrateRecord));if(data.name==='meta'){if(data.key==='routes')return t.routes;if(data.key==='profile')return hydrateProfile(t.legacyProfile);if(['globeScene','markerMetric'].includes(data.key))return t.preferences[data.key]}throw Error('旅行读取范围不正确。')}
 if(op==='write-store'&&data.name==='meta'){if(data.key==='routes'){const routes=data.value;if(!Array.isArray(routes)||routes.length>4000||!routes.every(Travel.route)||new Set(routes.map(r=>r.id)).size!==routes.length)throw Error('行程格式不正确。');return travelCommit(c=>{const removed=c.travel.routes.filter(r=>!routes.some(x=>x.id===r.id));c.travel.trash.routes=mergeIds(c.travel.trash.routes,removed);c.travel.routes=JSON.parse(JSON.stringify(routes));return routes})}if(data.key==='globeScene'&&['space','day','dusk'].includes(data.value)||data.key==='markerMetric'&&['smart','frequency','recency','duration'].includes(data.value))return travelCommit(c=>{c.travel.preferences[data.key]=data.value;return data.value})}throw Error('此页面只能修改旅行记录。')}
window.addEventListener('message',async event=>{const m=event.data;if(!travelFrame||event.source!==travelFrame.contentWindow||event.origin!=='null'||m?.channel!=='louie-travel'||m.nonce!==travelNonce)return;if(m.kind==='ready'){travelIsReady=true;$('#travelFrameLoading')?.remove();if(page==='travelPlan')sendTripMap(true);return}if(page==='travelPlan'&&m.kind==='plan-select'){selectTripDay(m.id);return}if(m.kind==='editing'){travelEditing=m.value===true;return}if(m.kind==='view'&&isTravelPage()&&page!=='travelPlan'){page=m.view==='journal'?'travelJournal':'travelGlobe';updateTravelHeading();renderPersonalNav();renderNavigationContext();rememberProjectRoute();return}if(m.kind!=='request'||!['api','read-store','write-store','remove-store'].includes(m.op)||typeof m.id!=='string'||m.id.length>100)return;const source=event.source,nonce=travelNonce;try{const result=await travelBridge(m.op,m.data||{});source.postMessage({channel:'louie-travel',nonce,kind:'response',id:m.id,result},'*')}catch(error){source.postMessage({channel:'louie-travel',nonce,kind:'response',id:m.id,error:String(error.message||error).slice(0,1000)},'*')}});
async function importTravelBackup(file){if(!file||!guardTravelLeave())return;try{if(file.size>200*1024*1024)throw Error('旅行备份超过200MB。');const data=JSON.parse(await file.text());if(!Travel.backup(data))throw Error('不是完整、有效的旅行备份。');if(!confirm(`合并 ${data.entries.length} 枚足迹、${data.routes?.length||0} 段行程？相同 ID 会使用备份内容替换。本站个人介绍和其他项目保留。`))return;await travelCommit(async(c,staged)=>{const entries=[];for(const e of data.entries)entries.push(await canonicalEntry(e,c,staged));c.travel.entries=mergeIds(c.travel.entries,entries);c.travel.routes=mergeIds(c.travel.routes,data.routes||[]);if(data.notes){const notes=[];for(const n of data.notes)notes.push(await canonicalNote(n,c,staged));c.travel.legacyNotes=mergeIds(c.travel.legacyNotes,notes)}if(data.profile){const {avatar,...profile}=data.profile;c.travel.legacyProfile={...profile,avatarId:avatar?await stageTravelPhoto(avatar,c,staged):''}}if(data.louieTrash){const removed=[];for(const e of data.louieTrash.entries)removed.push(await canonicalEntry(e,c,staged));c.travel.trash.entries=mergeIds(c.travel.trash.entries,removed);c.travel.trash.routes=mergeIds(c.travel.trash.routes,data.louieTrash.routes)}if(data.louieTravelPreferences){const prefs=data.louieTravelPreferences;if(['space','day','dusk'].includes(prefs.globeScene))c.travel.preferences.globeScene=prefs.globeScene;if(['smart','frequency','recency','duration'].includes(prefs.markerMetric))c.travel.preferences.markerMetric=prefs.markerMetric}});sendTravel({kind:'reload'});toast('旅行记录已合并。')}catch(error){toast('未完成导入：'+error.message)}}
async function exportTravelBackup(){try{await travelQueue.catch(()=>{});const t=db.travel,profile=await hydrateProfile(t.legacyProfile)||{name:db.personal.profile.name||'Louie',bio:'',headline:'',location:'',tags:[],email:'',link:'',avatar:''};downloadJSON({app:'我的小站',version:3,exportedAt:new Date().toISOString(),entries:await Promise.all(t.entries.map(hydrateRecord)),routes:t.routes,notes:await Promise.all(t.legacyNotes.map(hydrateRecord)),profile,louieTravelPreferences:t.preferences,louieTrash:{entries:await Promise.all(t.trash.entries.map(hydrateRecord)),routes:t.trash.routes}},'旅行星球备份-'+today()+'.json')}catch(error){toast('旅行备份未生成：'+error.message)}}
function travelTrashForm(){if(!guardTravelLeave())return;const t=db.travel.trash;show(`<h2>已删除的旅行记录</h2>${[['entries','足迹'],['routes','行程']].map(([key,title])=>`<h3>${title}</h3>${t[key].map(e=>`<div class="row"><div><b>${esc(e.title||e.label||e.place||e.from?.place||title)}</b><small>${esc(e.date||e.start||'')}</small></div><button onclick="restoreTravelItem('${key}','${e.id}')">恢复</button></div>`).join('')||'<p class="muted">暂无</p>'}`).join('')}`)}
async function restoreTravelItem(key,id){if(!['entries','routes'].includes(key))return;try{await travelCommit(c=>{if(c.travel[key].some(e=>e.id===id))throw Error('已有同编号的现行记录，未覆盖。');const item=c.travel.trash[key].find(e=>e.id===id);if(!item)throw Error('记录不存在。');c.travel[key].push(item);c.travel.trash[key]=c.travel.trash[key].filter(e=>e.id!==id)});closeModal();sendTravel({kind:'reload'});toast('已恢复旅行记录。')}catch(error){toast(error.message)}}
const validBeforeTravel=validData;
validData=function(d){if(!validBeforeTravel(d))return false;if(d.travelPlan!==undefined&&window.LouieTravelPlanReady&&!validTravelPlan(d.travelPlan))return false;if(d.travel===undefined)return true;if(!Travel.canonical(d.travel))return false;return Travel.photoIds(d.travel).every(id=>d.materials?.some(m=>m.id===id&&m.fileId&&/^image\/(jpeg|png|webp)$/.test(m.mime||'')))};
const deleteMaterialBeforeTravel=deleteMaterial;deleteMaterial=async function(id){if(Travel.photoIds(db.travel).includes(id))return toast('照片仍关联旅行记录，请先在旅行日记中移除相应照片。');return deleteMaterialBeforeTravel(id)};
const importBeforeTravel=importData;
importData=async function(file){if(!guardTravelLeave())return;await travelQueue.catch(()=>{});await importBeforeTravel(file);normalizeTravel();travelPhotoCache.clear();travelFrame?.remove();travelFrame=null;travelNonce=null;travelEditing=false;render()};
window.addEventListener('beforeunload',event=>{if(travelEditing||travelBusy){event.preventDefault();event.returnValue=''}});
try{const route=JSON.parse(window.sessionStorage?.getItem('louie-project-route-v1')||'null');if(route?.project==='travel'){
  if(navigationProject!=='travel')setProjectContext('travel');
  page=isTravelPage(route.page)?route.page:'travelGlobe';
  rememberProjectRoute();
}}catch(_){}
window.LouieTravelReady=true;
render();
