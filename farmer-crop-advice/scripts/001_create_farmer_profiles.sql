-- Create farmer profiles table
create table if not exists public.farmer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  farmer_name text not null,
  farm_location text not null,
  farm_size_acres decimal,
  primary_crops text[],
  farming_experience_years integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.farmer_profiles enable row level security;

-- Create policies for farmer profiles
create policy "farmer_profiles_select_own"
  on public.farmer_profiles for select
  using (auth.uid() = id);

create policy "farmer_profiles_insert_own"
  on public.farmer_profiles for insert
  with check (auth.uid() = id);

create policy "farmer_profiles_update_own"
  on public.farmer_profiles for update
  using (auth.uid() = id);

create policy "farmer_profiles_delete_own"
  on public.farmer_profiles for delete
  using (auth.uid() = id);

-- Create function to handle new user registration
create or replace function public.handle_new_farmer_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.farmer_profiles (id, farmer_name, farm_location)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'farmer_name', 'Unknown Farmer'),
    coalesce(new.raw_user_meta_data ->> 'farm_location', 'Unknown Location')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Create trigger for new user registration
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_farmer_user();
