/* Pure data reconciliation and streaming SHA-256. No credentials or personal data. */
(function(root){
'use strict';
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
function merge(base,local,remote,path='',conflicts=[]){
 if(equal(local,remote))return clone(local);
 if(equal(base,local))return clone(remote);
 if(equal(base,remote))return clone(local);
 if([base,local,remote].every(v=>v===undefined||object(v))&&object(local)&&object(remote)){
  const result={};for(const key of new Set([...Object.keys(base||{}),...Object.keys(local),...Object.keys(remote)])){
   if(['__proto__','constructor','prototype'].includes(key))throw Error('不安全的数据字段');
   const value=merge(base?.[key],local[key],remote[key],path+'/'+key,conflicts);if(value!==undefined)result[key]=value;
  }return result;
 }
 const keyed=xs=>Array.isArray(xs)&&xs.every(x=>object(x)&&typeof x.id==='string')&&new Set(xs.map(x=>x.id)).size===xs.length;
 if(keyed(local)&&keyed(remote)&&(base===undefined||keyed(base))){
  const bm=new Map((base||[]).map(x=>[x.id,x])),lm=new Map(local.map(x=>[x.id,x])),rm=new Map(remote.map(x=>[x.id,x]));
  const result=[];for(const id of new Set([...bm.keys(),...lm.keys(),...rm.keys()])){const value=merge(bm.get(id),lm.get(id),rm.get(id),path+'/id:'+id,conflicts);if(value!==undefined)result.push(value)}return result;
 }
 conflicts.push({path,base:clone(base),local:clone(local),remote:clone(remote)});
 return clone(local); // Never publish this provisional result while conflicts remain.
}
function reconcile(base,local,remote){const conflicts=[];return {value:merge(base,local,remote,'',conflicts),conflicts}}
function heads(commits){const parents=new Set(commits.flatMap(c=>c.parents||[]));return commits.filter(c=>!parents.has(c.id))}
function commonAncestor(commits,left,right){const map=new Map(commits.map(c=>[c.id,c]));function ancestry(id){const out=new Set(),stack=[id];while(stack.length){const key=stack.pop();if(out.has(key))continue;out.add(key);stack.push(...(map.get(key)?.parents||[]))}return out}const a=ancestry(left),b=ancestry(right);return commits.filter(c=>a.has(c.id)&&b.has(c.id)).sort((x,y)=>(y.generation||0)-(x.generation||0))[0]||null}
const K=new Uint32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
const rr=(x,n)=>(x>>>n)|(x<<(32-n));
class SHA256{
 constructor(){this.h=new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]);this.tail=new Uint8Array(64);this.length=0;this.used=0;this.w=new Uint32Array(64)}
 block(bytes,offset=0){const w=this.w;for(let i=0;i<16;i++){const j=offset+i*4;w[i]=(bytes[j]<<24)|(bytes[j+1]<<16)|(bytes[j+2]<<8)|bytes[j+3]}for(let i=16;i<64;i++){const x=w[i-15],y=w[i-2];w[i]=((rr(x,7)^rr(x,18)^(x>>>3))+w[i-16]+(rr(y,17)^rr(y,19)^(y>>>10))+w[i-7])>>>0}let[a,b,c,d,e,f,g,h]=this.h;for(let i=0;i<64;i++){const t1=(h+(rr(e,6)^rr(e,11)^rr(e,25))+((e&f)^(~e&g))+K[i]+w[i])>>>0,t2=((rr(a,2)^rr(a,13)^rr(a,22))+((a&b)^(a&c)^(b&c)))>>>0;h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0}for(const [i,v]of[a,b,c,d,e,f,g,h].entries())this.h[i]=(this.h[i]+v)>>>0}
 update(bytes){this.length+=bytes.length;let offset=0;while(offset<bytes.length){const take=Math.min(64-this.used,bytes.length-offset);this.tail.set(bytes.subarray(offset,offset+take),this.used);this.used+=take;offset+=take;if(this.used===64){this.block(this.tail);this.used=0}}return this}
 hex(){const bits=this.length*8;this.tail[this.used++]=0x80;if(this.used>56){this.tail.fill(0,this.used);this.block(this.tail);this.used=0}this.tail.fill(0,this.used,56);const view=new DataView(this.tail.buffer);view.setUint32(56,Math.floor(bits/4294967296));view.setUint32(60,bits>>>0);this.block(this.tail);return [...this.h].map(v=>v.toString(16).padStart(8,'0')).join('')}
}
async function hashBlob(blob){const hash=new SHA256();for(let start=0;start<blob.size;start+=4*1024*1024){hash.update(new Uint8Array(await blob.slice(start,start+4*1024*1024).arrayBuffer()));await new Promise(resolve=>setTimeout(resolve,0))}return hash.hex()}
const api={clone,equal,reconcile,heads,commonAncestor,SHA256,hashBlob};root.LouieDriveCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
