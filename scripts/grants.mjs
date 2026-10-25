#!/usr/bin/env node
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv,pick} from './lib/csv.mjs';
import {table} from './lib/format.mjs';
import {page,table as htmlTable,writeOut} from './lib/render.mjs';

export const commands={
 help:'help', grants:'grants', grant:'grant <name-or-id>', pipeline:'pipeline', deadlines:'deadlines', awards:'awards',
 spenddown:'spenddown [grant]', budgets:'budgets [grant]', expenses:'expenses [grant]', tasks:'tasks [grant]',
 'reports-due':'reports-due', 'evidence-gaps':'evidence-gaps', attention:'attention', compliance:'compliance',
 'weekly-review':'weekly-review', history:'history [grant]', imports:'imports', organisations:'organisations',
 'add-organisation':'add-organisation <name> --jurisdiction=NZ|AU --balance-date=YYYY-MM-DD --actor=name',
 'file-annual':'file-annual <organisation> --date=YYYY-MM-DD --evidence=reference --actor=name',
 'add-grant':'add-grant <name> --project=name --funder=name --currency=NZD --actor=name [--owner=name]',
 'set-grant':'set-grant <grant> [--owner=name --status=awarded --requested=100.00 --awarded=100.00 --deadline=YYYY-MM-DD --start=YYYY-MM-DD --end=YYYY-MM-DD --restrictions=text --agreement=reference] --actor=name',
 'set-task':'set-task <task-id> [--title=text --kind=report --due=YYYY-MM-DD --owner=name --requirement=reference] --actor=name',
 'set-budget':'set-budget <grant> --category=name --amount=100.00 --actor=name',
 'add-expense':'add-expense <grant> --reference=unique --category=name --date=YYYY-MM-DD --amount=100.00 --state=actual|planned --description=text [--evidence=reference] --actor=name',
 'post-expense':'post-expense <expense-id> --date=YYYY-MM-DD --evidence=reference --actor=name',
 'void-expense':'void-expense <expense-id> --reason=text --actor=name',
 'add-task':'add-task <grant> --title=text --kind=application|report|deliverable --due=YYYY-MM-DD [--owner=name --requirement=reference] --actor=name',
 'complete-task':'complete-task <task-id> --date=YYYY-MM-DD --evidence=reference --actor=name',
 log:'log <grant> --note=text --actor=name',
 'acknowledge-source':'acknowledge-source <grant> --note=reconciliation-explanation --actor=name',
 import:'import instrumentl <opportunities.csv> --currency=NZD --actor=name [--dry-run --date-format=mdy|dmy|iso]',
 export:'export --out=path.json',
 'draft-acquittal':'draft-acquittal <grant>', 'draft-application':'draft-application <grant>'
};
const READS={
 grants:'select id,name,project,funder,owner,currency,status,deadline from grants order by name',
 pipeline:'select currency,status,count(*)::int grants,sum(requested_cents)::bigint requested_cents from grants group by currency,status order by currency,status',
 deadlines:"select name,owner,status,deadline from grants where status in ('prospect','preparing','submitted') order by deadline nulls last",
 awards:"select name,currency,awarded_cents,actual_cents,planned_cents,remaining_cents,uncommitted_cents,end_date from grant_balances where status='awarded' order by name",
 'reports-due':"select t.id,g.name,t.title,t.owner,t.due_on from tasks t join grants g on g.id=t.grant_id where t.kind='report' and t.completed_on is null order by t.due_on",
 attention:'select name,owner,issue,due_on from grant_attention order by due_on nulls last,name',
 'evidence-gaps':'select name,issue,reference from evidence_gaps order by name,issue',
 imports:'select * from imports order by created_at desc',
 organisations:"select *, (date_trunc('month',balance_date)+interval '7 months'-interval '1 day')::date as annual_due from organisations order by name"
};
const FILTERED={spenddown:['grant_balances','id'],budgets:['budget_variance','grant_id'],expenses:['expenses','grant_id'],tasks:['tasks','grant_id'],history:['activity','grant_id']};
const FLAGS={
 'add-organisation':['jurisdiction','balance-date'], 'file-annual':['date','evidence'],
 'add-grant':['project','funder','currency','owner'], 'set-grant':['owner','status','requested','awarded','deadline','start','end','restrictions','agreement'],
 'set-task':['title','kind','due','owner','requirement'], 'set-budget':['category','amount'], 'add-expense':['reference','category','date','amount','state','description','evidence'],
 'post-expense':['date','evidence'], 'void-expense':['reason'], 'add-task':['title','kind','due','owner','requirement'],
 'complete-task':['date','evidence'],log:['note'],'acknowledge-source':['note'],import:['currency','dry-run','date-format'],export:['out']
};
function monthEnd(v){const d=date(v);const next=new Date(`${d}T00:00:00Z`);next.setUTCDate(next.getUTCDate()+1);if(next.getUTCDate()!==1)throw Error('Balance date must be the last day of the month');return d;}
const MUTATIONS=new Set(Object.keys(FLAGS).filter(x=>x!=='export'));
function parse(args){const pos=[],opts={};for(const a of args){if(a.startsWith('--')){const i=a.indexOf('=');const k=a.slice(2,i<0?undefined:i);if(k in opts)throw Error(`Duplicate flag: ${k}`);opts[k]=i<0?true:a.slice(i+1);}else pos.push(a);}return {pos,opts};}
function required(v,label){if(typeof v!=='string'||!v.trim())throw Error(`${label} is required`);return v.trim();}
export function cents(v){const s=String(v);if(!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(s))throw Error(`Invalid nonnegative amount: ${s}`);const [whole,decimal='']=s.replaceAll(',','').split('.');const n=BigInt(whole)*100n+BigInt(decimal.padEnd(2,'0'));if(n>BigInt(Number.MAX_SAFE_INTEGER))throw Error('Amount too large');return Number(n);}
export function date(v,format='iso'){if(!v)return null;let s=String(v).trim();if(format!=='iso'&&/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)){const [a,b,y]=s.split('/');s=`${y}-${(format==='mdy'?a:b).padStart(2,'0')}-${(format==='mdy'?b:a).padStart(2,'0')}`;}if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw Error(`Invalid date ${v}; use YYYY-MM-DD or explicit import date format`);return s;}
function currency(v){if(!/^[A-Z]{3}$/.test(v||''))throw Error('currency requires three uppercase letters');return v;}
async function resolve(db,tableName,term,name='name'){
 required(term,`${tableName} reference`);
 const rows=await db.query(`select * from ${tableName} where id::text=$1 or id::text ilike $1||'%' ${name?`or lower(${name})=lower($1) or ${name} ilike '%'||$1||'%'`:''} order by id`,[term]);
 if(rows.length!==1)throw Error(rows.length?`Ambiguous ${tableName}: ${rows.map(r=>`${r.id} ${r[name]||''}`).join('; ')}`:`No ${tableName} matches ${term}`);return rows[0];
}
async function audit(db,g,actor,action,detail){await db.query('insert into activity(grant_id,actor,action,detail) values($1,$2,$3,$4)',[g,actor,action,JSON.stringify(detail)]);}
async function compliance(db){
 const gaps=await db.query("select name,issue,reference,'Award agreement and internal evidence policy' as rule from evidence_gaps order by name,issue");
 const orgs=await db.query("select name,jurisdiction,balance_date,annual_filed,(date_trunc('month',balance_date)+interval '7 months'-interval '1 day')::date annual_due from organisations");
 const [today]=await db.query('select current_date::text today');
 return [...gaps,...orgs.filter(o=>!o.annual_filed).map(o=>({name:o.name,issue:o.annual_due<today.today?'annual filing overdue':'annual filing pending',reference:o.annual_due,rule:o.jurisdiction==='NZ'?'NZ Charities Services: six months after balance date':'ACNC: six months after reporting period; check extensions'})),...orgs.filter(o=>o.jurisdiction==='AU').map(o=>({name:o.name,issue:'retain financial and operational records seven years; confirm evidence storage',reference:'docs/compliance.md',rule:'ACNC record-keeping'}))];
}
async function importInstrumentl(db,file,o){
 const rows=parseCsv(readFileSync(file,'utf8'));if(!rows.length)throw Error('Empty import');
 const seen=new Set();const fmt=o['date-format']||'iso';if(!['iso','dmy','mdy'].includes(fmt))throw Error('Invalid date-format');
 const cur=currency(o.currency);let inserted=0,changed=0;
 for(const row of rows){
  const name=required(pick(row,'Opportunity name'),'Opportunity name');const project=required(pick(row,'Project'),'Project');
  const funder=required(pick(row,'Funder name'),'Funder name');const year=required(pick(row,'Year'),'Year');
  const key=createHash('sha256').update(JSON.stringify([year,project,funder,name])).digest('hex');
  if(seen.has(key))throw Error(`Duplicate opportunity identity in CSV: ${name}`);seen.add(key);
  const raw=JSON.stringify(row);const previous=(await db.query('select * from grants where source_key=$1',[key]))[0];
  // Validate every mapped value even on repeat imports. Unknown status stays prospect; raw value is retained.
  const statusMap={prospect:'prospect',researching:'prospect',planned:'preparing',preparing:'preparing','in progress':'preparing',submitted:'submitted',awarded:'awarded',received:'awarded',declined:'declined',rejected:'declined',closed:'closed'};
  const status=statusMap[pick(row,'Status').trim().toLowerCase()]||'prospect';
  const amount=k=>pick(row,k)===''?null:cents(pick(row,k));
  const vals=[key,name,project,funder,pick(row,'[Grant] Owner','Owner'),cur,status,amount('Amount requested'),amount('Amount awarded'),date(pick(row,'Funder Full proposal deadline'),fmt),date(pick(row,'Award Period Start Date'),fmt),date(pick(row,'Award Period End Date'),fmt),raw];
  if(vals[10]&&vals[11]&&vals[10]>vals[11])throw Error('Award end precedes start');
  if(previous){
   if(previous.currency!==cur)throw Error('Existing opportunity currency differs; reconcile explicitly');
   const equal=(await db.query('select $1::jsonb=$2::jsonb same',[JSON.stringify(previous.source_row),raw]))[0].same;
   if(!equal){await db.query('update grants set source_row=$2,source_changed=true where id=$1',[previous.id,raw]);await audit(db,previous.id,o.actor,'import-changed',{before:previous.source_row,after:row});changed++;}
  }else{
   const [g]=await db.query('insert into grants(source_key,name,project,funder,owner,currency,status,requested_cents,awarded_cents,deadline,start_date,end_date,source_row) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning id',vals);
   const title=pick(row,'Next task title'),due=date(pick(row,'Next task deadline'),fmt);
   if(title&&due)await db.query("insert into tasks(grant_id,title,kind,due_on,owner,requirement_ref) values($1,$2,'application',$3,$4,'Instrumentl Opportunities report: next task; verify kind and requirement')",[g.id,title,due,pick(row,'[Grant] Owner','Owner')]);
   await audit(db,g.id,o.actor,'import-inserted',{source:row});inserted++;
  }
 }
 await db.query('insert into imports(filename,actor,rows,inserted,changed) values($1,$2,$3,$4,$5)',[path.basename(file),o.actor,rows.length,inserted,changed]);
 return {rows:rows.length,inserted,changed,unchanged:rows.length-inserted-changed,dry_run:!!o['dry-run']};
}
export async function run(db,args){
 const {pos,opts:o}=parse(args);const [cmd='help',ref,...rest]=pos;
 if(!(cmd in commands))throw Error(`Unknown command ${cmd}; use help`);
 for(const flag of Object.keys(o))if(!['json',...(FLAGS[cmd]||[]),...(MUTATIONS.has(cmd)?['actor']:[])].includes(flag))throw Error(`Unknown flag --${flag} for ${cmd}`);
 for(const key of ['json','dry-run'])if(key in o&&o[key]!==true)throw Error(`--${key} takes no value`);
 if(cmd==='help')return Object.entries(commands).map(([command,usage])=>({command,usage}));
 const noRef=['help',...Object.keys(READS),'compliance','weekly-review','export'].filter(x=>!['organisations'].includes(x));
 if((noRef.includes(cmd)||cmd==='organisations')&&ref)throw Error(`${cmd} takes no positional arguments`);
 if(cmd!=='import'&&rest.length)throw Error(`Too many arguments for ${cmd}`);
 if(READS[cmd])return db.query(READS[cmd]);
 if(FILTERED[cmd]){const [t,k]=FILTERED[cmd];return db.query(`select * from ${t}${ref?` where ${k}=$1`:''} order by ${cmd==='history'?'created_at':'1'}`,ref?[(await resolve(db,'grants',ref)).id]:[]);}
 if(cmd==='grant')return [await resolve(db,'grants',ref)];
 if(cmd==='compliance')return compliance(db);
 if(cmd==='weekly-review')return {attention:await db.query(READS.attention),spenddown:await db.query(READS.awards),reports:await db.query(READS['reports-due'])};
 if(cmd==='export'){
  const out=path.resolve(required(o.out,'--out'));const data={format:'grant-operations-v1',exported_at:new Date().toISOString()};
  await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');try{for(const t of ['organisations','grants','budgets','expenses','tasks','activity','imports'])data[t]=await db.query(`select * from ${t} order by id`);await db.exec('COMMIT');}catch(e){await db.exec('ROLLBACK');throw e;}
  mkdirSync(path.dirname(out),{recursive:true,mode:0o700});writeFileSync(out,JSON.stringify(data,null,2),{mode:0o600,flag:'wx'});return {file:out,grants:data.grants.length};
 }
 if(cmd.startsWith('draft-')){
  const g=await resolve(db,'grants',ref);const sections=[{title:'Internal draft: review before submission',html:htmlTable([{name:g.name,funder:g.funder,owner:g.owner,currency:g.currency,status:g.status,restrictions:g.restrictions,agreement:g.agreement_ref,source_changed:g.source_changed}])}];
  for(const [title,sql] of (cmd==='draft-acquittal'?[
   ['Award balance','select * from grant_balances where id=$1'],['Budget and spending','select * from budget_variance where grant_id=$1'],['Evidence gaps','select issue,reference from evidence_gaps where id=$1'],['Deliverables and reports','select title,kind,due_on,completed_on,evidence_ref from tasks where grant_id=$1']
  ]:[['Application','select project,requested_cents,deadline,owner from grants where id=$1'],['Tasks','select title,due_on,owner,requirement_ref from tasks where grant_id=$1']]))sections.push({title,html:htmlTable(await db.query(sql,[g.id]))});
  const file=writeOut('drafts',`${cmd}-${g.id}-${Date.now()}`,page({title:cmd==='draft-acquittal'?'Draft grant acquittal':'Draft application brief',subtitle:'Working paper only. Reconcile with the ledger and signed agreement. No submission or payment.',sections}));return {file};
 }
 const actor=required(o.actor,'--actor');await db.exec('BEGIN');
 try{
  let result,g=null,before=null;
  if(cmd==='import'){
   if(ref!=='instrumentl'||rest.length!==1)throw Error(commands.import);result=await importInstrumentl(db,rest[0],o);
  }else if(cmd==='add-organisation'){
   result=await db.query('insert into organisations(name,jurisdiction,balance_date) values($1,$2,$3) returning *',[required(ref,'name'),required(o.jurisdiction,'jurisdiction'),monthEnd(required(o['balance-date'],'balance-date'))]);
  }else if(cmd==='file-annual'){
   before=await resolve(db,'organisations',ref);required(o.evidence,'evidence');const filed=date(required(o.date,'date'));if(filed<=before.balance_date||filed>new Date().toISOString().slice(0,10))throw Error('Filing date must be after balance date and not in the future');result=await db.query('update organisations set annual_filed=$2 where id=$1 returning *',[before.id,filed]);
  }else if(cmd==='add-grant'){
   result=await db.query('insert into grants(name,project,funder,currency,owner) values($1,$2,$3,$4,$5) returning *',[required(ref,'name'),required(o.project,'project'),required(o.funder,'funder'),currency(o.currency),o.owner||'']);g=result[0].id;
  }else if(['post-expense','void-expense','complete-task','set-task'].includes(cmd)){
   const t=['complete-task','set-task'].includes(cmd)?'tasks':'expenses';before=await resolve(db,t,ref,null);g=before.grant_id;
   if(cmd==='set-task'){const map={title:'title',kind:'kind',due:'due_on',owner:'owner',requirement:'requirement_ref'};const es=Object.entries(map).filter(([k])=>k in o);if(!es.length)throw Error('No task fields supplied');result=await db.query(`update tasks set ${es.map(([,col],i)=>`${col}=$${i+2}`).join(',')} where id=$1 returning *`,[before.id,...es.map(([k])=>k==='due'?date(required(o[k],k)):required(o[k],k))]);}
   else if(cmd==='void-expense'){required(o.reason,'reason');if(before.state==='void')throw Error('Expense already void');result=await db.query("update expenses set state='void' where id=$1 returning *",[before.id]);}
   else if(cmd==='post-expense'){if(before.state!=='planned')throw Error('Only a planned expense can be posted');result=await db.query("update expenses set state='actual',spent_on=$2,evidence_ref=$3 where id=$1 returning *",[before.id,date(required(o.date,'date')),required(o.evidence,'evidence')]);}
   else{if(before.completed_on)throw Error('Task already completed');const completed=date(required(o.date,'date'));if(completed>new Date().toISOString().slice(0,10))throw Error('Completion cannot be future-dated');result=await db.query('update tasks set completed_on=$2,evidence_ref=$3 where id=$1 returning *',[before.id,completed,required(o.evidence,'evidence')]);}
  }else{
   before=await resolve(db,'grants',ref);g=before.id;
   if(cmd==='set-grant'){
    const mapping={owner:'owner',status:'status',requested:'requested_cents',awarded:'awarded_cents',deadline:'deadline',start:'start_date',end:'end_date',restrictions:'restrictions',agreement:'agreement_ref'};
    const entries=Object.entries(mapping).filter(([key])=>key in o);if(!entries.length)throw Error('No grant fields supplied');const vals=entries.map(([k])=>['requested','awarded'].includes(k)?cents(o[k]):['deadline','start','end'].includes(k)?date(required(o[k],k)):String(o[k]));
    result=await db.query(`update grants set ${entries.map(([,col],i)=>`${col}=$${i+2}`).join(',')} where id=$1 returning *`,[g,...vals]);
   }else if(cmd==='set-budget'){before={grant:before,budget:await db.query('select * from budgets where grant_id=$1 and category=$2',[g,required(o.category,'category')])};result=await db.query('insert into budgets(grant_id,category,amount_cents) values($1,$2,$3) on conflict(grant_id,category) do update set amount_cents=excluded.amount_cents returning *',[g,required(o.category,'category'),cents(required(o.amount,'amount'))]);}
   else if(cmd==='add-expense'){if(!['actual','planned'].includes(o.state))throw Error('New expense state must be actual or planned');result=await db.query('insert into expenses(grant_id,reference,category,spent_on,amount_cents,state,evidence_ref,description) values($1,$2,$3,$4,$5,$6,$7,$8) returning *',[g,required(o.reference,'reference'),required(o.category,'category'),date(required(o.date,'date')),cents(required(o.amount,'amount')),required(o.state,'state'),o.evidence||'',required(o.description,'description')]);}
   else if(cmd==='add-task')result=await db.query('insert into tasks(grant_id,title,kind,due_on,owner,requirement_ref) values($1,$2,$3,$4,$5,$6) returning *',[g,required(o.title,'title'),required(o.kind,'kind'),date(required(o.due,'due')),o.owner||'',o.requirement||'']);
   else if(cmd==='log'){required(o.note,'note');result={logged:true,grant_id:g};}
   else if(cmd==='acknowledge-source'){required(o.note,'note');result=await db.query('update grants set source_changed=false where id=$1 returning *',[g]);}
  }
  if(cmd!=='import')await audit(db,g,actor,cmd,{before,arguments:o,result});
  await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return result;
 }catch(e){await db.exec('ROLLBACK');throw e;}
}
function display(value){
 if(Array.isArray(value)){if(!value.length)return '  (none)';const keys=Object.keys(value[0]);const rows=value.map(r=>Object.fromEntries(keys.map(k=>{let v=r[k];if(v!==null&&k.endsWith('_cents'))v=(Number(v)/100).toFixed(2);else if(v&&typeof v==='object')v=JSON.stringify(v);return [k,v];})));return table(rows,keys.map(key=>({key,label:key.replace(/_cents$/,' amount').replaceAll('_',' '),width:90})));}
 return Object.entries(value).map(([k,v])=>`${k}\n${Array.isArray(v)?display(v):typeof v==='object'?JSON.stringify(v):v}`).join('\n\n');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 let db;try{db=await getDb();const out=await run(db,process.argv.slice(2));console.log(process.argv.includes('--json')?JSON.stringify(out,null,2):display(out));}catch(e){console.error(e.message);process.exitCode=1;}finally{await db?.close();}
}
