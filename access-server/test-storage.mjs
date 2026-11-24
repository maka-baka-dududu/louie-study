import assert from 'node:assert/strict';
import {storageSummary} from './storage.mjs';
const doc={data:{materials:[{fileId:'a'},{fileId:'b'},{fileId:'c'},{fileId:'a'}]},files:{a:{driveId:'one',size:100},b:{driveId:'one',size:100},c:{driveId:'two',size:200},orphan:{driveId:'three',size:999}}};
let s=storageSummary({usage:'900',limit:'1000',usageInDrive:'600',usageInDriveTrash:'10'},doc);
assert.equal(s.remaining,100);assert.equal(s.attachmentBytes,300);assert.equal(s.attachmentCount,2);assert.equal(s.usage,900);
s=storageSummary({usage:'1100',limit:'1000'},doc);assert.equal(s.remaining,0);
s=storageSummary({usage:'1'},doc);assert.equal(s.limit,null);assert.equal(s.remaining,null);
assert.throws(()=>storageSummary({usage:'invalid'},doc));assert.throws(()=>storageSummary({usage:'99999999999999999999999'},doc));
console.log('Storage: quota parsing, missing limit, over-quota and linked attachment deduplication passed');
