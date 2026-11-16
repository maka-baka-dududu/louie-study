'use strict';
const parentOrigin=new URL(location.href).origin;
let active=null,workerSource=null;
window.addEventListener('message',async event=>{
 if(event.source!==parent||event.origin!==parentOrigin)return;
 const job=event.data;
 if(!job||job.kind!=='judge-run'||typeof job.id!=='string')return;
 if(active){active.worker?.terminate();clearTimeout(active.timer)}
 const task={id:job.id,worker:null,timer:null};active=task;
 const send=payload=>parent.postMessage({channel:'louie-judge',id:job.id,...payload},parentOrigin);
 const finish=payload=>{if(active!==task)return;clearTimeout(task.timer);task.worker?.terminate();active=null;send(payload)};
 try{
  if(typeof job.code!=='string'||job.code.length>40000||!['python','javascript','cpp'].includes(job.language)||!Array.isArray(job.cases)||job.cases.length>100)throw Error('运行请求格式不正确');
  task.timer=setTimeout(()=>finish({kind:'error',message:'运行环境加载超时，请重新运行。'}),60000);
  workerSource??=await fetch(new URL('judge-worker.js',location.href)).then(r=>{if(!r.ok)throw Error('执行组件未读取');return r.text()});
  if(active!==task)return;
  const blob=URL.createObjectURL(new Blob([workerSource],{type:'text/javascript'}));
  const worker=new Worker(blob);URL.revokeObjectURL(blob);task.worker=worker;
  worker.onerror=()=>finish({kind:'error',message:'代码执行环境出现错误，请重试。'});
  worker.onmessage=event=>{if(active!==task)return;const result=event.data;if(!result||typeof result!=='object')return;
   if(result.kind==='ready'){clearTimeout(task.timer);task.timer=setTimeout(()=>finish({kind:'timeout',message:job.language==='cpp'?'编译超过 30 秒，已终止。':'执行超过 3 秒，已终止。请检查死循环或算法复杂度。'}),job.language==='cpp'?30000:3000);worker.postMessage({kind:'execute',code:job.code,cases:job.cases})}
   else if(result.kind==='compiled'){clearTimeout(task.timer);task.timer=setTimeout(()=>finish({kind:'timeout',message:'执行超过 3 秒，已终止。请检查死循环或算法复杂度。'}),3000)}
   else if(result.kind==='compileerror')finish({kind:'compileerror',message:result.message});
   else if(result.kind==='result')finish({kind:'result',results:result.results,elapsed:result.elapsed});
   else if(result.kind==='error')finish({kind:'error',message:String(result.message).slice(0,4000)});
  };
  worker.postMessage({kind:'init',language:job.language,baseURL:new URL('vendor/'+(job.language==='cpp'?'wasm-clang/':'pyodide/'),location.href).href});
 }catch(error){finish({kind:'error',message:error.message})}
});
parent.postMessage({channel:'louie-judge',kind:'host-ready'},parentOrigin);
