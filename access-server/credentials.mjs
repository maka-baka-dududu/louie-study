import {b64,unb64} from './auth.mjs';
const enc=new TextEncoder();
async function key(env,purpose){return crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',enc.encode(purpose+':'+env.SESSION_SECRET)),{name:'AES-GCM'},false,['encrypt','decrypt'])}
export async function seal(value,env,purpose){const iv=crypto.getRandomValues(new Uint8Array(12));return {iv:b64(iv),cipher:b64(await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(env,purpose),enc.encode(value)))}}
export async function open(value,env,purpose){return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(value.iv)},await key(env,purpose),unb64(value.cipher)))}
