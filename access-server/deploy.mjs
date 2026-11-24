import {execFileSync,spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const directory=fileURLToPath(new URL('.',import.meta.url));const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim();if(!/^[a-f0-9]{40}$/.test(commit))throw Error('Invalid Git commit');
const result=spawnSync('wrangler',['deploy','--config',fileURLToPath(new URL('./wrangler.jsonc',import.meta.url)),'--var','ASSET_COMMIT:'+commit],{stdio:'inherit',cwd:directory});if(result.error)throw result.error;process.exitCode=result.status??1;
