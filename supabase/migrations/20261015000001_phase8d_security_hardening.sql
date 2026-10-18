-- ============================================================================
-- RoomSplits — Phase 8D Security Hardening & Authorization Fixes
-- Migration: 20261015000001_phase8d_security_hardening.sql
-- ============================================================================

-- 1. FIX FUNCTION SEARCH PATH (Eliminates mutable search_path vulnerability)
-- ----------------------------------------------------------------------------
alter function public.handle_new_auth_user() set search_path = public, auth;
alter function public.prevent_profile_role_escalation() set search_path = public, auth;
alter function public.protect_owner_verification() set search_path = public, auth;

-- 2. REVOKE DIRECT RPC EXECUTION PRIVILEGES ON TRIGGER FUNCTIONS
-- Prevents anon and authenticated users from calling internal trigger functions
-- via PostgREST RPC endpoints (/rest/v1/rpc/<function_name>)
-- ----------------------------------------------------------------------------
revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;
revoke execute on function public.prevent_profile_role_escalation() from public, anon, authenticated;
revoke execute on function public.protect_owner_verification() from public, anon, authenticated;

-- 3. CLOSE ROLE ESCALATION VECTOR ON PROFILE INSERT
-- Ensure users cannot provide role = 'admin' or 'owner' in INSERT payloads
-- ----------------------------------------------------------------------------
create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if TG_OP = 'INSERT' then
    -- On INSERT, force role to 'student' unless called by service_role or admin
    if new.role <> 'student' and auth.role() <> 'service_role' then
      if not exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
      ) then
        new.role = 'student';
      end if;
    end if;
  elsif TG_OP = 'UPDATE' then
    -- On UPDATE, users cannot modify their own role
    if new.role <> old.role and auth.role() <> 'service_role' then
      if not exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
      ) then
        raise exception 'Unauthorized: Users cannot modify their account role.';
      end if;
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;

-- Upgrade trigger to fire BEFORE INSERT OR UPDATE
drop trigger if exists tr_prevent_profile_role_escalation on public.profiles;
create trigger tr_prevent_profile_role_escalation
  before insert or update on public.profiles
  for each row
  execute function public.prevent_profile_role_escalation();

-- 4. FIX VISIT FORGERY VULNERABILITY ON VISITS INSERT
-- Prevent students from creating visits with status = 'confirmed' to illegally unlock private property details
-- ----------------------------------------------------------------------------
drop policy if exists "Students can schedule visits" on public.visits;
create policy "Students can schedule visits"
  on public.visits for insert
  with check (
    auth.uid() = student_id
    and status = 'pending'
  );

-- 5. DEFENSE-IN-DEPTH PRIVILEGE RESTRICTION FOR ANON ROLE
-- Anonymous users should never have INSERT/UPDATE/DELETE privileges on sensitive tables
-- ----------------------------------------------------------------------------
revoke insert, update, delete, truncate on table public.property_private_details from anon;
revoke insert, update, delete, truncate on table public.owners from anon;
revoke insert, update, delete, truncate on table public.saved_properties from anon;
revoke insert, update, delete, truncate on table public.visits from anon;
revoke insert, update, delete, truncate on table public.properties from anon;
revoke insert, update, delete, truncate on table public.rooms from anon;
revoke insert, update, delete, truncate on table public.property_images from anon;
revoke insert, update, delete, truncate on table public.property_amenities from anon;
