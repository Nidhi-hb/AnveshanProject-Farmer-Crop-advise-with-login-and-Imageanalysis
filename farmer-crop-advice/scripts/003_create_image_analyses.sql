-- Create image analyses table to store analysis results
create table if not exists public.image_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  crop_type text not null,
  health_status text not null check (health_status in ('healthy', 'diseased', 'pest_damage', 'nutrient_deficiency')),
  confidence integer not null check (confidence >= 0 and confidence <= 100),
  issues jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.image_analyses enable row level security;

-- Create policies for image analyses
create policy "image_analyses_select_own"
  on public.image_analyses for select
  using (auth.uid() = user_id);

create policy "image_analyses_insert_own"
  on public.image_analyses for insert
  with check (auth.uid() = user_id);

create policy "image_analyses_update_own"
  on public.image_analyses for update
  using (auth.uid() = user_id);

create policy "image_analyses_delete_own"
  on public.image_analyses for delete
  using (auth.uid() = user_id);

-- Create index for better performance
create index if not exists image_analyses_user_id_created_at_idx 
  on public.image_analyses (user_id, created_at desc);

-- Create index for crop type queries
create index if not exists image_analyses_crop_type_idx 
  on public.image_analyses (crop_type);
