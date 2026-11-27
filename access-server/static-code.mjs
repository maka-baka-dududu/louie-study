// Cache public, commit-pinned code only. Authentication is checked by the caller first.
const memory=new Map();let total=0;const MAX_TOTAL=4*1024*1024,MAX_ONE=1024*1024;
export async function staticCode(url,ctx){
 if(!/\.(js|css|html)$/.test(new URL(url).pathname))return fetch(url,{redirect:'manual'});
 const hit=memory.get(url);if(hit){memory.delete(url);memory.set(url,hit);return new Response(hit.bytes,{status:200,headers:{...hit.headers,'X-Louie-Asset-Cache':'MEMORY'}})}
 const cache=globalThis.caches?.default;try{const edge=await cache?.match(url);if(edge)return edge}catch{}
 const response=await fetch(url,{redirect:'manual'});if(response.status!==200)return response;
 const size=Number(response.headers.get('Content-Length'));if(size>MAX_ONE)return response;
 const bytes=new Uint8Array(await response.arrayBuffer());if(bytes.length>MAX_ONE)return new Response(bytes,{status:response.status,headers:response.headers});
 const headers=Object.fromEntries(response.headers);delete headers['set-cookie'];delete headers['vary'];delete headers['content-encoding'];delete headers['content-length'];headers['cache-control']='public, max-age=31536000, immutable';headers['X-Louie-Asset-Cache']='EDGE';
 while(total+bytes.length>MAX_TOTAL&&memory.size){const oldest=memory.keys().next().value;total-=memory.get(oldest).bytes.length;memory.delete(oldest)}memory.set(url,{bytes,headers});total+=bytes.length;
 if(cache){const put=cache.put(url,new Response(bytes,{headers})).catch(()=>{});if(ctx?.waitUntil)ctx.waitUntil(put);else await put}
 return new Response(bytes,{headers:{...headers,'X-Louie-Asset-Cache':'MISS'}});
}
