import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/configuracao/supabase';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
// Fallback final: ler direto do app.json para evitar divergências do Constants em alguns ambientes
// eslint-disable-next-line @typescript-eslint/no-var-requires
const appConfig = (() => {
  try {
    // Caminho relativo da pasta `biblioteca` até `app.json`
    // @ts-ignore - require de JSON
    return require('../app.json');
  } catch (_e) {
    return null as any;
  }
})();

/**
 * Cria e retorna um cliente singleton do Supabase usando chaves do app.json (extra).
 * Esse cliente é utilizado para Autenticação, Banco de Dados e Storage.
 */
let clienteSupabase: SupabaseClient | null = null;

export function obterClienteSupabase(): SupabaseClient {
  if (clienteSupabase) return clienteSupabase;

  // Tenta ler variáveis (ordem de prioridade): ENV (EXPO_PUBLIC_*), app.json (expo.expoConfig.extra), manifest2.extra
  // Prioriza sempre o app.json do projeto (appConfig) para evitar manifest antigo em cache
  const extra =
    (appConfig?.expo?.extra ?? {}) ||
    Constants.expoConfig?.extra ||
    (Constants as any).manifest?.extra ||
    (Constants as any).manifest2?.extra ||
    {};
  // Ordem final de prioridade: valores fixos > ENV > app.json extra
  const urlRaw = (SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || extra.supabaseUrl) as string | undefined;
  const anonKeyRaw = (SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || extra.supabaseAnonKey) as string | undefined;

  const url = typeof urlRaw === 'string' ? urlRaw.trim() : undefined;
  const anonKey = typeof anonKeyRaw === 'string' ? anonKeyRaw.trim() : undefined;

  // Logs de diagnóstico (podem ser removidos depois)
  // eslint-disable-next-line no-console
  console.log('SUPABASE_DEBUG extraKeys', Object.keys(extra || {}));
  // eslint-disable-next-line no-console
  console.log('SUPABASE_DEBUG url', url);
  // eslint-disable-next-line no-console
  console.log('SUPABASE_DEBUG anonKey present?', !!anonKey);

  if (!url || !anonKey || !/^https?:\/\//i.test(url)) {
    throw new Error(
      'Credenciais do Supabase inválidas. Garanta URL iniciando com https:// e a Anon Key. Defina em expo.extra (app.json) ou via EXPO_PUBLIC_SUPABASE_URL/EXPO_PUBLIC_SUPABASE_ANON_KEY, e rode `npx expo start -c`.'
    );
  }

  clienteSupabase = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  return clienteSupabase;
}


