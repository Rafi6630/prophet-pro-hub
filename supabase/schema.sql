create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null default 'buyer',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references public.users(id) on delete cascade,
  full_name text,
  phone text,
  country text default 'Iraq',
  preferred_language text default 'ar',
  created_at timestamptz not null default now()
);

create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.users(id) on delete set null,
  name text not null,
  verified boolean not null default false,
  subscription_tier text,
  response_time_minutes int default 30,
  completed_deals int default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.users(id) on delete set null,
  agency_id uuid references public.agencies(id) on delete set null,
  slug text unique not null,
  city text not null,
  district text,
  property_type text not null,
  price_usd numeric not null,
  size_sqm numeric not null,
  bedrooms int default 0,
  bathrooms int default 0,
  verified boolean not null default false,
  public_visibility boolean not null default false,
  investment_score int,
  fair_price_estimate numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  media_type text not null,
  url text not null,
  sort_order int default 0
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, property_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.users(id) on delete set null,
  receiver_id uuid references public.users(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  offer_amount numeric not null,
  status text not null default 'submitted',
  created_at timestamptz not null default now()
);

create table if not exists public.verifications (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  agency_id uuid references public.agencies(id) on delete cascade,
  verification_type text not null,
  status text not null default 'pending',
  notes text,
  reviewed_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.agencies(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  product_name text not null,
  billing_cycle text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  agency_id uuid references public.agencies(id) on delete cascade,
  lead_type text not null,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.market_prices (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  district text,
  property_type text not null,
  average_price_per_sqm numeric not null,
  captured_at timestamptz not null default now()
);

create table if not exists public.city_metrics (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  growth_score int,
  verified_listings int,
  monthly_leads int,
  captured_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_properties_city_type on public.properties(city, property_type);
create index if not exists idx_properties_visibility_created on public.properties(public_visibility, created_at desc);
create index if not exists idx_market_prices_city_district on public.market_prices(city, district);
create index if not exists idx_leads_property_created on public.leads(property_id, created_at desc);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);

alter table public.profiles enable row level security;
alter table public.agencies enable row level security;
alter table public.properties enable row level security;
alter table public.favorites enable row level security;
alter table public.messages enable row level security;
alter table public.offers enable row level security;

create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id);

create policy "favorites self manage" on public.favorites
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "public properties read" on public.properties
  for select using (public_visibility = true);
