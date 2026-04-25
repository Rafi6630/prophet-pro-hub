
-- ============================================================================
-- AQAR — Iraq/MENA real-estate trust portal
-- Clean foundational schema: profiles, roles, properties (sale-only),
-- media, favorites, offers, messages, alerts, verification, area scores
-- ============================================================================

-- ── Enums ───────────────────────────────────────────────────────────────────
create type public.app_role as enum ('admin', 'seller', 'buyer');

create type public.property_kind as enum (
  'house', 'apartment', 'villa', 'land', 'commercial', 'office', 'shop'
);

create type public.listing_status as enum ('draft', 'active', 'sold', 'archived');

create type public.verification_level as enum ('unverified', 'pending', 'verified', 'premium');

create type public.risk_level as enum ('low', 'medium', 'high');

create type public.offer_status as enum ('pending', 'accepted', 'rejected', 'countered', 'withdrawn');

-- ── Updated-at trigger helper ──────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Profiles (one per auth user) ────────────────────────────────────────────
create table public.profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique,
  display_name    text,
  phone           text,
  whatsapp        text,
  avatar_url      text,
  city            text,
  preferred_lang  text not null default 'ar',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are public read"
  on public.profiles for select using (true);

create policy "users insert own profile"
  on public.profiles for insert with check (auth.uid() = user_id);

create policy "users update own profile"
  on public.profiles for update using (auth.uid() = user_id);

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ── User roles (separate table, never on profiles) ──────────────────────────
create table public.user_roles (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null,
  role     public.app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

create policy "users read own roles"
  on public.user_roles for select using (auth.uid() = user_id);

create policy "admins read all roles"
  on public.user_roles for select using (public.has_role(auth.uid(), 'admin'));

create policy "admins manage roles"
  on public.user_roles for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ── Auto-create profile + default buyer role on signup ─────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name, preferred_lang)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'preferred_lang', 'ar')
  );

  insert into public.user_roles (user_id, role) values (new.id, 'buyer');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Cities (Iraq + MENA seed) ──────────────────────────────────────────────
create table public.cities (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name_en      text not null,
  name_ar      text not null,
  country_code text not null default 'IQ',
  latitude     numeric,
  longitude    numeric,
  active       boolean not null default true,
  sort_order   int not null default 0
);

alter table public.cities enable row level security;
create policy "cities public read" on public.cities for select using (true);
create policy "admins manage cities" on public.cities for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into public.cities (slug, name_en, name_ar, country_code, sort_order) values
  ('baghdad','Baghdad','بغداد','IQ',1),
  ('erbil','Erbil','أربيل','IQ',2),
  ('basra','Basra','البصرة','IQ',3),
  ('mosul','Mosul','الموصل','IQ',4),
  ('najaf','Najaf','النجف','IQ',5),
  ('karbala','Karbala','كربلاء','IQ',6),
  ('sulaymaniyah','Sulaymaniyah','السليمانية','IQ',7),
  ('kirkuk','Kirkuk','كركوك','IQ',8),
  ('dubai','Dubai','دبي','AE',20),
  ('riyadh','Riyadh','الرياض','SA',21),
  ('amman','Amman','عمّان','JO',22);

-- ── Properties (SALE only — no rent) ───────────────────────────────────────
create table public.properties (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null,
  title                text not null,
  title_ar             text,
  description          text,
  description_ar       text,

  -- Pricing (USD canonical, IQD optional)
  price                numeric not null check (price >= 0),
  price_iqd            numeric,
  currency             text not null default 'USD',

  -- Classification (no 'rent' anywhere)
  property_kind        public.property_kind not null,

  -- Location
  city                 text not null,
  district             text,
  address              text,
  latitude             numeric,
  longitude            numeric,

  -- Specs
  bedrooms             int not null default 0,
  bathrooms            int not null default 0,
  area_m2              numeric not null check (area_m2 > 0),
  features             text[] not null default '{}',

  -- Trust layer
  verification_level   public.verification_level not null default 'unverified',
  ownership_reviewed   boolean not null default false,
  legal_status         text,                -- 'clear' | 'pending' | 'disputed' | null
  fraud_risk           public.risk_level,   -- nullable -> computed fallback

  -- Investment layer
  fair_price_estimate  numeric,
  investment_score     int check (investment_score between 0 and 100),
  area_growth_pct      numeric,
  income_potential     text,                -- short label

  -- Area intelligence (1-5 stars or null -> computed)
  schools_score        int check (schools_score between 0 and 5),
  hospitals_score      int check (hospitals_score between 0 and 5),
  roads_score          int check (roads_score between 0 and 5),
  electricity_score    int check (electricity_score between 0 and 5),
  water_score          int check (water_score between 0 and 5),
  safety_score         int check (safety_score between 0 and 5),

  status               public.listing_status not null default 'active',
  views                int not null default 0,
  featured             boolean not null default false,
  investment_deal      boolean not null default false,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index idx_properties_city on public.properties(city);
create index idx_properties_kind on public.properties(property_kind);
create index idx_properties_status on public.properties(status);
create index idx_properties_featured on public.properties(featured) where featured = true;
create index idx_properties_investment_deal on public.properties(investment_deal) where investment_deal = true;
create index idx_properties_user on public.properties(user_id);

alter table public.properties enable row level security;

create policy "anyone reads active properties"
  on public.properties for select
  using (status = 'active' or auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "owners insert properties"
  on public.properties for insert with check (auth.uid() = user_id);

create policy "owners update properties"
  on public.properties for update using (auth.uid() = user_id);

create policy "owners delete properties"
  on public.properties for delete using (auth.uid() = user_id);

create policy "admins manage all properties"
  on public.properties for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger properties_touch before update on public.properties
  for each row execute function public.touch_updated_at();

-- ── Property media ─────────────────────────────────────────────────────────
create table public.property_images (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties(id) on delete cascade,
  url          text not null,
  sort_order   int not null default 0,
  is_video     boolean not null default false,
  created_at   timestamptz not null default now()
);

create index idx_property_images_pid on public.property_images(property_id);

alter table public.property_images enable row level security;

create policy "images public read" on public.property_images for select using (true);

create policy "owners insert images"
  on public.property_images for insert with check (
    exists (select 1 from public.properties p where p.id = property_id and p.user_id = auth.uid())
  );

create policy "owners delete images"
  on public.property_images for delete using (
    exists (select 1 from public.properties p where p.id = property_id and p.user_id = auth.uid())
  );

-- ── Favorites ──────────────────────────────────────────────────────────────
create table public.favorites (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null,
  property_id  uuid not null references public.properties(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (user_id, property_id)
);

alter table public.favorites enable row level security;
create policy "users read own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "users add favorites" on public.favorites for insert with check (auth.uid() = user_id);
create policy "users remove favorites" on public.favorites for delete using (auth.uid() = user_id);

-- ── Offers ─────────────────────────────────────────────────────────────────
create table public.offers (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties(id) on delete cascade,
  buyer_id     uuid not null,
  seller_id    uuid not null,
  offer_price  numeric not null,
  currency     text not null default 'USD',
  message      text,
  status       public.offer_status not null default 'pending',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_offers_buyer on public.offers(buyer_id);
create index idx_offers_seller on public.offers(seller_id);
create index idx_offers_property on public.offers(property_id);

alter table public.offers enable row level security;

create policy "buyer reads own offers" on public.offers for select using (auth.uid() = buyer_id);
create policy "seller reads received offers" on public.offers for select using (auth.uid() = seller_id);
create policy "buyer creates offers" on public.offers for insert with check (auth.uid() = buyer_id);
create policy "buyer updates own offers" on public.offers for update using (auth.uid() = buyer_id);
create policy "seller updates received offers" on public.offers for update using (auth.uid() = seller_id);

create trigger offers_touch before update on public.offers
  for each row execute function public.touch_updated_at();

-- ── Messages (lean) ────────────────────────────────────────────────────────
create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null,
  recipient_id uuid not null,
  property_id  uuid references public.properties(id) on delete set null,
  content      text not null,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index idx_messages_recipient on public.messages(recipient_id, created_at desc);
create index idx_messages_sender on public.messages(sender_id, created_at desc);

alter table public.messages enable row level security;
create policy "users read own messages" on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "users send messages" on public.messages for insert with check (auth.uid() = sender_id);
create policy "recipient marks read" on public.messages for update using (auth.uid() = recipient_id);

-- ── Saved searches / alerts ────────────────────────────────────────────────
create table public.alerts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null,
  name            text not null,
  city            text,
  property_kind   public.property_kind,
  min_price       numeric,
  max_price       numeric,
  min_bedrooms    int,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

alter table public.alerts enable row level security;
create policy "users manage own alerts" on public.alerts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Inspection requests ────────────────────────────────────────────────────
create table public.inspection_requests (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references public.properties(id) on delete cascade,
  buyer_id      uuid not null,
  seller_id     uuid not null,
  preferred_at  timestamptz,
  message       text,
  status        text not null default 'pending',
  created_at    timestamptz not null default now()
);

alter table public.inspection_requests enable row level security;
create policy "buyer reads own inspections" on public.inspection_requests for select using (auth.uid() = buyer_id);
create policy "seller reads received inspections" on public.inspection_requests for select using (auth.uid() = seller_id);
create policy "buyer creates inspections" on public.inspection_requests for insert with check (auth.uid() = buyer_id);
create policy "seller updates inspections" on public.inspection_requests for update using (auth.uid() = seller_id);

-- ── Seller verification submissions ────────────────────────────────────────
create table public.verification_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null,
  full_name       text not null,
  national_id     text,
  document_url    text,
  status          text not null default 'pending',
  reviewer_note   text,
  created_at      timestamptz not null default now(),
  reviewed_at     timestamptz
);

alter table public.verification_requests enable row level security;
create policy "users read own verification" on public.verification_requests for select using (auth.uid() = user_id);
create policy "users submit verification" on public.verification_requests for insert with check (auth.uid() = user_id);
create policy "admins read all verifications" on public.verification_requests for select
  using (public.has_role(auth.uid(), 'admin'));
create policy "admins update verifications" on public.verification_requests for update
  using (public.has_role(auth.uid(), 'admin'));

-- ── Market price snapshots (per city + kind) ───────────────────────────────
create table public.market_prices (
  id              uuid primary key default gen_random_uuid(),
  city            text not null,
  property_kind   public.property_kind not null,
  median_price_m2 numeric not null,
  yoy_change_pct  numeric,
  sample_size     int,
  snapshot_date   date not null default current_date,
  unique (city, property_kind, snapshot_date)
);

alter table public.market_prices enable row level security;
create policy "market prices public" on public.market_prices for select using (true);
create policy "admins manage market prices" on public.market_prices for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Seed a few rows so Market Prices page isn't empty
insert into public.market_prices (city, property_kind, median_price_m2, yoy_change_pct, sample_size) values
  ('Baghdad','house', 1200, 8.4, 320),
  ('Baghdad','apartment', 1450, 6.1, 210),
  ('Baghdad','land', 850, 12.0, 140),
  ('Erbil','house', 1100, 5.5, 180),
  ('Erbil','apartment', 1320, 4.2, 120),
  ('Basra','house', 980, 7.2, 95),
  ('Mosul','house', 720, 9.8, 65),
  ('Najaf','land', 640, 11.5, 80);
