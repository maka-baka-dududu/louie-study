'use strict';
document.addEventListener('click',event=>{const b=event.target.closest('[data-library-subject]');if(b){librarySubject=b.dataset.librarySubject;render()}});
// Optional personal data extends v1 records without rewriting existing IDs or attachments.
const trackTemplates=[
 {id:'exam',name:'考研',icon:'∑',kind:'study',subjects:['数学二','英语二','政治','数据结构','计算机组成原理','操作系统','计算机网络','408综合']},
 {id:'coding',name:'编程',icon:'⌘',kind:'study',subjects:['算法','C++','Python','JavaScript','项目实践']},
 {id:'guitar',name:'吉他',icon:'♫',kind:'study',subjects:['曲目练习','基本功','乐理','指弹','弹唱']},
 {id:'english',name:'英语',icon:'Aa',kind:'study',subjects:['雅思','口语','听力','阅读','写作','词汇']},
 {id:'calligraphy',name:'书法',icon:'永',kind:'study',subjects:['篆书','隶书','楷书','行书','草书']},
 {id:'fitness',name:'健身',icon:'↗',kind:'life',subjects:['力量训练','有氧','拉伸','活动恢复']},
 {id:'cantonese',name:'粤语',icon:'粵',kind:'study',subjects:['粤拼与声调','日常会话','听力跟读','常用词汇','粤语歌曲']},
 {id:'japanese',name:'日语',icon:'あ',kind:'study',subjects:['假名','词汇','语法','听力','会话'],paused:true}
];
const divinationProject = {
  id:'divination', name:'玄学', icon:'☯', kind:'study',
  subjects:['六爻','小六壬','梅花易数','八卦'],
  goal:'读原典，练习识卦和排卦，记录不同流派的规则。'
};
function normalizePersonal(){db.personal??={profile:{name:'Louie',intro:'',about:'',links:[]},tracks:trackTemplates.map(t=>({...t,subjects:[...t.subjects],goal:'',milestones:[]})),activeTrack:'exam'};db.personal.profile.links??=[];db.personal.activeTrack??='exam';
  db.personal.excerpts??=[];
  const tracks=db.personal.tracks;
  if(tracks.length<30&&!tracks.some(t=>t.id==='cantonese')){const t=trackTemplates.find(t=>t.id==='cantonese');tracks.push({...t,subjects:[...t.subjects],goal:'从粤拼和声调开始，练习日常会话、听力与跟读。',milestones:[]});}
  if(window.LouieAccessRole!=='read'&&tracks.length<30&&!tracks.some(t=>t.id==='savings'))tracks.push({id:'savings',name:'个人账户',icon:'＋',kind:'life',subjects:['攒钱目标','收支记录','预算管理','存钱复盘'],goal:'设定攒钱目标，记录收支和进展。',milestones:[]});
  if(tracks.length<30&&!tracks.some(t=>t.id==='sidebusiness'))tracks.push({id:'sidebusiness',name:'我的副业',icon:'↗',kind:'life',subjects:['挣钱思路','市场调研','技能变现','小成本试验','收支复盘'],goal:'研究可行的挣钱方式，记录成本、投入和实际结果。',milestones:[]});
  if(tracks.length<30&&!tracks.some(t=>t.id==='excerpts'))tracks.push({id:'excerpts',name:'摘录与感悟',icon:'「',kind:'life',subjects:['古诗文','好句子','感悟'],goal:'留下喜欢的文字和自己的思考。',milestones:[]});
  if(tracks.length<30&&!tracks.some(track=>track.id===divinationProject.id)){
    tracks.push({...divinationProject,subjects:[...divinationProject.subjects],milestones:[]});
  }
}
normalizePersonal();
Object.assign(labels,{home:'首页',directions:'我的项目',life:'我的项目',about:'关于我',track:'学习方向',divinationGuide:'入门与练习',examSettings:'报考设置'});
let personalTrackId=db.personal.activeTrack||'exam',libraryTrack='all';
const trackFor=id=>db.personal.tracks.find(t=>t.id===id)||db.personal.tracks[0];
const recordTrack=r=>r.trackId||(r.materialId&&db.materials.find(m=>m.id===r.materialId)?.trackId)||'exam';
const trackName=id=>trackFor(id)?.name||'考研';
const trackOptions=(selected,all=false)=>`${all?'<option value="all">全部方向</option>':''}${db.personal.tracks.map(t=>`<option value="${t.id}" ${t.id===selected?'selected':''}>${esc(t.name)}${t.status==='completed'?' · 已完成':t.paused?' · 已暂停':''}</option>`).join('')}`;
window.LouiePersonal={matches:m=>libraryTrack==='all'||recordTrack(m)===libraryTrack,subjects:()=>libraryTrack==='all'?[...new Set(db.personal.tracks.flatMap(t=>t.subjects))]:(trackFor(libraryTrack)?.subjects||materialSubjects)};
const renderBeforePersonal=render;
render=function(){normalizePersonal();if(!db.personal.tracks.some(t=>t.id===personalTrackId))personalTrackId=db.personal.activeTrack||'exam';const personal=['home','directions','life','about','track','divinationGuide','examSettings'].includes(page),target=page;if(personal){page='today';renderBeforePersonal();page=target;$('#crumb').textContent=target==='track'?trackName(personalTrackId):labels[target];$('#view').innerHTML=({home:personalHome,directions:directionsView,life:()=>directionsView('life'),about:aboutView,track:trackView,divinationGuide:divinationView,examSettings:examSettingsView})[target]()}else renderBeforePersonal();renderPersonalNav();if(page==='library'){const toolbar=$('.library-toolbar');if(toolbar&&!navigationProject){const select=document.createElement('select');select.setAttribute('aria-label','资料学习方向');select.innerHTML=trackOptions(libraryTrack,true);select.onchange=()=>{libraryTrack=select.value;librarySubject='全部';render()};toolbar.prepend(select)}}renderNavigationContext()};
let navigationProject=null;
const stableNavItems=['home','directions','about','settings'];
const examToolPages=['knowledge','math','errors','resources','examSettings'];
const projectTools={exam:examToolPages,coding:['algorithms'],guitar:['guitarBasics','guitarChords','guitarPractice'],english:['englishPractice'],calligraphy:['calligraphyStudio'],fitness:['fitnessStudio'],divination:['divinationGuide']};
function projectNavItems(){return navigationProject?['track',...(navigationProject==='fitness'?[]:['today']),...(projectTools[navigationProject]||[]).filter(k=>labels[k]),'library','tracking',...(window.LouieAccessRole==='edit'?['teacher']:[])]:stableNavItems}
function setProjectContext(id){if(window.LouieAccessRole==='read'&&!db.personal.tracks.some(t=>t.id===id))id='exam';window.LouieTeacherProject?.select(id);navigationProject=id;personalTrackId=id;if(window.LouieAccessRole!=='read')db.personal.activeTrack=id;libraryTrack=id;librarySubject='全部';libraryStatus='全部';librarySearch='';save()}
function clearProjectContext(){navigationProject=null;resetGlobalLibrary()}
function activeNavigationPage(){if(navigationProject)return page==='track'?'track':page;return page==='track'?'directions':page}
function renderPersonalNav(){const nav=$('#nav'),scroll=nav.scrollTop||0,glyph={...navGlyph,home:'⌂',directions:'⊞',life:'↗',about:'○',track:'◫',guitarPractice:'♫',englishPractice:'◉',calligraphyStudio:'永',fitnessStudio:'↗',divinationGuide:'☷',examSettings:'⚙'};const backButton=navigationProject&&navigationProject!=='travel'?`<button class="nav-return" data-page="directions" aria-label="全部项目" title="全部项目"><span class="nav-glyph">‹</span><span class="nav-label">全部项目</span></button>`:'';nav.innerHTML=backButton+projectNavItems().map(k=>navButton(k,glyph)).join('');nav.scrollTop=scroll;applySidebar()}
function renderNavigationContext(){const crumb=$('#crumb');if(!crumb)return;const sep='<span class="crumb-separator" aria-hidden="true">/</span>';if(navigationProject){const t=trackFor(navigationProject);crumb.innerHTML='<button data-page="directions">我的项目</button>'+sep+(page==='track'?`<span>${esc(t.name)}</span>`:`<button onclick="openTrack('${t.id}')">${esc(t.name)}</button>`+sep+`<span>${esc(projectNavLabel(page))}</span>`)}else crumb.textContent=labels[page]||'我的项目'}
function resetGlobalLibrary(){libraryTrack='all';librarySubject='全部';libraryStatus='全部';librarySearch=''}
function projectNavLabel(k){if(!navigationProject)return labels[k];if(navigationProject==='fitness'&&k==='tracking')return '练习记录';return ({track:'项目概览',today:'今日安排',library:'项目资料',tracking:'时间与记录'})[k]||labels[k]}
function navButton(k,glyph){return `<button data-page="${k}" title="${esc(projectNavLabel(k))}" aria-label="${esc(projectNavLabel(k))}" class="${activeNavigationPage()===k?'active':''}${navigationProject==='travel'&&['travelJournal','travelPlan'].includes(k)?' nav-travel-sub':''}" ${activeNavigationPage()===k?'aria-current="page"':''}><span class="nav-glyph" aria-hidden="true">${glyph[k]||'·'}</span><span class="nav-label">${esc(projectNavLabel(k))}</span></button>`}
window.LouieProjectScope={project:()=>navigationProject,matches:r=>!navigationProject||recordTrack(r)===navigationProject,sessions:()=>db.sessions.filter(r=>!navigationProject||recordTrack(r)===navigationProject)};
function openTrack(id) {
  if (id === 'travel') {
    if (window.LouieTravelReady) go('travelGlobe');
    else toast('旅行星球还在加载，请稍候。');
    return;
  }
  setProjectContext(id);
  go('track');
}
function trackLibrary(id){libraryTrack=id;librarySubject='全部';go('library')}
function projectStatus(t){return t.status||(t.paused?'paused':'active')}
function personalHome(){const p=db.personal.profile;return `<div class="home-layout"><section class="home-introduction"><div class="home-kicker"><span class="home-status-dot" aria-hidden="true"></span>一个持续生长的个人空间</div><h1>你好，我是<br><span class="home-name">${esc(p.name)}<span class="home-period">.</span></span></h1><p class="home-intro">${esc(p.intro||'学一点新东西，走一段新的路。')}</p><p class="home-description">在这里，专注学习，也给兴趣与生活留些位置。</p></section><div class="home-gateways"><button class="home-gateway home-project-link" onclick="go('directions')"><span class="home-gateway-icon" aria-hidden="true">⊞</span><span class="home-gateway-copy"><strong>我的项目</strong><span>学习、兴趣与生活计划，从这里继续。</span></span><span class="home-gateway-arrow" aria-hidden="true">↗</span></button>${window.LouieTravelReady ? `<button class="home-gateway" data-page="travelGlobe"><span class="home-gateway-icon" aria-hidden="true">◎</span><span class="home-gateway-copy"><strong>旅行星球</strong><span>地球地图、旅行日记与计划。</span></span><span class="home-gateway-arrow" aria-hidden="true">↗</span></button>` : ''}<button class="home-gateway" onclick="go('about')"><span class="home-gateway-icon" aria-hidden="true">○</span><span class="home-gateway-copy"><strong>关于我</strong><span>个人介绍、名片与简历。</span></span><span class="home-gateway-arrow" aria-hidden="true">↗</span></button></div></div>`}
function directionCard(t,showActions=true,showStatusEdit=true,showEmptySummary=true){const steps=t.milestones||[],done=steps.filter(s=>s.done).length,minutes=db.sessions.filter(s=>recordTrack(s)===t.id).reduce((n,s)=>n+s.minutes,0),status=projectStatus(t);return `<article class="project-card"><button class="direction-card" onclick="openTrack('${t.id}')"><span class="direction-icon">${esc(t.icon)}</span><div><h2>${esc(t.name)}</h2><p>${esc(t.goal||t.subjects.map(subjectLabel).join(' · '))}</p>${steps.length||minutes||showEmptySummary?`<small>${steps.length?`${done}/${steps.length} 个阶段 · `:''}${minutes?`${(minutes/60).toFixed(1)} 小时`:showEmptySummary?'尚未记录':''}</small>`:''}</div><span class="direction-arrow">↗</span></button>${showActions?`<div class="project-card-actions"><small>${({active:'进行中',paused:'已暂停',completed:'已完成'})[status]}</small>${showStatusEdit?`<button onclick="trackForm('${t.id}')">修改状态</button>`:''}${status!=='active'?`<button onclick="setProjectStatus('${t.id}','active')">恢复项目</button>`:''}</div>`:''}</article>`}
async function setProjectStatus(id,status){const t=trackFor(id);if(!t||!['active','paused','completed'].includes(status))return;t.status=status;t.paused=status!=='active';if(await save())render()}
function directionsView() {
  const tracks = db.personal.tracks.filter(track => track.id !== 'travel');
  const statusGroups = ['paused','completed'].map(status => {
    const group = tracks.filter(track => projectStatus(track) === status);
    if (!group.length) return '';
    const title = status === 'paused' ? '已暂停' : '已完成';
    return `<section class="project-status-section"><h2>${title}</h2>
      <div class="direction-grid">${group.map(track=>directionCard(track)).join('')}</div>
    </section>`;
  }).join('');
  return `<div class="pagehead"><h1>我的项目</h1><button class="primary" onclick="trackForm()">＋ 新建项目</button></div>
    <div class="direction-grid">${tracks.filter(track=>projectStatus(track)==='active').map(track=>directionCard(track)).join('')}</div>
    ${statusGroups}`;
}
function baseTrackView(){const t=trackFor(personalTrackId);if(!t)return directionsView();const records=db.sessions.map((s,i)=>({s,i})).filter(x=>recordTrack(x.s)===t.id).slice(-8).reverse(),tasks=db.tasks.filter(x=>recordTrack(x)===t.id&&x.date===today()),steps=t.milestones||[];return `<div class="pagehead"><div><span class="eyebrow">${t.kind==='life'?'LIFE':'LEARNING'}</span><h1>${esc(t.name)}</h1>${t.goal?`<p class="muted">${esc(t.goal)}</p>`:''}</div><div class="actions"><button onclick="trackForm('${t.id}')">编辑项目</button><button class="primary" onclick="taskForm('${t.id}')">＋ 安排任务</button></div></div><div class="track-actions">${t.id==='divination'?'<button data-page="divinationGuide">入门与练习</button>':(window.LouiePractice?.trackAction(t.id)||'').replace(/\sclass="primary"/g,'')}<button onclick="trackLibrary('${t.id}')">▤ 资料 <small>${db.materials.filter(m=>recordTrack(m)===t.id).length}</small></button><button onclick="sessionForm(undefined,'${t.id}')">◷ 记录练习</button><button onclick="materialFormForTrack('${t.id}')">＋ 添加资料</button>${t.id==='coding'?'<button onclick="go(\'algorithms\')">⌘ 算法题</button>':''}${t.id==='exam'?examToolPages.map(k=>`<button data-page="${k}">${labels[k]}</button>`).join(''):''}</div><div class="two"><section class="card"><div class="actions" style="justify-content:space-between"><h2>阶段目标</h2><button onclick="milestoneForm('${t.id}')">＋ 添加</button></div>${steps.length?steps.map(s=>`<div class="row"><label class="check"><input type="checkbox" ${s.done?'checked':''} onchange="toggleMilestone('${t.id}','${s.id}')"><span class="${s.done?'done':''}">${esc(s.title)}</span></label><button aria-label="删除阶段目标" onclick="removeMilestone('${t.id}','${s.id}')">×</button></div>`).join(''):'<p class="empty">设一个具体、可以完成的小目标。</p>'}</section><section class="card"><h2>今天的安排</h2>${tasks.length?tasks.map(x=>`<div class="row"><span class="${x.done?'done':''}">${esc(x.title)}</span><small>${x.minutes} 分钟</small></div>`).join(''):'<p class="empty">今天还没有这个方向的任务。</p>'}</section></div><section class="card"><div class="actions" style="justify-content:space-between"><h2>最近练习</h2><button onclick="sessionForm(undefined,'${t.id}')">＋ 记录</button></div>${records.length?records.map(({s,i})=>`<div class="row"><div><b>${esc(subjectLabel(s.subject))}</b><small> · ${esc(s.date)} · ${s.minutes} 分钟</small><p class="session-note">${esc(s.note||'')}</p></div><button onclick="sessionForm(${i})">编辑</button></div>`).join(''):'<p class="empty">完成练习后，记下这次做了什么和下次从哪里继续。</p>'}</section>`}
function trackView(){const html=baseTrackView();if(personalTrackId!=='fitness')return html;return html.replace(/<button class="primary" onclick="taskForm\('[^']+'\)">＋ 安排任务<\/button>/,'').replace(/<section class="card"><h2>今天的安排<\/h2>[\s\S]*?<\/section>/,'').replace(/<div class="two">/,'<div>')}

function aboutView(){const p=db.personal.profile;return `<section class="personal-hero about-hero"><span class="eyebrow">ABOUT ME</span><h1>${esc(p.name)}<span>.</span></h1><p>${esc(p.intro||'在这里写一句你的介绍。')}</p><button onclick="profileForm()">编辑介绍</button></section><section class="card about-copy">${p.about?`<p style="white-space:pre-wrap">${esc(p.about)}</p>`:'<p class="muted">兴趣、经历、想做的事，写你想留下的内容。</p>'}${p.links.map(l=>`<p><a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.title)} ↗</a></p>`).join('')}</section>`}
function profileForm(){const p=db.personal.profile;show(`<h2>关于我</h2><form id="personalProfileForm"><label>名字<input name="name" required maxlength="40" value="${esc(p.name)}"></label><label>一句话介绍<input name="intro" maxlength="180" value="${esc(p.intro)}"></label><label>自我介绍<textarea name="about" maxlength="6000" style="min-height:160px">${esc(p.about)}</textarea></label><label>个人链接名称<input name="linkTitle" maxlength="60" value="${esc(p.links[0]?.title||'')}"></label><label>个人链接网址<input name="linkURL" type="url" value="${esc(p.links[0]?.url||'')}" placeholder="https://…"></label><button class="primary">保存</button></form>`);$('#personalProfileForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),url=String(f.get('linkURL')).trim();if(url&&!/^https?:\/\//i.test(url))return toast('链接请使用 http 或 https。');db.personal.profile={...p,name:String(f.get('name')).trim(),intro:String(f.get('intro')).trim(),about:String(f.get('about')).trim(),links:url?[{title:String(f.get('linkTitle')).trim()||'个人链接',url}]:[]};save();closeModal();render()}}
function trackForm(id,kind='study'){const t=id?trackFor(id):{name:'',goal:'',kind,subjects:[],paused:false};show(`<h2>${id?'编辑':'新建'}项目</h2><form id="trackForm"><label>项目名称<input name="name" maxlength="30" required value="${esc(t.name)}"></label><label>当前目标<input name="goal" maxlength="240" value="${esc(t.goal)}" placeholder="例如：完整弹下第一首指弹曲"></label><label>分类（用逗号分开）<input name="subjects" maxlength="600" value="${esc(t.subjects.map(subjectLabel).join('，'))}" ${id==='exam'?'readonly':''} placeholder="基本功，曲目练习，乐理"></label><label>项目状态<select name="status">${opts(['进行中','已暂停','已完成'],({active:'进行中',paused:'已暂停',completed:'已完成'})[projectStatus(t)])}</select></label><button class="primary">保存项目</button></form>`);$('#trackForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),names=String(f.get('subjects')).split(/[,，、]/).map(s=>s.trim()).filter(Boolean);if(names.some(n=>n.length>100))return toast('每个分类最多100个字。');if(names.length>20)return toast('分类最多20个。');const data={name:String(f.get('name')).trim(),goal:String(f.get('goal')).trim(),kind:t.kind||kind,status:({'进行中':'active','已暂停':'paused','已完成':'completed'})[f.get('status')||'进行中'],paused:f.get('status')==='已暂停'||f.get('status')==='已完成'};if(!data.name)return;if(id){Object.assign(t,data);if(id!=='exam')t.subjects=names.length?[...new Set(names)]:[data.name]}else{if(db.personal.tracks.length>=30)return toast('方向最多30个。');db.personal.tracks.push({...data,id:uid(),icon:'✦',subjects:names.length?[...new Set(names)]:[data.name],milestones:[]})}save();closeModal();render()}}
function milestoneForm(id){show('<h2>添加阶段目标</h2><form id="milestoneForm"><label>完成标准<input name="title" required maxlength="180" placeholder="例如：60 BPM 连续弹完前八小节"></label><button class="primary">添加</button></form>');$('#milestoneForm').onsubmit=e=>{e.preventDefault();const t=trackFor(id);if(t.milestones.length>=100)return toast('阶段目标最多100个。');t.milestones.push({id:uid(),title:String(new FormData(e.target).get('title')).trim(),done:false});save();closeModal();render()}}
function toggleMilestone(id,mid){const s=trackFor(id).milestones.find(s=>s.id===mid);if(s){s.done=!s.done;save();render()}}
function removeMilestone(id,mid){if(!confirm('删除这条阶段目标？'))return;const t=trackFor(id);t.milestones=t.milestones.filter(s=>s.id!==mid);save();render()}
function directionFields(id,subject){const t=trackFor(id);return `<div class="formgrid"><label>方向<select name="trackId" onchange="updateDirectionSubjects(this.form,this.value)">${trackOptions(t.id)}</select></label><label>分类<select name="subject">${opts([...new Set([...t.subjects,...(subject?[subject]:[])])],subject)}</select></label></div>`}
function updateDirectionSubjects(form,id){form.elements.subject.innerHTML=opts(trackFor(id).subjects)}
taskForm=function(id=personalTrackId){show(`<h2>添加任务</h2><form id="personalTaskForm"><label>今天要做什么<input name="title" required maxlength="160" placeholder="写具体动作和完成标准"></label>${directionFields(id)}<div class="formgrid"><label>预计分钟<input type="number" name="minutes" min="5" max="480" value="30" required></label><label>日期<input type="date" name="date" value="${today()}" required></label></div><button class="primary">保存任务</button></form>`);$('#personalTaskForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);db.tasks.push({id:uid(),title:String(f.get('title')).trim(),trackId:f.get('trackId'),subject:f.get('subject'),minutes:+f.get('minutes'),date:f.get('date'),done:false});save();closeModal();render()}};
sessionForm=function(index,id=personalTrackId,task=null){const s=index===undefined?{date:today(),subject:task?.subject||trackFor(id).subjects[0],minutes:task?.minutes||30,note:'',trackId:task?recordTrack(task):id}:db.sessions[index];show(`<h2>${index===undefined?'记录学习 / 练习':'修改记录'}</h2><form id="personalSessionForm">${directionFields(recordTrack(s),s.subject)}<div class="formgrid"><label>日期<input name="date" type="date" max="${today()}" value="${s.date}" required></label><label>实际分钟<input name="minutes" type="number" min="1" max="720" value="${s.minutes}" required></label></div><label>这次完成了什么 / 下次继续哪里<textarea name="note" maxlength="2000" placeholder="曲目段落、练习速度、页码，或训练组数与重量…">${esc(s.note||'')}</textarea></label>${task?'<label class="check"><input name="done" type="checkbox">同时完成这条任务</label>':''}<button class="primary">保存记录</button></form>`);$('#personalSessionForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),data={...(index===undefined?{}:db.sessions[index]),date:f.get('date'),trackId:f.get('trackId'),subject:f.get('subject'),minutes:+f.get('minutes'),note:String(f.get('note')).trim()};if(index===undefined)db.sessions.push(data);else db.sessions[index]=data;if(task&&f.get('done'))task.done=true;save();closeModal();render()}};
logTime=function(task){sessionForm(undefined,task?recordTrack(task):personalTrackId,task)};
const materialFormBeforePersonal=materialForm;
let pendingMaterialTrack=null;
function materialFormForTrack(id){pendingMaterialTrack=id;materialForm()}
materialForm=function(id){const m=db.materials.find(x=>x.id===id),tid=m?recordTrack(m):(pendingMaterialTrack|| (libraryTrack==='all'?personalTrackId:libraryTrack));pendingMaterialTrack=null;materialFormBeforePersonal(id);const form=$('#materialForm'),subject=form.elements.subject;subject.closest('.formgrid').insertAdjacentHTML('beforebegin',`<label>方向<select name="trackId" onchange="updateDirectionSubjects(this.form,this.value)">${trackOptions(tid)}</select></label>`);subject.innerHTML=opts([...new Set([...trackFor(tid).subjects,...(m?[m.subject]:[])])],m?.subject);};
const personalValidation=validData;
validData=function(d){if(!personalValidation(d))return false;if(d.personal===undefined)return true;const p=d.personal,text=(s,n)=>typeof s==='string'&&s.length<=n,id=s=>typeof s==='string'&&/^[A-Za-z0-9-]{1,100}$/.test(s);return p&&p.profile&&text(p.profile.name,40)&&text(p.profile.intro,180)&&text(p.profile.about,6000)&&Array.isArray(p.profile.links)&&p.profile.links.length<=10&&p.profile.links.every(l=>text(l.title,60)&&text(l.url,2000)&&/^https?:\/\//i.test(l.url))&&Array.isArray(p.tracks)&&p.tracks.length>0&&p.tracks.length<=30&&new Set(p.tracks.map(t=>t.id)).size===p.tracks.length&&p.tracks.some(t=>t.id==='exam')&&p.tracks.every(t=>id(t.id)&&text(t.name,30)&&text(t.goal,240)&&text(t.icon,10)&&(t.status===undefined||['active','paused','completed'].includes(t.status))&&['study','life'].includes(t.kind)&&Array.isArray(t.subjects)&&t.subjects.length>0&&t.subjects.length<=20&&t.subjects.every(s=>text(s,100))&&Array.isArray(t.milestones)&&t.milestones.length<=100&&t.milestones.every(m=>id(m.id)&&text(m.title,180)&&typeof m.done==='boolean'))};
const personalImportBefore=importData;
importData=async function(file){const previous=db;await personalImportBefore(file);normalizePersonal();personalTrackId=db.personal.activeTrack||'exam';if(db!==previous){clearProjectContext();page='directions';rememberProjectRoute()}libraryTrack='all';render()};
const askAlgorithmBeforePersonal=askAlgorithmAI;askAlgorithmAI=function(){personalTrackId='coding';db.personal.activeTrack='coding';save();askAlgorithmBeforePersonal()};
const planBeforePersonal=plan;plan=function(){if(personalTrackId==='exam')planBeforePersonal();else taskForm(personalTrackId)};
const goBeforePersonalNavigation=go;
go=function(target){if(!navigationProject&&['today','library','tracking','teacher'].includes(target))target='directions';if(['home','directions','life','about','settings'].includes(target))clearProjectContext();else if(examToolPages.includes(target)&&navigationProject!=='exam')setProjectContext('exam');else{const owner=Object.keys(projectTools).find(id=>projectTools[id].includes(target));if(owner&&navigationProject!==owner)setProjectContext(owner)}if(target==='library'&&!navigationProject)resetGlobalLibrary();goBeforePersonalNavigation(target);window.scrollTo?.(0,0);rememberProjectRoute()};
function rememberProjectRoute(){try{window.sessionStorage?.setItem('louie-project-route-v1',JSON.stringify({project:navigationProject,page}))}catch(_){}}
page='home';render();window.LouiePersonalReady=true;


let scheduleProject=null,scheduleFilter='overdue',scheduleSearch='',scheduleLimit=50,scheduleWriting=false;
const scheduleFilters={overdue:'往日未完成',today:'今天',upcoming:'未来安排',completed:'已完成'};
function scheduleTasks(project,filter){return db.tasks.filter(t=>recordTrack(t)===project&&(filter==='completed'?t.done:!t.done&&(filter==='overdue'?t.date<today():filter==='today'?t.date===today():t.date>today()))).sort((a,b)=>filter==='completed'?b.date.localeCompare(a.date):a.date.localeCompare(b.date))}
function scheduleAccessible(id){const task=db.tasks.find(t=>t.id===id);return task&&navigationProject&&recordTrack(task)===navigationProject?task:null}
function scheduleIdle(id){if(scheduleWriting)return false;if(id&&timer&&focusTask===id){toast('这条任务正在计时，请先结束本次专注。');return false}return true}
function openSchedule(filter='overdue'){if(!navigationProject)return; scheduleProject=navigationProject;scheduleFilter=Object.hasOwn(scheduleFilters,filter)?filter:'overdue';scheduleSearch='';scheduleLimit=50;drawSchedule()}
function drawSchedule(){if(scheduleProject!==navigationProject||!navigationProject)return;show(`<div class="schedule-heading"><span class="eyebrow">${esc(trackName(scheduleProject))}</span><h2>管理安排</h2></div><div class="schedule-tabs" role="tablist" aria-label="任务时间"><button ${scheduleFilter==='overdue'?'aria-selected="true"':'aria-selected="false"'} role="tab" onclick="selectScheduleFilter('overdue')">往日未完成 <small>${scheduleTasks(scheduleProject,'overdue').length}</small></button>${['today','upcoming','completed'].map(k=>`<button role="tab" aria-selected="${scheduleFilter===k}" onclick="selectScheduleFilter('${k}')">${scheduleFilters[k]} <small>${scheduleTasks(scheduleProject,k).length}</small></button>`).join('')}</div><label class="schedule-search"><input type="search" aria-label="搜索当前项目任务" placeholder="搜索任务或分类" maxlength="100" value="${esc(scheduleSearch)}" oninput="searchSchedule(this.value)"></label><div id="scheduleList" role="tabpanel" aria-label="${scheduleFilters[scheduleFilter]}">${scheduleList()}</div><div class="schedule-footer"><button class="primary" onclick="taskForm('${scheduleProject}',null,true)">＋ 添加任务</button></div>`)}
function scheduleList(){const q=scheduleSearch.trim().toLowerCase(),tasks=scheduleTasks(scheduleProject,scheduleFilter).filter(t=>!q||(t.title+' '+subjectLabel(t.subject)).toLowerCase().includes(q));return tasks.slice(0,scheduleLimit).map(t=>`<article class="schedule-row"><div class="schedule-task-copy"><b class="${t.done?'done':''}">${esc(t.title)}</b><small>${esc(t.date)} · ${esc(subjectLabel(t.subject))} · ${t.minutes} 分钟</small></div><div class="actions"><button onclick="taskForm('${scheduleProject}','${t.id}',true)">编辑</button>${!t.done&&t.date!==today()?`<button onclick="rescheduleTask('${t.id}')">移到今天</button>`:''}<button onclick="setScheduledTaskDone('${t.id}',${!t.done})">${t.done?'重新打开':'标记完成'}</button></div></article>`).join('')+(tasks.length>scheduleLimit?'<button class="schedule-more" onclick="moreScheduleTasks()">显示更多</button>':'')+(!tasks.length?`<p class="empty">${q?'没有匹配的任务。':({overdue:'没有往日未完成的任务。',today:'今天还没有待办任务。',upcoming:'暂无未来安排，可添加任务并选择日期。',completed:'还没有已完成的任务。'})[scheduleFilter]}</p>`:'')}
function selectScheduleFilter(filter){if(!Object.hasOwn(scheduleFilters,filter))return;scheduleFilter=filter;scheduleLimit=50;drawSchedule()}
function searchSchedule(value){scheduleSearch=String(value).slice(0,100);scheduleLimit=50;$('#scheduleList').innerHTML=scheduleList()}
function moreScheduleTasks(){scheduleLimit+=50;$('#scheduleList').innerHTML=scheduleList()}
async function rescheduleTask(id){const t=scheduleAccessible(id);if(!t||t.done||!scheduleIdle(id))return;scheduleWriting=true;try{t.date=today();if(await save()){render();drawSchedule()}}finally{scheduleWriting=false}}
async function setScheduledTaskDone(id,done){const t=scheduleAccessible(id);if(!t||typeof done!=='boolean'||!scheduleIdle(id))return;scheduleWriting=true;try{t.done=done;if(await save()){render();drawSchedule()}}finally{scheduleWriting=false}}
function scheduleDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value}

taskForm=function(project=navigationProject||personalTrackId,id=null,fromManager=false){
  if(!navigationProject||project!==navigationProject)return;
  const original=id?scheduleAccessible(id):null,track=trackFor(project);
  if((id&&!original)||!track||!scheduleIdle(id))return;
  const task=original||{id:uid(),title:'',subject:track.subjects[0],minutes:30,date:today(),done:false,trackId:project};
  const choices=[...new Set([...track.subjects,task.subject])];
  show(`<span class="eyebrow">${esc(track.name)}</span><h2>${id?'编辑任务':'添加任务'}</h2><form id="personalTaskForm"><label>任务与完成标准<input name="title" required maxlength="160" value="${esc(task.title)}" placeholder="写具体动作和完成标准"></label><label>分类<select name="subject">${opts(choices,task.subject)}</select></label><div class="formgrid"><label>预计分钟<input type="number" name="minutes" min="1" max="480" value="${task.minutes}" required></label><label>日期<input type="date" name="date" value="${esc(task.date)}" required></label></div><p id="scheduleFormError" class="practice-error" role="status"></p><div class="actions"><button class="primary">保存任务</button>${fromManager?'<button type="button" onclick="drawSchedule()">返回安排</button>':''}</div></form>`);
  const form=$('#personalTaskForm'),error=$('#scheduleFormError');let writing=false;
  form.onsubmit=async event=>{
    event.preventDefault();if(writing||scheduleWriting)return;
    const f=new FormData(event.target),title=String(f.get('title')||'').trim(),subject=f.get('subject'),minutes=Number(f.get('minutes')),date=f.get('date');
    if(navigationProject!==project)return;
    if(!title||title.length>160||!choices.includes(subject)||!Number.isInteger(minutes)||minutes<1||minutes>480||!scheduleDate(date)){error.textContent='请填写有效的任务、日期和1～480分钟的预计时间。';return}
    if(!scheduleIdle(task.id))return;
    if(id&&!scheduleAccessible(id)){error.textContent='任务已被移除，请返回安排查看。';return}
    if(!db.tasks.some(t=>t.id===task.id)&&db.tasks.length>=49999){error.textContent='任务数量已达上限，请先整理历史任务。';return}
    writing=true;scheduleWriting=true;
    const button=form.querySelector('button');if(button)button.disabled=true;
    try{
      const index=db.tasks.findIndex(t=>t.id===task.id),next={...(index>=0?db.tasks[index]:task),title,subject,minutes,date,trackId:project};
      if(index>=0)db.tasks[index]=next;else db.tasks.push(next);
      if(!await save()){error.textContent='尚未写入本地，请保留页面并重试。';return}
      if(navigationProject===project){closeModal();render();if(fromManager)drawSchedule()}
    }finally{writing=false;scheduleWriting=false;if(button)button.disabled=false}
  };
};

// Keep the day page focused on today; all other dates stay behind one explicit entry.
const todayBeforeSchedule=todayView;
todayView=function(){return todayBeforeSchedule().replace('<button class="primary" onclick="taskForm()">＋ 添加任务</button>','<button onclick="openSchedule()">管理安排</button><button class="primary" onclick="taskForm()">＋ 添加任务</button>').replace(/<button onclick="removeTask\('([^']+)'\)" aria-label="删除任务">×<\/button>/g,(_,id)=>`<button onclick="taskForm('${navigationProject}','${id}')">编辑</button><button onclick="removeTask('${id}')" aria-label="删除任务">×</button>`)};
const trackBeforeSchedule=trackView;
trackView=function(){const html=trackBeforeSchedule();if(personalTrackId==='fitness')return html;return html.replace('<button class="primary" onclick="taskForm(', '<button onclick="openSchedule()">管理安排</button><button class="primary" onclick="taskForm(')};
carry=function(){openSchedule('overdue')};
moveTask=async function(id){await rescheduleTask(id)};
const toggleBeforeSchedule=toggleTask,removeBeforeSchedule=removeTask;
toggleTask=function(id){if(scheduleAccessible(id)&&scheduleIdle(id))return toggleBeforeSchedule(id)};
removeTask=function(id){if(scheduleAccessible(id)&&scheduleIdle(id))return removeBeforeSchedule(id)};

// A task in another project must not prevent an exam plan, nor consume its budget.
plan=async function(){
  if(navigationProject!=='exam')return taskForm();
  if(db.tasks.some(t=>recordTrack(t)==='exam'&&t.date===today()))return toast('今天已有任务，请手动调整，避免重复安排。');
  const ideas=[],budget=Number(db.settings.budget);
  if(due().some(e=>recordTrack(e)==='exam'))ideas.push(['到期错题闭卷重做，口述判断依据','408复习',20]);
  const weak=chapters.flatMap(([s,cs])=>cs.map(c=>({s,c,level:db.mastery[s+'|'+c]||0}))).sort((a,b)=>a.level-b.level)[0];
  if(weak)ideas.push([`${weak.c}：读例题后闭卷做3～5题，标记薄弱点`,weak.s,60]);
  const mathWeak=mathChapters.flatMap(x=>x[1]).sort((a,b)=>(db.mastery['数学二|'+a]||0)-(db.mastery['数学二|'+b]||0))[0];
  if(mathWeak)ideas.push(['数学 · '+mathWeak+'：做一组题，复算错题','数学二',60]);
  ideas.push(['英语：精读一篇阅读，复述错项原因','英语二',40]);
  let used=0;for(const [title,subject,proposed] of ideas){const minutes=Math.min(proposed,budget-used);if(minutes<5||db.tasks.length>=49999)break;db.tasks.push({id:uid(),trackId:'exam',title,subject,minutes,date:today(),done:false});used+=minutes}
  if(await save()){render();toast('已按时间预算安排，可编辑任务调整内容。')}
};
render();window.LouieScheduleReady=true;

// Curated readings are also filed in the owner's project library.
const divinationResources = [
  {
    "id": "divination-source-shuogua",
    "subject": "八卦",
    "title": "八卦基础｜《说卦传》",
    "url": "https://zh.wikisource.org/zh-hans/周易/說卦",
    "reading": [
      "先读第七、八章，认卦名、卦性与物象。",
      "再读第五章，单独记后天方位。",
      "画八个卦，遮住名称逐个辨认。"
    ],
    "note": "先认卦画，再记物象与方位；先天卦数和后天方位分开记。",
    "reference": "维基文库 · 原典转录"
  },
  {
    "id": "divination-source-zengshan",
    "subject": "六爻",
    "title": "六爻入门｜《增删卜易》卷一",
    "url": "https://zh.wikisource.org/zh-hans/增刪卜易",
    "reading": [
      "先读八卦、卦象图与八宫图。",
      "再读浑天甲子、六亲歌、世应与动变。",
      "最后读用神章，先练装卦，再读案例。"
    ],
    "note": "按卷一第1–8章循序读。此电子本含后人增订说明，遇疑义对照古籍版本，不把增订说明当原作者正文。",
    "reference": "维基文库 · 原典转录，含增订说明"
  },
  {
    "id": "divination-source-meihua",
    "subject": "梅花易数",
    "title": "梅花入门｜《梅花易数》卷一",
    "url": "https://zh.wikisource.org/zh-hans/梅花易數/卷一",
    "reading": [
      "读周易卦数、卦以八除、爻以六除。",
      "读年月日时起例，明确各数如何取得。",
      "复算观梅占：34取兑、43取离、初爻动。"
    ],
    "note": "卦数取余：除8余0按8；动爻除6余0按第6爻。初学先把同一个例子的数、卦和动爻算清楚。",
    "reference": "维基文库 · 原典转录"
  },
  {
    "id": "divination-source-liuren",
    "subject": "小六壬",
    "title": "小六壬古籍对读｜《选择要略》中",
    "url": "https://zh.wikisource.org/zh-hans/選擇要略/中",
    "reading": [
      "在原文中查找“六壬赤口”，只读这一小段。",
      "对照六个名称与逐日循环顺序。",
      "记下本篇正月初一起留连，不混用别的起日法。"
    ],
    "note": "这是古籍对读材料，不是完整的现代月日时教程。本篇正月初一起留连；不同传法的起点与计数约定要分别记录。",
    "reference": "维基文库 · 古籍对读"
  }
];
const divinationTopics = [
  {
    name: '六爻',
    introduction: '先认识六个爻位：从下往上依次记初、二、三、四、五、上。下三爻组成下卦，上三爻组成上卦。接着练习区分本卦和变卦，再学纳甲、世应和六亲。',
    example: '从下往上记「阳、阴、阴、阳、阳、阳」，下卦为震，上卦为乾。先画出来，再上下对照。',
    exercise: '从下往上画六个爻，标出初爻、上爻以及上下卦',
    source: ['《增删卜易》卷一','https://zh.wikisource.org/zh-hans/增刪卜易']
  },
  {
    name: '小六壬',
    introduction: '先把大安、留连、速喜、赤口、小吉、空亡排成一圈。学习起课时，先注明参考的是哪一套规则，再写月、日、时各从哪里起数。',
    example: '只练六宫顺序：从大安起，按「起点算第一」数到第三位，是速喜。这一步只用于熟悉顺序。',
    exercise: '默写六宫顺序，练习从不同位置起数并标注计数规则',
    source: ['《选择要略》中·六壬赤口','https://zh.wikisource.org/zh-hans/選擇要略/中']
  },
  {
    name: '梅花易数',
    introduction: '先熟悉《梅花易数》中的卦数顺序。学会分别取上卦、下卦和动爻，再读书中的「观梅占」例子。',
    example: '观梅占原例中，年、月、日数合为 34，除以 8 余 2 取兑为上卦。加时数后为 43，除以 8 余 3 取离为下卦，除以 6 余 1 为初爻动。',
    exercise: '手算观梅占原例，写出上下卦、三个余数和动爻',
    source: ['《梅花易数》卷一','https://zh.wikisource.org/zh-hans/梅花易數/卷一']
  },
  {
    name: '八卦',
    introduction: '先把八个卦画和天、泽、火、雷、风、水、山、地对上。这里按《梅花易数》卷一的卦数排列。学方位时再区分先天与后天。',
    example: '震和艮都是一阳两阴。震的阳爻在最下面，艮的阳爻在最上面。',
    exercise: '画出八卦，默写每卦对应的自然物象',
    source: ['《说卦传》','https://zh.wikisource.org/zh-hans/周易/說卦']
  }
];
const divinationTrigrams = [
  ['☰','乾','天'], ['☱','兑','泽'], ['☲','离','火'], ['☳','震','雷'],
  ['☴','巽','风'], ['☵','坎','水'], ['☶','艮','山'], ['☷','坤','地']
];
let divinationTopicIndex = 3;

function selectDivinationTopic(index) {
  if (!divinationTopics[index]) return;
  divinationTopicIndex = index;
  render();
  $('#divinationTopic' + index)?.focus();
}

function addDivinationExercise() {
  if (navigationProject !== divinationProject.id) return;
  const topic = divinationTopics[divinationTopicIndex];
  taskForm(divinationProject.id);
  const form = $('#personalTaskForm');
  if (!form?.elements) return;
  form.elements.title.value = topic.exercise;
  const select = form.elements.subject;
  if ([...select.options].some(option => option.value === topic.name)) select.value = topic.name;
}

function divinationView() {
  const topic = divinationTopics[divinationTopicIndex];
  const resource = divinationResources.find(item=>item.subject===topic.name);
  const trigrams = divinationTopicIndex === 3
    ? `<div class="divination-trigrams">${divinationTrigrams.map(([symbol,name,image],index)=>
      `<div class="divination-trigram"><b>${symbol}</b><span>${name} · ${image}</span><small>${index+1}</small></div>`).join('')}</div>`
    : '';
  return `<div class="pagehead"><div><h1>入门与练习</h1><p class="muted">先学八卦，再选一门。每次读一小段、做一项练习。</p></div></div>
    <div class="actions divination-topics" aria-label="入门主题">
      ${[3,0,2,1].map(index=>`<button id="divinationTopic${index}" aria-pressed="${index===divinationTopicIndex}" onclick="selectDivinationTopic(${index})">${divinationTopics[index].name}</button>`).join('')}
    </div>
    <section class="card divination-guide">
      <h2>${topic.name}</h2>
      <p>${topic.introduction}</p>
      <h3>${esc(resource.title)}</h3>
      <ol class="divination-reading">${resource.reading.map(line=>`<li>${esc(line)}</li>`).join('')}</ol>
      <p class="muted">${esc(resource.note)}</p>
      ${trigrams}
      <div class="divination-example"><strong>例子</strong><br>${topic.example}</div>
      <p><strong>练习</strong> · ${topic.exercise}</p>
      <p><a href="${resource.url}" target="_blank" rel="noopener noreferrer">读原文 ↗</a> <small class="muted">${esc(resource.reference)}</small></p>
      <div class="actions">
        <button class="primary" onclick="addDivinationExercise()">安排这项练习</button>
        <button data-page="library">打开项目资料</button>
      </div>
    </section>`;
}


function examSettingsView() {
  const { school, major, date, budget } = db.settings;
  return `<div class="pagehead"><h1>报考设置</h1></div>
    <section class="card" style="max-width:880px">
      <form id="examSettingsForm">
        <div class="formgrid">
          <label>目标学校<input name="school" value="${esc(school)}" required maxlength="100"></label>
          <label>专业与考试组合<input name="major" value="${esc(major)}" required maxlength="100"></label>
          <label>考试日期<input type="date" name="date" value="${esc(date)}"></label>
          <label>考研每日计划预算（分钟）<input type="number" min="20" max="720" name="budget" value="${budget}" required></label>
        </div>
        <button class="primary">保存报考设置</button>
      </form>
    </section>`;
}


// Text collections live inside personal data, included in backups and public sync.
let excerptCategory='全部',excerptQuery='';
const excerptCategories=['古诗文','好句子','感悟'];
const projectNavBeforeExcerpts=projectNavItems;
projectNavItems=function(){return navigationProject==='excerpts'?['track']:projectNavBeforeExcerpts()};
const trackBeforeExcerpts=trackView;
trackView=function(){return personalTrackId==='excerpts'?excerptsView():trackBeforeExcerpts()};
function excerptMatches(){const q=excerptQuery.trim().toLowerCase();return db.personal.excerpts.filter(x=>(excerptCategory==='全部'||x.category===excerptCategory)&&(!q||[x.title,x.content,x.author,x.source,x.note].join(' ').toLowerCase().includes(q))).slice().sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt))}
function excerptsView(){return `<div class="pagehead"><h1>摘录与感悟</h1><button class="primary" onclick="excerptForm()">＋ 记一则</button></div><div class="actions" style="margin-bottom:20px"><select aria-label="摘录分类" onchange="excerptCategory=this.value;drawExcerpts()">${opts(['全部',...excerptCategories],excerptCategory)}</select><input type="search" aria-label="搜索摘录" placeholder="搜索文字、作者、出处…" maxlength="100" value="${esc(excerptQuery)}" oninput="excerptQuery=this.value;drawExcerpts()"></div><section id="excerptList">${excerptList()}</section>`}
function excerptList(){return excerptMatches().map(x=>`<article class="card"><div class="actions" style="justify-content:space-between"><span class="muted">${esc(x.category)} · ${esc(x.date)}</span><div class="actions"><button onclick="excerptForm('${x.id}')">编辑</button><button onclick="removeExcerpt('${x.id}')">删除</button></div></div>${x.title?`<h2>${esc(x.title)}</h2>`:''}<p style="white-space:pre-wrap;line-height:1.9;overflow-wrap:anywhere">${esc(x.content)}</p>${x.author||x.source?`<p class="muted">${esc([x.author,x.source].filter(Boolean).join(' · '))}</p>`:''}${x.note?`<div style="white-space:pre-wrap;border-top:1px solid var(--line,#ddd);padding-top:14px;line-height:1.8;overflow-wrap:anywhere">${esc(x.note)}</div>`:''}</article>`).join('')||'<p class="empty">记一首诗、一句话，或此刻的感悟。</p>'}
function drawExcerpts(){const list=$('#excerptList');if(list)list.innerHTML=excerptList()}
function excerptForm(id){const old=id?db.personal.excerpts.find(x=>x.id===id):null;if(id&&!old)return;const x=old||{category:excerptCategories.includes(excerptCategory)?excerptCategory:'古诗文',title:'',content:'',author:'',source:'',note:'',date:today()};show(`<h2>${id?'编辑摘录':'记一则'}</h2><form id="excerptForm"><div class="formgrid"><label>分类<select name="category">${opts(excerptCategories,x.category)}</select></label><label>日期<input type="date" name="date" value="${esc(x.date)}" required></label></div><label>标题（选填）<input name="title" maxlength="120" value="${esc(x.title)}"></label><label>正文<textarea name="content" rows="8" maxlength="20000" required placeholder="诗文、好句子，或者你的感悟…">${esc(x.content)}</textarea></label><div class="formgrid"><label>作者（选填）<input name="author" maxlength="100" value="${esc(x.author)}"></label><label>出处（选填）<input name="source" maxlength="300" value="${esc(x.source)}"></label></div><label>我的理解（选填）<textarea name="note" rows="3" maxlength="6000">${esc(x.note)}</textarea></label><p id="excerptError" role="status"></p><button class="primary">保存</button></form>`);const draftId=old?.id||uid();let writing=false;$('#excerptForm').onsubmit=async e=>{e.preventDefault();if(writing)return;const f=new FormData(e.target),next={id:draftId,createdAt:old?.createdAt||new Date().toISOString()};for(const k of ['category','title','content','author','source','note','date'])next[k]=String(f.get(k)||'').trim();if(!validExcerpt(next)){$('#excerptError').textContent='请填写有效的分类、日期和正文。';return}if(!old&&db.personal.excerpts.length>=5000){$('#excerptError').textContent='摘录已达5000则，请先整理。';return}writing=true;const button=e.target.querySelector('button');button.disabled=true;try{const i=db.personal.excerpts.findIndex(x=>x.id===next.id);if(i<0)db.personal.excerpts.push(next);else db.personal.excerpts[i]=next;if(await save()){closeModal();render()}else $('#excerptError').textContent='保存未完成，请重试。'}finally{writing=false;button.disabled=false}}}
async function removeExcerpt(id){const i=db.personal.excerpts.findIndex(x=>x.id===id);if(i<0||!confirm('删除这则摘录？'))return;const removed=db.personal.excerpts.splice(i,1)[0];if(await save())render();else db.personal.excerpts.splice(i,0,removed)}
function validExcerpt(x){const t=(v,n)=>typeof v==='string'&&v.length<=n;return x&&t(x.id,100)&&/^[a-zA-Z0-9-]+$/.test(x.id)&&excerptCategories.includes(x.category)&&t(x.title,120)&&t(x.content,20000)&&x.content.trim().length>0&&t(x.author,100)&&t(x.source,300)&&t(x.note,6000)&&scheduleDate(x.date)&&t(x.createdAt,40)&&Number.isFinite(Date.parse(x.createdAt))}
const validBeforeExcerpts=validData;
validData=function(d){return validBeforeExcerpts(d)&&(d.personal?.excerpts===undefined||(Array.isArray(d.personal.excerpts)&&d.personal.excerpts.length<=5000&&new Set(d.personal.excerpts.map(x=>x?.id)).size===d.personal.excerpts.length&&d.personal.excerpts.every(validExcerpt)))};
/* Dedicated savings workspace; all amounts are integer minor units by currency. */
(function(){
const categories=['现金','活期存款','定期存款','股票','基金','黄金','其他'];
const currencies=['CNY','USD','HKD','EUR','GBP','JPY','SGD'];
let tab='overview',currency='CNY',month=today().slice(0,7),archived=false;
const empty=()=>({assets:[],entries:[],goals:[],plans:[],budgets:{}});
const data=()=>{const f=db.personal.finance||empty();return {...f,plans:f.plans||[]}};
const editable=()=>window.LouieAccessRole?window.LouieAccessRole==='edit':!window.LouiePublicSite;
const money=(n,code='CNY')=>new Intl.NumberFormat('zh-CN',{style:'currency',currency:code,maximumFractionDigits:2}).format(n/100);
const amount=v=>{if(!/^\d{1,10}(\.\d{1,2})?$/.test(String(v)))throw Error('金额最多保留两位小数');const n=Math.round(Number(v)*100);if(!Number.isSafeInteger(n))throw Error('金额无效');return n};
const list=key=>data()[key].filter(x=>!!x.archived===archived);
const live=key=>data()[key].filter(x=>!x.archived);
const paid=plan=>live('entries').find(e=>e.kind==='expense'&&e.planId===plan.id);
const total=rows=>rows.reduce((s,x)=>s+x.amount,0);
const action=(text,code,primary=false)=>editable()?`<button class="${primary?'primary':''}" onclick="${code}">${text}</button>`:'';
const progress=(value,target)=>`<div class="finance-progress" role="progressbar" aria-label="目标进度" aria-valuenow="${Math.min(100,Math.round(value/target*100))}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.min(100,value/target*100)}%"></i></div>`;
function saved(id){return total(live('entries').filter(x=>x.kind==='saving'&&x.goalId===id))}
let fx=null,fxLoading=false,fxError='',fxAttemptAt=0;
try{const cached=JSON.parse(localStorage.getItem('louie-finance-reference-rates')||'null');if(cached?.base==='CNY'&&cached?.rates?.CNY===1&&Object.values(cached.rates).every(r=>Number.isFinite(r)&&r>0))fx={...cached,stale:true}}catch{}
const toCNY=x=>x.currency==='CNY'?x.amount:fx?.rates?.[x.currency]?x.amount*fx.rates[x.currency]:null;
function cnyTotal(rows){const amounts=rows.map(toCNY);return amounts.some(x=>x===null)?null:Math.round(amounts.reduce((s,n)=>s+n,0))}
const converted=n=>n===null?'汇率待更新':money(n);
function ratesNote(){if(!needsRates())return '';return `<p class="muted finance-caption">${fx?`参考汇率：${esc(fx.date)} · ${esc(fx.provider||'Frankfurter')}${fx.stale?' · 暂用上次汇率':''}`:fxLoading?'正在获取参考汇率…':'暂未取得汇率，外币仍按原币显示。'}${fxError?' · 汇率更新暂不可用':''}</p>`}
function needsRates(){return ['assets','entries'].some(k=>data()[k].some(x=>x.currency!=='CNY'))||Object.keys(data().budgets).some(k=>!k.endsWith('|CNY')&&data().budgets[k]>0)}
async function ensureRates(){if(!editable()||!needsRates()||fxLoading||Date.now()-fxAttemptAt<60000||fx&&!fx.stale&&Date.now()-Date.parse(fx.checkedAt)<6*3600000)return;fxAttemptAt=Date.now();fxLoading=true;try{const r=await fetch('/api/finance/rates',{cache:'no-store',signal:AbortSignal.timeout(15000)});const value=await r.json();if(!r.ok)throw Error(value.error);if(value.base!=='CNY'||value.rates?.CNY!==1||!currencies.every(c=>Number.isFinite(value.rates[c])&&value.rates[c]>0))throw Error('汇率不完整');fx=value;fxError='';try{localStorage.setItem('louie-finance-reference-rates',JSON.stringify(value))}catch{}}catch{fxError='unavailable';if(fx)fx.stale=true}finally{fxLoading=false;if(page==='track'&&personalTrackId==='savings')render()}}
function dates(){const now=new Date(today()+'T12:00:00'),d=now.getDay()||7;now.setDate(now.getDate()-d+1);const start=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;return {start,end:today()}}
function totals(){const entries=live('entries'),week=dates(),current=today().slice(0,7),budgets=Object.entries(data().budgets).filter(([k])=>k.startsWith(current+'|')).map(([k,amount])=>({amount,currency:k.split('|')[1]}));return {assets:cnyTotal(live('assets')),expense:cnyTotal(entries.filter(x=>x.kind==='expense'&&x.date.startsWith(current))),income:cnyTotal(entries.filter(x=>x.kind==='income'&&x.date.startsWith(current))),weekly:cnyTotal(entries.filter(x=>x.kind==='expense'&&x.date>=week.start&&x.date<=week.end)),budget:cnyTotal(budgets)}}
function assetsView(){const assets=list('assets'),sum=cnyTotal(assets);return `<section class="card"><div class="finance-section"><h2>资产结构</h2>${action('添加资产',"financeForm('assets')",true)}</div>${assets.length?`${sum!==null&&sum>0?`<div class="finance-allocation">${categories.map((c,i)=>{const n=cnyTotal(assets.filter(x=>x.category===c));return n?`<span style="flex:${n};background:${['#5c8c80','#829ebd','#ae9264','#ac7180','#8c81b0','#c4a24d','#85939a'][i]}" title="${c} ${money(n)}"></span>`:''}).join('')}</div>`:''}${categories.map(c=>{const group=assets.filter(x=>x.category===c),value=cnyTotal(group);return group.length?`<details open><summary>${c}<span class="finance-sum">${converted(value)}${sum&&value!==null?' · '+Math.round(value/sum*100)+'%':''}</span></summary>${group.map(x=>row('assets',x,esc(x.name),money(x.amount,x.currency))).join('')}</details>`:''}).join('')}`:'<p class="empty">添加现金、存款或投资资产，查看当前结构。</p>'}${ratesNote()}<p class="muted finance-caption">填写当前余额或估值，收支记账不自动调整资产。</p></section>`}
function row(key,x,label,value){return `<div class="row finance-row"><div>${label}${x.note?`<small>${esc(x.note)}</small>`:''}</div><div class="actions"><strong>${value}</strong>${action(archived?'恢复':'编辑',archived?`financeArchive('${key}','${x.id}',false)`:`financeForm('${key}','${x.id}')`)}</div></div>`}
function entriesView(){const entries=list('entries').filter(x=>x.date.startsWith(month)).sort((a,b)=>b.date.localeCompare(a.date));return `<section class="card"><div class="finance-section"><h2>收支账本</h2><div class="actions"><input aria-label="账本月份" type="month" value="${month}" onchange="financeMonth(this.value)">${action('记收入',"financeForm('entries','','income')")}${action('记支出',"financeForm('entries','','expense')",true)}</div></div>${entries.map(x=>row('entries',x,`${esc(x.category)} · ${esc(x.date)}<small>${esc({expense:'支出',income:'收入',saving:'攒钱存入'}[x.kind])}${x.goalId?' · '+esc(data().goals.find(g=>g.id===x.goalId)?.name||'已归档目标'):''}</small>`,(x.kind==='expense'?'−':'+')+money(x.amount,x.currency))).join('')||'<p class="empty">这个月还没有记录。</p>'}</section>`}
function goalsView(){return `<section class="card"><div class="finance-section"><h2>攒钱计划</h2>${action('新建计划',"financeForm('goals')",true)}</div><div class="finance-goals">${list('goals').map(g=>{const value=g.initial+saved(g.id),left=Math.max(0,g.amount-value);return `<article class="finance-goal"><div class="finance-section"><h3>${esc(g.name)}</h3>${action(archived?'恢复':'编辑',archived?`financeArchive('goals','${g.id}',false)`:`financeForm('goals','${g.id}')`)}</div><strong>${money(value,g.currency)} <small>/ ${money(g.amount,g.currency)}</small></strong>${progress(value,g.amount)}<p class="muted">${left?'还差 '+money(left,g.currency):'目标已达成'}</p>${action('存入一笔',`financeForm('entries','','saving','${g.id}')`,true)}</article>`}).join('')||'<p class="empty">为应急金、旅行或下一件想做的事，设一个目标。</p>'}</div></section>`}
function plansView(){const pending=live('plans').filter(p=>!paid(p)),rows=list('plans').slice().sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));return `<section class="card"><div class="finance-section"><h2>消费计划</h2>${action('新增消费计划',"financePlanForm()",true)}</div><div class="finance-planning-summary"><div><small>待支出合计</small><strong>${money(total(pending))}</strong></div><div><small>${month} 预计花销</small><strong>${money(total(pending.filter(p=>p.date.startsWith(month))))}</strong></div></div>${rows.map(p=>{const entry=paid(p);return `<article class="finance-plan"><div class="finance-section"><div><h3>${esc(p.name)}</h3><small>${esc(p.category)} · ${esc(p.priority)} · ${p.date?esc(p.date):'日期待定'}</small></div><strong>${money(p.amount)}</strong></div>${p.note?`<p class="muted">${esc(p.note)}</p>`:''}<div class="finance-section"><span class="tag">${entry?'已记支出 '+money(entry.amount):'待支出'}</span><div class="actions">${archived?action('恢复',`financeArchive('plans','${p.id}',false)`):action('编辑',`financePlanForm('${p.id}')`)+(!entry?action('记为支出',`financePlanExpense('${p.id}')`,true):'')}</div></div></article>`}).join('')||'<p class="empty">先记下以后想买什么、预计花多少，以及什么时候需要。</p>'}<p class="muted finance-caption">计划金额不会计入实际花销；付款后点“记为支出”，确认金额再保存到账本。</p></section>`}
let trendRange=30,historyWriting=false,historyAttemptAt=0;
function assetSnapshot(f){const assets=(f.assets||[]).filter(x=>!x.archived),previous=f.history||[];if(!assets.length&&!previous.length)return null;const basket=Object.fromEntries(currencies.map(c=>[c,total(assets.filter(x=>x.currency===c))]).filter(([,n])=>n));const values=Object.entries(basket).map(([currency,amount])=>({currency,amount}));return {date:today(),at:new Date().toISOString(),assets:basket,valueCny:cnyTotal(values),rateDate:values.some(x=>x.currency!=='CNY')?fx?.date||null:null};}
function snapshotChanged(f,point){if(!point)return false;const last=f.history?.find(x=>x.date===point.date);return !last||JSON.stringify([last.assets,last.valueCny,last.rateDate])!==JSON.stringify([point.assets,point.valueCny,point.rateDate]);}
function applySnapshot(f){const point=assetSnapshot(f);if(!snapshotChanged(f,point))return false;f.history??=[];const index=f.history.findIndex(x=>x.date===point.date);if(index<0)f.history.push(point);else f.history[index]=point;return true;}
function scheduleSnapshot(){if(!editable()||page!=='track'||personalTrackId!=='savings'||tab!=='overview'||historyWriting||fxLoading||Date.now()-historyAttemptAt<60000||!snapshotChanged(data(),assetSnapshot(data())))return;historyWriting=true;historyAttemptAt=Date.now();queueMicrotask(async()=>{try{await commit(()=>{});}catch{}finally{historyWriting=false;if(page==='track'&&personalTrackId==='savings')render()}});}
window.LouieFinanceLayout=function(){const card=document.querySelector('.finance-trend');if(card)card.outerHTML=trendView()};
window.financeTrendRange=function(value){if([7,30,90,0].includes(Number(value))){trendRange=Number(value);render()}};
function trendView(){const cut=trendRange?new Date(Date.parse(today()+'T00:00:00Z')-(trendRange-1)*86400000).toISOString().slice(0,10):'',rows=(data().history||[]).filter(p=>p.date>=cut).slice().sort((a,b)=>a.date.localeCompare(b.date)),points=rows.filter(p=>Number.isSafeInteger(p.valueCny)),first=points[0],last=points.at(-1),change=points.length>1?last.valueCny-first.valueCny:null;const header=`<div class="finance-section"><h2>资产趋势</h2><div class="finance-trend-ranges">${[[7,'7天'],[30,'30天'],[90,'90天'],[0,'全部']].map(([n,label])=>`<button class="${trendRange===n?'primary':''}" onclick="financeTrendRange(${n})" aria-pressed="${trendRange===n}">${label}</button>`).join('')}</div></div>`;
 if(!points.length)return `<section class="card finance-trend">${header}<p class="empty">${rows.length?'取得汇率后显示趋势。':'记录资产后开始积累每日快照。'}</p></section>`;
 const compact=typeof matchMedia==='function'&&matchMedia('(max-width:600px)').matches,width=compact?360:720,height=230,left=compact?96:76,right=compact?16:24,top=24,bottom=42,start=Date.parse(first.date+'T00:00:00Z'),end=Date.parse(last.date+'T00:00:00Z'),low=Math.min(...points.map(p=>p.valueCny)),high=Math.max(...points.map(p=>p.valueCny)),pad=Math.max((high-low)*.15,Math.max(Math.abs(high),100)*.02),min=low-pad,max=high+pad,x=p=>end===start?(width+left-right)/2:left+(Date.parse(p.date+'T00:00:00Z')-start)/(end-start)*(width-left-right),y=p=>top+(max-p.valueCny)/(max-min)*(height-top-bottom);let segments=[],segment=[];for(const p of rows){if(p.valueCny===null){if(segment.length)segments.push(segment);segment=[]}else segment.push(p)}if(segment.length)segments.push(segment);
 const line=segments.map(group=>`<path d="${group.map((p,i)=>(i?'L':'M')+x(p).toFixed(2)+' '+y(p).toFixed(2)).join(' ')}" fill="none" stroke="var(--green)" stroke-width="3" stroke-linejoin="round"/>`).join(''),ticks=[0,.5,1].map(t=>{const pos=top+t*(height-top-bottom),value=Math.round(max-t*(max-min));return `<line x1="${left}" x2="${width-right}" y1="${pos}" y2="${pos}" stroke="var(--line)" stroke-dasharray="4 5"/><text x="${left-10}" y="${pos+4}" text-anchor="end">${esc(money(value))}</text>`}).join(''),labels=[...new Set([0,Math.floor((points.length-1)/2),points.length-1])].map(i=>`<text x="${x(points[i])}" y="${height-12}" text-anchor="middle">${points[i].date.slice(5)}</text>`).join('');
 return `<section class="card finance-trend">${header}${change!==null?`<p class="finance-trend-change">期间变化 <strong>${change>0?'+':''}${money(change)}</strong></p>`:''}<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="人民币资产趋势，${points.length}个已记录日期"><title>人民币资产每日快照</title>${ticks}${line}${points.map(p=>`<circle cx="${x(p)}" cy="${y(p)}" r="4" fill="var(--green)" tabindex="0"><title>${p.date} · ${money(p.valueCny)}</title></circle>`).join('')}${labels}</svg><p class="muted finance-caption">${points.length===1?'已开始记录，后续会形成趋势。':'按已记录日期展示，每天保留最后一笔资产快照。'}${rows.some(p=>p.valueCny===null)?'部分日期缺少汇率，已留空。':''} 外币按记录时的参考汇率折算。</p></section>`;
}

function overview(){const t=totals(),rest=t.budget!==null&&t.expense!==null?t.budget-t.expense:null;return `<div class="finance-stats">${[['总资产 · 折合人民币',t.assets],['本月收入',t.income],['本月支出',t.expense],['本周支出',t.weekly]].map(([k,v])=>`<section class="card"><small>${k}</small><strong>${converted(v)}</strong></section>`).join('')}</div>${ratesNote()}${trendView()}<section class="card"><div class="finance-section"><h2>月度预算</h2>${action('设置预算',"financeBudget()")}</div>${t.budget===null?'<p class="muted">取得汇率后显示合计预算。</p>':t.budget?`<div class="finance-section"><strong>${converted(t.expense)} <small>/ ${money(t.budget)}</small></strong>${rest!==null?`<span>${rest>=0?'剩余 '+money(rest):'超出 '+money(-rest)}</span>`:''}</div>${t.expense!==null?progress(t.expense,t.budget):''}`:'<p class="muted">设定每月支出上限，查看本月还可以花多少。</p>'}</section>`}
function view(){return `<div class="pagehead"><div><span class="eyebrow">MONEY</span><h1>个人账户</h1></div></div><div class="tabs finance-tabs">${[['overview','总览'],['assets','资产结构'],['entries','收支账本'],['goals','攒钱计划']].map(([k,label])=>`<button class="${tab===k?'primary':''}" onclick="financeTab('${k}')">${label}</button>`).join('')}<button onclick="financeArchived()">${archived?'返回当前记录':'已归档'}</button></div>${archived?'<p class="muted">正在查看归档记录。资产、收支和计划可在对应栏目恢复。</p>':''}${tab==='overview'?overview():tab==='assets'?assetsView():tab==='entries'?entriesView():goalsView()}`}
const oldView=trackView;trackView=function(){if(personalTrackId!=='savings')return oldView();void ensureRates();scheduleSnapshot();return view()};
const oldNav=projectNavItems;projectNavItems=function(){return navigationProject==='savings'?['track']:oldNav()};
const oldLabel=projectNavLabel;projectNavLabel=function(k){return navigationProject==='savings'?({track:'个人账户'}[k]||oldLabel(k)):oldLabel(k)};
window.financeTab=k=>{if(['overview','assets','entries','goals'].includes(k)){tab=k;render()}};
window.financeCurrency=k=>{if(currencies.includes(k)){currency=k;render()}};
window.financeMonth=k=>{if(/^\d{4}-(0[1-9]|1[0-2])$/.test(k)){month=k;render()}};
window.financeArchived=()=>{archived=!archived;if(tab==='overview')tab='assets';render()};
let financeQueue=Promise.resolve();function commit(change){if(!editable())return Promise.resolve(false);const run=async()=>{if(typeof diskQueue!=='undefined')await diskQueue;const before=db.personal.finance,next=structuredClone(before||empty());next.plans??=[];change(next);applySnapshot(next);db.personal.finance=next;try{const ok=await save();if(!ok){if(before===undefined)delete db.personal.finance;else db.personal.finance=before;return false}return true}catch(e){if(before===undefined)delete db.personal.finance;else db.personal.finance=before;throw e}};const job=financeQueue.then(run,run);financeQueue=job.catch(()=>{});return job;}
window.financeArchive=async(key,id,value=true)=>{if(!['assets','entries','goals','plans'].includes(key))return;if(await commit(d=>{const x=d[key].find(x=>x.id===id);if(x)x.archived=value})){closeModal();render()}};
window.financeForm=function(key,id='',kind='expense',goalId='',planId=''){if(!editable()||!['assets','entries','goals'].includes(key))return;const old=id?data()[key].find(x=>x.id===id):null;if(id&&!old)return;const plan=planId?data().plans.find(p=>p.id===planId&&p.currency===currency&&!p.archived):null;if(planId&&!plan)return;const linkedGoal=goalId?data().goals.find(g=>g.id===goalId):null;const x=old||{name:'',amount:plan?.amount||0,initial:0,category:plan?.category||(key==='assets'?'现金':'日常'),date:key==='goals'?'':today(),note:plan?.name||'',currency:linkedGoal?.currency||currency,kind,goalId,...(plan?{planId:plan.id}:{})};const label=key==='assets'?'资产':key==='goals'?'攒钱计划':'收支';show(`<h2>${old?'编辑':'新增'}${label}</h2><form id="financeForm"><label>币种<select name="currency" onchange="financeFormCurrency(this.form)">${opts(currencies,x.currency)}</select></label>${key==='entries'?`<label>类型<select name="kind">${[['expense','支出'],['income','收入'],['saving','攒钱存入']].map(([k,n])=>`<option value="${k}" ${x.kind===k?'selected':''}>${n}</option>`).join('')}</select></label><label>关联攒钱计划（存入时必选）<select name="goalId"><option value="">不关联</option>${data().goals.filter(g=>!g.archived&&g.currency===x.currency).map(g=>`<option value="${g.id}" ${g.id===x.goalId?'selected':''}>${esc(g.name)}</option>`).join('')}</select></label>`:`<label>名称<input name="name" required maxlength="80" value="${esc(x.name)}" placeholder="${key==='assets'?'如：工资卡、黄金持仓':'如：应急金、旅行基金'}"></label>`}${key==='assets'?`<label>资产类别<select name="category">${opts(categories,x.category)}</select></label>`:key==='entries'?`<label>分类<input name="category" maxlength="40" value="${esc(x.category)}" required list="financeCategories"><datalist id="financeCategories">${['餐饮','交通','住房','购物','娱乐','医疗','工资','奖金','其他'].map(c=>`<option>${c}</option>`).join('')}</datalist></label>`:''}<div class="formgrid"><label>${key==='assets'?'当前余额 / 估值':key==='goals'?'目标金额':'金额'}（<span data-finance-unit>${esc(x.currency)}</span>）<input name="amount" type="number" min="0.01" max="9999999999" step="0.01" required value="${x.amount?x.amount/100:''}"></label>${key==='entries'?`<label>日期<input name="date" type="date" value="${x.date}" required></label>`:''}</div>${key==='goals'?`<label>开始前已攒金额（<span data-finance-unit>${esc(x.currency)}</span>）<input name="initial" type="number" min="0" step="0.01" value="${x.initial/100}"></label>`:''}<label>备注<textarea name="note" maxlength="500">${esc(x.note||'')}</textarea></label><p id="financeError" role="status"></p><div class="actions"><button class="primary">保存${label}</button>${old?`<button type="button" onclick="financeArchive('${key}','${old.id}')">归档</button>`:''}</div></form>`);let pending=false;$('#financeForm').onsubmit=async e=>{e.preventDefault();if(pending)return;const f=new FormData(e.target);try{const value={...x,id:old?.id||uid(),currency:String(f.get('currency')),amount:amount(f.get('amount')),date:key==='entries'?String(f.get('date')||''):x.date,note:String(f.get('note')||'').trim(),archived:false};if(value.amount<=0)throw Error('金额须大于0');if(!currencies.includes(value.currency))throw Error('请选择有效币种');if(old&&value.currency!==old.currency&&((key==='goals'&&data().entries.some(e=>e.goalId===old.id))||(key==='entries'&&old.goalId)))throw Error('这条记录已关联攒钱存入，请保留原币种');if(key==='entries'){value.kind=f.get('kind');if(value.kind!=='expense')delete value.planId;if(value.planId&&data().entries.some(e=>e.planId===value.planId&&e.kind==='expense'&&!e.archived&&e.id!==value.id))throw Error('这个计划已记过支出，请到收支账本查看');value.category=String(f.get('category')).trim();value.goalId=value.kind==='saving'?String(f.get('goalId')):'';if(value.kind==='saving'&&!data().goals.some(g=>g.id===value.goalId&&g.currency===value.currency&&!g.archived))throw Error('请选择同币种的攒钱计划')}else value.name=String(f.get('name')).trim();if(key==='assets')value.category=f.get('category');if(key==='goals')value.initial=amount(f.get('initial'));pending=true;e.target.querySelector('button').disabled=true;const ok=await commit(d=>{const i=d[key].findIndex(v=>v.id===value.id);if(i<0)d[key].push(value);else d[key][i]=value});if(ok){closeModal();render()}else $('#financeError').textContent='未保存，请重试。'}catch(error){$('#financeError').textContent=error.message}finally{pending=false;const b=$('#financeForm button');if(b)b.disabled=false}}};
window.financeFormCurrency=function(form){const code=form.elements.currency.value;if(!currencies.includes(code))return;form.querySelectorAll('[data-finance-unit]').forEach(n=>n.textContent=code);const select=form.elements.goalId;if(select){const previous=select.value;select.innerHTML='<option value="">不关联</option>'+data().goals.filter(g=>!g.archived&&g.currency===code).map(g=>`<option value="${g.id}" ${g.id===previous?'selected':''}>${esc(g.name)}</option>`).join('')}};
window.financePlanExpense=function(id){if(!editable())return;const plan=data().plans.find(p=>p.id===id&&!p.archived&&p.currency===currency);if(!plan||paid(plan))return;window.financeForm('entries','','expense','',id)};
window.financePlanForm=function(id=''){if(!editable())return;const old=id?data().plans.find(p=>p.id===id):null;if(id&&!old)return;const p=old||{name:'',amount:0,currency,date:'',category:'其他',priority:'想要',note:'',archived:false};show(`<h2>${old?'编辑':'新增'}消费计划</h2><form id="financePlanForm"><label>计划买什么 / 用在哪里<input name="name" maxlength="80" required value="${esc(p.name)}" placeholder="如：旅行、换手机、课程学费"></label><div class="formgrid"><label>预计金额（${p.currency}）<input name="amount" type="number" min="0.01" max="9999999999" step="0.01" required value="${p.amount?p.amount/100:''}"></label><label>预计支出日期（可选）<input name="date" type="date" value="${esc(p.date)}"></label></div><div class="formgrid"><label>分类<input name="category" maxlength="40" required value="${esc(p.category)}" list="spendingPlanCategories"><datalist id="spendingPlanCategories">${['旅行','电子产品','学习','居住','健康','人情','其他'].map(c=>`<option>${c}</option>`).join('')}</datalist></label><label>优先级<select name="priority">${opts(['必要','想要','可推迟'],p.priority)}</select></label></div><label>备注<textarea name="note" maxlength="500">${esc(p.note)}</textarea></label><p id="financePlanError" role="status"></p><div class="actions"><button class="primary">保存消费计划</button>${old?`<button type="button" onclick="financeArchive('plans','${p.id}')">归档计划</button>`:''}</div></form>`);let pending=false;const planId=old?.id||uid();$('#financePlanForm').onsubmit=async e=>{e.preventDefault();if(pending)return;const f=new FormData(e.target);try{const value={...p,id:planId,name:String(f.get('name')).trim(),amount:amount(f.get('amount')),date:String(f.get('date')||''),category:String(f.get('category')).trim(),priority:f.get('priority'),note:String(f.get('note')||'').trim()};if(!value.name||!value.category||!value.amount)throw Error('请填写名称、预计金额和分类');pending=true;e.target.querySelector('button').disabled=true;if(await commit(d=>{const i=d.plans.findIndex(p=>p.id===value.id);if(i<0)d.plans.push(value);else d.plans[i]=value})){closeModal();render()}else $('#financePlanError').textContent='未保存，请重试。'}catch(error){$('#financePlanError').textContent=error.message}finally{pending=false;const button=$('#financePlanForm button');if(button)button.disabled=false}}};
window.financeBudget=function(){if(!editable())return;const current=today().slice(0,7);show(`<h2>月度预算</h2><form id="financeBudgetForm"><label>币种<select name="currency" onchange="financeBudgetCurrency(this.form)">${opts(currencies,'CNY')}</select></label><label>支出上限<input type="number" name="amount" min="0" step="0.01" required value="${(data().budgets[current+'|CNY']||0)/100}"></label><p id="financeError" role="status"></p><button class="primary">保存预算</button></form>`);let pending=false;$('#financeBudgetForm').onsubmit=async e=>{e.preventDefault();if(pending)return;try{const f=new FormData(e.target),n=amount(f.get('amount')),code=String(f.get('currency'));if(!currencies.includes(code))throw Error('请选择有效币种');pending=true;if(await commit(d=>d.budgets[current+'|'+code]=n)){closeModal();render()}}catch(error){$('#financeError').textContent=error.message}finally{pending=false}}};
window.financeBudgetCurrency=function(form){const code=form.elements.currency.value;if(currencies.includes(code))form.elements.amount.value=(data().budgets[today().slice(0,7)+'|'+code]||0)/100};
const oldValid=validData;validData=function(d){if(!oldValid(d))return false;const f=d.personal?.finance;if(f===undefined)return true;const num=n=>Number.isSafeInteger(n)&&n>=0&&n<=1e12;return f&&['assets','entries','goals'].every(k=>Array.isArray(f[k])&&f[k].length<=20000&&new Set(f[k].map(x=>x.id)).size===f[k].length&&f[k].every(x=>x&&/^[a-zA-Z0-9-]{1,100}$/.test(x.id)&&currencies.includes(x.currency)&&num(x.amount)&&x.amount>0&&typeof x.date==='string'&&(!x.date&&k==='goals'||/^\d{4}-\d{2}-\d{2}$/.test(x.date))&&typeof x.note==='string'&&x.note.length<=500&&typeof x.archived==='boolean'&&(k==='entries'?['expense','income','saving'].includes(x.kind)&&typeof x.category==='string'&&x.category.length<=40&&typeof x.goalId==='string':typeof x.name==='string'&&x.name.length>0&&x.name.length<=80&&(k==='assets'?categories.includes(x.category):num(x.initial)))))&&f.budgets&&typeof f.budgets==='object'&&!Array.isArray(f.budgets)&&Object.entries(f.budgets).every(([k,v])=>/^\d{4}-(0[1-9]|1[0-2])\|(CNY|USD|HKD|EUR|GBP|JPY|SGD)$/.test(k)&&num(v))};
const financeBaseValid=validData;validData=function(d){if(!financeBaseValid(d))return false;const f=d.personal?.finance;if(!f)return true;return (f.plans===undefined||(Array.isArray(f.plans)&&f.plans.length<=20000&&new Set(f.plans.map(p=>p?.id)).size===f.plans.length&&f.plans.every(p=>p&&/^[A-Za-z0-9-]{1,100}$/.test(p.id)&&typeof p.name==='string'&&p.name.trim().length>0&&p.name.length<=80&&Number.isSafeInteger(p.amount)&&p.amount>0&&p.amount<=1e12&&currencies.includes(p.currency)&&typeof p.date==='string'&&(!p.date||/^\d{4}-\d{2}-\d{2}$/.test(p.date))&&typeof p.category==='string'&&p.category.trim().length>0&&p.category.length<=40&&['必要','想要','可推迟'].includes(p.priority)&&typeof p.note==='string'&&p.note.length<=500&&typeof p.archived==='boolean')))&&f.entries.every(e=>e.planId===undefined||typeof e.planId==='string'&&/^[A-Za-z0-9-]{1,100}$/.test(e.planId))};
const historyBaseValid=validData;validData=function(d){if(!historyBaseValid(d))return false;const h=d.personal?.finance?.history;if(h===undefined)return true;return Array.isArray(h)&&h.length<=20000&&new Set(h.map(p=>p?.date)).size===h.length&&h.every(p=>p&&/^\d{4}-\d{2}-\d{2}$/.test(p.date)&&typeof p.at==='string'&&p.at.length<=40&&(p.valueCny===null||Number.isSafeInteger(p.valueCny)&&p.valueCny>=0)&&(p.rateDate===null||typeof p.rateDate==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(p.rateDate))&&p.assets&&typeof p.assets==='object'&&!Array.isArray(p.assets)&&Object.entries(p.assets).every(([c,v])=>currencies.includes(c)&&Number.isSafeInteger(v)&&v>=0))};
const style=document.createElement('style');style.textContent=`.finance-trend svg{display:block;width:100%;height:auto;max-height:280px;margin:12px 0}.finance-trend svg text{fill:var(--muted);font:12px system-ui,sans-serif}.finance-trend-ranges{display:flex;gap:6px}.finance-trend-ranges button{padding:6px 11px;font-size:12px}.finance-trend-change{margin:12px 0 0;color:var(--muted);font-size:13px}.finance-trend-change strong{color:var(--ink);margin-left:10px;font-variant-numeric:tabular-nums}.finance-planning-summary{display:flex;gap:40px;flex-wrap:wrap;margin:22px 0}.finance-planning-summary strong{display:block;font-size:25px;font-variant-numeric:tabular-nums}.finance-plan{padding:20px 0;border-bottom:1px solid var(--line)}.finance-plan:last-of-type{border-bottom:0}.finance-plan h3{margin:0 0 6px}.finance-plan p{margin:12px 0;white-space:pre-wrap}.finance-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:20px}.finance-stats .card{margin:0;padding:22px}.finance-stats strong{display:block;font-size:clamp(20px,2.1vw,30px);font-variant-numeric:tabular-nums;letter-spacing:-.5px;margin-top:10px}.finance-section{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}.finance-section h2,.finance-section h3{margin:0 0 10px}.finance-progress{height:8px;background:var(--accent-soft);border-radius:8px;overflow:hidden;margin:16px 0}.finance-progress i{display:block;height:100%;background:var(--green);border-radius:8px}.finance-allocation{display:flex;gap:3px;height:14px;border-radius:6px;overflow:hidden;margin:22px 0}.finance-sum{float:right;font-weight:500;font-size:14px}.finance-row small{display:block;margin-top:6px}.finance-goal{padding:20px 0;border-bottom:1px solid var(--line)}.finance-goal:last-child{border-bottom:0}.finance-caption{font-size:13px;line-height:1.7}.finance-tabs{flex-wrap:wrap}.finance-row strong{font-variant-numeric:tabular-nums;white-space:nowrap}@media(max-width:750px){.finance-stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.finance-stats .card{padding:16px}.finance-sum{float:none;display:block;margin-top:8px}}`;document.head.appendChild(style);
if(page==='track'&&personalTrackId==='savings')render();
})();
