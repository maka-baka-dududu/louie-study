import assert from 'node:assert/strict';
import worker from './worker.mjs';
import {issueSession,session} from './auth.mjs';
const env={READ_VERIFIER:'configured',EDIT_VERIFIER:'configured',SESSION_SECRET:'test-only-secret-with-more-than-thirty-two-characters',AUTH_VERSION:'1',SITE_ORIGIN:'https://example.com'};
const token=await issueSession('read',env);assert.equal((await session(token,env)).role,'read');assert.equal(await session(token+'x',env),null);assert.equal(await session(token,{...env,AUTH_VERSION:'2'}),null);
for(const path of ['/api/state','/api/profile','/api/files/example','/api/publish','/api/travel/publish'])for(const method of ['POST','PUT','PATCH','DELETE']){
 const result=await worker.fetch(new Request('https://private.example'+path,{method,headers:{Cookie:'__Host-louie='+token},body:'{}'}),env);assert.equal(result.status,403,method+' '+path);
}
assert.equal((await worker.fetch(new Request('https://private.example/api/state'),env)).status,401);
assert.equal((await worker.fetch(new Request('https://private.example/api/state'),{})).status,503);
console.log('Read sessions reject all tested writes, anonymous API and invalid sessions fail closed');
