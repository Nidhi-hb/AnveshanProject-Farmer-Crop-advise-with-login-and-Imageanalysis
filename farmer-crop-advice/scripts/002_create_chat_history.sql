-- Create chat history table to store conversations
create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message_role text not null check (message_role in ('user', 'assistant')),
  message_content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.chat_history enable row level security;

-- Create policies for chat history
create policy "chat_history_select_own"
  on public.chat_history for select
  using (auth.uid() = user_id);

create policy "chat_history_insert_own"
  on public.chat_history for insert
  with check (auth.uid() = user_id);

create policy "chat_history_update_own"
  on public.chat_history for update
  using (auth.uid() = user_id);

create policy "chat_history_delete_own"
  on public.chat_history for delete
  using (auth.uid() = user_id);

-- Create index for better performance
create index if not exists chat_history_user_id_created_at_idx 
  on public.chat_history (user_id, created_at desc);
