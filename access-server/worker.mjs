import {validVault,plainPrivate,vaultFiles,proofMatches} from './vault-storage.mjs';
import {derive as derivePrivate} from './auth.mjs';
import {financeRates} from './finance-rates.mjs';
import {examResearchRoute} from './exam-research.mjs';
import {open as openCredential} from './credentials.mjs';
import {privacyPage} from './privacy.mjs';
import {teacherRoute} from './teacher.mjs';
import {visitorDocument,lockedOwnerDocument,mergeLockedOwnerWrite} from './visitor-data.mjs';
import {privateAuthRoute,privateGrant,privateGatePage,privateLockCookie} from './private-auth.mjs';
import {storageSummary} from './storage.mjs';
import {beginOwner,finishOwner} from './owner-auth.mjs';
import {migrationRoute} from './migration.mjs';
import {verifyPassword,issueSession,session,tokenFrom,allowed,ownerProof,b64} from './auth.mjs';
const text=new TextEncoder();
const json=(value,status=200,extra={})=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
const fail=(message,status=400)=>json({error:message},status);
const validID=v=>typeof v==='string'&&/^[\w-]{1,160}$/.test(v);
async function readJSON(request,max=16000000){if(Number(request.headers.get('Content-Length'))>max)throw Error('请求过大');const reader=request.body?.getReader();let chunks=[],length=0;if(reader)for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>max){await reader.cancel();throw Error('请求过大')}chunks.push(value)}return JSON.parse(await new Blob(chunks).text())}
const loginPage=()=>new Response(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Louie · 访问验证</title><style>body{font:15px/1.8 system-ui;background:#eef3ee;color:#2d4235;padding:30px}main{max-width:420px;margin:12vh auto;background:#fffefa;border:1px solid #dce5dc;border-radius:18px;padding:32px}h1{font-size:24px}input,button{box-sizing:border-box;font:inherit;padding:12px;width:100%;border:1px solid #dce5dc;border-radius:9px;margin:8px 0}button{background:#456e58;color:white}</style><main><h1>Louie 的小站</h1><p>输入访客密码，进入访客模式。</p><form><input aria-label="访客密码" type="password" autocomplete="current-password" required><button>进入网站</button><p role="status"></p></form></main><script>document.querySelector('form').onsubmit=async e=>{e.preventDefault();const r=await fetch('/auth/read',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:document.querySelector('input').value})});const v=await r.json();if(r.ok)location.replace('/');else document.querySelector('[role=status]').textContent=v.error||'验证失败'}</script></html>`,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"}});
export class AccessState{
 constructor(ctx,env){this.ctx=ctx;this.env=env}
 async fetch(request){const path=new URL(request.url).pathname,body=await request.json();
  if(path==='/rate'){return this.ctx.storage.transaction(async tx=>{const key='rate:'+body.key,now=Date.now();let slot=await tx.get(key);if(!slot||now-slot.start>900000)slot={start:now,count:0};if(slot.count>=8)return json({allowed:false});slot.count++;await tx.put(key,slot);return json({allowed:true})})}
  if(path==='/private-grant-get')return json(await this.ctx.storage.get('private-grant:'+body.parent)||null);
  if(path==='/private-grant-put'){await this.ctx.storage.put('private-grant:'+body.parent,body.value);return json({ok:true})}
  if(path==='/private-grant-delete'){await this.ctx.storage.delete('private-grant:'+body.parent);return json({ok:true})}
  if(path==='/private-auth-get')return json(await this.ctx.storage.get('private-auth')||null);
  if(path==='/private-auth-replace')return this.ctx.storage.transaction(async tx=>{const old=await tx.get('private-auth');if(old?.version!==body.expected)return fail('密码已更新，请重新进入',409);await tx.put('private-auth',body.value);return json({ok:true})});
  if(path==='/private-auth-init')return this.ctx.storage.transaction(async tx=>{if(await tx.get('private-auth'))return fail('已设置私密密码',409);await tx.put('private-auth',body.value);return json({ok:true})});
  if(path==='/owner-put'){await this.ctx.storage.put('owner:'+body.id,body.value);return json({ok:true})}
  if(path==='/owner-take')return this.ctx.storage.transaction(async tx=>{const v=await tx.get('owner:'+body.id);await tx.delete('owner:'+body.id);return json(v||null)});
  if(path==='/finance-rates-get')return json(await this.ctx.storage.get('finance-rates')||null);
  if(path==='/finance-rates-put'){await this.ctx.storage.put('finance-rates',body.value);return json({ok:true})}
  if(path==='/system-check-get')return json(await this.ctx.storage.get('system-check')||null);
  if(path==='/system-check-put'){await this.ctx.storage.put('system-check',body.value);return json({ok:true})}
  if(path==='/drive-refresh-get')return json(await this.ctx.storage.get('drive-refresh')||null);
  if(path==='/drive-refresh-status'){const v=await this.ctx.storage.get('drive-refresh');return json({productionReady:!!v?.productionReady,updatedAt:v?.updatedAt||null})}
  if(path==='/drive-refresh-put'){await this.ctx.storage.put('drive-refresh',body.value);return json({ok:true})}
  if(path==='/exam-head')return json(await this.ctx.storage.get('exam-head')||{revision:0,driveId:null});
  if(path==='/exam-publish')return this.ctx.storage.transaction(async tx=>{const old=await tx.get('exam-head')||{revision:0};if(body.expected!==old.revision)return fail('其他设备已更新考研信息',409);await tx.put('exam-backup:'+old.revision,old);const next={revision:old.revision+1,driveId:body.driveId};await tx.put('exam-head',next);return json(next)});
  if(path==='/exam-attempt-get')return json(await this.ctx.storage.get('exam-attempt:'+body.key)||null);
  if(path==='/exam-attempt-put'){await this.ctx.storage.put('exam-attempt:'+body.key,body.value);return json({ok:true})}
  if(path==='/exam-lock')return this.ctx.storage.transaction(async tx=>{const old=await tx.get('exam-lock');if(old&&old.until>Date.now())return json({acquired:false});await tx.put('exam-lock',{id:body.id,until:Date.now()+300000});return json({acquired:true})});
  if(path==='/exam-unlock')return this.ctx.storage.transaction(async tx=>{const old=await tx.get('exam-lock');if(old?.id===body.id)await tx.delete('exam-lock');return json({ok:true})});
  if(path==='/teacher-head')return json(await this.ctx.storage.get('teacher-head')||{revision:0,driveId:null});
  if(path==='/teacher-publish')return this.ctx.storage.transaction(async tx=>{const old=await tx.get('teacher-head')||{revision:0};if(old.revision!==body.expected)return fail('其他设备已更新问答',409);await tx.put('teacher-backup:'+old.revision,old);const next={revision:old.revision+1,driveId:body.driveId};await tx.put('teacher-head',next);return json(next)});
  if(path==='/teacher-key-get')return json(await this.ctx.storage.get('teacher-key')||null);
  if(path==='/teacher-key-put'){await this.ctx.storage.put('teacher-key',body.value);return json({ok:true})}
  if(path==='/teacher-busy'){const v=await this.ctx.storage.get('teacher-lock');return json({busy:!!v&&v.until>Date.now()})}
  if(path==='/teacher-lock')return this.ctx.storage.transaction(async tx=>{const v=await tx.get('teacher-lock');if(v&&v.until>Date.now())return json({acquired:false});await tx.put('teacher-lock',{id:body.id,until:Date.now()+240000});return json({acquired:true})});
  if(path==='/teacher-unlock')return this.ctx.storage.transaction(async tx=>{const v=await tx.get('teacher-lock');if(v?.id===body.id)await tx.delete('teacher-lock');return json({ok:true})});
  if(path==='/head')return json(await this.ctx.storage.get('head')||{revision:0,driveId:null});
  if(path==='/vault-recover-publish')return this.ctx.storage.transaction(async tx=>{const old=await tx.get('head')||{revision:0};if(body.expected!==old.revision)return fail('其他设备已更新，请重新恢复',409);await tx.put('backup:'+old.revision,old);const next={revision:old.revision+1,driveId:body.driveId,vaultEnabled:true};await tx.put('head',next);await tx.put('private-auth',body.auth);return json(next)});
  if(path==='/publish')return this.ctx.storage.transaction(async tx=>{const old=await tx.get('head')||{revision:0};if(body.expected!==old.revision)return fail('其他设备已更新，未覆盖记录',409);await tx.put('backup:'+old.revision,old);const head={revision:old.revision+1,driveId:body.driveId,...(old.vaultEnabled||body.vaultEnabled?{vaultEnabled:true}:{})};await tx.put('head',head);return json(head)});
  if(path==='/upload-put'){await this.ctx.storage.put('upload:'+body.id,body.value);return json({ok:true})}
  if(path==='/upload-get')return json(await this.ctx.storage.get('upload:'+body.id)||null);
  if(path==='/file-put'){await this.ctx.storage.put('file:'+body.id,body.value);return json({ok:true})}
  if(path==='/file-get')return json(await this.ctx.storage.get('file:'+body.id)||null);
  return fail('不存在',404);
 }
}
let cachedToken=null;
async function driveToken(env){if(cachedToken?.until>Date.now())return cachedToken.token;const stored=await(await stateCall(env,'/drive-refresh-get')).json();const refresh=stored?await openCredential(stored.sealed,env,'drive-refresh-v1'):env.DRIVE_REFRESH_TOKEN;if(!env.GOOGLE_CLIENT_ID||!env.GOOGLE_CLIENT_SECRET||!refresh)throw Error('尚未配置站主 Drive 的服务端授权');const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',redirect:'manual',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,refresh_token:refresh,grant_type:'refresh_token'})});if(!response.ok)throw Object.assign(Error('站主 Drive 授权需重新连接'),{code:'DRIVE_AUTH_'+response.status});const result=await response.json();cachedToken={token:result.access_token,until:Date.now()+Math.max(0,result.expires_in-120)*1000};return cachedToken.token}
async function drive(env,path,options={}){return fetch('https://www.googleapis.com/drive/v3/'+path,{...options,redirect:'manual',headers:{...options.headers,Authorization:'Bearer '+await driveToken(env)}})}
async function stateCall(env,path,body={}){const stub=env.ACCESS_STATE.get(env.ACCESS_STATE.idFromName('louie'));return stub.fetch('https://internal'+path,{method:'POST',body:JSON.stringify(body)})}
async function head(env){return (await stateCall(env,'/head')).json()}
async function document(env,reference){if(!reference.driveId)throw Error('私人资料迁移与发布尚未完成');const response=await drive(env,'files/'+encodeURIComponent(reference.driveId)+'?alt=media');if(!response.ok)throw Error('私人记录读取失败');const value=await response.json();if(value.format!=='louie-private-sync'||value.version!==1||!value.data||!value.files)throw Error('私人记录格式不正确');return value}
function validData(data){return data&&data.version===1&&data.settings&&data.mastery&&['tasks','errors','sessions','mocks','attempts','materials','progress'].every(k=>Array.isArray(data[k]||[]))}
async function fileResponse(request,env,id,doc){const info=doc.files[id];if(!info||!doc.data.materials?.some(m=>m.fileId===id)||!validID(info.driveId))return fail('附件不存在',404);const headers={};const range=request.headers.get('Range');if(range){if(!/^bytes=\d+-\d*$/.test(range))return fail('不支持的读取范围',416);headers.Range=range}const response=await drive(env,'files/'+info.driveId+'?alt=media',{headers});if(![200,206].includes(response.status))return fail('附件读取失败',502);const inline=/^(?:application\/pdf|image\/(?:jpeg|png|webp|gif)|text\/plain|audio\/|video\/)/.test(info.mime||'');const resultHeaders={'Content-Type':inline?(info.mime||'application/octet-stream'):'application/octet-stream','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"sandbox; default-src 'none'",'Content-Disposition':(inline?'inline':'attachment')+"; filename*=UTF-8''"+encodeURIComponent(info.name||id),'Accept-Ranges':'bytes'};for(const key of ['Content-Length','Content-Range'])if(response.headers.has(key))resultHeaders[key]=response.headers.get(key);if(request.method==='HEAD'){response.body?.cancel();return new Response(null,{status:200,headers:{...resultHeaders,'Content-Length':String(info.size)}})}return new Response(response.body,{status:response.status,headers:resultHeaders})}
async function api(request,env,identity,path){const current=await head(env);if(current.vaultEnabled&&(path.startsWith('/api/migration/')||path==='/api/publish'))return fail('加密空间停用旧明文快照接口',410);if(!identity.privateRoute&&(path.startsWith('/api/migration/')||path==='/api/publish'))return fail('请先解锁私密空间',423);if(current.vaultEnabled&&!identity.privateRoute&&path==='/api/uploads'&&request.method==='POST'){const candidate=await readJSON(request.clone(),4096),stored=await document(env,current);if(stored.vault?.blockedPlainFileIds?.includes(candidate.id))return fail('旧私密附件不能通过普通上传接口重新关联',423)}const migration=await migrationRoute(request,env,identity,path,{json,fail,drive,driveToken,stateCall,readJSON});if(migration)return migration;
 if(path==='/api/system/status'||path==='/api/system/check'){if(identity.role!=='edit')return fail('需要个人模式',403);if(path.endsWith('/check')){if(request.method!=='POST')return fail('无效请求',405);return json(await systemCheck(env))}return json(await(await stateCall(env,'/system-check-get')).json())}
 if(path==='/api/finance/rates')return financeRates(request,env,identity,{json,fail,stateCall});
 if(path==='/api/storage'){
  if(identity.role!=='edit')return fail('仅管理员可查看存储容量',403);
  if(request.method!=='GET')return fail('无效的请求',405);
  const response=await drive(env,'about?fields=storageQuota(limit,usage,usageInDrive,usageInDriveTrash)');
  if(!response.ok)return fail('暂时无法读取 Google Drive 容量，请稍后重试',502);
  const about=await response.json();return json({...storageSummary(about.storageQuota,await document(env,current)),driveAuthorization:await(await stateCall(env,'/drive-refresh-status')).json()});
 }
 if(path==='/api/status')return json({role:identity.role,revision:current.revision,storageReady:!!(current.driveId&&env.DRIVE_REFRESH_TOKEN),...(identity.role==='edit'?{driveAuthorization:await(await stateCall(env,'/drive-refresh-status')).json()}: {})});
 if(path==='/api/publish'&&request.method==='POST'){
  const body=await readJSON(request,4096);if(!validID(body.driveId)||!Number.isInteger(body.revision))return fail('发布信息无效');const meta=await drive(env,'files/'+body.driveId+'?fields=ownedByMe,parents,permissions(role)');if(!meta.ok)return fail('无法确认私人文件',409);const proof=await meta.json();if(!proof.ownedByMe||!proof.parents?.includes(env.DRIVE_ROOT_ID)||proof.permissions?.some(p=>p.role!=='owner'))return fail('仅允许站主独享目录中的文件',403);const candidate=await document(env,{driveId:body.driveId});if(!validData(candidate.data))return fail('私人记录格式不完整',409);for(const m of candidate.data.materials||[]){if(!m.fileId)continue;const f=candidate.files[m.fileId];if(!f||!validID(f.driveId))return fail('快照缺少附件',409);const r=await drive(env,'files/'+f.driveId+'?fields=size,sha256Checksum,parents,ownedByMe,permissions(role)');if(!r.ok)return fail('附件未能核验',409);const verified=await r.json();if(!verified.ownedByMe||!verified.parents?.includes(env.DRIVE_ROOT_ID)||verified.permissions?.some(p=>p.role!=='owner')||Number(verified.size)!==f.size||verified.sha256Checksum!==f.sha256)return fail('附件完整性或私有权限不符',409)}return stateCall(env,'/publish',{expected:body.revision,driveId:body.driveId});
 }
 if(['/api/exam-info','/api/exam-info/update'].includes(path)){
  if(path.endsWith('/update')&&identity.role!=='edit')return fail('访客模式不能调用 AI',403);
  return examResearchRoute(request,env,identity,path,{json,fail,drive,driveToken,stateCall,readJSON},(await document(env,current)).data.settings);
 }
 if(path.startsWith('/api/teacher')){
  if(identity.role!=='edit')return fail('仅个人模式可访问智能问答',403);
  return teacherRoute(request,env,identity,path,{json,fail,drive,driveToken,stateCall,readJSON},lockedOwnerDocument(await document(env,current)).data);
 }
 const staged=/^\/api\/vault-staged\/([\w-]{1,160})$/.exec(path);if(staged&&request.method==='GET'){if(!identity.privateRoute)return fail('请先解锁私密空间',423);const info=await(await stateCall(env,'/file-get',{id:staged[1]})).json();if(!info?.encrypted)return fail('加密文件不存在',404);return fileResponse(request,env,staged[1],{files:{[staged[1]]:info},data:{materials:[{fileId:staged[1]}]}})}
 const fullDoc=await document(env,current);
 if(path==='/api/vault/recovery'&&request.method==='GET'){if(identity.role!=='edit')return fail('需要个人模式',403);if(!fullDoc.vault)return fail('尚未启用文件加密',404);return json({revision:current.revision,config:fullDoc.vault.config,payload:fullDoc.vault.payload})}
 if(path==='/api/vault/recover'&&request.method==='POST'){
  if(identity.role!=='edit')return fail('需要个人模式',403);const rate=await(await stateCall(env,'/rate',{key:b64(await crypto.subtle.digest('SHA-256',text.encode('vault-recover:'+(request.headers.get('CF-Connecting-IP')||'unknown'))))})).json();if(!rate.allowed)return fail('尝试次数过多，请15分钟后重试',429);
  const body=await readJSON(request,16000),old=fullDoc.vault;if(!old||body.revision!==current.revision)return fail('资料版本已更新，请重新恢复',409);if(!await proofMatches(body.proof,old.config.proofHash))return fail('恢复密钥不正确',403);
  const next={...old,config:body.config};if(!validVault(next)||JSON.stringify({...body.config,salt:old.config.salt,password:old.config.password})!==JSON.stringify(old.config))return fail('恢复配置无效');
  if(typeof body.password!=='string'||body.password.length<10||body.password.length>256||await verifyPassword(body.password,env.EDIT_VERIFIER)||await verifyPassword(body.password,env.READ_VERIFIER))return fail('请使用不同于访客和个人模式的密码，至少10位');
  const salt=crypto.getRandomValues(new Uint8Array(16)),auth={version:crypto.randomUUID(),verifier:JSON.stringify({salt:b64(salt),hash:b64(await derivePrivate(body.password,salt)),iterations:100000})};
  return storeSnapshot({...fullDoc,vault:next},current,env,auth);
 }
 const doc=identity.role==='read'?visitorDocument(fullDoc):identity.privateRoute?fullDoc:lockedOwnerDocument(fullDoc);
 if(path==='/api/bootstrap'&&request.method==='GET')return json({data:doc.data,revision:current.revision,role:identity.role,token:'gateway-session',...(identity.privateRoute?{privateUntil:identity.privateUntil,...(fullDoc.vault?{vault:fullDoc.vault}:{privateFileMap:fullDoc.files})}: {})});
 if(path==='/site-public.json'&&request.method==='GET')return json({version:1,data:doc.data,files:Object.fromEntries(Object.entries(doc.files).map(([key,value])=>[key,{url:'api/files/'+encodeURIComponent(key),mime:value.mime}]))});
 if(path==='/travel-public.json'&&request.method==='GET'){const materials=new Map((doc.data.materials||[]).map(m=>[m.id,m]));return json({version:1,entries:(doc.data.travel?.entries||[]).map(e=>({...e,photos:(e.photoIds||[]).map(id=>materials.get(id)).filter(m=>m?.photoHash&&m.fileId).map(m=>'travel-media/'+m.photoHash+'.'+(m.mime==='image/png'?'png':m.mime==='image/webp'?'webp':'jpg'))}))})}
 if(path.startsWith('/travel-media/')&&request.method==='GET'){const hash=path.split('/').pop().split('.')[0];const material=doc.data.materials.find(m=>m.photoHash===hash);return material?fileResponse(request,env,material.fileId,doc):fail('不存在',404)}
 if(path.startsWith('/api/files/')&&['GET','HEAD'].includes(request.method)){const id=decodeURIComponent(path.slice('/api/files/'.length));if(identity.privateRoute&&fullDoc.vault?.files?.[id])return fileResponse(request,env,id,{files:fullDoc.vault.files,data:{materials:[{fileId:id}]}});return fileResponse(request,env,id,doc)}
 if(path==='/api/state'&&request.method==='PUT'){
  const body=await readJSON(request,32000000);if(body.revision!==current.revision)return fail('其他设备已更新，未覆盖记录',409);if(!validData(body.data)||Object.keys(doc.data).some(k=>!(k in body.data)))return fail('记录格式不完整');
  let vault=fullDoc.vault;
  if(body.vault){if(!identity.privateRoute||!validVault(body.vault)||plainPrivate(body.data,fullDoc.files))return fail('加密记录格式无效');if(vault&&JSON.stringify(body.vault.config)!==JSON.stringify(vault.config))return fail('密钥配置只能通过恢复流程修改',409);try{vault={...body.vault,files:await vaultFiles(body.vault,vault,async id=>(await stateCall(env,'/file-get',{id})).json()),legacyPlaintextRetained:true,blockedPlainFileIds:vault?.blockedPlainFileIds||Object.keys(fullDoc.files).filter(id=>!lockedOwnerDocument(fullDoc).files[id])}}catch{return fail('加密附件未核验完成',409)}}
  else if(identity.privateRoute&&vault)return fail('已启用加密，拒绝明文保存',423);
  if(!identity.privateRoute){try{body.data=mergeLockedOwnerWrite(body.data,fullDoc)}catch{return fail('私密内容只能在独立解锁页面修改，请刷新个人模式后重试',423)}}
  const files=vault?{...lockedOwnerDocument(fullDoc).files}:{...fullDoc.files};for(const material of body.data.materials||[]){if(vault?.blockedPlainFileIds?.includes(material.fileId))return fail('旧私密附件只能通过加密迁移访问',423);if(material.fileId&&!files[material.fileId]){const info=await(await stateCall(env,'/file-get',{id:material.fileId})).json();if(!info)return fail('附件未上传完成，未保存新记录',409);if(info.encrypted)return fail('加密附件不能关联到普通资料',423);files[material.fileId]=info}}
  return storeSnapshot({...fullDoc,data:body.data,files,...(vault?{vault}:{})},current,env);

 }
 if(path.startsWith('/api/files/')&&request.method==='DELETE')return json({removed:true,retainedForRecovery:true});
 return fail('此接口尚未接入私人存储，原记录未修改',503);
}
async function storeSnapshot(doc,current,env,auth){
 const value={...doc,id:crypto.randomUUID(),parents:[doc.id],generation:(doc.generation||0)+1,createdAt:new Date().toISOString()},raw=JSON.stringify(value),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',text.encode(raw)))].map(x=>x.toString(16).padStart(2,'0')).join(''),boundary='louie'+crypto.randomUUID();
 const metadata={name:'snapshot-'+value.id+'.json',parents:[env.DRIVE_ROOT_ID],appProperties:{louieType:'commit',localId:value.id,sha256:hash}};
 const result=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',redirect:'manual',headers:{Authorization:'Bearer '+await driveToken(env),'Content-Type':'multipart/related; boundary='+boundary},body:'--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(metadata)+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+raw+'\r\n--'+boundary+'--'});
 if(!result.ok)return fail('私人记录未保存，请重试',502);const uploaded=await result.json();return stateCall(env,auth?'/vault-recover-publish':'/publish',{expected:current.revision,driveId:uploaded.id,...(value.vault?{vaultEnabled:true}:{}),...(auth?{auth}:{})});
}
async function systemCheck(env){
 const previous=await(await stateCall(env,'/system-check-get')).json();const value={checkedAt:new Date().toISOString(),driveConnected:false,teacherKeyConfigured:false,lastSuccess:previous?.lastSuccess||null};
 try{const response=await drive(env,'about?fields=storageQuota(usage,limit)');if(!response.ok)throw Error('DRIVE_UNAVAILABLE');await response.json();value.driveConnected=true;const key=await(await stateCall(env,'/teacher-key-get')).json();value.teacherKeyConfigured=!!(key?await openCredential(key,env,'teacher-key-v1'):env.DEEPSEEK_API_KEY);value.lastSuccess=value.checkedAt}catch(error){value.errorCode=/^DRIVE_[A-Z_]+_[0-9]{3}$/.test(error.code||'')?error.code:'CLOUD_CONNECTION_FAILED'}
 await stateCall(env,'/system-check-put',{value});return value;
}
export default {async scheduled(event,env,ctx){ctx.waitUntil(systemCheck(env))},async fetch(request,env){try{
 const url=new URL(request.url),path=url.pathname,origin=request.headers.get('Origin');
 const publicAsset=/^\/(?:vendor|travel-assets)\//.test(path)||['/judge-host.html','/judge-host.js','/judge-worker.js'].includes(path);
 if(publicAsset&&['GET','HEAD','OPTIONS'].includes(request.method)&&!path.includes('..')&&!path.includes('%')){if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, HEAD, OPTIONS'}});const r=await fetch(env.SITE_ORIGIN+env.SITE_PREFIX+path.slice(1)+url.search,{redirect:'manual'});const h=new Headers(r.headers);h.set('Access-Control-Allow-Origin','*');h.set('Cross-Origin-Resource-Policy','cross-origin');h.delete('Set-Cookie');return new Response(request.method==='HEAD'?null:r.body,{status:r.status,headers:h})}
 if(origin&&origin!==url.origin)return fail('不允许此来源',403);
 if(path==='/privacy.html'&&request.method==='GET')return privacyPage();
 if(path==='/health')return json({service:'louie-access',configured:!!(env.READ_VERIFIER&&env.EDIT_VERIFIER&&env.SESSION_SECRET)});
 if(!env.READ_VERIFIER||!env.EDIT_VERIFIER||!env.SESSION_SECRET)return fail('权限服务尚未完成密码配置，私人内容未开放',503);
 if(path==='/auth/owner/callback')return await finishOwner(request,env,{stateCall,json,fail});
 if(path==='/auth/read'||path==='/auth/edit'){
  if(request.method!=='POST'||!request.headers.get('Content-Type')?.startsWith('application/json'))return fail('无效的登录请求',405);
  const key=b64(await crypto.subtle.digest('SHA-256',text.encode((request.headers.get('CF-Connecting-IP')||'unknown')+':'+path+':'+Math.floor(Date.now()/900000))));const check=await(await stateCall(env,'/rate',{key})).json();if(!check.allowed)return fail('尝试次数过多，请15分钟后重试',429);
  const body=await readJSON(request,12000),role=path.endsWith('edit')?'edit':'read';
  if(!await verifyPassword(body.password,role==='edit'?env.EDIT_VERIFIER:env.READ_VERIFIER))return fail('密码不正确',401);
  if(role==='edit'){if(body.googleAccessToken){if(!await ownerProof(body.googleAccessToken,env.OWNER_EMAIL_SHA256))return fail('管理员模式还需要站主 Google 账号验证',403)}else return await beginOwner(request,env,{stateCall,json,fail})}
  const token=await issueSession(role,env);return json({role},200, {'Set-Cookie':'__Host-louie='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+(role==='edit'?3600:43200)});
 }
 if(path==='/auth/logout'&&request.method==='POST'){const prior=await session(tokenFrom(request),env);if(prior?.role==='edit')await stateCall(env,'/private-grant-delete',{parent:prior.nonce});const r=json({ok:true},200,{'Set-Cookie':'__Host-louie=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'});r.headers.append('Set-Cookie',privateLockCookie());return r}
 const identity=await session(tokenFrom(request),env);if(!identity)return ['/', '/private'].includes(path)?loginPage():fail('请先输入访客密码',401);
 const privateResult=await privateAuthRoute(request,env,identity,path,{stateCall,json,fail,readJSON});if(privateResult)return privateResult;
 if(path==='/private-recovery'&&identity.role!=='edit')return fail('请先进入个人模式',403);
 const privateAPI=path.startsWith('/api/private/');
 if(path==='/private'||privateAPI){if(identity.role!=='edit')return fail('请先进入个人模式',403);const grant=await privateGrant(request,env,identity,{stateCall});if(!grant&&privateAPI)return fail('请先输入私密空间密码',423);if(grant){identity.privateRoute=true;identity.privateUntil=grant.exp}}
 if(path==='/auth/owner/reconnect'&&request.method==='POST'){if(identity.role!=='edit')return fail('需要个人模式',403);return beginOwner(request,env,{stateCall,json,fail})}
 if(path==='/auth/downgrade'&&request.method==='POST'){await stateCall(env,'/private-grant-delete',{parent:identity.nonce});const token=await issueSession('read',env);const r=json({role:'read'},200,{'Set-Cookie':'__Host-louie='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200'});r.headers.append('Set-Cookie',privateLockCookie());return r}
 if(!allowed(identity.role,request.method))return fail('当前只有查看权限，请先通过管理员验证',403);
 if(path.startsWith('/api/')||['/site-public.json','/travel-public.json'].includes(path)||path.startsWith('/travel-media/'))return await api(request,env,identity,privateAPI?path.replace('/api/private/','/api/'):path);
 if(path.startsWith('/site-files/')||path.includes('..')||path.includes('%'))return fail('不存在',404);
 const safe=path==='/naiwa.png'||path==='/'||path==='/private'||path==='/private-recovery'||/^\/[\w-]+\.(?:html|css|js|json|txt)$/.test(path)||path.startsWith('/travel-assets/')||path.startsWith('/vendor/');if(!safe)return fail('不存在',404);
 const protectedUI=new Set(['index.html','bootstrap.js','app.js','personal-ui.js','practice-ui.js','language-ui.js','studio-ui.js','profile-files-ui.js','algorithms-ui.js','travel-ui.js','travel-plan.js','access-ui.js','drive-core.js','teacher-ui.js','galaxy-ui.js','exam-research-ui.js','naiwa-ui.js','naiwa.png','responsive-ui.js','discipline-ui.js','private-space-ui.js','vault-core.js','vault-data.js','vault-ui.js']);const name=path==='/'||path==='/private'||path==='/private-recovery'?'index.html':path.slice(1);const remote=protectedUI.has(name)?'private-ui/'+name:name;const assetURL='https://raw.githubusercontent.com/maka-baka-dududu/louie-study/'+env.ASSET_COMMIT+'/'+remote;const response=await fetch(assetURL,{redirect:'manual'});const headers=new Headers(response.headers);headers.set('Cache-Control','private, no-store');headers.delete('Set-Cookie');headers.delete('Content-Disposition');headers.delete('Content-Security-Policy');headers.set('Content-Security-Policy',"frame-ancestors 'self'; base-uri 'self'; object-src 'none'");headers.set('Content-Type',({'png':'image/png','js':'text/javascript; charset=utf-8','html':'text/html; charset=utf-8','css':'text/css; charset=utf-8','json':'application/json; charset=utf-8'})[name.split('.').pop()]||'text/plain; charset=utf-8');headers.set('X-Content-Type-Options','nosniff');if(path==='/'){await stateCall(env,'/private-grant-delete',{parent:identity.nonce});headers.append('Set-Cookie',privateLockCookie())}return new Response(response.body,{status:response.status,headers});
 }catch(error){return json({error:'服务暂时未就绪，未修改原始资料',code:/^DRIVE_[A-Z_]+_[0-9]{3}$/.test(error.code||'')?error.code:'PRIVATE_STORAGE_UNAVAILABLE'},503)}}};
