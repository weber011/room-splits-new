-- ============================================================================
-- RoomSplits — Phase 15 Security Hardening Migration
-- Migration: 20261017000003_phase15_security_hardening.sql
-- ============================================================================

-- 1. HARDEN STORAGE OBJECTS UPDATE POLICY (Adds WITH CHECK validation)
-- Prevents cross-owner object path tampering or moving files across properties
-- ----------------------------------------------------------------------------
drop policy if exists "Owners can update property images" on storage.objects;
create policy "Owners can update property images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'property-images'
    and exists (
      select 1 from public.properties p
      join public.owners o on p.owner_id = o.id
      where o.user_id = auth.uid()
        and p.id::text = split_part(name, '/', 1)
    )
  )
  with check (
    bucket_id = 'property-images'
    and exists (
      select 1 from public.properties p
      join public.owners o on p.owner_id = o.id
      where o.user_id = auth.uid()
        and p.id::text = split_part(name, '/', 1)
    )
  );

-- 2. ALLOW ADMINISTRATORS TO INSERT SYSTEM NOTIFICATIONS
-- Enables admin moderation workflows (owner KYC approval, property archiving)
-- to dispatch notifications to users without being rejected by RLS
-- ----------------------------------------------------------------------------
drop policy if exists "Admins can insert notifications" on public.notifications;
create policy "Admins can insert notifications"
  on public.notifications for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Admins can view all notifications" on public.notifications;
create policy "Admins can view all notifications"
  on public.notifications for select
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
