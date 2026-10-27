-- supabase/leads.sql
-- Leads del formulario de webbonding.net/crea-tu-app. Va en el proyecto Supabase r4-cuentas
-- (ref myzjlejuanichemxmfuw), que es de Web Bonding y la web ya usa para /r4apertura. Para aplicarlo:
--   supabase db query --linked -f supabase/leads.sql
-- Se puede correr de nuevo sin romper nada.
--
-- Son datos personales, así que:
--  · van en un esquema propio (web_bonding) que la API no publica: con la clave pública del sitio nadie puede
--    leer, cambiar ni borrar un lead;
--  · el sitio solo puede llamar public.crear_lead(), que valida, exige que se acepte la política de privacidad,
--    guarda y no devuelve nada;
--  · el equipo los ve en el panel de Supabase: Table Editor → esquema web_bonding → leads.

create schema if not exists web_bonding;
comment on schema web_bonding is 'Leads de webbonding.net. Lo define WebBonding/supabase/leads.sql';
revoke all on schema web_bonding from public, anon, authenticated;
grant usage on schema web_bonding to service_role;

create table if not exists web_bonding.leads (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  tipo              text not null,                        -- lo que quiere construir
  nombre            text not null,
  telefono          text not null,                        -- tal cual lo escribió
  correo            text not null,
  adicional         text,
  acepta_privacidad boolean not null check (acepta_privacidad),
  acepta_novedades  boolean not null default false,       -- ofertas y novedades: opcional
  version_politica  text not null,                        -- la versión de /privacidad que aceptó
  pagina            text,                                 -- desde qué página lo envió
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  utm_content       text,
  estado            text not null default 'nuevo'
                    check (estado in ('nuevo', 'contactado', 'propuesta', 'cliente', 'descartado')),
  notas             text
);
comment on table web_bonding.leads is 'Formulario de /crea-tu-app. Datos personales: no exportar ni compartir fuera del equipo.';

-- RLS sin políticas: aunque el esquema se publicara por error, por la API no entra nadie.
alter table web_bonding.leads enable row level security;
revoke all on web_bonding.leads from public, anon, authenticated;
grant all on web_bonding.leads to service_role;

create index if not exists leads_created_at on web_bonding.leads (created_at desc);

create or replace function public.crear_lead(
  p_tipo              text,
  p_nombre            text,
  p_telefono          text,
  p_correo            text,
  p_adicional         text    default null,
  p_acepta_privacidad boolean default false,
  p_acepta_novedades  boolean default false,
  p_version_politica  text    default null,
  p_pagina            text    default null,
  p_utm_source        text    default null,
  p_utm_medium        text    default null,
  p_utm_campaign      text    default null,
  p_utm_content       text    default null
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tel    text := regexp_replace(coalesce(p_telefono, ''), '\D', '', 'g');
  v_correo text := lower(btrim(coalesce(p_correo, '')));
begin
  if p_acepta_privacidad is not true then
    raise exception 'Hay que aceptar la política de privacidad' using errcode = '22023';
  end if;
  if length(btrim(coalesce(p_tipo, ''))) not between 1 and 80
     or length(btrim(coalesce(p_nombre, ''))) not between 2 and 120
     or length(v_tel) not between 10 and 15
     or length(v_correo) > 160
     or v_correo !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'
     or length(btrim(coalesce(p_version_politica, ''))) not between 1 and 20 then
    raise exception 'Datos incompletos o no válidos' using errcode = '22023';
  end if;

  -- el mismo teléfono dos veces en 10 minutos (doble toque, «Empezar de nuevo») se guarda una sola vez
  if exists (
    select 1 from web_bonding.leads l
    where l.created_at > now() - interval '10 minutes'
      and regexp_replace(l.telefono, '\D', '', 'g') = v_tel
  ) then
    return;
  end if;

  -- freno contra el relleno automático: como mucho 30 leads por minuto entre todos
  if (select count(*) from web_bonding.leads l where l.created_at > now() - interval '1 minute') >= 30 then
    raise exception 'Demasiados registros seguidos' using errcode = '54000';
  end if;

  insert into web_bonding.leads (tipo, nombre, telefono, correo, adicional, acepta_privacidad, acepta_novedades,
                                 version_politica, pagina, utm_source, utm_medium, utm_campaign, utm_content)
  values (btrim(p_tipo), btrim(p_nombre), left(btrim(p_telefono), 30), v_correo,
          nullif(left(btrim(coalesce(p_adicional, '')), 2000), ''), true, coalesce(p_acepta_novedades, false),
          btrim(p_version_politica), left(p_pagina, 200), left(p_utm_source, 200), left(p_utm_medium, 200),
          left(p_utm_campaign, 200), left(p_utm_content, 200));
end $$;

comment on function public.crear_lead(text, text, text, text, text, boolean, boolean, text, text, text, text, text, text)
  is 'Formulario de webbonding.net/crea-tu-app → web_bonding.leads. Ver WebBonding/supabase/leads.sql';
revoke all on function public.crear_lead(text, text, text, text, text, boolean, boolean, text, text, text, text, text, text) from public;
grant execute on function public.crear_lead(text, text, text, text, text, boolean, boolean, text, text, text, text, text, text) to anon, authenticated;
