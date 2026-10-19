-- =====================================================================
-- Second Serve — Supabase schema v2.0
-- Run ONCE in: Supabase Dashboard → SQL Editor → New query → Run
-- Use a FRESH project (enums/tables are not idempotent).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. ENUMS
-- ---------------------------------------------------------------------
create type public.user_role          as enum ('user', 'volunteer', 'admin');
create type public.pickup_status      as enum ('reported', 'assigned', 'collected', 'delivered', 'cancelled');
create type public.food_type          as enum ('veg', 'non_veg', 'both');
create type public.volunteer_role     as enum ('food_hero', 'shelter_coordinator', 'event_volunteer', 'social_media');
create type public.application_status as enum ('pending', 'approved', 'rejected');
create type public.contact_subject    as enum ('partnership', 'csr', 'media', 'general');

-- ---------------------------------------------------------------------
-- 2. HELPER FUNCTIONS
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. PROFILES (1 row per auth user; role lives here)
-- ---------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null default '',
  email      text,
  phone      text check (phone is null or phone ~ '^[6-9][0-9]{9}$'),
  role       public.user_role not null default 'user',
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "profiles_select_own"   on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "profiles_select_admin" on public.profiles for select to authenticated
  using (public.is_admin());
create policy "profiles_update_own"   on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Users may edit ONLY name + phone. They can never change their own role.
revoke update on public.profiles from authenticated, anon;
grant  update (full_name, phone) on public.profiles to authenticated;

-- ---------------------------------------------------------------------
-- 4. PICKUP REQUESTS (the core table)
-- ---------------------------------------------------------------------
create sequence public.pickup_ref_seq start 1001;

create table public.pickup_requests (
  id                 uuid primary key default gen_random_uuid(),
  reference_id       text not null unique
                       default ('SS-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.pickup_ref_seq')::text, 4, '0')),
  user_id            uuid references auth.users(id) on delete set null,   -- null = guest submission
  contact_name       text not null check (char_length(contact_name) between 2 and 100),
  phone              text not null check (phone ~ '^[6-9][0-9]{9}$'),
  organisation       text not null check (char_length(organisation) between 2 and 150),
  pickup_address     text not null check (char_length(pickup_address) between 5 and 300),
  city               text not null check (city in ('Delhi NCR','Mumbai','Bengaluru','Jaipur','Lucknow','Patna')),
  food_type          public.food_type not null,
  quantity_people    int  not null check (quantity_people between 10 and 5000),
  pickup_time        timestamptz not null,
  notes              text check (notes is null or char_length(notes) <= 500),
  status             public.pickup_status not null default 'reported',
  assigned_volunteer uuid references auth.users(id) on delete set null,
  delivered_to       text check (delivered_to in ('night_shelter','community_kitchen','slum_kitchen')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index pickup_requests_status_idx   on public.pickup_requests (status, created_at desc);
create index pickup_requests_user_idx     on public.pickup_requests (user_id);
create index pickup_requests_assigned_idx on public.pickup_requests (assigned_volunteer);

create trigger trg_pickup_updated_at
  before update on public.pickup_requests
  for each row execute function public.set_updated_at();

-- "Pickup time must be in the future" is enforced on INSERT only
-- (a CHECK with now() would break later status updates).
create or replace function public.validate_pickup_time()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.pickup_time <= now() then
    raise exception 'Pickup time must be in the future' using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger trg_pickup_future
  before insert on public.pickup_requests
  for each row execute function public.validate_pickup_time();

alter table public.pickup_requests enable row level security;

-- No INSERT policy on purpose: guests and users submit through submit_pickup() below.
create policy "pickups_select_own"      on public.pickup_requests for select to authenticated
  using (user_id = (select auth.uid()));
create policy "pickups_select_assigned" on public.pickup_requests for select to authenticated
  using (assigned_volunteer = (select auth.uid()));
create policy "pickups_select_admin"    on public.pickup_requests for select to authenticated
  using (public.is_admin());
create policy "pickups_update_admin"    on public.pickup_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---- RPC: submit a pickup (works for guests AND logged-in users) ----
create or replace function public.submit_pickup(
  p_name         text,
  p_phone        text,
  p_organisation text,
  p_address      text,
  p_city         text,
  p_food_type    public.food_type,
  p_quantity     int,
  p_pickup_time  timestamptz,
  p_notes        text default null
) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_ref text;
begin
  insert into public.pickup_requests
    (user_id, contact_name, phone, organisation, pickup_address, city,
     food_type, quantity_people, pickup_time, notes)
  values
    ((select auth.uid()), trim(p_name), trim(p_phone), trim(p_organisation), trim(p_address), p_city,
     p_food_type, p_quantity, p_pickup_time, nullif(trim(coalesce(p_notes, '')), ''))
  returning reference_id into v_ref;
  return v_ref;
end;
$$;

-- ---- RPC: public tracking by reference ID + phone (no account needed) ----
create or replace function public.track_pickup(p_ref text, p_phone text)
returns table (
  reference_id text,
  status       public.pickup_status,
  organisation text,
  city         text,
  pickup_time  timestamptz,
  updated_at   timestamptz
)
language sql stable security definer set search_path = '' as $$
  select r.reference_id, r.status, r.organisation, r.city, r.pickup_time, r.updated_at
  from public.pickup_requests r
  where r.reference_id = upper(trim(p_ref))
    and r.phone = trim(p_phone);
$$;

-- ---- RPC: assigned volunteer moves a pickup forward ----
create or replace function public.volunteer_update_status(
  p_id           uuid,
  p_status       public.pickup_status,
  p_delivered_to text default null
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v public.pickup_requests;
begin
  select * into v from public.pickup_requests
  where id = p_id and assigned_volunteer = (select auth.uid());

  if not found then
    raise exception 'This pickup is not assigned to you' using errcode = '42501';
  end if;

  if not ((v.status = 'assigned'  and p_status = 'collected')
       or (v.status = 'collected' and p_status = 'delivered')) then
    raise exception 'Invalid status change' using errcode = '22023';
  end if;

  if p_status = 'delivered'
     and (p_delivered_to is null
          or p_delivered_to not in ('night_shelter','community_kitchen','slum_kitchen')) then
    raise exception 'Delivery destination is required' using errcode = '22023';
  end if;

  update public.pickup_requests
     set status       = p_status,
         delivered_to = case when p_status = 'delivered' then p_delivered_to else delivered_to end
   where id = p_id;
end;
$$;

-- ---------------------------------------------------------------------
-- 5. VOLUNTEER APPLICATIONS
-- ---------------------------------------------------------------------
create table public.volunteer_applications (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete set null,
  full_name      text not null check (char_length(full_name) between 2 and 100),
  email          text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone          text not null check (phone ~ '^[6-9][0-9]{9}$'),
  city           text not null check (city in ('Delhi NCR','Mumbai','Bengaluru','Jaipur','Lucknow','Patna')),
  preferred_role public.volunteer_role not null,
  availability   text[] not null
                   check (cardinality(availability) >= 1
                          and availability <@ array['weekdays','weekends','evenings']),
  motivation     text check (motivation is null or char_length(motivation) <= 500),
  status         public.application_status not null default 'pending',
  created_at     timestamptz not null default now()
);

alter table public.volunteer_applications enable row level security;

create policy "vol_insert_public" on public.volunteer_applications for insert to anon, authenticated
  with check (status = 'pending' and user_id is not distinct from (select auth.uid()));
create policy "vol_select_own"    on public.volunteer_applications for select to authenticated
  using (user_id = (select auth.uid()));
create policy "vol_select_admin"  on public.volunteer_applications for select to authenticated
  using (public.is_admin());
create policy "vol_update_admin"  on public.volunteer_applications for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---- RPC: admin approves/rejects; approval promotes the matching account to 'volunteer' ----
create or replace function public.review_volunteer_application(p_id uuid, p_approve boolean)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  a public.volunteer_applications;
begin
  if not public.is_admin() then
    raise exception 'Admins only' using errcode = '42501';
  end if;

  select * into a from public.volunteer_applications where id = p_id;
  if not found then
    raise exception 'Application not found' using errcode = 'P0002';
  end if;

  update public.volunteer_applications
     set status = case when p_approve then 'approved'::public.application_status
                       else 'rejected'::public.application_status end
   where id = p_id;

  if p_approve then
    update public.profiles
       set role = 'volunteer'
     where role = 'user'
       and (id = a.user_id or lower(email) = lower(a.email));
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- 6. CONTACT MESSAGES
-- ---------------------------------------------------------------------
create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete set null,
  full_name  text not null check (char_length(full_name) between 2 and 100),
  email      text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject    public.contact_subject not null,
  message    text not null check (char_length(message) between 20 and 2000),
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "contact_insert_public" on public.contact_messages for insert to anon, authenticated
  with check (is_read = false and user_id is not distinct from (select auth.uid()));
create policy "contact_select_admin"  on public.contact_messages for select to authenticated
  using (public.is_admin());
create policy "contact_update_admin"  on public.contact_messages for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 7. NEWSLETTER SUBSCRIBERS
-- ---------------------------------------------------------------------
create table public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);
create unique index newsletter_email_uniq on public.newsletter_subscribers (lower(email));

alter table public.newsletter_subscribers enable row level security;

create policy "news_insert_public" on public.newsletter_subscribers for insert to anon, authenticated
  with check (true);
create policy "news_select_admin"  on public.newsletter_subscribers for select to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- 8. IMPACT DATA (illustrative baseline + live deliveries)
-- ---------------------------------------------------------------------
create table public.impact_baseline (
  key   text primary key,
  value numeric not null
);
create table public.impact_monthly (
  sort_order  int primary key,
  month_label text not null,
  meals       int  not null
);
create table public.impact_destinations (
  name text primary key,
  pct  int  not null check (pct between 0 and 100)
);

alter table public.impact_baseline     enable row level security;
alter table public.impact_monthly      enable row level security;
alter table public.impact_destinations enable row level security;

create policy "baseline_read"     on public.impact_baseline     for select to anon, authenticated using (true);
create policy "monthly_read"      on public.impact_monthly      for select to anon, authenticated using (true);
create policy "destinations_read" on public.impact_destinations for select to anon, authenticated using (true);

insert into public.impact_baseline (key, value) values
  ('meals_rescued', 320000),   -- illustrative
  ('partners',      210),      -- illustrative
  ('volunteers',    850),      -- illustrative
  ('cities',        6),
  ('kg_per_meal',   0.3);      -- 320000 meals x 0.3 = 96,000 kg

insert into public.impact_monthly (sort_order, month_label, meals) values
  (1,'Nov',5000),(2,'Dec',5500),(3,'Jan',6500),(4,'Feb',7000),
  (5,'Mar',8000),(6,'Apr',9000),(7,'May',9500),(8,'Jun',10500),
  (9,'Jul',11500),(10,'Aug',12500),(11,'Sep',14000),(12,'Oct',15500);

insert into public.impact_destinations (name, pct) values
  ('Night shelters', 45), ('Community kitchens', 30), ('Slum kitchens', 25);

-- Public counters = illustrative baseline + REAL delivered pickups from this database.
create or replace function public.get_impact_stats()
returns json
language sql stable security definer set search_path = '' as $$
  with b as (select key, value from public.impact_baseline),
       d as (
         select coalesce(sum(quantity_people), 0)        as meals,
                count(distinct lower(organisation))      as orgs,
                count(*)                                 as deliveries
         from public.pickup_requests
         where status = 'delivered'
       ),
       v as (select count(*) as n from public.profiles where role = 'volunteer')
  select json_build_object(
    'meals_rescued',       (select value from b where key = 'meals_rescued') + d.meals,
    'food_waste_kg',       round(((select value from b where key = 'meals_rescued') + d.meals)
                                 * (select value from b where key = 'kg_per_meal')),
    'partner_restaurants', (select value from b where key = 'partners') + d.orgs,
    'volunteers',          (select value from b where key = 'volunteers') + v.n,
    'cities',              (select value from b where key = 'cities'),
    'live_deliveries',     d.deliveries
  )
  from d, v;
$$;

-- ---------------------------------------------------------------------
-- 9. FUNCTION PERMISSIONS
-- ---------------------------------------------------------------------
revoke execute on all functions in schema public from public;

grant execute on function public.submit_pickup(text,text,text,text,text,public.food_type,int,timestamptz,text) to anon, authenticated;
grant execute on function public.track_pickup(text,text)                          to anon, authenticated;
grant execute on function public.get_impact_stats()                               to anon, authenticated;
grant execute on function public.volunteer_update_status(uuid,public.pickup_status,text) to authenticated;
grant execute on function public.review_volunteer_application(uuid,boolean)       to authenticated;
grant execute on function public.is_admin()                                       to authenticated;

-- ---------------------------------------------------------------------
-- 10. CREATE YOUR FIRST ADMIN (do this AFTER you sign up on the site)
-- ---------------------------------------------------------------------
-- update public.profiles set role = 'admin' where email = 'your-email@example.com';
