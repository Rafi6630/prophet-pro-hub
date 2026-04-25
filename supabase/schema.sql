create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'seller', 'buyer');
create type public.property_kind as enum ('house', 'apartment', 'villa', 'land', 'commercial', 'office', 'shop');
create type public.listing_status as enum ('draft', 'pending_review', 'active', 'sold', 'archived');
create type public.verification_level as enum ('unverified', 'pending', 'verified', 'premium');
create type public.risk_level as enum ('low', 'medium', 'high');
create type public.subscription_status as enum ('trial', 'active', 'past_due', 'canceled');
create type public.lead_type as enum ('call', 'whatsapp', 'message', 'offer', 'inspection');

create table if not exists public.users (
  id uuid primary key default auth.uid(),
  email text unique,
  role public.app_role not null default 'buyer',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  phone text,
  whatsapp text,
  city text,
  preferred_lang text not null default 'ar',
  buyer_intent text,
  investor_origin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.users(id) on delete set null,
  slug text unique not null,
  name text not null,
  name_ar text,
  description text,
  verified boolean not null default false,
  verification_level public.verification_level not null default 'pending',
  response_time_minutes integer,
  completed_deals integer not null default 0,
  active_listings integer not null default 0,
  rating numeric(3,2) not null default 0,
  city text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  user_id uuid not null references public.users(id) on delete cascade,
  agency_id uuid references public.agencies(id) on delete set null,
  title text not null,
  title_ar text,
  description text,
  description_ar text,
  city text not null,
  district text,
  address text,
  property_kind public.property_kind not null,
  status public.listing_status not null default 'draft',
  verification_level public.verification_level not null default 'pending',
  featured boolean not null default false,
  investment_deal boolean not null default false,
  ownership_reviewed boolean not null default false,
  legal_status text,
  fraud_risk public.risk_level default 'medium',
  price numeric(14,2) not null,
  price_iqd numeric(16,2),
  fair_price_estimate numeric(14,2),
  investment_score integer,
  area_growth_pct numeric(5,2),
  area_m2 integer not null,
  bedrooms integer not null default 0,
  bathrooms integer not null default 0,
  features text[] not null default '{}',
  income_potential text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  schools_score numeric(3,1),
  hospitals_score numeric(3,1),
  roads_score numeric(3,1),
  electricity_score numeric(3,1),
  water_score numeric(3,1),
  safety_score numeric(3,1),
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video', 'floorplan')),
  url text not null,
  thumbnail_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, property_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(id) on delete cascade,
  recipient_id uuid not null references public.users(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  buyer_id uuid not null references public.users(id) on delete cascade,
  seller_id uuid not null references public.users(id) on delete cascade,
  offer_price numeric(14,2) not null,
  currency text not null default 'USD',
  status text not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verifications (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  agency_id uuid references public.agencies(id) on delete cascade,
  reviewer_id uuid references public.users(id) on delete set null,
  verification_type text not null,
  status public.verification_level not null default 'pending',
  notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  agency_id uuid references public.agencies(id) on delete cascade,
  plan_name text not null,
  monetization_channel text not null,
  status public.subscription_status not null default 'trial',
  billing_cycle text not null default 'monthly',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  agency_id uuid references public.agencies(id) on delete set null,
  buyer_id uuid references public.users(id) on delete set null,
  seller_id uuid references public.users(id) on delete set null,
  lead_type public.lead_type not null,
  source text,
  campaign text,
  created_at timestamptz not null default now()
);

create table if not exists public.market_prices (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  district text,
  property_kind public.property_kind not null,
  median_price_m2 numeric(14,2) not null,
  sample_size integer not null default 0,
  yoy_change_pct numeric(6,2),
  snapshot_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.city_metrics (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  verified_listings integer not null default 0,
  verified_agencies integer not null default 0,
  monthly_leads integer not null default 0,
  closed_deals integer not null default 0,
  avg_days_to_lead integer,
  buyer_demand_score integer,
  investor_interest_score integer,
  captured_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_agencies_slug on public.agencies(slug);
create index if not exists idx_properties_city_kind on public.properties(city, property_kind);
create index if not exists idx_properties_status_created on public.properties(status, created_at desc);
create index if not exists idx_properties_featured on public.properties(featured, investment_deal);
create index if not exists idx_properties_scores on public.properties(investment_score desc, fair_price_estimate);
create index if not exists idx_property_media_property on public.property_media(property_id, sort_order);
create index if not exists idx_favorites_user on public.favorites(user_id, created_at desc);
create index if not exists idx_messages_recipient on public.messages(recipient_id, created_at desc);
create index if not exists idx_offers_property_status on public.offers(property_id, status, created_at desc);
create index if not exists idx_verifications_property on public.verifications(property_id, status);
create index if not exists idx_subscriptions_owner on public.subscriptions(user_id, agency_id, status);
create index if not exists idx_leads_property_created on public.leads(property_id, created_at desc);
create index if not exists idx_market_prices_city_snapshot on public.market_prices(city, property_kind, snapshot_date desc);
create index if not exists idx_city_metrics_city_captured on public.city_metrics(city, captured_at desc);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.agencies enable row level security;
alter table public.properties enable row level security;
alter table public.property_media enable row level security;
alter table public.favorites enable row level security;
alter table public.messages enable row level security;
alter table public.offers enable row level security;
alter table public.verifications enable row level security;
alter table public.subscriptions enable row level security;
alter table public.leads enable row level security;
alter table public.market_prices enable row level security;
alter table public.city_metrics enable row level security;
alter table public.audit_logs enable row level security;

create policy "public read active properties" on public.properties
  for select using (status = 'active');

create policy "seller manage own properties" on public.properties
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "public read property media" on public.property_media
  for select using (
    exists (
      select 1 from public.properties
      where properties.id = property_media.property_id
        and properties.status = 'active'
    )
  );

create policy "seller manage own media" on public.property_media
  for all using (
    exists (
      select 1 from public.properties
      where properties.id = property_media.property_id
        and properties.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.properties
      where properties.id = property_media.property_id
        and properties.user_id = auth.uid()
    )
  );

create policy "public read agencies" on public.agencies
  for select using (true);

create policy "agency owner manage profile" on public.agencies
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create policy "users read own profile" on public.profiles
  for select using (auth.uid() = user_id);

create policy "users upsert own profile" on public.profiles
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage own favorites" on public.favorites
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users read own conversations" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "users send messages in own name" on public.messages
  for insert with check (auth.uid() = sender_id);

create policy "participants manage offers" on public.offers
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "buyers create offers" on public.offers
  for insert with check (auth.uid() = buyer_id);

create policy "seller and buyer update offers" on public.offers
  for update using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "admins read verifications" on public.verifications
  for select using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

create policy "admins manage verifications" on public.verifications
  for all using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

create policy "owners read subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id or exists (select 1 from public.agencies where agencies.id = subscriptions.agency_id and agencies.owner_user_id = auth.uid()));

create policy "admins read leads" on public.leads
  for select using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

create policy "agency owners read own leads" on public.leads
  for select using (
    exists (
      select 1 from public.agencies
      where agencies.id = leads.agency_id and agencies.owner_user_id = auth.uid()
    )
  );

create policy "public read market prices" on public.market_prices
  for select using (true);

create policy "public read city metrics" on public.city_metrics
  for select using (true);

create policy "admins read audit logs" on public.audit_logs
  for select using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );
