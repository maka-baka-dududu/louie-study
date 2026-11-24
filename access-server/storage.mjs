// Capacity values come from Google, never an assumed free-account allowance.
export function storageSummary(quota,doc){
 const bytes=value=>typeof value==='string'&&/^\d+$/.test(value)&&Number.isSafeInteger(Number(value))?Number(value):null;
 const usage=bytes(quota?.usage),limit=bytes(quota?.limit);
 if(usage===null)throw Error('Google 未返回已用容量');
 const linked=new Set((doc.data?.materials||[]).map(m=>m.fileId).filter(Boolean)),seen=new Set();let attachmentBytes=0,attachmentCount=0;
 for(const id of linked){const f=doc.files?.[id];if(!f||seen.has(f.driveId))continue;seen.add(f.driveId);if(Number.isSafeInteger(f.size)&&f.size>=0){attachmentBytes+=f.size;attachmentCount++}}
 return {usage,limit,remaining:limit===null?null:Math.max(0,limit-usage),driveUsage:bytes(quota?.usageInDrive),trashUsage:bytes(quota?.usageInDriveTrash),attachmentBytes,attachmentCount,checkedAt:new Date().toISOString(),singleFileLimit:250*1024*1024};
}
