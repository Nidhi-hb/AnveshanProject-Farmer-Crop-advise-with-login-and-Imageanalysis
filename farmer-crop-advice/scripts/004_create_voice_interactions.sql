-- Create voice interactions table to store voice conversations
create table if not exists public.voice_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_message text not null,
  assistant_response text not null,
  language text not null default 'en-US',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.voice_interactions enable row level security;

-- Create policies for voice interactions
create policy "voice_interactions_select_own"
  on public.voice_interactions for select
  using (auth.uid() = user_id);

create policy "voice_interactions_insert_own"
  on public.voice_interactions for insert
  with check (auth.uid() = user_id);

create policy "voice_interactions_update_own"
  on public.voice_interactions for update
  using (auth.uid() = user_id);

create policy "voice_interactions_delete_own"
  on public.voice_interactions for delete
  using (auth.uid() = user_id);

-- Create index for better performance
create index if not exists voice_interactions_user_id_created_at_idx 
  on public.voice_interactions (user_id, created_at desc);

-- Create index for language queries
create index if not exists voice_interactions_language_idx 
  on public.voice_interactions (language);
