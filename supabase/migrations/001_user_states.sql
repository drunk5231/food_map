create table if not exists user_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  favorites text[] default '{}',
  eaten text[] default '{}',
  want_to_eat text[] default '{}',
  visited_counties text[] default '{}',
  taste_profile jsonb,
  achievements text[] default '{}',
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- RLS policies
alter table user_states enable row level security;

create policy "Users can view own state" on user_states
  for select using (auth.uid() = user_id);

create policy "Users can insert own state" on user_states
  for insert with check (auth.uid() = user_id);

create policy "Users can update own state" on user_states
  for update using (auth.uid() = user_id);
