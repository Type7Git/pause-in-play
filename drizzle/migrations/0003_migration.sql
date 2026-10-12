create table public.cron_tokens (name text primary key, token text not null default encode(extensions.gen_random_bytes(32), 'hex'));
grant all on public.cron_tokens to service_role;
alter table public.cron_tokens enable row level security;
insert into public.cron_tokens (name) values ('push');
create extension if not exists pg_cron;
create extension if not exists pg_net;