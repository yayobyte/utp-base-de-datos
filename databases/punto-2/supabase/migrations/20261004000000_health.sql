-- Punto 2 · Migración de verificación del despliegue.
-- Registra la versión de esquema aplicada y expone public.health() para que la app
-- compruebe (página /estado) que Vercel → Supabase funciona y que las migraciones llegaron.

create schema if not exists app;

create table if not exists app.despliegue (
  version     text primary key,
  descripcion text not null,
  aplicado_en timestamptz not null default now()
);

insert into app.despliegue (version, descripcion)
values ('20261004000000', 'Verificación de despliegue (health)')
on conflict (version) do nothing;

create or replace function public.health()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'punto', 2,
    'ok', true,
    'version', (select d.version from app.despliegue d order by d.version desc limit 1),
    'migraciones', (select count(*) from app.despliegue),
    'hora_servidor', now()
  );
$$;

revoke all on function public.health() from public;
grant execute on function public.health() to anon, authenticated;
