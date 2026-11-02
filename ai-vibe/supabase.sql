-- AI Vibe circles: OPTIONAL live group feature. Run this in a personal Supabase project.
-- Private-by-invite-link, not authenticated/private to known employees.
-- No names, email addresses, raw question answers or free text are stored.
-- Participants are pseudonymous per browser; no protection against dishonest or duplicate responses.

create table if not exists public.ai_vibe_circle_entries (
  room_code text not null check (room_code ~ '^[A-Z2-9]{10}$'),
  participant_id uuid not null,
  archetype text not null check (archetype in ('frontier','freedom','practical','guardian','power','observer')),
  scores jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (room_code, participant_id)
);

alter table public.ai_vibe_circle_entries enable row level security;
revoke all on public.ai_vibe_circle_entries from public, anon, authenticated;
-- Intentionally create NO anon SELECT/INSERT/UPDATE policies.
-- The only API entrypoints below explicitly validate and restrict data.

create or replace function public.submit_ai_vibe_circle_result(
  p_code text,
  p_participant uuid,
  p_scores jsonb,
  p_archetype text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  k text;
  sum_scores integer := 0;
begin
  if p_code is null or p_code !~ '^[A-Z2-9]{10}$' then
    raise exception 'Invalid room code';
  end if;
  if p_participant is null then
    raise exception 'Missing participant ID';
  end if;
  if p_archetype is null or p_archetype not in ('frontier','freedom','practical','guardian','power','observer') then
    raise exception 'Invalid archetype';
  end if;
  if p_scores is null or jsonb_typeof(p_scores) <> 'object' then
    raise exception 'Scores must be an object';
  end if;
  if (select count(*) from jsonb_object_keys(p_scores)) <> 6 then
    raise exception 'Exactly six score keys are required';
  end if;
  foreach k in array array['frontier','freedom','practical','guardian','power','observer'] loop
    if coalesce(p_scores->>k,'') !~ '^(0|[1-9]|1[0-2])$' then
      raise exception 'Score must be a whole number between 0 and 12';
    end if;
    sum_scores := sum_scores + (p_scores->>k)::integer;
  end loop;
  if sum_scores <> 12 then
    raise exception 'Scores must total 12';
  end if;
  if (p_scores->>p_archetype)::integer < (
    select max((p_scores->>t.key)::integer)
    from unnest(array['frontier','freedom','practical','guardian','power','observer']) as t(key)
  ) then
    raise exception 'Primary archetype must have a top score';
  end if;
  insert into public.ai_vibe_circle_entries(room_code,participant_id,archetype,scores,updated_at)
  values (p_code,p_participant,p_archetype,p_scores,now())
  on conflict (room_code,participant_id) do update
     set archetype=excluded.archetype,
         scores=excluded.scores,
         updated_at=now();
  return jsonb_build_object('ok',true);
end;
$$;

create or replace function public.get_ai_vibe_circle_stats(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
  c_frontier integer;
  c_freedom integer;
  c_practical integer;
  c_guardian integer;
  c_power integer;
  c_observer integer;
begin
  if p_code is null or p_code !~ '^[A-Z2-9]{10}$' then
    raise exception 'Invalid room code';
  end if;
  select count(*)::integer,
    count(*) filter(where archetype='frontier')::integer,
    count(*) filter(where archetype='freedom')::integer,
    count(*) filter(where archetype='practical')::integer,
    count(*) filter(where archetype='guardian')::integer,
    count(*) filter(where archetype='power')::integer,
    count(*) filter(where archetype='observer')::integer
  into n,c_frontier,c_freedom,c_practical,c_guardian,c_power,c_observer
  from public.ai_vibe_circle_entries
  where room_code=p_code;
  if n < 5 then
    return jsonb_build_object('ready',false,'count',n);
  end if;
  return jsonb_build_object('ready',true,'count',n,
    'counts',jsonb_build_object(
      'frontier',c_frontier,'freedom',c_freedom,'practical',c_practical,
      'guardian',c_guardian,'power',c_power,'observer',c_observer));
end;
$$;

revoke all on function public.submit_ai_vibe_circle_result(text,uuid,jsonb,text) from public, anon, authenticated;
revoke all on function public.get_ai_vibe_circle_stats(text) from public, anon, authenticated;
grant execute on function public.submit_ai_vibe_circle_result(text,uuid,jsonb,text) to anon, authenticated;
grant execute on function public.get_ai_vibe_circle_stats(text) to anon, authenticated;
