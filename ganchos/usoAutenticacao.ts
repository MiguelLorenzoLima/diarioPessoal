import { useEffect, useState } from 'react';
import { obterClienteSupabase } from '@/biblioteca/supabase';

/**
 * Hook React que escuta as mudanças de autenticação do Supabase
 * e expõe sessão e usuário atuais para proteger telas e atualizar a UI.
 */
export function usoAutenticacao() {
  const supabase = obterClienteSupabase();
  const [carregando, definirCarregando] = useState(true);
  const [sessao, definirSessao] = useState<any>(null);

  useEffect(() => {
    let montado = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!montado) return;
      definirSessao(data.session ?? null);
      definirCarregando(false);
    });

    const { data: inscricao } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      definirSessao(novaSessao ?? null);
    });

    return () => {
      montado = false;
      inscricao.subscription.unsubscribe();
    };
  }, [supabase]);

  return { carregando, sessao, usuario: sessao?.user ?? null } as const;
}


