-- supabase/firmas.sql
-- Firma electrónica de contratos en webbonding.net/firmar. Va en el mismo proyecto Supabase que admin.sql (el r4-cuentas
-- nuevo, el de VITE_R4_SUPABASE_URL) y después de él. Se aplica con la API de administración o pegándolo en el SQL Editor,
-- y se puede correr de nuevo sin romper nada.
--
-- Cómo cumple el Decreto-Ley sobre Mensajes de Datos y Firmas Electrónicas (art. 16):
--  · vinculada al firmante: cada firmante entra con su enlace propio, escribe su cédula y confirma con un código de un solo
--    uso que le llega a su correo (o a su WhatsApp); se guardan la fecha y hora del servidor, la IP y el navegador;
--  · bajo su control exclusivo: el código vence a los 10 minutos, se guarda solo su resumen y se gasta al usarlo;
--  · detecta cualquier cambio: cada PDF lleva su resumen SHA-256 desde que se sube, el archivo final lleva el suyo y un sello
--    de tiempo RFC 3161 de un tercero (DigiCert o FreeTSA), y la bitácora va encadenada: cada evento lleva el resumen del
--    anterior, así que borrar o cambiar uno rompe la cadena.
--
-- Nada de esto se lee desde la web con la clave pública: RLS sin políticas y sin permisos para anon ni authenticated. Todo
-- pasa por la función de Supabase «firmas» (supabase/functions/firmas), que usa la conexión del servidor y revisa el rol
-- 'admin' (public.es_admin()) en lo que es del panel. Los PDF van en el bucket privado «firmas».

create schema if not exists web_bonding;
revoke all on schema web_bonding from public, anon, authenticated;
grant usage on schema web_bonding to service_role;

-- ── El sobre: un envío con uno o varios documentos y sus firmantes ───────────────────────────────────────────
create table if not exists web_bonding.firma_sobres (
  id             uuid primary key default gen_random_uuid(),
  creado_en      timestamptz not null default now(),
  creado_por     uuid,                                     -- el usuario del panel que lo armó
  codigo         text not null unique check (codigo ~ '^[A-Z0-9-]{4,40}$'),   -- WB-VGO-2026-001
  titulo         text not null check (length(titulo) between 3 and 140),
  mensaje        text check (length(mensaje) <= 1500),     -- lo que leen los firmantes en el correo y en la página
  en_orden       boolean not null default true,            -- firman uno detrás de otro, en el orden de la lista
  estado         text not null default 'borrador'
                 check (estado in ('borrador', 'enviado', 'completado', 'anulado')),
  enviado_en     timestamptz,
  completado_en  timestamptz,
  anulado_en     timestamptz,
  motivo_anulado text check (length(motivo_anulado) <= 500),
  final_ruta     text,                                     -- el PDF firmado, en el bucket
  final_sha256   text check (final_sha256 ~ '^[0-9a-f]{64}$'),
  final_paginas  integer,
  sello_ruta     text,                                     -- el sello de tiempo (.tsr) del PDF firmado
  sello_tsa      text,                                     -- quién lo emitió
  sello_en       timestamptz                               -- la hora que dice el sello
);
comment on table web_bonding.firma_sobres is 'Firma electrónica de contratos (webbonding.net/firmar). Ver WebBonding/supabase/firmas.sql';

create table if not exists web_bonding.firma_documentos (
  id        uuid primary key default gen_random_uuid(),
  sobre_id  uuid not null references web_bonding.firma_sobres (id) on delete cascade,
  orden     integer not null default 0,
  nombre    text not null check (length(nombre) between 1 and 160),
  ruta      text not null,                                 -- el PDF tal cual se subió
  sha256    text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  bytes     integer not null check (bytes > 0),
  paginas   integer not null check (paginas > 0),
  subido_en timestamptz not null default now()
);
create index if not exists firma_documentos_sobre on web_bonding.firma_documentos (sobre_id, orden);

create table if not exists web_bonding.firma_firmantes (
  id            uuid primary key default gen_random_uuid(),
  sobre_id      uuid not null references web_bonding.firma_sobres (id) on delete cascade,
  orden         integer not null default 0,
  nombre        text not null check (length(nombre) between 3 and 120),
  cedula        text not null check (cedula ~ '^[VEJPGvejpg]-?[0-9.]{5,12}(-[0-9])?$'),
  correo        text not null check (correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  telefono      text check (telefono ~ '^\+?[0-9 ]{10,16}$'),
  caracter      text check (length(caracter) <= 160),     -- «EL CLIENTE», «Director de Web Bonding»
  token         text not null unique default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),  -- el de su enlace /firmar/<token>
  estado        text not null default 'pendiente'
                check (estado in ('pendiente', 'visto', 'firmado', 'rechazado')),
  invitado_en   timestamptz,
  visto_en      timestamptz,
  -- el código de un solo uso (solo su resumen)
  codigo_hash   text,
  codigo_canal  text check (codigo_canal in ('correo', 'whatsapp')),
  codigo_vence  timestamptz,
  codigo_fallos integer not null default 0,
  codigos_hora  timestamptz[] not null default '{}',      -- cuándo se pidió cada código (máximo 3 por hora)
  -- la firma
  firmado_en    timestamptz,
  firma_ip      text,
  firma_agente  text check (length(firma_agente) <= 400),
  firma_metodo  text,                                      -- «Código de un solo uso al correo w***@gmail.com»
  firma_trazo   text check (length(firma_trazo) <= 300000),  -- la firma dibujada, PNG en data URL
  firma_evento  bigint,                                    -- el evento de la bitácora que la registra
  rechazado_en  timestamptz,
  motivo        text check (length(motivo) <= 500)
);
create index if not exists firma_firmantes_sobre on web_bonding.firma_firmantes (sobre_id, orden);

-- ── La bitácora: solo se agrega, y cada evento lleva el resumen del anterior ─────────────────────────────────
create table if not exists web_bonding.firma_eventos (
  id          bigint generated always as identity primary key,
  sobre_id    uuid not null references web_bonding.firma_sobres (id) on delete restrict,
  firmante_id uuid references web_bonding.firma_firmantes (id) on delete restrict,
  tipo        text not null check (tipo ~ '^[a-z_]{3,30}$'),
  detalle     jsonb not null default '{}'::jsonb,
  ip          text,
  agente      text,
  creado_en   timestamptz not null default clock_timestamp(),
  hash_previo text not null default '',
  hash        text not null default ''
);
create index if not exists firma_eventos_sobre on web_bonding.firma_eventos (sobre_id, id);

alter table web_bonding.firma_sobres     enable row level security;
alter table web_bonding.firma_documentos enable row level security;
alter table web_bonding.firma_firmantes  enable row level security;
alter table web_bonding.firma_eventos    enable row level security;
revoke all on web_bonding.firma_sobres, web_bonding.firma_documentos, web_bonding.firma_firmantes, web_bonding.firma_eventos
  from public, anon, authenticated;
grant select, insert, update, delete on web_bonding.firma_sobres, web_bonding.firma_documentos, web_bonding.firma_firmantes
  to service_role;
grant select, insert on web_bonding.firma_eventos to service_role;

-- el texto exacto que entra en el resumen de cada evento (la función de Supabase y quien verifique lo arman igual)
create or replace function web_bonding.firma_evento_texto(e web_bonding.firma_eventos)
returns text language sql stable set search_path = '' as $$
  select concat_ws('|', e.hash_previo, e.id::text, e.sobre_id::text, coalesce(e.firmante_id::text, ''), e.tipo,
    e.detalle::text, coalesce(e.ip, ''), coalesce(e.agente, ''),
    to_char(e.creado_en at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'))
$$;

create or replace function web_bonding.firma_evento_encadenar()
returns trigger language plpgsql set search_path = '' as $$
begin
  -- uno a la vez por sobre, para que la cadena no se bifurque
  perform pg_advisory_xact_lock(hashtextextended(new.sobre_id::text, 0));
  new.creado_en := clock_timestamp();
  new.hash_previo := coalesce((select e.hash from web_bonding.firma_eventos e
                               where e.sobre_id = new.sobre_id order by e.id desc limit 1), '');
  new.hash := encode(sha256(convert_to(web_bonding.firma_evento_texto(new), 'UTF8')), 'hex');
  return new;
end $$;

create or replace function web_bonding.firma_solo_agregar()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'La bitácora de firmas no se cambia ni se borra' using errcode = '42501';
end $$;

drop trigger if exists encadenar on web_bonding.firma_eventos;
create trigger encadenar before insert on web_bonding.firma_eventos
  for each row execute function web_bonding.firma_evento_encadenar();
drop trigger if exists solo_agregar on web_bonding.firma_eventos;
create trigger solo_agregar before update or delete on web_bonding.firma_eventos
  for each row execute function web_bonding.firma_solo_agregar();
drop trigger if exists sin_vaciar on web_bonding.firma_eventos;
create trigger sin_vaciar before truncate on web_bonding.firma_eventos
  for each statement execute function web_bonding.firma_solo_agregar();

-- una firma hecha ya no se toca; un documento no cambia después de enviado el sobre
create or replace function web_bonding.firma_proteger()
returns trigger language plpgsql set search_path = '' as $$
declare v_estado text;
begin
  if tg_table_name = 'firma_firmantes' then
    if tg_op = 'UPDATE' and old.estado = 'firmado' then
      raise exception 'Esa firma ya está hecha y no se cambia' using errcode = '42501';
    end if;
    if tg_op = 'DELETE' and old.estado = 'firmado' then
      raise exception 'Esa firma ya está hecha y no se borra' using errcode = '42501';
    end if;
  end if;
  if tg_table_name = 'firma_documentos' then
    if tg_op = 'UPDATE' then
      raise exception 'Un documento subido no se cambia: se quita y se sube de nuevo' using errcode = '42501';
    end if;
    select s.estado into v_estado from web_bonding.firma_sobres s where s.id = old.sobre_id;
    if v_estado is not null and v_estado <> 'borrador' then
      raise exception 'El sobre ya se envió: sus documentos no se quitan' using errcode = '42501';
    end if;
  end if;
  return coalesce(new, old);
end $$;

drop trigger if exists proteger on web_bonding.firma_firmantes;
create trigger proteger before update or delete on web_bonding.firma_firmantes
  for each row execute function web_bonding.firma_proteger();
drop trigger if exists proteger on web_bonding.firma_documentos;
create trigger proteger before update or delete on web_bonding.firma_documentos
  for each row execute function web_bonding.firma_proteger();

-- un sobre con eventos no se borra (la bitácora lo impide con «on delete restrict»): se anula
-- ── El bucket privado de los PDF ─────────────────────────────────────────────────────────────────────────────
do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('firmas', 'firmas', false, 15728640, array['application/pdf', 'application/timestamp-reply'])
    on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
  end if;
end $$;
