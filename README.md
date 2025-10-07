<img width="373" height="785" alt="image" src="https://github.com/user-attachments/assets/9a513aac-f04a-4526-875c-ee1991d7b3d5" />
<img width="362" height="786" alt="image" src="https://github.com/user-attachments/assets/8fd01a54-6821-49b5-9b17-5e3cb52f5e1c" />
<img width="354" height="794" alt="image" src="https://github.com/user-attachments/assets/0ecaf566-bfcc-4ce2-ba85-47e5fbc3f9cd" />
<img width="356" height="791" alt="image" src="https://github.com/user-attachments/assets/1de02ca3-aa93-4cce-87e0-dc3b6850222a" />




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
