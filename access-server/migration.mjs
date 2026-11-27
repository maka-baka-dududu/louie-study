// Owner-only migration and chunked uploads. No public sharing permissions are created.
export const MAX_FILE=250*1024*1024,CHUNK=4*1024*1024;
export function uploadMetadata(v){return v&&typeof v.id==='string'&&/^[\w-]{1,160}$/.test(v.id)&&typeof v.name==='string'&&v.name.length>0&&v.name.length<=500&&typeof v.mime==='string'&&/^[\w.+-]+\/[\w.+-]+$/.test(v.mime)&&Number.isSafeInteger(v.size)&&v.size>0&&v.size<=MAX_FILE+(v.encrypted===true?16384:0)&&/^[a-f0-9]{64}$/.test(v.sha256||'')}
export function chunkRange(value,size,length){const m=/^bytes (\d+)-(\d+)\/(\d+)$/.exec(value||'');if(!m)return false;const [start,end,total]=m.slice(1).map(Number);return total===size&&Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&start>=0&&end>=start&&end<size&&end-start+1===length&&length<=CHUNK}
export async function migrationRoute(request,env,identity,path,H){
 if(!path.startsWith('/api/migration/')&&!path.startsWith('/api/uploads'))return null;
 const {json,fail,drive,driveToken,stateCall,readJSON}=H;
 if(identity.role!=='edit')return fail('需要站主编辑权限',403);
 if(!env.DRIVE_ROOT_ID||!env.DRIVE_REFRESH_TOKEN)return fail('私人资料授权未接通',503);
 const get=async p=>{const r=await drive(env,p);if(!r.ok)throw Object.assign(Error('私人文件核验失败'),{code:'DRIVE_METADATA_'+r.status});return r.json()};
 const verify=async(id,expected)=>{const v=await get('files/'+encodeURIComponent(id)+'?fields=id,size,sha256Checksum,mimeType,parents,ownedByMe,permissions(role)');if(!v.ownedByMe||!v.parents?.includes(env.DRIVE_ROOT_ID)||v.permissions?.some(p=>p.role!=='owner')||Number(v.size)!==expected.size||v.sha256Checksum!==expected.sha256)throw Error('附件内容或私人权限校验不一致');return {driveId:v.id,size:Number(v.size),sha256:v.sha256Checksum,mime:v.mimeType,name:expected.name,...(expected.encrypted?{encrypted:true}:{})}};
 if(path==='/api/migration/inventory'&&request.method==='GET'){
  let files=[],pageToken;
  do{const params=new URLSearchParams({q:"trashed=false and '"+env.DRIVE_ROOT_ID+"' in parents",fields:'nextPageToken,files(id,size,sha256Checksum,mimeType,appProperties,ownedByMe,permissions(role))',pageSize:'1000'});if(pageToken)params.set('pageToken',pageToken);const page=await get('files?'+params);files.push(...page.files);pageToken=page.nextPageToken;if(files.length>50000)throw Error('文件数量超过核验上限')}while(pageToken);
  return json({files});
 }
 const snapshot=/^\/api\/migration\/commit\/([\w-]{1,160})$/.exec(path);
 if(snapshot&&request.method==='GET'){
  const meta=await get('files/'+snapshot[1]+'?fields=id,size,sha256Checksum,parents,ownedByMe,permissions(role),appProperties');
  if(!meta.ownedByMe||!meta.parents?.includes(env.DRIVE_ROOT_ID)||meta.permissions?.some(p=>p.role!=='owner')||meta.appProperties?.louieType!=='commit'||Number(meta.size)>16000000)return fail('私人快照核验失败',403);
  const r=await drive(env,'files/'+snapshot[1]+'?alt=media');if(!r.ok)throw Error('快照读取失败');const raw=await r.text();const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw)))].map(v=>v.toString(16).padStart(2,'0')).join('');if(hash!==meta.sha256Checksum)throw Error('快照校验不一致');const value=JSON.parse(raw);if(value.format!=='louie-private-sync'||value.version!==1)return fail('快照格式不正确');return json(value);
 }
 if(path==='/api/uploads'&&request.method==='POST'){
  const body=await readJSON(request,4096);if(body.encrypted&&(!identity.privateRoute||body.mime!=='application/octet-stream'||body.name!==body.id+'.lvault'))return fail('加密上传信息无效');body.kind??='blob';if(body.kind==='commit'&&!identity.privateRoute)return fail('请先解锁私密空间',423);
  if(!['blob','commit'].includes(body.kind)||(body.kind==='commit'&&body.size>16*1024*1024)||!uploadMetadata(body))return fail('附件信息无效');
  const params=new URLSearchParams({q:"trashed=false and '"+env.DRIVE_ROOT_ID+"' in parents and appProperties has { key='localId' and value='"+body.id+"' } and appProperties has { key='sha256' and value='"+body.sha256+"' }",fields:'files(id,size,sha256Checksum)',pageSize:'1000'});
  const reused=(await get('files?'+params)).files.find(v=>Number(v.size)===body.size&&v.sha256Checksum===body.sha256);
  if(reused){const info=await verify(reused.id,body);await stateCall(env,'/file-put',{id:body.id,value:info});return json({complete:true,info})}
  const old=await(await stateCall(env,'/upload-get',{id:body.id})).json();if(old?.private&&!identity.privateRoute)return fail('请先解锁私密空间',423);
  if(old&&old.sha256===body.sha256&&old.size===body.size&&Date.now()-old.createdAt<6*86400000)return json({complete:false,offset:old.offset||0});
  const r=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id',{method:'POST',redirect:'manual',headers:{Authorization:'Bearer '+await driveToken(env),'Content-Type':'application/json','X-Upload-Content-Type':body.mime,'X-Upload-Content-Length':String(body.size)},body:JSON.stringify({name:body.name,mimeType:body.mime,parents:[env.DRIVE_ROOT_ID],appProperties:{louieType:body.kind,localId:body.id,sha256:body.sha256}})});
  if(!r.ok)throw Error('无法创建可恢复上传');const location=r.headers.get('Location');const url=new URL(location||'');if(url.origin!=='https://www.googleapis.com'||!url.pathname.startsWith('/upload/drive/'))throw Error('上传地址无效');
  await stateCall(env,'/upload-put',{id:body.id,value:{...body,private:!!identity.privateRoute,url:location,createdAt:Date.now(),offset:0}});return json({complete:false,offset:0});
 }
 const upload=/^\/api\/uploads\/([\w-]{1,160})$/.exec(path);
 if(upload&&['PUT','GET'].includes(request.method)){
  const id=upload[1],v=await(await stateCall(env,'/upload-get',{id})).json();if(!v)return fail('未找到上传会话',404);if(v.private&&!identity.privateRoute)return fail('请先解锁私密空间',423);
  const url=new URL(v.url);if(url.origin!=='https://www.googleapis.com'||!url.pathname.startsWith('/upload/drive/'))throw Error('上传地址无效');
  let body=new Uint8Array(),range='bytes */'+v.size;
  if(request.method==='PUT'){
   if(Number(request.headers.get('Content-Length'))>CHUNK)return fail('单次上传分块过大',413);
   const reader=request.body?.getReader(),parts=[];let length=0;if(!reader)return fail('没有上传内容');for(;;){const n=await reader.read();if(n.done)break;length+=n.value.length;if(length>CHUNK){await reader.cancel();return fail('单次上传分块过大',413)}parts.push(n.value)}
   range=request.headers.get('Content-Range');if(!chunkRange(range,v.size,length))return fail('上传分块范围无效');body=await new Blob(parts).arrayBuffer();
  }
  const r=await fetch(v.url,{method:'PUT',redirect:'manual',headers:{'Content-Range':range,'Content-Type':v.mime,Authorization:'Bearer '+await driveToken(env)},body});
  if(r.status===308){const acknowledged=r.headers.get('Range'),m=/^bytes=0-(\d+)$/.exec(acknowledged||'');const offset=m?Number(m[1])+1:0;if(offset>v.size)throw Error('上传确认范围无效');await stateCall(env,'/upload-put',{id,value:{...v,offset}});return json({complete:false,offset})}
  if(r.ok){const result=await r.json(),info=await verify(result.id,v);await stateCall(env,'/file-put',{id,value:info});return json({complete:true,info})}
  if([404,410].includes(r.status))await stateCall(env,'/upload-put',{id,value:null});
  return fail([404,410].includes(r.status)?'上传会话已过期，请重新创建':'上传暂时中断，请查询恢复位置',[404,410].includes(r.status)?410:502);
 }
 return fail('迁移接口不存在',404);
}
