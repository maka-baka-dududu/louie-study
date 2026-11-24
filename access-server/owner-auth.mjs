import {seal} from './credentials.mjs';
import {b64,issueSession,session,tokenFrom,ownerProof} from './auth.mjs';
const enc=new TextEncoder();
export async function beginOwner(request,env,H){
 const identity=await session(tokenFrom(request),env);if(!identity)return H.fail('请先输入访问密码',401);
 const id=b64(crypto.getRandomValues(new Uint8Array(24))),cookie=b64(crypto.getRandomValues(new Uint8Array(32))),verifier=b64(crypto.getRandomValues(new Uint8Array(48)));
 const digest=await crypto.subtle.digest('SHA-256',enc.encode(cookie));await H.stateCall(env,'/owner-put',{id,value:{cookieHash:b64(digest),verifier,expires:Date.now()+600000}});
 const callback=new URL('/auth/owner/callback',request.url).href;
 const params=new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,redirect_uri:callback,response_type:'code',scope:'https://www.googleapis.com/auth/drive.file',state:id,code_challenge:b64(await crypto.subtle.digest('SHA-256',enc.encode(verifier))),code_challenge_method:'S256'});
 const authState=await(await H.stateCall(env,'/drive-refresh-status')).json();if(env.GOOGLE_OAUTH_PRODUCTION==='1'&&!authState.productionReady){params.set('access_type','offline');params.set('prompt','consent')}
 return H.json({url:'https://accounts.google.com/o/oauth2/v2/auth?'+params},200,{'Set-Cookie':'__Host-louie-owner='+cookie+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600'});
}
export async function finishOwner(request,env,H){
 const url=new URL(request.url),state=url.searchParams.get('state');if(!/^[\w-]{20,100}$/.test(state||''))return H.fail('授权状态无效',403);
 const ticket=await(await H.stateCall(env,'/owner-take',{id:state})).json();const cookie=(request.headers.get('Cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('__Host-louie-owner='))?.slice('__Host-louie-owner='.length)||'';
 if(!ticket||ticket.expires<Date.now()||ticket.cookieHash!==b64(await crypto.subtle.digest('SHA-256',enc.encode(cookie))))return H.fail('个人模式验证已过期，请重新输入个人模式密码',403);
 const code=url.searchParams.get('code');if(!code||url.searchParams.has('error'))return H.fail('未完成站主账号验证',403);
 const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',redirect:'manual',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,code,code_verifier:ticket.verifier,redirect_uri:new URL('/auth/owner/callback',url).href,grant_type:'authorization_code'})});
 if(!r.ok)return H.fail('Google 账号验证未完成，请检查回调地址配置',403);
 const result=await r.json();if(!await ownerProof(result.access_token,env.OWNER_EMAIL_SHA256))return H.fail('只有站主 Google 账号可以进入个人模式',403);
 if(result.refresh_token)await H.stateCall(env,'/drive-refresh-put',{value:{sealed:await seal(result.refresh_token,env,'drive-refresh-v1'),productionReady:env.GOOGLE_OAUTH_PRODUCTION==='1',updatedAt:new Date().toISOString()}});
 const headers=new Headers({'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",'X-Content-Type-Options':'nosniff'});headers.append('Set-Cookie','__Host-louie='+await issueSession('edit',env)+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600');headers.append('Set-Cookie','__Host-louie-owner=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');return new Response(`<!doctype html><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>验证完成</title><p>验证完成，正在返回网站…</p><a href="/">进入网站</a><script>location.replace('/')</script>`,{status:200,headers});
}
