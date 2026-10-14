-- PeriPals access rules. Runs inside a transaction and rolls back; any failure raises.
begin;
create temp table t_ids as select
  '00000000-0000-4000-8000-0000000000a1'::uuid as owner,
  '00000000-0000-4000-8000-0000000000b2'::uuid as pal,
  '00000000-0000-4000-8000-0000000000c3'::uuid as stranger;
grant select on t_ids to authenticated;

insert into pal_settings(user_id, adult_confirmed_at) select owner, now() from t_ids union all select pal, now() from t_ids;
insert into pal_links(id, owner_id, pal_id, status) select '00000000-0000-4000-8000-00000000f001', owner, pal, 'active' from t_ids;
insert into pal_permissions(link_id, garden, status) values ('00000000-0000-4000-8000-00000000f001', false, true);
insert into pal_status(user_id, status) select owner, 'mixed' from t_ids;
insert into petal_events(user_id, amount, reason) select owner, 5, 'test' from t_ids;
insert into side_quests(user_id, doing) select owner, 'private' from t_ids;
insert into vit_items(user_id, thing, location) select owner, 'private', 'private' from t_ids;

create or replace function pg_temp.as_user(u uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, true),
         set_config('role', 'authenticated', true) $$;
create or replace function pg_temp.check(ok boolean, rule text) returns void language plpgsql as $$
begin if not ok then raise exception 'FAILED: %', rule; end if; end $$;

-- 1 status visible when permission on + link active
select pg_temp.as_user(pal) from t_ids;
select pg_temp.check((select count(*) from pal_status) = 1, 'pal reads permitted status');
-- 2 garden hidden when permission off
select pg_temp.check((select count(*) from pal_garden((select owner from t_ids))) = 0, 'garden hidden without permission');
-- 3 private tables never visible to a pal
select pg_temp.check((select count(*) from petal_events) = 0, 'petal history private');
select pg_temp.check((select count(*) from side_quests) = 0, 'side quests private');
select pg_temp.check((select count(*) from vit_items) = 0, 'VIT items private');
-- 4 stranger sees nothing
select pg_temp.as_user(stranger) from t_ids;
select pg_temp.check((select count(*) from pal_status) = 0, 'stranger cannot read status');
select pg_temp.check((select count(*) from pal_links) = 0, 'stranger cannot read links');
-- 5 pal cannot grant themselves permissions
select pg_temp.as_user(pal) from t_ids;
update pal_permissions set garden = true;
reset role;
select pg_temp.check(not (select garden from pal_permissions limit 1), 'pal cannot change permissions');
-- 6 garden visible once owner allows it
update pal_permissions set garden = true;
select pg_temp.as_user(pal) from t_ids;
select pg_temp.check((select petals from pal_garden((select owner from t_ids))) = 5, 'garden visible with permission');
-- 7 pause all sharing hides everything
reset role;
update pal_settings set paused_all = true where user_id = (select owner from t_ids);
select pg_temp.as_user(pal) from t_ids;
select pg_temp.check((select count(*) from pal_status) = 0, 'pause all hides status');
select pg_temp.check((select count(*) from pal_garden((select owner from t_ids))) = 0, 'pause all hides garden');
reset role;
update pal_settings set paused_all = false;
-- 8 paused link hides status
update pal_links set status = 'paused';
select pg_temp.as_user(pal) from t_ids;
select pg_temp.check((select count(*) from pal_status) = 0, 'paused link hides status');
-- 9 messaging works for connected pals, and stops after removal
reset role;
update pal_links set status = 'active';
select pg_temp.as_user(pal) from t_ids;
insert into pal_messages(sender_id, recipient_id, body) select pal, owner, 'hi' from t_ids;
select pg_temp.check((select count(*) from pal_messages) = 1, 'connected pal can message');
reset role;
update pal_links set status = 'removed';
select pg_temp.as_user(pal) from t_ids;
select pg_temp.check((select count(*) from pal_messages) = 0, 'removal hides conversation');
-- 10 stranger cannot message
select pg_temp.as_user(stranger) from t_ids;
do $$ begin
  insert into pal_messages(sender_id, recipient_id, body) values ('00000000-0000-4000-8000-0000000000c3', '00000000-0000-4000-8000-0000000000a1', 'x');
  raise exception 'FAILED: stranger could message';
exception when insufficient_privilege then null; end $$;
-- 11 medicine and cycle sharing stay locked
reset role;
do $$ begin
  update pal_permissions set med_checkins = true;
  raise exception 'FAILED: medicine sharing unlocked';
exception when check_violation then null; end $$;
-- 12 removed links cannot be quietly reactivated
do $$ begin
  update pal_links set status = 'active';
  raise exception 'FAILED: removed link reactivated';
exception when raise_exception then
  if sqlerrm like 'FAILED%' then raise; end if;
end $$;
-- 13 a block hides status even with an active link
delete from pal_links;
insert into pal_links(id, owner_id, pal_id, status) select '00000000-0000-4000-8000-00000000f002', owner, pal, 'active' from t_ids;
insert into pal_permissions(link_id, status) values ('00000000-0000-4000-8000-00000000f002', true);
insert into pal_blocks(blocker_id, blocked_id) select owner, pal from t_ids;
select pg_temp.as_user(pal) from t_ids;
select pg_temp.check((select count(*) from pal_status) = 0, 'block hides status');
reset role;
select 'all PeriPals rules passed' as result;
rollback;
