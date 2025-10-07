import { obterClienteSupabase } from '@/biblioteca/supabase';
import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system/legacy';

export type TipoMidia = 'imagem' | 'video' | 'audio';

export interface EntradaDiario {
  id: string;
  usuario_id: string;
  titulo: string;
  conteudo: string;
  criado_em: string;
  atualizado_em: string | null;
}

export interface MidiaEntrada {
  id: string;
  entrada_id: string;
  tipo: TipoMidia;
  caminho_arquivo: string; // caminho no bucket do Storage
  criado_em: string;
}

export interface IndicadoresMidiaPorEntrada {
  entradaId: string;
  possuiImagem: boolean;
  possuiAudio: boolean;
  possuiVideo: boolean;
}

/**
 * Serviço do Diário: CRUD de entradas e upload/listagem de mídias no Supabase Storage.
 */
export const diarioServico = {
  /**
   * Cria uma nova entrada do diário para o usuário autenticado.
   */
  async criarEntrada(titulo: string, conteudo: string): Promise<EntradaDiario> {
    const supabase = obterClienteSupabase();
    const { data: { user }, error: erroUsuario } = await supabase.auth.getUser();
    if (erroUsuario || !user) throw new Error('Usuário não autenticado.');

    const { data, error } = await supabase
      .from('entradas')
      .insert({ usuario_id: user.id, titulo, conteudo })
      .select('*')
      .single();
    if (error) throw error;
    return data as EntradaDiario;
  },

  /**
   * Lista as entradas do usuário atual em ordem decrescente de criação.
   */
  async listarEntradas(): Promise<EntradaDiario[]> {
    const supabase = obterClienteSupabase();
    const { data, error } = await supabase
      .from('entradas')
      .select('*')
      .order('criado_em', { ascending: false });
    if (error) throw error;
    return (data ?? []) as EntradaDiario[];
  },

  /**
   * Lista entradas e retorna também indicadores se há imagens ou áudios
   * associados a cada entrada (consulta única para mídias).
   */
  async listarEntradasComIndicadores(): Promise<Array<EntradaDiario & { possuiImagem: boolean; possuiAudio: boolean; possuiVideo: boolean }>> {
    const entradas = await this.listarEntradas();
    if (entradas.length === 0) return [] as any;

    const ids = entradas.map((e) => e.id);
    const supabase = obterClienteSupabase();
    const { data: midias, error } = await supabase
      .from('midias')
      .select('entrada_id, tipo')
      .in('entrada_id', ids);
    if (error) throw error;

    const flags = new Map<string, { possuiImagem: boolean; possuiAudio: boolean; possuiVideo: boolean }>();
    for (const id of ids) flags.set(id, { possuiImagem: false, possuiAudio: false, possuiVideo: false });
    for (const m of midias ?? []) {
      const atual = flags.get(m.entrada_id) ?? { possuiImagem: false, possuiAudio: false, possuiVideo: false };
      if (m.tipo === 'imagem') atual.possuiImagem = true;
      if (m.tipo === 'audio') atual.possuiAudio = true;
      if (m.tipo === 'video') atual.possuiVideo = true;
      flags.set(m.entrada_id, atual);
    }

    return entradas.map((e) => ({ ...e, ...(flags.get(e.id) ?? { possuiImagem: false, possuiAudio: false, possuiVideo: false }) }));
  },

  /**
   * Busca uma entrada específica pelo id.
   */
  async obterEntrada(id: string): Promise<EntradaDiario | null> {
    const supabase = obterClienteSupabase();
    const { data, error } = await supabase
      .from('entradas')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return (data ?? null) as EntradaDiario | null;
  },

  /**
   * Exclui uma entrada do diário (RLS garante propriedade do registro).
   */
  async excluirEntrada(id: string): Promise<void> {
    const supabase = obterClienteSupabase();
    const { error } = await supabase.from('entradas').delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Faz upload de um arquivo de mídia ao bucket e cria o registro relacionado.
   * Retorna o caminho salvo no Storage.
   */
  async enviarMidia(
    entradaId: string,
    arquivo: { uri: string; nome: string; tipoMime: string },
    tipo: TipoMidia
  ): Promise<string> {
    const supabase = obterClienteSupabase();
    const caminho = `${entradaId}/${Date.now()}-${arquivo.nome}`;

    // RN: converte arquivo em base64 e envia como ArrayBuffer
    const base64 = await FileSystem.readAsStringAsync(arquivo.uri, { encoding: 'base64' as any });
    const buffer = Buffer.from(base64, 'base64');

    const { error: uploadErro } = await supabase.storage
      .from('midias_diario')
      .upload(caminho, buffer as any, {
        contentType: arquivo.tipoMime,
        upsert: false,
      });
    if (uploadErro) throw uploadErro;

    const { error: erroMidia } = await supabase
      .from('midias')
      .insert({ entrada_id: entradaId, tipo, caminho_arquivo: caminho });
    if (erroMidia) throw erroMidia;

    return caminho;
  },

  /**
   * Lista as mídias associadas a uma entrada.
   */
  async listarMidias(entradaId: string): Promise<MidiaEntrada[]> {
    const supabase = obterClienteSupabase();
    const { data, error } = await supabase
      .from('midias')
      .select('*')
      .eq('entrada_id', entradaId)
      .order('criado_em', { ascending: false });
    if (error) throw error;
    return (data ?? []) as MidiaEntrada[];
  },
  /**
   * Gera uma URL assinada temporária para acessar um arquivo privado do bucket.
   */
  async obterUrlMidiaAssinada(caminho: string, segundos: number = 60 * 60): Promise<string> {
    const supabase = obterClienteSupabase();
    const { data, error } = await supabase.storage
      .from('midias_diario')
      .createSignedUrl(caminho, segundos);
    if (error) throw error;
    return (data?.signedUrl ?? '') as string;
  },
  /**
   * Indica se existem mídias por tipo para um conjunto de entradas.
   */
  async indicadoresPorEntradas(entradaIds: string[]): Promise<Record<string, { possuiImagem: boolean; possuiAudio: boolean; possuiVideo: boolean }>> {
    if (entradaIds.length === 0) return {};
    const supabase = obterClienteSupabase();
    const { data, error } = await supabase
      .from('midias')
      .select('entrada_id, tipo')
      .in('entrada_id', entradaIds);
    if (error) throw error;
    const result: Record<string, { possuiImagem: boolean; possuiAudio: boolean; possuiVideo: boolean }> = {};
    for (const id of entradaIds) result[id] = { possuiImagem: false, possuiAudio: false, possuiVideo: false };
    for (const m of data ?? []) {
      const rec = result[m.entrada_id] ?? { possuiImagem: false, possuiAudio: false, possuiVideo: false };
      if (m.tipo === 'imagem') rec.possuiImagem = true;
      if (m.tipo === 'audio') rec.possuiAudio = true;
      if (m.tipo === 'video') rec.possuiVideo = true;
      result[m.entrada_id] = rec;
    }
    return result;
  },
};


