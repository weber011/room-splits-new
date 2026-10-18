-- Migration: 20261017000001_create_notifications_schema.sql
-- Create in-app notifications table and Row Level Security policies

-- 1. Create notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (
    type in (
      'visit_requested',
      'visit_confirmed',
      'visit_declined',
      'visit_rescheduled',
      'visit_cancelled',
      'visit_completed',
      'system'
    )
  ),
  title text not null,
  message text not null,
  property_id uuid references public.properties(id) on delete set null,
  visit_id uuid references public.visits(id) on delete set null,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- 2. Create performance indexes
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_user_unread on public.notifications(user_id, is_read);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);
create index if not exists idx_notifications_visit_id on public.notifications(visit_id);

-- 3. Enable Row Level Security
alter table public.notifications enable row level security;

-- 4. RLS Policies
-- Users can only read their own notifications
create policy "Users can view own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

-- Users can only update their own notifications (e.g. mark as read)
create policy "Users can update own notifications"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Users can delete their own notifications
create policy "Users can delete own notifications"
  on public.notifications for delete
  to authenticated
  using (user_id = auth.uid());

-- Authenticated users can insert notifications for valid visit participants or themselves
create policy "Authorized insert for visit participants"
  on public.notifications for insert
  to authenticated
  with check (
    user_id = auth.uid()
    or (
      visit_id is not null and exists (
        select 1 from public.visits v
        join public.properties p on v.property_id = p.id
        join public.owners o on p.owner_id = o.id
        where v.id = notifications.visit_id
          and (
            -- Student is auth.uid() notifying owner
            (v.student_id = auth.uid() and notifications.user_id = o.user_id)
            or
            -- Owner is auth.uid() notifying student
            (o.user_id = auth.uid() and notifications.user_id = v.student_id)
          )
      )
    )
  );

-- Revoke all permissions from anon
revoke all on public.notifications from anon;
grant select, insert, update, delete on public.notifications to authenticated;
