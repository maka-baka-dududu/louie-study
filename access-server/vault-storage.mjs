import {validConfig,bytes,digest} from './vault-core.mjs';
import {lockedOwnerDocument} from './visitor-data.mjs';
export function validVault(v){try{return v?.v===1&&validConfig(v.config)&&bytes(v.payload.iv).length===12&&typeof v.payload.ct==='string'&&v.payload.ct.length<24000000&&bytes(v.payload.ct).length>=16&&Array.isArray(v.fileIds)&&v.fileIds.length<=1000&&new Set(v.fileIds).size===v.fileIds.length&&v.fileIds.every(id=>/^[\w-]{1,160}$/.test(id))}catch{return false}}
export function plainPrivate(data,files={}){return JSON.stringify(lockedOwnerDocument({data,files}).data)!==JSON.stringify(data)}
export async function vaultFiles(v,old,lookup){const files={};for(const id of v.fileIds){const info=old?.files?.[id]||await lookup(id);if(!info?.encrypted||info.mime!=='application/octet-stream'||info.name!==id+'.lvault')throw Error('私密附件尚未完成加密上传');files[id]=info}return files}
export async function proofMatches(proof,hash){if(typeof proof!=='string'||proof.length!==43)return false;return await digest(new TextEncoder().encode(proof))===hash}
