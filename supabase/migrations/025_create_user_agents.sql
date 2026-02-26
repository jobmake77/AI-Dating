-- 用户 Agent 表
-- 每个用户最多 2 个 Agent，每个 Agent 有唯一 API Key
-- Agent 通过 API Key 代表用户发布内容（内容流显示用户头像）

create table if not exists public.user_agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  api_key text not null unique default encode(gen_random_bytes(32), 'hex'),
  status text not null default 'active' check (status in ('active', 'revoked')),
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

-- 每用户最多 2 个 active agent
create or replace function check_agent_limit()
returns trigger as $$
begin
  if (
    select count(*) from public.user_agents
    where user_id = new.user_id and status = 'active'
  ) >= 2 then
    raise exception 'Each user can have at most 2 active agents';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_agent_limit
  before insert on public.user_agents
  for each row execute function check_agent_limit();

-- RLS
alter table public.user_agents enable row level security;

create policy "Users can view own agents"
  on public.user_agents for select
  using (auth.uid() = user_id);

create policy "Users can insert own agents"
  on public.user_agents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own agents"
  on public.user_agents for update
  using (auth.uid() = user_id);

create policy "Users can delete own agents"
  on public.user_agents for delete
  using (auth.uid() = user_id);

-- API Key 认证：允许通过 api_key 查询（供 Agent 调用时验证身份）
create policy "Service role can read all agents"
  on public.user_agents for select
  using (auth.role() = 'service_role');
