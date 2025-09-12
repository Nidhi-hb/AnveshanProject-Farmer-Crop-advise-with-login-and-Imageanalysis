-- Create crop advice sessions table to store generated recommendations
create table if not exists public.crop_advice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommendations jsonb not null default '[]'::jsonb,
  seasonal_tasks jsonb not null default '[]'::jsonb,
  insights jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.crop_advice_sessions enable row level security;

-- Create policies for crop advice sessions
create policy "crop_advice_sessions_select_own"
  on public.crop_advice_sessions for select
  using (auth.uid() = user_id);

create policy "crop_advice_sessions_insert_own"
  on public.crop_advice_sessions for insert
  with check (auth.uid() = user_id);

create policy "crop_advice_sessions_update_own"
  on public.crop_advice_sessions for update
  using (auth.uid() = user_id);

create policy "crop_advice_sessions_delete_own"
  on public.crop_advice_sessions for delete
  using (auth.uid() = user_id);

-- Create index for better performance
create index if not exists crop_advice_sessions_user_id_created_at_idx 
  on public.crop_advice_sessions (user_id, created_at desc);
