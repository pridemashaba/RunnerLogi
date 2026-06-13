create table if not exists public.profiles (
  id uuid references auth.users(id) primary key,
  email text,
  full_name text,
  phone text,
  company_name text,
  address text,
  city text,
  state text,
  zip_code text,
  country text,
  website text,
  notification_preferences jsonb default '{
    "email": true,
    "sms": false,
    "push": true,
    "orderUpdates": true,
    "promotions": false
  }'::jsonb,
  business_hours jsonb default '{
    "monday": {"enabled": true, "start": "08:00", "end": "17:00"},
    "tuesday": {"enabled": true, "start": "08:00", "end": "17:00"},
    "wednesday": {"enabled": true, "start": "08:00", "end": "17:00"},
    "thursday": {"enabled": true, "start": "08:00", "end": "17:00"},
    "friday": {"enabled": true, "start": "08:00", "end": "17:00"},
    "saturday": {"enabled": false, "start": "08:00", "end": "13:00"},
    "sunday": {"enabled": false, "start": "08:00", "end": "13:00"}
  }'::jsonb,
  default_pickup_address text,
  default_return_address text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      phone = excluded.phone,
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can insert own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );
