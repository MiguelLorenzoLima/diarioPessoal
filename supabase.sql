-- Criação de esquema para Diário Pessoal no Supabase

-- Tabela de entradas do diário
create table if not exists public.entradas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  conteudo text not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz
);

-- Tabela de mídias das entradas
create table if not exists public.midias (
  id uuid primary key default gen_random_uuid(),
  entrada_id uuid not null references public.entradas(id) on delete cascade,
  tipo text not null check (tipo in ('imagem','video','audio')),
  caminho_arquivo text not null,
  criado_em timestamptz not null default now()
);

-- Habilitar RLS
alter table public.entradas enable row level security;
alter table public.midias enable row level security;

-- Políticas RLS: cada usuário acessa somente suas entradas
create policy if not exists "entradas_select_proprio" on public.entradas
  for select using (auth.uid() = usuario_id);

create policy if not exists "entradas_insert_proprio" on public.entradas
  for insert with check (auth.uid() = usuario_id);

create policy if not exists "entradas_update_proprio" on public.entradas
  for update using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy if not exists "entradas_delete_proprio" on public.entradas
  for delete using (auth.uid() = usuario_id);

-- Políticas RLS: mídias vinculadas a entradas do próprio usuário
create policy if not exists "midias_select_proprio" on public.midias
  for select using (
    exists (
      select 1 from public.entradas e where e.id = midias.entrada_id and e.usuario_id = auth.uid()
    )
  );

create policy if not exists "midias_insert_proprio" on public.midias
  for insert with check (
    exists (
      select 1 from public.entradas e where e.id = entrada_id and e.usuario_id = auth.uid()
    )
  );

create policy if not exists "midias_delete_proprio" on public.midias
  for delete using (
    exists (
      select 1 from public.entradas e where e.id = midias.entrada_id and e.usuario_id = auth.uid()
    )
  );

-- Bucket de Storage
-- No painel do Supabase, crie um bucket chamado 'midias_diario' (privado)
-- Depois aplique a seguinte política de acesso usando Storage Policies (SQL):

-- Permitir upload apenas pelo dono (precisa informar caminho contendo id da entrada)
-- Obs: Storage policies usam a tabela objects, com nome do bucket
create policy if not exists "upload_midias_do_proprio" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'midias_diario' and
    exists (
      select 1
      from public.entradas e
      where e.usuario_id = auth.uid()
      -- exige que o primeiro segmento do caminho seja exatamente o id da entrada
      and e.id::text = split_part(name, '/', 1)
    )
  );

-- Permitir leitura apenas do dono
create policy if not exists "ler_midias_do_proprio" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'midias_diario' and
    exists (
      select 1
      from public.entradas e
      where e.usuario_id = auth.uid()
      and e.id::text = split_part(name, '/', 1)
    )
  );


