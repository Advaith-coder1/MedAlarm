-- MedAlarm Supabase Schema
-- Run this in the Supabase SQL editor to set up the database.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users (extends Supabase auth.users)
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  name        text not null,
  role        text not null check (role in ('senior', 'caregiver')),
  phone       text,
  date_of_birth date,
  created_at  timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Caregiver-Senior relationships
create table public.caregiver_relationships (
  id            uuid primary key default uuid_generate_v4(),
  caregiver_id  uuid references public.profiles(id) on delete cascade,
  senior_id     uuid references public.profiles(id) on delete cascade,
  relationship  text,
  created_at    timestamptz default now(),
  unique(caregiver_id, senior_id)
);
alter table public.caregiver_relationships enable row level security;

-- Medications
create table public.medications (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid references public.profiles(id) on delete cascade,
  name               text not null,
  generic_name       text,
  brand_name         text,
  strength           text,
  dosage             text,
  type               text default 'tablet',
  color              text,
  shape              text,
  imprint            text,
  purpose            text,
  instructions       text,
  food_instruction   text default 'any_time',
  water_instruction  text,
  avoid_foods        text[],
  image_url          text,
  schedule_frequency text,
  schedule_times     text[],
  prescribed_by      text,
  pharmacy           text,
  refills_remaining  int,
  next_refill_date   date,
  start_date         date,
  end_date           date,
  is_active          boolean default true,
  is_paused          boolean default false,
  notes              text,
  created_at         timestamptz default now()
);
alter table public.medications enable row level security;
create policy "Users and caregivers can view medications" on public.medications for select
  using (
    auth.uid() = user_id or
    exists (
      select 1 from public.caregiver_relationships
      where caregiver_id = auth.uid() and senior_id = user_id
    )
  );

-- Dose records
create table public.dose_records (
  id              uuid primary key default uuid_generate_v4(),
  medication_id   uuid references public.medications(id) on delete cascade,
  user_id         uuid references public.profiles(id) on delete cascade,
  scheduled_time  timestamptz not null,
  taken_at        timestamptz,
  status          text not null check (status in ('taken','missed','skipped','pending','upcoming','late')),
  meal_confirmed  boolean default false,
  notes           text,
  created_at      timestamptz default now()
);
alter table public.dose_records enable row level security;

-- Documents
create table public.documents (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references public.profiles(id) on delete cascade,
  title         text not null,
  type          text default 'other',
  file_url      text,
  uploaded_at   timestamptz default now(),
  is_processed  boolean default false
);
alter table public.documents enable row level security;

-- Notifications
create table public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete cascade,
  title       text not null,
  message     text,
  type        text default 'info',
  is_read     boolean default false,
  created_at  timestamptz default now()
);
alter table public.notifications enable row level security;
