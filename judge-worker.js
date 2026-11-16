'use strict';
let runtime=null,language='javascript',cppOutput='',cppBase='';
const send=postMessage.bind(self),clock=performance.now.bind(performance);
self.onmessage=async event=>{
 const job=event.data;
 try{
  if(job.kind==='init'){
   language=job.language;
   if(language==='python'){importScripts(job.baseURL+'pyodide.js');runtime=await loadPyodide({indexURL:job.baseURL,packages:[]})}
   if(language==='cpp'){
    cppBase=job.baseURL;importScripts(cppBase+'shared.js');
    runtime=new API({readBuffer:async name=>{const r=await fetch(cppBase+name);if(!r.ok)throw Error('C++ 组件读取失败');return r.arrayBuffer()},compileStreaming:async name=>{const r=await fetch(cppBase+name);if(!r.ok)throw Error('C++ 组件读取失败');return WebAssembly.compile(await r.arrayBuffer())},hostWrite:s=>{cppOutput+=s;if(cppOutput.length>200000)throw Error('输出过多，已停止。')}});
    runtime.hostLog=()=>{};await runtime.ready;
   }
   send({kind:'ready'});return;
  }
  if(job.kind!=='execute')return;
  const results=[];let cppModule;
  if(language==='cpp'){
   cppOutput='';
   const source='#include <louie-json.hpp>\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n#include <map>\n#include <queue>\n#include <stack>\n#include <set>\n#include <climits>\nusing namespace std;\n'+'#line 1 "solution.cpp"\n'+job.code+'\n#line 1 "judge.cpp"\nint main(){json data;cin>>data;auto result=solve(data);cout<<"\\nLOUIE_RESULT:"<<json(result).dump()<<"\\n";return 0;}';
   try{cppModule=await runtime.judgeCompile(source)}catch(error){send({kind:'compileerror',message:(cppOutput||String(error.message||error)).replace(/\x1b\[[0-9;]*m/g,'').slice(-6000)});return}
   send({kind:'compiled'});
  }
  const start=clock();
  for(const value of job.cases){
   let stdout='';const capture=s=>{stdout=(stdout+String(s)+'\n').slice(0,4000)};
   const began=clock();
   try{
    let output;
    if(language==='cpp'){
     cppOutput='';await runtime.judgeRun(cppModule,JSON.stringify(value).replace(/[\u007f-\uffff]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0')));
     cppOutput=new TextDecoder().decode(Uint8Array.from(cppOutput,c=>c.charCodeAt(0)));
     const marker=cppOutput.lastIndexOf('LOUIE_RESULT:');
     if(marker<0)throw Error('程序未返回有效结果。'+cppOutput.slice(0,1000));
     stdout=cppOutput.slice(0,marker).trim().slice(0,4000);
     output=JSON.parse(cppOutput.slice(marker+13).trim());
    }else if(language==='python'){
     runtime.setStdout({batched:capture});runtime.setStderr({batched:capture});
     runtime.globals.set('_louie_source',job.code);runtime.globals.set('_louie_input',JSON.stringify(value));
     const serialized=await runtime.runPythonAsync('import json as _louie_json\n_louie_env = {}\nexec(_louie_source, _louie_env)\nif not callable(_louie_env.get("solve")):\n    raise TypeError("请定义 solve(data) 函数")\n_louie_value = _louie_env["solve"](_louie_json.loads(_louie_input))\n_louie_json.dumps(_louie_value, ensure_ascii=False, allow_nan=False)');
     output=JSON.parse(serialized);
    }else{
     const fakeConsole={log:(...xs)=>capture(xs.join(' ')),error:(...xs)=>capture(xs.join(' ')),warn:(...xs)=>capture(xs.join(' '))};
     const solve=new Function('console','"use strict";\n'+job.code+'\n;if(typeof solve!=="function")throw Error("请定义 solve(data) 函数");return solve;')(fakeConsole);
     output=solve(JSON.parse(JSON.stringify(value)));
     if(output===undefined)throw Error('solve(data) 没有返回值，请使用 return。');
     if(output&&typeof output.then==='function')throw Error('请使用同步的 solve(data) 函数。');
     const serialized=JSON.stringify(output);
     if(!serialized||serialized.length>100000)throw Error('返回结果为空或过大。');
     output=JSON.parse(serialized);
    }
    if(JSON.stringify(output).length>100000)throw Error('返回结果过大。');
    results.push({output,stdout,ms:clock()-began});
   }catch(error){results.push({error:String(error.message||error).slice(0,4000),stdout,ms:clock()-began});break}
  }
  send({kind:'result',results,elapsed:clock()-start});
 }catch(error){send({kind:'error',message:String(error.message||error).slice(0,4000)})}
};
