-- Teen Expense Tracker database schema
-- Run this entire file in Supabase: Project Dashboard > SQL Editor > New query.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null check (char_length(trim(name)) between 2 and 100),
  email varchar(255) not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_lowercase check (email = lower(email)),
  constraint users_email_unique unique (email)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title varchar(120) not null check (char_length(trim(title)) between 1 and 120),
  amount numeric(12, 2) not null check (amount > 0),
  category varchar(40) not null check (category in (
    'Food', 'Transport', 'Shopping', 'Education', 'Entertainment',
    'Mobile/Internet', 'Subscriptions', 'Health', 'Sports', 'Travel', 'Gifts', 'Other'
  )),
  description varchar(500),
  expense_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  period varchar(20) not null default 'monthly' check (period in ('weekly', 'monthly')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budgets_one_per_user_and_period unique (user_id, period)
);

create index if not exists expenses_user_date_idx
  on public.expenses (user_id, expense_date desc);

create index if not exists expenses_user_category_idx
  on public.expenses (user_id, category);

create index if not exists expenses_user_title_idx
  on public.expenses (user_id, title);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

drop trigger if exists budgets_set_updated_at on public.budgets;
create trigger budgets_set_updated_at
before update on public.budgets
for each row execute function public.set_updated_at();

-- The React app never receives a Supabase key. The Express API uses the service-role
-- key and enforces user ownership from a verified JWT before every database operation.
-- Do not expose the service-role key or use it in frontend code.
