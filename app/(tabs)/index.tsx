import { obterClienteSupabase } from '@/biblioteca/supabase';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { diarioServico, type EntradaDiario } from '@/servicos/diario';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, TouchableOpacity, View } from 'react-native';

/**
 * Tela principal: lista de entradas do diário do usuário autenticado.
 */
export default function ListaDiarioTela() {
  const [entradas, definirEntradas] = useState<EntradaDiario[]>([]);
  const [carregando, definirCarregando] = useState(false);
  const supabase = obterClienteSupabase();
  const roteador = useRouter();

  const carregar = useCallback(async () => {
    try {
      definirCarregando(true);
      const itens = await diarioServico.listarEntradasComIndicadores();
      definirEntradas(itens);
    } catch (e: any) {
      Alert.alert('Erro ao carregar', e.message ?? String(e));
    } finally {
      definirCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function sair() {
    try {
      await supabase.auth.signOut();
      // Redireciona imediatamente para a tela de autenticação
      roteador.replace('/autenticacao');
    } catch (e: any) {
      Alert.alert('Erro ao sair', e.message ?? String(e));
    }
  }

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <View style={{ marginTop: 100, marginBottom: 100, alignItems: 'center' }}>
        <ThemedText type="title">Meu Diário</ThemedText>
      </View>

      <View style={{ marginBottom: 8 }}>
        <Pressable
          onPress={() => roteador.push('/(tabs)/nova')}
          style={({ pressed }) => [{
            borderWidth: 2,
            borderColor: '#003cffff',
            borderRadius: 10,
            paddingVertical: 12,
            paddingHorizontal: 18,
            backgroundColor: pressed ? '#0026ffff' : '#0026ffff',
            alignItems: 'center',
            marginBottom: 2,
          }]}
        >
          <ThemedText style={{ color: '#ffffffff', fontWeight: 'bold', fontSize: 16 }}>Nova anotação</ThemedText>
        </Pressable>
      </View>

      <FlatList
        data={entradas}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} />}
        contentContainerStyle={{ gap: 12, paddingTop: 4, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <ThemedView
            style={{
              padding: 14,
              borderRadius: 12,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Pressable style={{ flex: 1 }} onPress={() => roteador.push(`/entrada/${item.id}`)}>
                <ThemedText type="subtitle">{item.titulo}</ThemedText>
              </Pressable>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    Alert.alert('Excluir', 'Deseja excluir esta anotação?', [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Excluir', style: 'destructive', onPress: async () => {
                          await diarioServico.excluirEntrada(item.id);
                          await carregar();
                        }
                      }
                    ]);
                  } catch (e: any) {
                    Alert.alert('Erro', e.message ?? String(e));
                  }
                }}
                style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#d11' }}
              >
                <ThemedText style={{ color: '#fff', fontSize: 12 }}>Excluir</ThemedText>
              </TouchableOpacity>
            </View>
            <Pressable onPress={() => roteador.push(`/entrada/${item.id}`)}>
              <ThemedText numberOfLines={2} style={{ opacity: 0.9 }}>{item.conteudo}</ThemedText>
              {(item as any).possuiImagem || (item as any).possuiAudio || (item as any).possuiVideo ? (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  {(item as any).possuiImagem ? (
                    <ThemedView style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: 9999 }}>
                      <ThemedText style={{ fontSize: 12, opacity: 0.8 }}>Imagem</ThemedText>
                    </ThemedView>
                  ) : null}
                  {(item as any).possuiAudio ? (
                    <ThemedView style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: 9999 }}>
                      <ThemedText style={{ fontSize: 12, opacity: 0.8 }}>Áudio</ThemedText>
                    </ThemedView>
                  ) : null}
                  {(item as any).possuiVideo ? (
                    <ThemedView style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: 9999 }}>
                      <ThemedText style={{ fontSize: 12, opacity: 0.8 }}>Vídeo</ThemedText>
                    </ThemedView>
                  ) : null}
                </View>
              ) : null}
              <ThemedText style={{ opacity: 0.6, marginTop: 8 }}>{new Date(item.criado_em).toLocaleString()}</ThemedText>
            </Pressable>
          </ThemedView>
        )}
        ListEmptyComponent={
          <ThemedText style={{ textAlign: 'center', marginTop: 24 }}>
            Nenhuma anotação ainda. Toque em                                   "Nova anotação" para começar.

          </ThemedText>
        }
      />

      <View style={{ marginTop: 'auto', paddingTop: 8 }}>
        <Pressable
          onPress={sair}
          style={({ pressed }) => [{
            borderWidth: 2,
            borderColor: '#d11',
            borderRadius: 10,
            paddingVertical: 12,
            paddingHorizontal: 18,
            backgroundColor: pressed ? '#ffeaea' : '#fff',
            alignItems: 'center',
          }]}
        >
          <ThemedText style={{ color: '#d11', fontWeight: 'bold', fontSize: 16 }}>Sair</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}
