# Diário Pessoal (React Native + Expo + Supabase)

Aplicativo mobile de diário pessoal com autenticação, criação de entradas com título/conteúdo, upload de mídias (imagens/vídeos/áudios), listagem, visualização e exclusão.

## Tecnologias
- React Native + Expo Router
- Supabase (Auth, Database e Storage)
- expo-image-picker, expo-av

## Como rodar
1. Instalar dependências:
   - `npm install`
2. Configurar o `app.json` em `expo.extra`:
   - `supabaseUrl`: URL do projeto Supabase
   - `supabaseAnonKey`: chave anônima do Supabase
3. Iniciar o app:
   - `npx expo start`

Permissões Android configuradas para leitura de mídia e gravação de áudio.

## Funcionalidades implementadas
- Autenticação (login, registro e logout) com Supabase Auth
- CRUD de entradas do diário
- Upload de mídias para Supabase Storage
- Lista, detalhe e exclusão de entradas

## Estrutura (pastas e arquivos em português)
- `biblioteca/supabase.ts`: cliente Supabase
- `ganchos/usoAutenticacao.ts`: hook de sessão
- `servicos/diario.ts`: serviço do diário (CRUD + upload)
- Telas:
  - `app/autenticacao/index.tsx` (Login)
  - `app/autenticacao/registro.tsx` (Registro)
  - `app/(tabs)/index.tsx` (Lista de entradas)
  - `app/(tabs)/nova.tsx` (Nova entrada + upload)
  - `app/entrada/[id].tsx` (Detalhe + exclusão)

## SQL Supabase
Copie o conteúdo do arquivo `supabase.sql` e execute no SQL Editor do seu projeto Supabase. Em seguida, crie o bucket `midias_diario` como privado e garanta que as Storage Policies do arquivo foram aplicadas.
