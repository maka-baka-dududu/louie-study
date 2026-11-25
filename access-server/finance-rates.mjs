const foreign=['USD','HKD','EUR','GBP','JPY','SGD'];
const source='https://frankfurter.dev/';
export function normalizeRates(rows){
 if(!Array.isArray(rows))throw Error('Invalid rates');const rates={CNY:1},dates={};
 for(const row of rows){const code=row?.quote?.toUpperCase();if(!foreign.includes(code))continue;if(row.base?.toUpperCase()!=='CNY'||!Number.isFinite(row.rate)||row.rate<=0||!/^\d{4}-\d{2}-\d{2}$/.test(row.date)||row.date>new Date().toISOString().slice(0,10))throw Error('Invalid rate');rates[code]=1/row.rate;dates[code]=row.date;}
 if(foreign.some(code=>!rates[code]))throw Error('Incomplete rates');
 return {base:'CNY',rates,dates,date:Object.values(dates).sort()[0],source,provider:'欧洲央行 · Frankfurter',checkedAt:new Date().toISOString()};
}
export async function financeRates(request,env,identity,H){
 if(identity.role!=='edit')return H.fail('仅个人模式可查看账户汇率',403);
 if(request.method!=='GET')return H.fail('无效请求',405);
 const cached=await(await H.stateCall(env,'/finance-rates-get')).json();
 if(cached?.checkedAt&&Date.now()-Date.parse(cached.checkedAt)<6*3600000)return H.json({...cached,stale:false});
 try{
  const r=await fetch('https://api.frankfurter.dev/v2/providers/ecb/rates?base=CNY&quotes='+foreign.join(','),{redirect:'manual',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Provider HTTP '+r.status);const value=normalizeRates(await r.json());await H.stateCall(env,'/finance-rates-put',{value});return H.json({...value,stale:false});
 }catch(error){
  console.warn('finance_rate_failure',String(error.message||error.name||'unknown').slice(0,180));
  if(cached?.rates&&cached?.checkedAt)return H.json({...cached,stale:true});
  return H.json({error:'暂时无法获取汇率，原币金额保留；稍后重试',code:/^Provider HTTP \d+$/.test(error.message)?error.message.replaceAll(' ','_'):error.message==='Invalid rate'?'INVALID_RATE':error.message==='Incomplete rates'?'INCOMPLETE_RATES':error.message==='Invalid rates'?'INVALID_FORMAT':'NETWORK_UNAVAILABLE'},503);
 }
}
