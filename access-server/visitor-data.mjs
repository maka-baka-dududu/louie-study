const privateIds=new Set(['savings']);
export function visitorDocument(doc){
 const data=structuredClone(doc.data),personal=data.personal||{};
 const privateTracks=(personal.tracks||[]).filter(t=>privateIds.has(t.id));
 const subjects=new Set(privateTracks.flatMap(t=>t.subjects||[]));
 const hidden=item=>item&&typeof item==='object'&&(privateIds.has(item.trackId)||privateIds.has(item.projectId)||(!item.trackId&&subjects.has(item.subject)));
 function prune(value){if(Array.isArray(value))return value.filter(item=>!hidden(item)).map(prune);if(value&&typeof value==='object'){for(const key of Object.keys(value))value[key]=prune(value[key])}return value}
 prune(data);delete personal.finance;personal.tracks=(personal.tracks||[]).filter(t=>!privateIds.has(t.id));if(privateIds.has(personal.activeTrack))personal.activeTrack='exam';
 data.personal=personal;const allowed=new Set((data.materials||[]).map(m=>m.fileId).filter(Boolean));
 return {...doc,data,files:Object.fromEntries(Object.entries(doc.files||{}).filter(([id])=>allowed.has(id)))};
}
