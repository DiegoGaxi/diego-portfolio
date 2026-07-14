-- Diego Portfolio schema
create extension if not exists pgcrypto;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary varchar(280) not null,
  description_long text,
  cover_image_url text,
  repo_url text,
  demo_url text,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_status_published_at
  on projects (status, published_at desc);

create table if not exists timeline_entries (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null,
  start_date date not null,
  end_date date,
  achievements text[] not null default '{}',
  tech_stack text[] not null default '{}',
  sort_order int not null default 0
);

create index if not exists idx_timeline_start_date on timeline_entries (start_date desc);

insert into timeline_entries (company, role, start_date, end_date, achievements, tech_stack, sort_order)
select * from (values
  ('Agentcy', 'Founding Engineer / AI Systems Lead', date '2026-01-01', null::date,
    array['Diseñé y construí AgentChain, una plataforma de orquestación multi-agente para SDLC autónomo.', 'Lideré la arquitectura de workflows concurrentes con verificación adversarial entre agentes.'],
    array['Bun','TypeScript','PostgreSQL','Claude API'], 6),
  ('EPAM / BBVA', 'PMO & Front-End Leader', date '2025-05-01', date '2026-01-31',
    array['Automatización de Funds Transfer Pricing (FTP): procesos de cálculo vía gestión SDLC.', 'Desarrollo de vistas y funcionalidades en front-end (Angular 17, TypeScript) y despliegue a producción.'],
    array['Angular','TypeScript','SDLC','Java','Spring'], 5),
  ('Neoris', 'Full Stack Developer', date '2024-09-01', date '2025-05-31',
    array['Sistema administrativo legal: análisis de requisitos y resolución técnica.', 'Desarrollo de vistas y funcionalidades en front-end (Angular 17, TypeScript).'],
    array['Angular','TypeScript','Java','Spring Boot','PostgreSQL','Microservices'], 4),
  ('Corporativo Caprepa', 'Full Stack Developer', date '2024-07-01', date '2024-09-30',
    array['Sistema de administración de negocio y gestión financiera.', 'Desarrollo de APIs y migraciones de base de datos (MySQL); refactorización de código.'],
    array['PHP','Laravel','Angular','MySQL','REST API'], 3),
  ('Fuentebuena', 'Full Stack Developer', date '2022-05-01', date '2024-05-31',
    array['Arrendamiento de vehículos: desarrollo y mantenimiento de sistemas ERP y CRM.', 'Reportes con Cloud Functions y Lambda; front-end (JS) y back-end (Ruby on Rails, PHP Laravel).'],
    array['Ruby on Rails','PHP','Laravel','JavaScript','PostgreSQL','MySQL','MongoDB','AWS Lambda'], 2),
  ('Santa Maria de la Luz Jardin Funerario S.A de C.V', 'Full Stack Developer', date '2019-06-01', date '2022-05-31',
    array['Sistema de información web para administración contable y gestión de clientes.', 'Front-end (React, Angular JS) y back-end (Ruby on Rails, REST API); automatización contable.'],
    array['Ruby on Rails','React','Angular JS','MySQL','REST API'], 1)
) as v(company, role, start_date, end_date, achievements, tech_stack, sort_order)
where not exists (select 1 from timeline_entries);
