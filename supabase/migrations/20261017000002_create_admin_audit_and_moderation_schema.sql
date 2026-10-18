-- ============================================================================
-- RoomSplits — Phase 14: Secure Admin Dashboard and Platform Management
-- Migration: 20261017000002_create_admin_audit_and_moderation_schema.sql
-- ============================================================================

-- 1. ADD OWNER VERIFICATION AUDIT FIELDS
-- ----------------------------------------------------------------------------
alter table public.owners
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid references public.profiles(id) on delete set null,
  add column if not exists rejection_reason text;

-- 2. CREATE ADMIN AUDIT LOGS TABLE
-- Tracks immutable security audit trail of all sensitive admin actions
-- ----------------------------------------------------------------------------
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  action varchar(100) not null,
  target_type varchar(50) not null,
  target_id varchar(100) not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- Performance and query indexes
create index if not exists idx_admin_audit_logs_admin on public.admin_audit_logs(admin_id);
create index if not exists idx_admin_audit_logs_action on public.admin_audit_logs(action);
create index if not exists idx_admin_audit_logs_target on public.admin_audit_logs(target_type, target_id);
create index if not exists idx_admin_audit_logs_created_at on public.admin_audit_logs(created_at desc);

-- 3. ROW LEVEL SECURITY ON ADMIN AUDIT LOGS
-- ----------------------------------------------------------------------------
alter table public.admin_audit_logs enable row level security;

-- Admins can inspect the security audit trail
drop policy if exists "Admins can view audit logs" on public.admin_audit_logs;
create policy "Admins can view audit logs"
  on public.admin_audit_logs for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Admins can append audit log records
drop policy if exists "Admins can insert audit logs" on public.admin_audit_logs;
create policy "Admins can insert audit logs"
  on public.admin_audit_logs for insert
  with check (
    auth.uid() = admin_id and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Revoke mutation & truncation on audit logs for immutability
revoke update, delete, truncate on table public.admin_audit_logs from public, anon, authenticated;

-- 4. ROW LEVEL SECURITY POLICIES FOR ADMIN OWNER VERIFICATION
-- ----------------------------------------------------------------------------
drop policy if exists "Admins can update owners" on public.owners;
create policy "Admins can update owners"
  on public.owners for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 5. ROW LEVEL SECURITY POLICIES FOR ADMIN PROPERTY MODERATION
-- ----------------------------------------------------------------------------
drop policy if exists "Admins can update properties" on public.properties;
create policy "Admins can update properties"
  on public.properties for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 6. ROW LEVEL SECURITY POLICIES FOR ADMIN PROFILE MANAGEMENT
-- ----------------------------------------------------------------------------
drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
