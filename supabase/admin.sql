-- supabase/admin.sql
-- El panel /admin de webbonding.net maneja todos los datos: lo que se ve en la web, los leads y el equipo. Va en el mismo
-- proyecto Supabase que leads.sql y portafolio.sql (el r4-cuentas nuevo, el de VITE_R4_SUPABASE_URL) y después de ellos.
-- Se aplica con la API de administración (POST /v1/projects/<ref>/database/query) o pegándolo en el SQL Editor, y se
-- puede correr de nuevo sin romper nada. Lo que la web traía escrito en el código entra con contenido-semilla.sql.
--
--  · web_bonding.contenido: cada lista de la web es una sección (cifras, palabras, servicios, pilares, pasos, proyectos,
--    planes, preguntas, apps, catalogo, ajustes) y cada elemento una fila con sus datos en JSON (los mismos campos que
--    usaba el código), su orden y si se ve. La web solo puede llamar public.ver_contenido(), que trae lo visible de todas
--    las secciones de una vez; crear, cambiar, ordenar, ocultar y borrar es solo del rol 'admin' (public.es_admin()).
--  · las imágenes (capturas de las apps, fotos de los servicios) van en el bucket público «contenido»: las ve cualquiera
--    por su enlace y solo el admin las sube o las borra.
--  · los leads: se cargan a mano (los que llegan por WhatsApp o Instagram), se editan todos sus datos y se borran.
--  · el equipo: el admin ve los usuarios con su rol y se lo cambia (menos el suyo).

create schema if not exists web_bonding;
revoke all on schema web_bonding from public, anon, authenticated;
grant usage on schema web_bonding to service_role;

-- ── El contenido de la web ──────────────────────────────────────────────────────────────────────────────────

create table if not exists web_bonding.contenido (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  seccion    text not null check (seccion ~ '^[a-z_]{2,30}$'),
  datos      jsonb not null default '{}'::jsonb
             check (jsonb_typeof(datos) = 'object' and octet_length(datos::text) <= 20000),
  orden      integer not null default 0,
  visible    boolean not null default true
);
comment on table web_bonding.contenido is 'Lo que se ve en webbonding.net y se cambia en /admin. Ver WebBonding/supabase/admin.sql';

-- RLS sin políticas: por la API solo se entra con las funciones de abajo
alter table web_bonding.contenido enable row level security;
revoke all on web_bonding.contenido from public, anon, authenticated;
grant all on web_bonding.contenido to service_role;

create index if not exists contenido_seccion on web_bonding.contenido (seccion, orden, created_at);

-- la web: lo visible de todas las secciones, en su orden
create or replace function public.ver_contenido()
returns table (seccion text, id uuid, datos jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select c.seccion, c.id, c.datos
    from web_bonding.contenido c
   where c.visible
   order by c.seccion, c.orden, c.created_at;
$$;

revoke all on function public.ver_contenido() from public;
grant execute on function public.ver_contenido() to anon, authenticated;

-- el panel: todo lo de una sección, también lo oculto
create or replace function public.contenido_admin(p_seccion text)
returns setof web_bonding.contenido
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  return query select * from web_bonding.contenido c where c.seccion = p_seccion order by c.orden, c.created_at;
end $$;

-- crea (p_id null; al final de la sección, o en p_orden) o cambia un elemento. Devuelve su id.
create or replace function public.guardar_contenido(
  p_id      uuid,
  p_seccion text,
  p_datos   jsonb,
  p_visible boolean default true,
  p_orden   integer default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if p_datos is null or jsonb_typeof(p_datos) <> 'object' then
    raise exception 'Datos no válidos' using errcode = '22023';
  end if;

  if p_id is null then
    insert into web_bonding.contenido (seccion, datos, visible, orden)
    values (p_seccion, p_datos, coalesce(p_visible, true),
            coalesce(p_orden, coalesce((select max(x.orden) from web_bonding.contenido x where x.seccion = p_seccion), 0) + 1))
    returning id into v_id;
  else
    update web_bonding.contenido
       set datos = p_datos, visible = coalesce(p_visible, true), updated_at = now()
     where id = p_id and seccion = p_seccion
    returning id into v_id;
    if v_id is null then
      raise exception 'Ese elemento ya no existe' using errcode = 'P0002';
    end if;
  end if;
  return v_id;
end $$;

-- mostrar u ocultar uno o varios
create or replace function public.mostrar_contenido(p_ids uuid[], p_visible boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  update web_bonding.contenido set visible = coalesce(p_visible, true), updated_at = now() where id = any(p_ids);
end $$;

-- el orden de una sección: los ids en el orden en que salen
create or replace function public.ordenar_contenido(p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  update web_bonding.contenido c
     set orden = o.n, updated_at = now()
    from unnest(p_ids) with ordinality as o(id, n)
   where c.id = o.id;
end $$;

-- borra uno o varios; devuelve cuántos. Las imágenes del bucket las borra el panel.
create or replace function public.borrar_contenido(p_ids uuid[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_n integer;
begin
  if not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  delete from web_bonding.contenido where id = any(p_ids);
  get diagnostics v_n = row_count;
  return v_n;
end $$;

-- cuántos hay en cada sección (y cuántos se ven), para el menú del panel. El portafolio tiene su propia tabla.
create or replace function public.resumen_contenido()
returns table (seccion text, total bigint, visibles bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  return query
    select c.seccion, count(*), count(*) filter (where c.visible) from web_bonding.contenido c group by c.seccion
    union all
    select 'portafolio'::text, count(*), count(*) filter (where p.visible) from web_bonding.portafolio p;
end $$;

revoke all on function public.contenido_admin(text) from public, anon;
grant execute on function public.contenido_admin(text) to authenticated;
revoke all on function public.guardar_contenido(uuid, text, jsonb, boolean, integer) from public, anon;
grant execute on function public.guardar_contenido(uuid, text, jsonb, boolean, integer) to authenticated;
revoke all on function public.mostrar_contenido(uuid[], boolean) from public, anon;
grant execute on function public.mostrar_contenido(uuid[], boolean) to authenticated;
revoke all on function public.ordenar_contenido(uuid[]) from public, anon;
grant execute on function public.ordenar_contenido(uuid[]) to authenticated;
revoke all on function public.borrar_contenido(uuid[]) from public, anon;
grant execute on function public.borrar_contenido(uuid[]) to authenticated;
revoke all on function public.resumen_contenido() from public, anon;
grant execute on function public.resumen_contenido() to authenticated;

-- las imágenes: el panel las sube ya reducidas (webp) y con nombre nuevo cada vez, así que no hace falta reemplazar
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('contenido', 'contenido', true, 3145728, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists contenido_ver on storage.objects;
drop policy if exists contenido_subir on storage.objects;
drop policy if exists contenido_borrar on storage.objects;
create policy contenido_ver    on storage.objects for select to authenticated using (bucket_id = 'contenido' and public.es_admin());
create policy contenido_subir  on storage.objects for insert to authenticated with check (bucket_id = 'contenido' and public.es_admin());
create policy contenido_borrar on storage.objects for delete to authenticated using (bucket_id = 'contenido' and public.es_admin());

-- ── Los leads: cargarlos a mano, editarlos y borrarlos ──────────────────────────────────────────────────────
-- Un lead que se carga a mano (llegó por WhatsApp, Instagram o un referido) no pasó por el formulario: no aceptó la
-- política en la web y puede no tener correo. origen lo distingue; utm_source dice de dónde llegó.

alter table web_bonding.leads add column if not exists origen text not null default 'formulario';
alter table web_bonding.leads add column if not exists updated_at timestamptz;
alter table web_bonding.leads drop constraint if exists leads_origen_check;
alter table web_bonding.leads add constraint leads_origen_check check (origen in ('formulario', 'manual'));
alter table web_bonding.leads drop constraint if exists leads_acepta_privacidad_check;
alter table web_bonding.leads drop constraint if exists leads_privacidad_check;
alter table web_bonding.leads add constraint leads_privacidad_check check (acepta_privacidad or origen = 'manual');
alter table web_bonding.leads alter column version_politica drop not null;
alter table web_bonding.leads alter column correo drop not null;

-- crea (p_id null) o cambia un lead con los datos de p_datos: nombre, telefono, tipo y, si vienen, correo, adicional,
-- estado, notas, acepta_novedades y utm_source. Lo pueden hacer ventas y admin. Devuelve el id.
create or replace function public.guardar_lead(p_id uuid, p_datos jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id     uuid;
  v_nombre text := btrim(coalesce(p_datos->>'nombre', ''));
  v_tel    text := btrim(coalesce(p_datos->>'telefono', ''));
  v_tipo   text := btrim(coalesce(p_datos->>'tipo', ''));
  v_correo text := nullif(lower(btrim(coalesce(p_datos->>'correo', ''))), '');
  v_estado text := coalesce(nullif(btrim(p_datos->>'estado'), ''), 'nuevo');
  v_fuente text := nullif(lower(btrim(coalesce(p_datos->>'utm_source', ''))), '');
begin
  if not public.es_ventas() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if p_datos is null or jsonb_typeof(p_datos) <> 'object' then
    raise exception 'Datos no válidos' using errcode = '22023';
  end if;
  if length(v_nombre) not between 2 and 120 then
    raise exception 'El nombre va de 2 a 120 letras' using errcode = '22023';
  end if;
  if length(regexp_replace(v_tel, '\D', '', 'g')) not between 7 and 15 or length(v_tel) > 30 then
    raise exception 'Revisa el teléfono: de 7 a 15 números' using errcode = '22023';
  end if;
  if length(v_tipo) not between 1 and 80 then
    raise exception 'Falta qué pide' using errcode = '22023';
  end if;
  if v_correo is not null and (length(v_correo) > 160 or v_correo !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$') then
    raise exception 'Revisa el correo' using errcode = '22023';
  end if;
  if v_estado not in ('nuevo', 'contactado', 'propuesta', 'cliente', 'descartado') then
    raise exception 'Estado no válido' using errcode = '22023';
  end if;

  if p_id is null then
    insert into web_bonding.leads (tipo, nombre, telefono, correo, adicional, acepta_privacidad, acepta_novedades,
                                   version_politica, pagina, origen, estado, notas, utm_source)
    values (v_tipo, v_nombre, v_tel, v_correo, nullif(left(btrim(coalesce(p_datos->>'adicional', '')), 2000), ''), false,
            coalesce((p_datos->>'acepta_novedades')::boolean, false), null, null, 'manual', v_estado,
            nullif(left(btrim(coalesce(p_datos->>'notas', '')), 2000), ''), left(v_fuente, 200))
    returning id into v_id;
  else
    update web_bonding.leads l
       set tipo = v_tipo, nombre = v_nombre, telefono = v_tel, correo = v_correo, estado = v_estado,
           adicional = case when p_datos ? 'adicional' then nullif(left(btrim(coalesce(p_datos->>'adicional', '')), 2000), '') else l.adicional end,
           notas = case when p_datos ? 'notas' then nullif(left(btrim(coalesce(p_datos->>'notas', '')), 2000), '') else l.notas end,
           acepta_novedades = case when p_datos ? 'acepta_novedades' then coalesce((p_datos->>'acepta_novedades')::boolean, false) else l.acepta_novedades end,
           utm_source = case when p_datos ? 'utm_source' then left(v_fuente, 200) else l.utm_source end,
           updated_at = now()
     where l.id = p_id
    returning l.id into v_id;
    if v_id is null then
      raise exception 'Ese lead ya no existe' using errcode = 'P0002';
    end if;
  end if;
  return v_id;
end $$;

-- borra uno o varios leads (solo admin); devuelve cuántos
create or replace function public.borrar_leads(p_ids uuid[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_n integer;
begin
  if not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  delete from web_bonding.leads where id = any(p_ids);
  get diagnostics v_n = row_count;
  return v_n;
end $$;

revoke all on function public.guardar_lead(uuid, jsonb) from public, anon;
grant execute on function public.guardar_lead(uuid, jsonb) to authenticated;
revoke all on function public.borrar_leads(uuid[]) from public, anon;
grant execute on function public.borrar_leads(uuid[]) to authenticated;

-- ── El equipo ───────────────────────────────────────────────────────────────────────────────────────────────
-- Los usuarios son los de Supabase Auth de este proyecto (los mismos de R4, /leads y el cotizador). El rol vive en
-- public.perfiles: 'admin' todo, 'ventas' los leads y el cotizador, 'lectura' solo R4.

create or replace function public.equipo_admin()
returns table (id uuid, correo text, rol text, creado timestamptz, ultimo_acceso timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  return query
    select u.id, coalesce(p.correo, u.email)::text, coalesce(p.rol, 'lectura')::text, u.created_at, u.last_sign_in_at
      from auth.users u
      left join public.perfiles p on p.id = u.id
     order by u.created_at;
end $$;

-- el rol de otro usuario (el propio no, para que nadie se quede sin entrar)
create or replace function public.cambiar_rol(p_id uuid, p_rol text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if p_id = (select auth.uid()) then
    raise exception 'Tu propio rol no se cambia desde aquí' using errcode = '22023';
  end if;
  if p_rol not in ('admin', 'ventas', 'lectura') then
    raise exception 'Rol no válido' using errcode = '22023';
  end if;
  insert into public.perfiles (id, correo, rol)
  select u.id, u.email, p_rol from auth.users u where u.id = p_id
  on conflict (id) do update set rol = excluded.rol;
  if not found then
    raise exception 'Ese usuario ya no existe' using errcode = 'P0002';
  end if;
end $$;

revoke all on function public.equipo_admin() from public, anon;
grant execute on function public.equipo_admin() to authenticated;
revoke all on function public.cambiar_rol(uuid, text) from public, anon;
grant execute on function public.cambiar_rol(uuid, text) to authenticated;

-- que la API vea las funciones y columnas nuevas sin esperar
notify pgrst, 'reload schema';
