create function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create table organisations (
 id uuid primary key default gen_random_uuid(), name text not null, jurisdiction text not null check(jurisdiction in ('NZ','AU')),
 balance_date date not null check(balance_date=(date_trunc('month',balance_date)+interval '1 month'-interval '1 day')::date), annual_filed date, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table grants (
 id uuid primary key default gen_random_uuid(), source_key text unique, name text not null check(length(trim(name))>0),
 project text not null, funder text not null, owner text not null default '', currency text not null check(currency ~ '^[A-Z]{3}$'),
 status text not null default 'prospect' check(status in ('prospect','preparing','submitted','awarded','declined','closed')),
 requested_cents bigint check(requested_cents>=0), awarded_cents bigint check(awarded_cents>=0),
 deadline date, start_date date, end_date date, restrictions text not null default '', agreement_ref text not null default '',
 source_row jsonb, source_changed boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(end_date is null or start_date is null or end_date>=start_date)
);
create table budgets (
 id uuid primary key default gen_random_uuid(), grant_id uuid not null references grants(id), category text not null check(length(trim(category))>0),
 amount_cents bigint not null check(amount_cents>=0), unique(grant_id,category),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table expenses (
 id uuid primary key default gen_random_uuid(), grant_id uuid not null references grants(id), reference text not null check(length(trim(reference))>0),
 category text not null, spent_on date not null, amount_cents bigint not null check(amount_cents>0),
 state text not null check(state in ('planned','actual','void')), evidence_ref text not null default '', description text not null,
 unique(grant_id,reference), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table tasks (
 id uuid primary key default gen_random_uuid(), grant_id uuid not null references grants(id), title text not null,
 kind text not null check(kind in ('application','report','deliverable')), due_on date not null, owner text not null default '',
 requirement_ref text not null default '', evidence_ref text not null default '', completed_on date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(completed_on is null or length(trim(evidence_ref))>0)
);
create table activity (
 id uuid primary key default gen_random_uuid(), grant_id uuid references grants(id), actor text not null check(length(trim(actor))>0),
 action text not null, detail jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table imports (
 id uuid primary key default gen_random_uuid(), filename text not null, actor text not null, rows integer not null,
 inserted integer not null, changed integer not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
do $$ declare t text; begin foreach t in array array['organisations','grants','budgets','expenses','tasks','activity','imports'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_updated_at()',t);
 execute format('alter table %I enable row level security',t); execute format('revoke all on %I from public',t);
 end loop; end $$;
create view grant_balances as
 select g.id,g.name,g.funder,g.owner,g.currency,g.status,g.awarded_cents,
 (select coalesce(sum(b.amount_cents),0) from budgets b where b.grant_id=g.id)::bigint as budget_cents,
 coalesce(sum(e.amount_cents) filter(where e.state='actual'),0)::bigint as actual_cents,
 coalesce(sum(e.amount_cents) filter(where e.state='planned'),0)::bigint as planned_cents,
 (g.awarded_cents-coalesce(sum(e.amount_cents) filter(where e.state='actual'),0))::bigint as remaining_cents,
 (g.awarded_cents-coalesce(sum(e.amount_cents) filter(where e.state in ('actual','planned')),0))::bigint as uncommitted_cents,
 g.start_date,g.end_date,g.source_changed
 from grants g left join expenses e on e.grant_id=g.id group by g.id;
create view budget_variance as
 with cats as (select grant_id,category from budgets union select grant_id,category from expenses where state<>'void')
 select c.grant_id,g.name,g.currency,c.category,b.amount_cents as budget_cents,
 coalesce(sum(e.amount_cents) filter(where e.state='actual'),0)::bigint as actual_cents,
 coalesce(sum(e.amount_cents) filter(where e.state='planned'),0)::bigint as planned_cents,
 (b.amount_cents-coalesce(sum(e.amount_cents) filter(where e.state in ('actual','planned')),0))::bigint as available_cents
 from cats c join grants g on g.id=c.grant_id left join budgets b on b.grant_id=c.grant_id and b.category=c.category
 left join expenses e on e.grant_id=c.grant_id and e.category=c.category
 group by c.grant_id,g.name,g.currency,c.category,b.amount_cents;
create view grant_attention as
 select g.id,g.name,g.owner,'application overdue'::text issue,g.deadline due_on from grants g where g.status in ('prospect','preparing') and g.deadline<current_date
 union all select g.id,g.name,g.owner,'owner missing',g.deadline from grants g where g.owner='' and g.status not in ('closed','declined')
 union all select g.id,g.name,g.owner,'source changed: reconcile before reporting',null::date from grants g where g.source_changed
 union all select g.id,g.name,t.owner,'overdue '||t.kind||': '||t.title,t.due_on from tasks t join grants g on g.id=t.grant_id where t.completed_on is null and t.due_on<current_date
 union all select id,name,owner,'award oversubscribed by actual and planned spend',end_date from grant_balances where uncommitted_cents<0
 union all select id,name,owner,'award ends within 30 days with unspent funds',end_date from grant_balances where status='awarded' and end_date between current_date and current_date+30 and remaining_cents>0;
create view evidence_gaps as
 select g.id,g.name,'agreement missing'::text issue,g.agreement_ref reference from grants g where status='awarded' and agreement_ref=''
 union all select g.id,g.name,'restrictions not recorded',g.agreement_ref from grants g where status='awarded' and restrictions=''
 union all select g.id,g.name,'expense evidence missing',e.reference from expenses e join grants g on g.id=e.grant_id where e.state='actual' and e.evidence_ref=''
 union all select g.id,g.name,'expense outside award dates',e.reference from expenses e join grants g on g.id=e.grant_id where e.state<>'void' and (e.spent_on<g.start_date or e.spent_on>g.end_date)
 union all select g.id,g.name,'award dates missing',g.agreement_ref from grants g where status='awarded' and (start_date is null or end_date is null)
 union all select id,name,'total budget exceeds award',agreement_ref from grants g where awarded_cents<(select sum(amount_cents) from budgets where grant_id=g.id)
 union all select v.grant_id,v.name,'category lacks approved budget',v.category from budget_variance v where budget_cents is null
 union all select v.grant_id,v.name,'category budget exceeded',v.category from budget_variance v where available_cents<0
 union all select g.id,g.name,'requirement source missing',t.title from tasks t join grants g on g.id=t.grant_id where t.requirement_ref='';
