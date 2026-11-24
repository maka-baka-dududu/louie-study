import assert from 'node:assert/strict';
import {uploadMetadata,chunkRange,migrationRoute,MAX_FILE,CHUNK} from './migration.mjs';
const v={id:'a-1',name:'book.pdf',mime:'application/pdf',size:MAX_FILE,sha256:'a'.repeat(64)};
assert(uploadMetadata(v));for(const changed of [{id:"a'"},{size:MAX_FILE+1},{size:0},{sha256:'bad'},{mime:'text/html\r\nInjected: true'}])assert(!uploadMetadata({...v,...changed}));
assert(chunkRange('bytes 0-4194303/262144000',MAX_FILE,CHUNK));assert(!chunkRange('bytes 0-4194304/262144000',MAX_FILE,CHUNK+1));assert(!chunkRange('bytes 0-9/20',20,9));assert(!chunkRange('bytes 0-20/20',20,21));
for(const path of ['/api/migration/inventory','/api/uploads','/api/uploads/a-1']){const response=await migrationRoute(new Request('https://example.test'+path),{}, {role:'read'},path,{fail:(message,status)=>new Response(message,{status})});assert.equal(response.status,403)}
console.log('Upload boundaries, file metadata and migration read access checks passed');
