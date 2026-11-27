import defaults from './teacher-defaults.json' with {type:'json'};
import {b64,unb64} from './auth.mjs';
const enc=new TextEncoder(),skillsIDs=defaults.skills.map(s=>s.id),models=['deepseek-flash','deepseek-v4-pro'],categories=['学习偏好','学习目标','学习观察'];
const text=(v,n=4000)=>typeof v==='string'?v.trim().slice(0,n):'',id=v=>typeof v==='string'&&/^[A-Za-z0-9-]{1,100}$/.test(v),now=()=>new Date().toISOString(),norm=v=>String(v).replace(/\s/g,'').toLowerCase(),day=(n=0)=>new Date(Date.now()+8*3600000+n*86400000).toISOString().slice(0,10);
function error(message,status=400){throw Object.assign(Error(message),{teacherStatus:status})}
// Validate the provider envelope and final JSON separately; never use reasoning_content as an answer.
export function parseTeacherCompletion(raw){
 let result;try{result=JSON.parse(raw)}catch{error('AI 返回的数据不完整，请重试',502)}
 const choice=result.choices?.[0];
 if(choice?.finish_reason==='length')error('回答达到长度上限，请拆小问题或关闭深入思考后重试',502);
 if(!choice){error('AI 服务没有返回完整回答，请稍后重试',502)}
 const content=typeof choice.message?.content==='string'?choice.message.content.trim():'';
 const invalid=message=>{const e=Object.assign(Error(message),{teacherStatus:502,teacherCode:'ANSWER_FORMAT',retryable:true});throw e};
 if(!content)invalid('AI 返回了空回答，问题已保留，请重试');
 const clean=content.replace(/^```(?:json)?\s*\n?/i,'').replace(/\n?```\s*$/,'');
 let object;try{object=JSON.parse(clean)}catch{invalid('AI 回答格式异常，问题已保留，请重试')}
 const answer=text(object?.answer,24000);
 if(!answer||/^(?:请)?(?:见|参见|详见|参考)(?:上表|下表|上图|下图)[。.!！\s]*$/.test(answer))invalid('AI 没有返回实际正文，问题已保留，请重试');
 return {object,answer,usage:result.usage||{}};
}
export async function completeTeacher({key,model,messages,thinking}){
 for(let attempt=0;attempt<2;attempt++){
  try{
   const r=await fetch('https://api.deepseek.com/chat/completions',{method:'POST',redirect:'manual',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},signal:AbortSignal.timeout(attempt?50000:100000),body:JSON.stringify({model,messages:attempt?[...messages,{role:'system',content:'上次未得到可解析的完整 JSON。请重新回答原问题，仅输出 JSON 对象，answer 必须包含完整正文，换行与双引号需正确转义。不得输出代码块围栏。'}]:messages,stream:false,response_format:{type:'json_object'},thinking:{type:thinking&&!attempt?'enabled':'disabled'},max_tokens:thinking&&!attempt?8192:4096})});
   if(!r.ok)error(({400:'AI 接口拒绝了请求，请检查模型设置',401:'DeepSeek 密钥无效',402:'DeepSeek 余额不足',429:'DeepSeek 请求较多，请稍后重试'})[r.status]||'DeepSeek 服务暂时不可用，请稍后重试',502);
   const raw=await r.text();if(raw.length>3*1024*1024)error('回答过长，请拆小问题',502);
   return parseTeacherCompletion(raw);
  }catch(e){
   if(e.retryable&&attempt===0){console.warn('teacher_answer_recovery',JSON.stringify({code:e.teacherCode,attempt:1}));continue}
   if(e.teacherStatus)throw e;
   if(['TimeoutError','AbortError'].includes(e.name))error('AI 回答超时，问题已保留。可关闭深入思考后重试',504);
   console.warn('teacher_provider_failure',JSON.stringify({name:e.name||'Error'}));
   error('AI 连接中断，问题已保留，请稍后重试',502);
  }
 }
}

export function emptyTeacher(){return {version:1,state:{version:1,chats:[],memories:[],questions:[],disabledSkills:[],memoryEpoch:0},skills:structuredClone(defaults.skills),preferences:{model:models[0],autoMemory:true,useStudyContext:true}}}
export function validateTeacher(snapshot){
 if(!snapshot||snapshot.version!==1)error('问答备份版本无效');const s=snapshot.state;if(!s||s.version!==1)error('问答记录结构无效');
 for(const [k,max] of Object.entries({chats:100,memories:200,questions:20000,disabledSkills:3}))if(!Array.isArray(s[k])||s[k].length>max)error('问答记录数量或结构无效');
 const string=(v,n=24000)=>typeof v==='string'&&v.length<=n;
 for(const k of ['chats','memories','questions']){if(new Set(s[k].map(x=>x?.id)).size!==s[k].length)error('问答编号重复');for(const x of s[k])if(!x||!id(x.id)||x.projectId!==undefined&&!id(x.projectId))error('问答记录编号无效')}
 for(const c of s.chats){if(!string(c.title,100)||!string(c.createdAt,100)||!Array.isArray(c.messages)||c.messages.length>400)error('对话格式无效');for(const m of c.messages)if(!id(m.id)||!['user','assistant'].includes(m.role)||!string(m.content)||!string(m.createdAt,100)||m.replyTo!==undefined&&!id(m.replyTo))error('消息格式无效')}
 for(const m of s.memories)if(!string(m.content,800)||!categories.includes(m.category)||!string(m.createdAt,100))error('记忆格式无效');
 for(const q of s.questions)if(['title','question','takeaway','answer','createdAt','due'].some(k=>!string(q[k]))||!Number.isInteger(q.level)||q.level<0||q.level>4)error('问题本格式无效');
 if(!Array.isArray(snapshot.skills)||snapshot.skills.length!==3||new Set(snapshot.skills.map(x=>x.id)).size!==3)error('教学规则不完整');
 const checkSkill=(name,content)=>skillsIDs.includes(name)&&string(content,12000)&&content.startsWith('---')&&new RegExp('^name:\\s*'+name+'\\s*$','m').test(content);
 for(const skill of snapshot.skills)if(!checkSkill(skill.id,skill.content))error('教学规则格式无效');
 if(s.disabledSkills.some(k=>!skillsIDs.includes(k)))error('教学规则状态无效');
 for(const [project,rules] of Object.entries(s.projectSkills||{})){if(!id(project)||!rules||typeof rules!=='object')error('项目规则无效');for(const [name,content] of Object.entries(rules))if(!checkSkill(name,content))error('项目教学规则无效')}
 for(const [project,disabled] of Object.entries(s.projectDisabledSkills||{}))if(!id(project)||!Array.isArray(disabled)||disabled.length>3||disabled.some(k=>!skillsIDs.includes(k)))error('项目规则状态无效');
 if(!snapshot.preferences||!models.includes(snapshot.preferences.model)||typeof snapshot.preferences.autoMemory!=='boolean'||typeof snapshot.preferences.useStudyContext!=='boolean')error('问答设置无效');
 if(JSON.stringify(snapshot).length>24*1024*1024)error('问答记录过大，请先备份整理',413);return true;
}
const projectOf=(state,item)=>item.projectId||state.chats.find(c=>c.id===item.chatId)?.projectId||'exam';
function projectSkills(snapshot,project){const disabled=project==='exam'?snapshot.state.disabledSkills:snapshot.state.projectDisabledSkills?.[project]||[];return snapshot.skills.map(s=>({...s,content:project==='exam'?s.content:snapshot.state.projectSkills?.[project]?.[s.id]||defaults.skills.find(d=>d.id===s.id).content,enabled:!disabled.includes(s.id)}))}
function view(snapshot,project,hasKey,pending=false){const state=structuredClone(snapshot.state),source=snapshot.state;for(const k of ['chats','memories','questions'])state[k]=state[k].filter(x=>projectOf(source,x)===project);state.disabledSkills=project==='exam'?source.disabledSkills:source.projectDisabledSkills?.[project]||[];delete state.projectSkills;delete state.projectDisabledSkills;if(!pending)for(const c of state.chats)for(const m of c.messages)if(m.status==='pending'){m.status='interrupted';m.error='上次请求中断，问题已保留，可重新提问。'}return {state,projectId:project,config:{provider:'DeepSeek',...snapshot.preferences,hasKey},skills:projectSkills(snapshot,project)}}
async function secretKey(env){return crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',enc.encode('teacher-key-v1:'+env.SESSION_SECRET)),{name:'AES-GCM'},false,['encrypt','decrypt'])}
export async function encryptTeacherKey(value,env){const iv=crypto.getRandomValues(new Uint8Array(12));return {iv:b64(iv),cipher:b64(await crypto.subtle.encrypt({name:'AES-GCM',iv},await secretKey(env),enc.encode(value)))}}
async function getKey(env,H){const stored=await(await H.stateCall(env,'/teacher-key-get')).json();return stored?new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(stored.iv)},await secretKey(env),unb64(stored.cipher))):env.DEEPSEEK_API_KEY||''}
async function load(env,H){const ref=await(await H.stateCall(env,'/teacher-head')).json();if(!ref.driveId)return {ref,snapshot:emptyTeacher()};const r=await H.drive(env,'files/'+encodeURIComponent(ref.driveId)+'?alt=media');if(!r.ok)error('问答云端记录读取失败，原记录未修改',502);const snapshot=await r.json();validateTeacher(snapshot);return {ref,snapshot}}
async function save(env,H,ref,snapshot){validateTeacher(snapshot);const raw=JSON.stringify(snapshot),boundary='teacher'+crypto.randomUUID(),meta={name:'teacher-snapshot-'+crypto.randomUUID()+'.json',parents:[env.DRIVE_ROOT_ID],appProperties:{louieType:'teacher'}};const r=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',redirect:'manual',headers:{Authorization:'Bearer '+await H.driveToken(env),'Content-Type':'multipart/related; boundary='+boundary},body:'--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(meta)+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+raw+'\r\n--'+boundary+'--'});if(!r.ok)error('问答记录未保存，请重试',502);const uploaded=await r.json(),result=await H.stateCall(env,'/teacher-publish',{expected:ref.revision,driveId:uploaded.id});if(!result.ok)error('其他设备已更新问答，未覆盖，请刷新重试',409);return result.json()}
function studyContext(data,project){const t=data.personal?.tracks?.find(t=>t.id===project),scope=x=>(x.trackId||'exam')===project;return JSON.stringify({direction:t?{name:t.name,goal:t.goal,subjects:t.subjects,milestones:t.milestones}:{name:project},target:project==='exam'?data.settings:{},recentSessions:(data.sessions||[]).filter(scope).slice(-5),materials:(data.materials||[]).filter(scope).slice(-8).map(m=>({title:m.title,subject:m.subject,current:m.current,total:m.total,status:m.status})),...(project==='exam'?{weakChapters:Object.entries(data.mastery||{}).filter(([,v])=>v===1||v===2).slice(0,12),errors:(data.errors||[]).slice(-5)}:{})}).slice(0,10000)}
export function mutateTeacher(snapshot,body,project,known){const state=snapshot.state,action=body.action,find=(key,ident)=>{const x=state[key].find(x=>x.id===ident);if(x&&projectOf(state,x)!==project)error('当前项目没有这条记录',404);return x};
 if(action==='new-chat'){if(state.chats.length>=100)error('对话已达100，请先备份整理');state.chats.push({id:crypto.randomUUID(),projectId:project,title:text(body.title,100)||'新对话',createdAt:now(),messages:[]})}
 else if(action==='delete-chat'){const c=find('chats',body.id);if(!c)error('对话不存在',404);state.chats=state.chats.filter(x=>x.id!==c.id);state.questions=state.questions.filter(x=>x.chatId!==c.id);state.memories=state.memories.filter(x=>x.manual||x.chatId!==c.id);for(const m of state.memories)if(m.chatId===c.id){m.projectId=project;delete m.chatId;delete m.sourceId}state.memoryEpoch++}
 else if(action==='move-chat'){const c=find('chats',body.id);if(!c||!known.has(body.targetProjectId))error('目标项目或对话不存在',404);for(const k of ['questions','memories'])for(const x of state[k])if(x.chatId===c.id)x.projectId=body.targetProjectId;c.projectId=body.targetProjectId;state.memoryEpoch++}
 else if(action==='save-memory'||action==='delete-memory'){const m=find('memories',body.id);if(action==='delete-memory'){state.memories=state.memories.filter(x=>x.id!==body.id)}else{const content=text(body.content,800);if(!content||!categories.includes(body.category))error('请填写有效的记忆内容和分类');if(m)Object.assign(m,{content,category:body.category,manual:true,evidence:'用户编辑',updatedAt:now()});else{if(state.memories.length>=200)error('记忆已达200条');state.memories.push({id:crypto.randomUUID(),content,category:body.category,manual:true,evidence:'用户记录',projectId:project,createdAt:now()})}}state.memoryEpoch++}
 else if(action==='collect-question'){const c=find('chats',body.chatId),q=c?.messages.find(m=>m.id===body.sourceId&&m.role==='user'),a=c?.messages.find(m=>m.replyTo===body.sourceId);if(!q||!a)error('原对话尚无完整回答');if(!state.questions.some(x=>projectOf(state,x)===project&&norm(x.question)===norm(q.content))){if(state.questions.length>=20000)error('问题本已满');state.questions.push({id:crypto.randomUUID(),projectId:project,title:q.content.slice(0,100),question:q.content,takeaway:a.content.slice(0,2000),answer:a.content,chatId:c.id,sourceId:q.id,createdAt:now(),due:day(1),level:0})}}
 else if(['save-question','delete-question','review-question'].includes(action)){const q=find('questions',body.id);if(!q)error('问题记录不存在',404);if(action==='delete-question')state.questions=state.questions.filter(x=>x.id!==q.id);else if(action==='save-question'){const title=text(body.title,150),takeaway=text(body.takeaway,2000);if(!title||!takeaway)error('问题标题和关键方法不能为空');Object.assign(q,{title,takeaway,updatedAt:now()})}else{q.level=body.pass===true?Math.min(q.level+1,4):0;q.due=day([1,3,7,14,30][q.level]);q.lastReview=day()}}
 else if(action==='save-skill'){if(!skillsIDs.includes(body.id))error('教学规则不存在');const content=text(body.content,12000);if(!content.startsWith('---')||!new RegExp('^name:\\s*'+body.id+'\\s*$','m').test(content))error('规则需保留原有 name');let disabled;if(project==='exam'){snapshot.skills.find(x=>x.id===body.id).content=content;disabled=state.disabledSkills}else{((state.projectSkills??={})[project]??={})[body.id]=content;disabled=(state.projectDisabledSkills??={})[project]??=[]}const i=disabled.indexOf(body.id);if(i>=0)disabled.splice(i,1);if(body.enabled===false)disabled.push(body.id)}
 else error('不支持的问答操作');validateTeacher(snapshot);
}
export async function teacherRoute(request,env,identity,path,H,learningData){
 if(!path.startsWith('/api/teacher'))return null;if(identity.role!=='edit')return H.fail('仅个人模式可访问智能问答',403);
 let lease;
 try{
 const body=request.method==='GET'?{}:await H.readJSON(request,32*1024*1024),project=body.projectId||new URL(request.url).searchParams.get('projectId')||'exam',known=new Set(['exam',...(learningData.personal?.tracks||[]).filter(t=>t.id!=='selfdiscipline').map(t=>t.id)]);if(!id(project)||!known.has(project))error('项目不存在',404);
 if(request.method!=='GET'){lease=crypto.randomUUID();const r=await(await H.stateCall(env,'/teacher-lock',{id:lease})).json();if(!r.acquired)error('老师正在处理上一个操作，请稍候',409)}
 let {ref,snapshot}=await load(env,H);const key=await getKey(env,H);
 if(request.method==='GET'){
  if(path==='/api/teacher/export')return H.json(snapshot);
  if(path!=='/api/teacher')return H.fail('接口不存在',404);
  const busy=await(await H.stateCall(env,'/teacher-busy')).json();return H.json(view(snapshot,project,!!key,busy.busy));
 }
 if(request.method!=='POST')error('不支持的请求',405);
 if(path==='/api/teacher/import'){validateTeacher(body.snapshot);if(body.validateOnly)return H.json({valid:true});snapshot=structuredClone(body.snapshot);for(const c of snapshot.state.chats)for(const m of c.messages)if(m.status==='pending'){m.status='interrupted';m.error='从备份恢复的问题，可重新提问。'}snapshot.state.memoryEpoch=(snapshot.state.memoryEpoch||0)+1;await save(env,H,ref,snapshot);return H.json(view(snapshot,project,!!key))}
 if(path==='/api/teacher/config'){const p=snapshot.preferences;const model=body.model||p.model;if(!models.includes(model))error('请选择支持的 DeepSeek 模型');if(body.apiKey!==undefined&&(typeof body.apiKey!=='string'||body.apiKey.length>500||/[\r\n]/.test(body.apiKey)))error('密钥格式错误');p.model=model;for(const k of ['useStudyContext','autoMemory'])if(k in body){if(typeof body[k]!=='boolean')error('设置格式错误');p[k]=body[k]}if(body.clearKey||text(body.apiKey,500))await H.stateCall(env,'/teacher-key-put',{value:await encryptTeacherKey(body.clearKey?'':body.apiKey.trim(),env)});await save(env,H,ref,snapshot);return H.json({config:view(snapshot,project,!!(await getKey(env,H))).config})}
 if(path==='/api/teacher/action'){mutateTeacher(snapshot,body,project,known);await save(env,H,ref,snapshot);return H.json(view(snapshot,project,!!key))}
 if(path!=='/api/teacher/chat')error('问答接口不存在',404);
 if(!key)error('请先在接口设置中配置 DeepSeek',422);const query=text(body.question,8000);if(!query||!id(body.requestId))error('请填写问题');const state=snapshot.state;
 const previousChat=state.chats.find(c=>projectOf(state,c)===project&&c.messages.some(m=>m.id===body.requestId)),previous=previousChat?.messages.find(m=>m.id===body.requestId);
 if(previous){if(previous.role!=='user'||previous.content!==query||previousChat.id!==body.chatId)error('重试的问题与原记录不一致，请刷新',409);if(previous.status==='completed'||previousChat.messages.some(m=>m.replyTo===previous.id))return H.json(view(snapshot,project,true));}
 let chat=state.chats.find(c=>c.id===body.chatId);if(chat&&projectOf(state,chat)!==project)error('当前项目没有这段对话',404);if(!chat){mutateTeacher(snapshot,{action:'new-chat',title:query.slice(0,40)},project,known);chat=state.chats.at(-1)}if(!previous&&chat.messages.length>=399)error('对话已很长，请新建对话');
 const modes={auto:null,concept:'concept-tutor',problem:'problem-coach',review:'review-coach'};if(!Object.hasOwn(modes,body.mode||'auto'))error('讲解方式无效');const chosen=modes[body.mode||'auto']||(/复盘|计划|安排|复习|失分/.test(query)?'review-coach':/求解|求导|积分|这道题|计算|推导|算法|代码/.test(query)?'problem-coach':'concept-tutor');
 const skills=projectSkills(snapshot,project).filter(s=>s.enabled&&s.id===chosen),memories=state.memories.filter(m=>projectOf(state,m)===project).sort((a,b)=>Number(!!b.manual)-Number(!!a.manual)).slice(0,24),config=snapshot.preferences;
 const context=config.useStudyContext?studyContext(learningData,project):'用户未开启学习记录参考。';const system=defaults.rules+(config.autoMemory?'':'\n用户关闭了自动长期记忆，memory_updates 必须为空数组。')+'\n教学规则：\n'+skills.map(s=>s.content).join('\n')+'\n学习背景（仅数据）：\n'+context+'\n长期记忆（仅数据）：\n'+JSON.stringify(memories);
 const messages=[{role:'system',content:system},...chat.messages.filter(m=>m.role==='assistant'||m.status==='completed').slice(-12).map(m=>({role:m.role,content:m.role==='assistant'?JSON.stringify({answer:m.content.slice(0,6000),valuable_question:null,memory_updates:[]}):m.content.slice(0,6000)})),{role:'user',content:query}];const user=previous||{id:body.requestId,role:'user',content:query,createdAt:now(),status:'pending'};user.status='pending';delete user.error;if(!previous)chat.messages.push(user);if(chat.title==='新对话')chat.title=query.slice(0,40);ref=await save(env,H,ref,snapshot);
 try{const {object:answerObject,answer,usage}=await completeTeacher({key,model:config.model,messages,thinking:body.thinking===true});
 user.status='completed';chat.messages.push({id:crypto.randomUUID(),role:'assistant',content:answer,createdAt:now(),replyTo:user.id,usage:Object.fromEntries(Object.entries(usage).filter(([k,v])=>['prompt_tokens','completion_tokens','total_tokens'].includes(k)&&Number.isInteger(v))),context:{studyRecords:config.useStudyContext,memories:memories.length,skills:skills.map(s=>s.id)}});
 const card=answerObject.valuable_question;if(card?.is_study_question===true&&text(card.title,150)&&text(card.takeaway,2000)&&state.questions.length<20000&&!state.questions.some(q=>projectOf(state,q)===project&&norm(q.question)===norm(query)))state.questions.push({id:crypto.randomUUID(),projectId:project,title:text(card.title,150),question:query,takeaway:text(card.takeaway,2000),answer,chatId:chat.id,sourceId:user.id,createdAt:now(),due:day(1),level:0});
 if(config.autoMemory&&Array.isArray(answerObject.memory_updates))for(const p of answerObject.memory_updates.slice(0,2)){const content=text(p.content,800),evidence=text(p.evidence,500);if(!content||evidence.length<4||!query.includes(evidence)||!categories.includes(p.category)||/sk-[A-Za-z0-9]|密码|密钥|身份证|电话号码|\b\d{11,18}\b/.test(content+evidence)||state.memories.length>=200||state.memories.some(m=>projectOf(state,m)===project&&norm(m.content)===norm(content)))continue;state.memories.push({id:crypto.randomUUID(),content,evidence,category:p.category,projectId:project,chatId:chat.id,sourceId:user.id,createdAt:now(),manual:false})}
 await save(env,H,ref,snapshot);return H.json(view(snapshot,project,true));
 }catch(e){user.status='failed';user.error=e.teacherStatus?e.message:'回答暂时失败，问题已保留。';await save(env,H,ref,snapshot);error(user.error,e.teacherStatus||502)}
 }catch(e){H.onError?.(e);return H.fail(e.teacherStatus?e.message:'问答服务暂时不可用，原记录保留',e.teacherStatus||503)}finally{if(lease)await H.stateCall(env,'/teacher-unlock',{id:lease})}
}
export {getKey as getAIKey};
