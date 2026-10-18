-- Migration: 20261017000000_create_property_images_storage.sql
-- Create dedicated public bucket for property images and configure RLS policies

-- 1. Create the 'property-images' bucket if it doesn't already exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- 2. Drop existing policies if any to ensure clean idempotent application
drop policy if exists "Public Access to Property Images" on storage.objects;
drop policy if exists "Owners can upload property images" on storage.objects;
drop policy if exists "Owners can update property images" on storage.objects;
drop policy if exists "Owners can delete property images" on storage.objects;

-- 3. Policy: Anyone can view/download public property images
create policy "Public Access to Property Images"
  on storage.objects for select
  using (bucket_id = 'property-images');

-- 4. Policy: Owners can upload images to their own property folder: {property_id}/{image_file}
create policy "Owners can upload property images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'property-images'
    and exists (
      select 1 from public.properties p
      join public.owners o on p.owner_id = o.id
      where o.user_id = auth.uid()
        and p.id::text = split_part(name, '/', 1)
    )
  );

-- 5. Policy: Owners can update images in their own property folder
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
  );

-- 6. Policy: Owners can delete images from their own property folder
create policy "Owners can delete property images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'property-images'
    and exists (
      select 1 from public.properties p
      join public.owners o on p.owner_id = o.id
      where o.user_id = auth.uid()
        and p.id::text = split_part(name, '/', 1)
    )
  );
