-- =====================================================================
-- RoomSplits Phase 8C Database Schema Migration
-- Defines core student accommodation marketplace tables with strict RLS.
-- =====================================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- =====================================================================
-- 1. PROFILES TABLE
-- Extends auth.users with student/owner profile fields.
-- Role escalation is strictly prevented via a database trigger.
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'owner', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Profiles RLS Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Function & Trigger: Prevent users from self-assigning 'owner' or 'admin' roles
create or replace function public.prevent_profile_role_escalation()
returns trigger as $$
begin
  if new.role <> old.role and auth.role() <> 'service_role' then
    if not exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    ) then
      raise exception 'Unauthorized: Users cannot modify their account role.';
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_prevent_profile_role_escalation on public.profiles;
create trigger tr_prevent_profile_role_escalation
  before update on public.profiles
  for each row
  execute function public.prevent_profile_role_escalation();

-- Function & Trigger: Automatically create public.profiles row on auth.users signup
create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Student Explorer'),
    'student' -- Always default to 'student' to prevent client payload manipulation
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- =====================================================================
-- 2. OWNERS TABLE
-- Verified partner accounts managing student properties.
-- =====================================================================
create table if not exists public.owners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  business_name text not null,
  phone text not null,
  whatsapp text,
  primary_city text not null check (primary_city in ('Ranchi', 'Dhanbad', 'Jamshedpur', 'Bokaro', 'Hazaribagh')),
  is_verified boolean not null default false,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.owners enable row level security;

create policy "Owners can view their own profile"
  on public.owners for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Authenticated users can register as owner"
  on public.owners for insert
  with check (auth.uid() = user_id);

create policy "Owners can update their own details"
  on public.owners for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trigger: Prevent owners from verifying themselves
create or replace function public.protect_owner_verification()
returns trigger as $$
begin
  if (new.is_verified <> old.is_verified or new.verification_status <> old.verification_status)
     and auth.role() <> 'service_role' then
    if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
      new.is_verified = old.is_verified;
      new.verification_status = old.verification_status;
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_protect_owner_verification on public.owners;
create trigger tr_protect_owner_verification
  before update on public.owners
  for each row
  execute function public.protect_owner_verification();

-- =====================================================================
-- 3. PROPERTIES TABLE
-- Public accommodation listings across Jharkhand hubs.
-- Sensitive exact address and owner contacts are kept in a separate table.
-- =====================================================================
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.owners(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text not null,
  category text not null default 'pg' check (category in ('pg', 'hostel', 'coliving')),
  gender_policy text not null default 'boys' check (gender_policy in ('boys', 'girls', 'co-ed')),
  city text not null check (city in ('Ranchi', 'Dhanbad', 'Jamshedpur', 'Bokaro', 'Hazaribagh')),
  locality text not null,
  starting_price numeric(10,2) not null check (starting_price > 0),
  security_deposit numeric(10,2) check (security_deposit >= 0),
  cover_image text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_properties_city on public.properties(city);
create index if not exists idx_properties_locality on public.properties(locality);
create index if not exists idx_properties_status on public.properties(status);
create index if not exists idx_properties_price on public.properties(starting_price);
create index if not exists idx_properties_gender on public.properties(gender_policy);
create index if not exists idx_properties_owner on public.properties(owner_id);

alter table public.properties enable row level security;

-- Public can view published listings; Owners can view all their listings
create policy "Anyone can view published properties"
  on public.properties for select
  using (
    status = 'published' or
    owner_id in (select id from public.owners where user_id = auth.uid()) or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Owners can insert properties"
  on public.properties for insert
  with check (
    owner_id in (select id from public.owners where user_id = auth.uid())
  );

create policy "Owners can update their own properties"
  on public.properties for update
  using (
    owner_id in (select id from public.owners where user_id = auth.uid())
  )
  with check (
    owner_id in (select id from public.owners where user_id = auth.uid())
  );

create policy "Owners can delete their own properties"
  on public.properties for delete
  using (
    owner_id in (select id from public.owners where user_id = auth.uid())
  );

-- =====================================================================
-- 4. PROPERTY PRIVATE DETAILS TABLE
-- Exact house address, host phone number & visit instructions.
-- Strictly hidden from public queries; revealed only to the owner or
-- students with confirmed physical visit requests.
-- =====================================================================
create table if not exists public.property_private_details (
  property_id uuid primary key references public.properties(id) on delete cascade,
  exact_address text not null,
  landmark_details text,
  latitude numeric(10, 6),
  longitude numeric(10, 6),
  contact_phone text not null,
  contact_whatsapp text,
  visit_instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.property_private_details enable row level security;

-- Private details policy: Owner or Admin access
create policy "Owners can view private details of their properties"
  on public.property_private_details for select
  using (
    property_id in (
      select id from public.properties
      where owner_id in (select id from public.owners where user_id = auth.uid())
    ) or exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Owners can insert private details for their properties"
  on public.property_private_details for insert
  with check (
    property_id in (
      select id from public.properties
      where owner_id in (select id from public.owners where user_id = auth.uid())
    )
  );

create policy "Owners can update private details for their properties"
  on public.property_private_details for update
  using (
    property_id in (
      select id from public.properties
      where owner_id in (select id from public.owners where user_id = auth.uid())
    )
  )
  with check (
    property_id in (
      select id from public.properties
      where owner_id in (select id from public.owners where user_id = auth.uid())
    )
  );

-- =====================================================================
-- 5. ROOMS TABLE
-- Sharing configurations, bed capacities, pricing & amenities per room.
-- =====================================================================
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  sharing_type text not null check (sharing_type in ('single', 'double', 'triple', 'four_plus')),
  monthly_rent numeric(10,2) not null check (monthly_rent > 0),
  security_deposit numeric(10,2) check (security_deposit >= 0),
  total_beds integer not null default 1 check (total_beds > 0),
  available_beds integer not null default 1 check (available_beds >= 0 and available_beds <= total_beds),
  has_attached_bathroom boolean not null default false,
  has_balcony boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_rooms_property on public.rooms(property_id);
create index if not exists idx_rooms_sharing on public.rooms(sharing_type);
create index if not exists idx_rooms_rent on public.rooms(monthly_rent);

alter table public.rooms enable row level security;

create policy "Anyone can view rooms of published properties"
  on public.rooms for select
  using (
    property_id in (select id from public.properties where status = 'published') or
    property_id in (
      select id from public.properties
      where owner_id in (select id from public.owners where user_id = auth.uid())
    )
  );

create policy "Owners can insert rooms for their properties"
  on public.rooms for insert
  with check (
    property_id in (
      select id from public.properties
      where owner_id in (select id from public.owners where user_id = auth.uid())
    )
  );

create policy "Owners can update rooms for their properties"
  on public.rooms for update
  using (
    property_id in (
      select id from public.properties
      where owner_id in (select id from public.owners where user_id = auth.uid())
    )
  )
  with check (
    property_id in (
      select id from public.properties
      where owner_id in (select id from public.owners where user_id = auth.uid())
    )
  );

create policy "Owners can delete rooms for their properties"
  on public.rooms for delete
  using (
    property_id in (
      select id from public.properties
      where owner_id in (select id from public.owners where user_id = auth.uid())
    )
  );

-- =====================================================================
-- 6. PROPERTY IMAGES TABLE
-- Photo gallery images per accommodation.
-- =====================================================================
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  image_url text not null,
  caption text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_property_images_property on public.property_images(property_id);

alter table public.property_images enable row level security;

create policy "Anyone can view images of published properties"
  on public.property_images for select
  using (
    property_id in (select id from public.properties where status = 'published') or
    property_id in (
      select id from public.properties
      where owner_id in (select id from public.owners where user_id = auth.uid())
    )
  );

create policy "Owners can manage property images"
  on public.property_images for all
  using (
    property_id in (
      select id from public.properties
      where owner_id in (select id from public.owners where user_id = auth.uid())
    )
  );

-- =====================================================================
-- 7. AMENITIES & PROPERTY_AMENITIES TABLES
-- Standardized amenity dictionary and per-property relations.
-- =====================================================================
create table if not exists public.amenities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text,
  icon text,
  created_at timestamptz not null default now()
);

alter table public.amenities enable row level security;

create policy "Amenities are viewable by everyone"
  on public.amenities for select
  using (true);

-- Seed standardized Jharkhand PG amenities
insert into public.amenities (name, category, icon)
values
  ('High-Speed Wi-Fi', 'connectivity', 'Wifi'),
  ('3x Daily Meals', 'food', 'Utensils'),
  ('Power Backup', 'utilities', 'Zap'),
  ('Attached Bathroom', 'comfort', 'Bath'),
  ('Daily Housekeeping', 'services', 'Sparkles'),
  ('CCTV & 24/7 Security', 'security', 'Shield'),
  ('Study Table & Chair', 'furniture', 'BookOpen'),
  ('Laundry / Washing Machine', 'services', 'Shirt'),
  ('RO Drinking Water', 'utilities', 'Droplets'),
  ('AC in Rooms', 'comfort', 'Wind')
on conflict (name) do nothing;

create table if not exists public.property_amenities (
  property_id uuid not null references public.properties(id) on delete cascade,
  amenity_id uuid not null references public.amenities(id) on delete cascade,
  primary key (property_id, amenity_id)
);

create index if not exists idx_property_amenities_prop on public.property_amenities(property_id);
create index if not exists idx_property_amenities_amenity on public.property_amenities(amenity_id);

alter table public.property_amenities enable row level security;

create policy "Anyone can view amenities of published properties"
  on public.property_amenities for select
  using (
    property_id in (select id from public.properties where status = 'published') or
    property_id in (
      select id from public.properties
      where owner_id in (select id from public.owners where user_id = auth.uid())
    )
  );

create policy "Owners can manage property amenities"
  on public.property_amenities for all
  using (
    property_id in (
      select id from public.properties
      where owner_id in (select id from public.owners where user_id = auth.uid())
    )
  );

-- =====================================================================
-- 8. SAVED PROPERTIES (SHORTLIST) TABLE
-- Student shortlisted properties for cross-device persistence.
-- =====================================================================
create table if not exists public.saved_properties (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_id, property_id)
);

create index if not exists idx_saved_student on public.saved_properties(student_id);

alter table public.saved_properties enable row level security;

create policy "Students can view their own saved properties"
  on public.saved_properties for select
  using (auth.uid() = student_id);

create policy "Students can save properties"
  on public.saved_properties for insert
  with check (auth.uid() = student_id);

create policy "Students can remove saved properties"
  on public.saved_properties for delete
  using (auth.uid() = student_id);

-- =====================================================================
-- 9. VISITS TABLE
-- Student physical visit appointments and walkthrough scheduling.
-- =====================================================================
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  student_id uuid not null references public.profiles(id) on delete cascade,
  preferred_date date not null,
  preferred_time_slot text not null check (preferred_time_slot in ('morning', 'afternoon', 'evening')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined', 'cancelled', 'completed')),
  notes text,
  host_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_visits_student on public.visits(student_id);
create index if not exists idx_visits_property on public.visits(property_id);
create index if not exists idx_visits_status on public.visits(status);

alter table public.visits enable row level security;

create policy "Students and Owners can view their relevant visits"
  on public.visits for select
  using (
    student_id = auth.uid() or
    property_id in (
      select id from public.properties
      where owner_id in (select id from public.owners where user_id = auth.uid())
    ) or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Students can schedule visits"
  on public.visits for insert
  with check (auth.uid() = student_id);

create policy "Students can cancel their own visits"
  on public.visits for update
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id and status = 'cancelled');

create policy "Owners can update visit statuses for their properties"
  on public.visits for update
  using (
    property_id in (
      select id from public.properties
      where owner_id in (select id from public.owners where user_id = auth.uid())
    )
  )
  with check (
    property_id in (
      select id from public.properties
      where owner_id in (select id from public.owners where user_id = auth.uid())
    )
  );

-- ============================================================================
-- CROSS-TABLE POLICIES (Dependent on visits table)
-- ============================================================================

-- Private details policy: Student with confirmed visit can view property contact and address
create policy "Students with confirmed visit can view property contact and address"
  on public.property_private_details for select
  using (
    exists (
      select 1 from public.visits
      where visits.property_id = property_private_details.property_id
        and visits.student_id = auth.uid()
        and visits.status = 'confirmed'
    )
  );

