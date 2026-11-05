-- supabase/portafolio.sql
-- Los videos de webbonding.net/portafolio. Va en el mismo proyecto Supabase que los leads (el r4-cuentas nuevo, el de
-- VITE_R4_SUPABASE_URL). Se aplica con la API de administración (POST /v1/projects/<ref>/database/query) o pegándolo en
-- el SQL Editor. Se puede correr de nuevo sin romper nada.
--
-- Cada video es una publicación de Instagram (reel o post) que la página muestra embebida: aquí solo van su código, los
-- textos de su tarjeta y su portada. Williams los carga uno por uno en webbonding.net/admin/portafolio.
--  · la página solo puede llamar public.ver_portafolio(), que devuelve los visibles en su orden;
--  · agregar, cambiar, ordenar, ocultar y quitar es solo del rol 'admin' (public.es_admin(), de r4-cuentas);
--  · las portadas van en el bucket público «portafolio»: las ve cualquiera, y solo el admin las sube o las borra.

create schema if not exists web_bonding;
revoke all on schema web_bonding from public, anon, authenticated;
grant usage on schema web_bonding to service_role;

create table if not exists web_bonding.portafolio (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  codigo      text not null unique check (codigo ~ '^[A-Za-z0-9_-]{5,64}$'), -- el de instagram.com/reel/<código>/
  titulo      text not null check (length(titulo) between 1 and 80),
  tipo        text check (length(tipo) <= 120),                               -- la línea de abajo: «Reel · Día 1»
  etiqueta    text not null check (length(etiqueta) between 1 and 30),        -- «App + video» sale también en el Plus
  descripcion text check (length(descripcion) <= 600),
  duracion    text check (duracion ~ '^[0-9]{1,2}:[0-5][0-9]$'),
  -- una de /img/portafolio (las que trae la web) o una del bucket «portafolio» de este proyecto
  portada     text check (portada ~ '^/img/portafolio/[A-Za-z0-9._-]+$'
                       or portada ~ '^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/portafolio/[A-Za-z0-9._-]+$'),
  orden       integer not null default 0,
  visible     boolean not null default true
);
comment on table web_bonding.portafolio is 'Videos de webbonding.net/portafolio. Se cargan en /admin/portafolio. Ver WebBonding/supabase/portafolio.sql';

-- RLS sin políticas: por la API solo se entra con las funciones de abajo
alter table web_bonding.portafolio enable row level security;
revoke all on web_bonding.portafolio from public, anon, authenticated;
grant all on web_bonding.portafolio to service_role;

create index if not exists portafolio_orden on web_bonding.portafolio (orden, created_at);

-- el que ya estaba en la página (Revísalo, Día 1 de «Haciendo una app por día»), solo si la tabla está vacía
insert into web_bonding.portafolio (codigo, titulo, tipo, etiqueta, descripcion, duracion, portada, orden)
select 'DfUxMfRvkuR', 'Revísalo', 'Reel · Haciendo una app por día, Día 1', 'App + video',
       'Para revisar un carro usado antes de comprarlo: la app te guía punto por punto y te dice si te están pidiendo de más. La hicimos en un día y la contamos en este reel.',
       '1:34', '/img/portafolio/una-app-por-dia-1.webp', 1
where not exists (select 1 from web_bonding.portafolio);

-- ── La página ───────────────────────────────────────────────────────────────────────────────────────────────

create or replace function public.ver_portafolio()
returns table (codigo text, titulo text, tipo text, etiqueta text, descripcion text, duracion text, portada text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.codigo, p.titulo, p.tipo, p.etiqueta, p.descripcion, p.duracion, p.portada
    from web_bonding.portafolio p
   where p.visible
   order by p.orden, p.created_at;
$$;

revoke all on function public.ver_portafolio() from public;
grant execute on function public.ver_portafolio() to anon, authenticated;

-- ── El panel /admin/portafolio ──────────────────────────────────────────────────────────────────────────────
-- Para los usuarios con rol 'admin' en public.perfiles. Sin sesión no se pueden llamar; con sesión pero sin ese rol,
-- responden «No autorizado».

create or replace function public.portafolio_admin()
returns setof web_bonding.portafolio
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  return query select * from web_bonding.portafolio p order by p.orden, p.created_at;
end $$;

-- agrega (p_id null, al final de la lista) o cambia un video. El enlace va tal cual lo comparte Instagram
-- (…/reel/<código>/?igsh=…, …/p/<código>/) o el código solo. Devuelve el id.
create or replace function public.guardar_video(
  p_id          uuid,
  p_enlace      text,
  p_titulo      text,
  p_etiqueta    text,
  p_tipo        text    default null,
  p_descripcion text    default null,
  p_duracion    text    default null,
  p_portada     text    default null,
  p_visible     boolean default true
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_enlace text := btrim(coalesce(p_enlace, ''));
  v_codigo text := coalesce(substring(v_enlace from '/(?:reels?|p|tv)/([A-Za-z0-9_-]+)'), v_enlace);
  v_id     uuid;
begin
  if not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if v_codigo !~ '^[A-Za-z0-9_-]{5,64}$' then
    raise exception 'Ese enlace no es de una publicación de Instagram' using errcode = '22023';
  end if;

  if p_id is null then
    insert into web_bonding.portafolio (codigo, titulo, tipo, etiqueta, descripcion, duracion, portada, visible, orden)
    values (v_codigo, btrim(p_titulo), nullif(btrim(p_tipo), ''), btrim(p_etiqueta), nullif(btrim(p_descripcion), ''),
            nullif(btrim(p_duracion), ''), nullif(btrim(p_portada), ''), coalesce(p_visible, true),
            coalesce((select max(x.orden) from web_bonding.portafolio x), 0) + 1)
    returning id into v_id;
  else
    update web_bonding.portafolio
       set codigo = v_codigo, titulo = btrim(p_titulo), tipo = nullif(btrim(p_tipo), ''), etiqueta = btrim(p_etiqueta),
           descripcion = nullif(btrim(p_descripcion), ''), duracion = nullif(btrim(p_duracion), ''),
           portada = nullif(btrim(p_portada), ''), visible = coalesce(p_visible, true), updated_at = now()
     where id = p_id
    returning id into v_id;
    if v_id is null then
      raise exception 'Ese video ya no está en el portafolio' using errcode = 'P0002';
    end if;
  end if;
  return v_id;
end $$;

-- mostrar u ocultar sin tocar lo demás
create or replace function public.mostrar_video(p_id uuid, p_visible boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  update web_bonding.portafolio set visible = coalesce(p_visible, true), updated_at = now() where id = p_id;
end $$;

-- el orden de la página: los ids en el orden en que salen
create or replace function public.ordenar_portafolio(p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  update web_bonding.portafolio p
     set orden = o.n, updated_at = now()
    from unnest(p_ids) with ordinality as o(id, n)
   where p.id = o.id;
end $$;

-- lo saca del portafolio; el video sigue en Instagram. La portada del bucket la borra el panel.
create or replace function public.quitar_video(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  delete from web_bonding.portafolio where id = p_id;
end $$;

revoke all on function public.portafolio_admin() from public, anon;
grant execute on function public.portafolio_admin() to authenticated;
revoke all on function public.guardar_video(uuid, text, text, text, text, text, text, text, boolean) from public, anon;
grant execute on function public.guardar_video(uuid, text, text, text, text, text, text, text, boolean) to authenticated;
revoke all on function public.mostrar_video(uuid, boolean) from public, anon;
grant execute on function public.mostrar_video(uuid, boolean) to authenticated;
revoke all on function public.ordenar_portafolio(uuid[]) from public, anon;
grant execute on function public.ordenar_portafolio(uuid[]) to authenticated;
revoke all on function public.quitar_video(uuid) from public, anon;
grant execute on function public.quitar_video(uuid) to authenticated;

-- ── Las portadas ────────────────────────────────────────────────────────────────────────────────────────────
-- Bucket público: cada portada se ve por su enlace sin sesión. Subir y borrar, solo el admin (borrar también pide poder
-- verlas por la API). El panel las sube ya recortadas a 540x960 y con nombre nuevo cada vez, así que no hace falta
-- reemplazar.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portafolio', 'portafolio', true, 1048576, array['image/webp', 'image/jpeg'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists portafolio_ver on storage.objects;
drop policy if exists portafolio_subir on storage.objects;
drop policy if exists portafolio_borrar on storage.objects;
create policy portafolio_ver    on storage.objects for select to authenticated using (bucket_id = 'portafolio' and public.es_admin());
create policy portafolio_subir  on storage.objects for insert to authenticated with check (bucket_id = 'portafolio' and public.es_admin());
create policy portafolio_borrar on storage.objects for delete to authenticated using (bucket_id = 'portafolio' and public.es_admin());
