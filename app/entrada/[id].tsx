import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { diarioServico, type EntradaDiario, type MidiaEntrada } from '@/servicos/diario';
import { Audio, Video } from 'expo-av';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Button, Image, ScrollView, View } from 'react-native';

/**
 * Tela de detalhe de uma entrada, com opção de exclusão.
 */
export default function DetalheEntradaTela() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entrada, definirEntrada] = useState<EntradaDiario | null>(null);
  const [carregando, definirCarregando] = useState(false);
  const [midias, definirMidias] = useState<MidiaEntrada[]>([]);
  const roteador = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      try {
        definirCarregando(true);
        if (id) {
          const e = await diarioServico.obterEntrada(id);
          definirEntrada(e);
          const m = await diarioServico.listarMidias(id);
          definirMidias(m);
        }
      } catch (e: any) {
        Alert.alert('Erro ao carregar', e.message ?? String(e));
      } finally {
        definirCarregando(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (entrada) {
      // Atualiza o título do header com o título da entrada
      // @ts-expect-error - tipos do expo-router
      navigation.setOptions?.({ title: entrada.titulo });
    }
  }, [entrada, navigation]);

  async function excluir() {
    if (!id) return;
    try {
      definirCarregando(true);
      await diarioServico.excluirEntrada(id);
      // Após excluir, volta para a lista principal forçando refresh
      roteador.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Erro ao excluir', e.message ?? String(e));
    } finally {
      definirCarregando(false);
    }
  }

  if (!entrada) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText>{carregando ? 'Carregando...' : 'Entrada não encontrada'}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 12 }}>
      <ThemedView style={{ padding: 14, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}>
        <ThemedText type="title" style={{ marginBottom: 6 }}>{entrada.titulo}</ThemedText>
        <ThemedText>{entrada.conteudo}</ThemedText>
      </ThemedView>

      {midias.length > 0 ? (
        <View style={{ marginTop: 4 }}>
          <ThemedText style={{ marginBottom: 8, opacity: 0.7 }}>Mídias</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {midias.map((m) => (
              <MidiaItem key={m.id} midia={m} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={{ marginTop: 'auto' }}>
        <Button title={carregando ? 'Excluindo...' : 'Excluir entrada'} color="#d11" onPress={excluir} />
      </View>
    </ThemedView>
  );
}

function MidiaItem({ midia }: { midia: MidiaEntrada }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const signed = await diarioServico.obterUrlMidiaAssinada(midia.caminho_arquivo);
        setUrl(signed);
      } catch {
        setUrl(null);
      }
    })();
  }, [midia.caminho_arquivo]);

  if (!url) return null;
  if (midia.tipo === 'imagem') {
    return <Image source={{ uri: url }} style={{ width: 180, height: 140, borderRadius: 10 }} />;
  }
  if (midia.tipo === 'audio') {
    return <AudioPlayer uri={url} />;
  }
  if (midia.tipo === 'video') {
    return <Video source={{ uri: url }} style={{ width: 180, height: 140, borderRadius: 10 }} useNativeControls resizeMode="cover" />;
  }
  return null;
}

function AudioPlayer({ uri }: { uri: string }) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    (async () => {
      const { sound: s } = await Audio.Sound.createAsync({ uri });
      setSound(s);
      s.setOnPlaybackStatusUpdate((status: any) => {
        if (!status) return;
        if (status.isLoaded) {
          setPosition(status.positionMillis ?? 0);
          setDuration(status.durationMillis ?? 0);
          setPlaying(!!status.isPlaying);
        }
      });
    })();
    return () => {
      sound?.unloadAsync?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri]);

  async function toggle() {
    if (!sound) return;
    if (playing) {
      await sound.pauseAsync();
      setPlaying(false);
    } else {
      await sound.playAsync();
      setPlaying(true);
    }
  }

  return (
    <ThemedView style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, minWidth: 200 }}>
      <View style={{ marginBottom: 8 }}>
        <Button title={playing ? 'Pausar áudio' : 'Reproduzir áudio'} onPress={toggle} />
      </View>
      <View style={{ height: 6, borderRadius: 4, backgroundColor: '#00000022', overflow: 'hidden' }}>
        <View style={{ height: 6, width: duration ? `${Math.min(100, (position / duration) * 100)}%` : '0%', backgroundColor: '#3b82f6' }} />
      </View>
      <ThemedText style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
        {formatMs(position)} / {formatMs(duration)}
      </ThemedText>
    </ThemedView>
  );
}

function formatMs(ms: number): string {
  if (!ms || ms < 0) return '0:00';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}


