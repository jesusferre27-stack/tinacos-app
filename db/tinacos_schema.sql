-- ============================================================
-- ECOSISTEMA TINACOS — ALIANZA COMUNITARIA PARA EL DESARROLLO
-- Schema completo · Supabase · 2026
-- ============================================================

-- ── 1. CATÁLOGO DE TINACOS ──────────────────────────────────
create table if not exists tinacos_catalogo (
  id            uuid primary key default gen_random_uuid(),
  capacidad_lts integer not null,           -- 450, 600, 750, 1100, 1500, 2500
  descripcion   text,                       -- "Tinaco Rotoplas 1100L"
  precio_venta  numeric(10,2) not null,
  precio_costo  numeric(10,2),              -- solo tú lo ves
  stock_total   integer default 0,
  stock_disponible integer default 0,
  activo        boolean default true,
  created_at    timestamptz default now()
);

-- ── 2. LEADS — TODOS LOS QUE CONTACTAN ────────────────────
create table if not exists tinacos_leads (
  id              uuid primary key default gen_random_uuid(),
  folio           text unique,              -- TIN-2026-0001
  -- datos del cliente
  nombre          text,
  telefono        text,
  municipio       text,
  colonia         text,
  direccion       text,
  referencia      text,                     -- "casa azul junto a la escuela"
  -- pedido
  tipo_entrega    text default 'domicilio', -- 'domicilio' | 'punto_recoleccion'
  punto_recoleccion text,
  -- tinacos solicitados
  cantidad        integer default 1,
  capacidad_lts   integer,                  -- 450, 600, 750, 1100, 1500, 2500
  -- estado del lead
  estado          text default 'nuevo',
  -- nuevo | datos_incompletos | completo | apartado | confirmado | entregado | cancelado
  canal_origen    text default 'whatsapp',  -- 'whatsapp' | 'chatlevel' | 'manual'
  chat_id         text,                     -- ID de conversación en Chatlevel
  -- control
  agente_proceso  text,                     -- qué agente lo procesó
  notas           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 3. APARTADOS — CONFIRMADOS CON COMPROBANTE ────────────
create table if not exists tinacos_apartados (
  id              uuid primary key default gen_random_uuid(),
  folio_apartado  text unique,              -- APT-2026-0001
  lead_id         uuid references tinacos_leads(id),
  -- snapshot del pedido al momento de apartar
  nombre_cliente  text not null,
  telefono        text not null,
  municipio       text not null,
  direccion       text,
  tipo_entrega    text not null,
  punto_recoleccion text,
  cantidad        integer not null,
  capacidad_lts   integer not null,
  -- comprobante
  comprobante_pdf_url text,                 -- URL del PDF en Supabase Storage
  comprobante_enviado boolean default false,
  fecha_envio_comprobante timestamptz,
  -- confirmación del cliente
  confirmado      boolean default false,
  fecha_confirmacion timestamptz,
  mensaje_confirmacion text,               -- respuesta del cliente
  -- estado
  estado          text default 'pendiente_confirmacion',
  -- pendiente_confirmacion | confirmado | listo_entrega | entregado | cancelado
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 4. ENTREGAS — RUTAS POR MUNICIPIO ─────────────────────
create table if not exists tinacos_entregas (
  id              uuid primary key default gen_random_uuid(),
  folio_entrega   text unique,             -- ENT-2026-0001
  municipio       text not null,
  fecha_entrega   date,
  estado          text default 'planificada',
  -- planificada | en_ruta | completada | reagendada
  maps_url        text,                    -- link Google Maps con la ruta
  total_tinacos   integer default 0,
  notas_ruta      text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 5. DETALLE DE ENTREGA (apartados en esa ruta) ─────────
create table if not exists tinacos_entrega_detalle (
  id              uuid primary key default gen_random_uuid(),
  entrega_id      uuid references tinacos_entregas(id),
  apartado_id     uuid references tinacos_apartados(id),
  orden_ruta      integer,                 -- 1, 2, 3... orden en la ruta
  latitud         numeric(10,7),
  longitud        numeric(10,7),
  estado_entrega  text default 'pendiente',
  -- pendiente | entregado | no_encontrado | reagendado
  hora_entrega    timestamptz,
  firma_recibio   text,                    -- nombre de quien recibió
  foto_url        text,                    -- foto de entrega
  created_at      timestamptz default now()
);

-- ── 6. LOG DE AGENTES ──────────────────────────────────────
create table if not exists tinacos_agentes_log (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid references tinacos_leads(id),
  agente          text not null,
  -- 'extractor' | 'filtrador' | 'generador' | 'enviador' | 'rutero'
  accion          text not null,
  resultado       text,                    -- 'ok' | 'error' | 'pendiente'
  detalle         jsonb,                   -- datos del proceso
  created_at      timestamptz default now()
);

-- ── 7. DASHBOARD VIEW — RESUMEN EN TIEMPO REAL ────────────
create or replace view tinacos_dashboard as
select
  (select count(*) from tinacos_leads where estado = 'nuevo')              as leads_nuevos,
  (select count(*) from tinacos_leads where estado = 'datos_incompletos')  as datos_incompletos,
  (select count(*) from tinacos_leads where estado = 'completo')           as leads_completos,
  (select count(*) from tinacos_apartados where estado = 'pendiente_confirmacion') as pendientes_confirmacion,
  (select count(*) from tinacos_apartados where confirmado = true)         as confirmados,
  (select count(*) from tinacos_apartados where estado = 'entregado')      as entregados,
  (select coalesce(sum(cantidad),0) from tinacos_apartados where confirmado = true) as tinacos_confirmados,
  (select count(*) from tinacos_entregas where estado = 'planificada')     as rutas_planificadas,
  (select count(*) from tinacos_entregas where estado = 'en_ruta')         as rutas_en_curso;

-- ── 8. FUNCIÓN AUTO-FOLIO LEADS ───────────────────────────
create or replace function generar_folio_lead()
returns trigger as $$
begin
  new.folio := 'TIN-' || to_char(now(), 'YYYY') || '-' ||
               lpad(nextval('tinacos_lead_seq')::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create sequence if not exists tinacos_lead_seq start 1;

create trigger tr_folio_lead
  before insert on tinacos_leads
  for each row
  when (new.folio is null)
  execute function generar_folio_lead();

-- ── 9. FUNCIÓN AUTO-FOLIO APARTADOS ───────────────────────
create or replace function generar_folio_apartado()
returns trigger as $$
begin
  new.folio_apartado := 'APT-' || to_char(now(), 'YYYY') || '-' ||
                        lpad(nextval('tinacos_apt_seq')::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create sequence if not exists tinacos_apt_seq start 1;

create trigger tr_folio_apartado
  before insert on tinacos_apartados
  for each row
  when (new.folio_apartado is null)
  execute function generar_folio_apartado();

-- ── 10. UPDATED_AT AUTOMÁTICO ─────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_leads_updated
  before update on tinacos_leads
  for each row execute function update_updated_at();

create trigger tr_apartados_updated
  before update on tinacos_apartados
  for each row execute function update_updated_at();

create trigger tr_entregas_updated
  before update on tinacos_entregas
  for each row execute function update_updated_at();

-- ── 11. DATOS INICIALES — CATÁLOGO ────────────────────────
insert into tinacos_catalogo (capacidad_lts, descripcion, precio_venta, stock_total, stock_disponible) values
  (450,  'Tinaco 450 Litros',   0.00, 0, 0),
  (600,  'Tinaco 600 Litros',   0.00, 0, 0),
  (750,  'Tinaco 750 Litros',   0.00, 0, 0),
  (1100, 'Tinaco 1100 Litros',  0.00, 0, 0),
  (1500, 'Tinaco 1500 Litros',  0.00, 0, 0),
  (2500, 'Tinaco 2500 Litros',  0.00, 0, 0)
on conflict do nothing;

-- ── 12. ÍNDICES ────────────────────────────────────────────
create index if not exists idx_leads_estado    on tinacos_leads(estado);
create index if not exists idx_leads_municipio on tinacos_leads(municipio);
create index if not exists idx_leads_telefono  on tinacos_leads(telefono);
create index if not exists idx_apartados_confirmado on tinacos_apartados(confirmado);
create index if not exists idx_apartados_estado on tinacos_apartados(estado);
create index if not exists idx_entregas_municipio on tinacos_entregas(municipio);
create index if not exists idx_entregas_fecha on tinacos_entregas(fecha_entrega);
create index if not exists idx_log_lead on tinacos_agentes_log(lead_id);
create index if not exists idx_log_agente on tinacos_agentes_log(agente);

-- ============================================================
-- LISTO — 6 tablas + 1 view + folios automáticos + índices
-- ============================================================
