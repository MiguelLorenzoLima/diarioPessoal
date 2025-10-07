import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { diarioServico } from '@/servicos/diario';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';

/**
 * Tela para criar nova entrada e enviar mídias (imagens/vídeos/áudios).
 */
export default function NovaEntradaTela() {
  const [titulo, definirTitulo] = useState('');
  const [conteudo, definirConteudo] = useState('');
  const [carregando, definirCarregando] = useState(false);
  const [imagemSelecionada, definirImagemSelecionada] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [audioUri, definirAudioUri] = useState<string | null>(null);
  const [videoSelecionado, definirVideoSelecionado] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [gravando, definirGravando] = useState<Audio.Recording | null>(null);
  const roteador = useRouter();

  async function escolherImagem() {
    const mediaTypeImage = (ImagePicker as any).MediaType?.image ?? (ImagePicker as any).MediaTypeOptions?.Images;
    const mediaTypes = (ImagePicker as any).MediaType ? [mediaTypeImage] : mediaTypeImage;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes } as any);
    if (!res.canceled && res.assets?.length) {
      definirImagemSelecionada(res.assets[0]);
    }
  }

  async function tirarFoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Conceda acesso à câmera para tirar fotos.');
      return;
    }
    const mediaTypeImage = (ImagePicker as any).MediaType?.image ?? (ImagePicker as any).MediaTypeOptions?.Images;
    const mediaTypes = (ImagePicker as any).MediaType ? [mediaTypeImage] : mediaTypeImage;
    const res = await ImagePicker.launchCameraAsync({ mediaTypes } as any);
    if (!res.canceled && res.assets?.length) {
      definirImagemSelecionada(res.assets[0]);
    }
  }

  async function escolherVideo() {
    const mediaTypeVideo = (ImagePicker as any).MediaType?.video ?? (ImagePicker as any).MediaTypeOptions?.Videos;
    const mediaTypes = (ImagePicker as any).MediaType ? [mediaTypeVideo] : mediaTypeVideo;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes } as any);
    if (!res.canceled && res.assets?.length) {
      definirVideoSelecionado(res.assets[0]);
    }
  }

  async function gravarVideo() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Conceda acesso à câmera para gravar vídeo.');
      return;
    }
    const mediaTypeVideo = (ImagePicker as any).MediaType?.video ?? (ImagePicker as any).MediaTypeOptions?.Videos;
    const mediaTypes = (ImagePicker as any).MediaType ? [mediaTypeVideo] : mediaTypeVideo;
    const res = await ImagePicker.launchCameraAsync({ mediaTypes } as any);
    if (!res.canceled && res.assets?.length) {
      definirVideoSelecionado(res.assets[0]);
    }
  }

  async function iniciarGravacao() {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Conceda acesso ao microfone para gravar áudio.');
      return;
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    definirGravando(recording);
  }

  async function pararGravacao() {
    if (!gravando) return;
    await gravando.stopAndUnloadAsync();
    const uri = gravando.getURI();
    definirAudioUri(uri ?? null);
    definirGravando(null);
  }

  async function salvar() {
    try {
      definirCarregando(true);
      const entrada = await diarioServico.criarEntrada(titulo, conteudo);
      // Upload de imagem
      if (imagemSelecionada) {
        const nomeArquivo = imagemSelecionada.fileName ?? imagemSelecionada.uri.split('/').pop() ?? `imagem-${Date.now()}.jpg`;
        const tipoMime = imagemSelecionada.mimeType ?? 'image/jpeg';
        await diarioServico.enviarMidia(entrada.id, { uri: imagemSelecionada.uri, nome: nomeArquivo, tipoMime }, 'imagem');
      }
      // Upload de vídeo
      if (videoSelecionado) {
        const nomeArquivo = videoSelecionado.fileName ?? videoSelecionado.uri.split('/').pop() ?? `video-${Date.now()}.mp4`;
        const tipoMime = videoSelecionado.mimeType ?? 'video/mp4';
        await diarioServico.enviarMidia(entrada.id, { uri: videoSelecionado.uri, nome: nomeArquivo, tipoMime }, 'video');
      }
      // Upload de áudio
      if (audioUri) {
        const nomeArquivo = `audio-${Date.now()}.m4a`;
        await diarioServico.enviarMidia(entrada.id, { uri: audioUri, nome: nomeArquivo, tipoMime: 'audio/m4a' }, 'audio');
      }
      // Resetar estado local após salvar
      definirTitulo('');
      definirConteudo('');
      definirImagemSelecionada(null);
      definirAudioUri(null);
      definirVideoSelecionado(null);
      // Voltar para a aba Diário; a lista escuta foco e recarrega
      roteador.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Erro ao salvar', e.message ?? String(e));
    } finally {
      definirCarregando(false);
    }
  }

  // Azul do título de nova entrada
  const azulTitulo = '#1b40b9ff';

  return (
    <ThemedView style={{
      marginTop: 100, marginBottom: 100, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 16
    }}>

      <ThemedText type="title" style={{ marginBottom: 4 }}>Nova entrada</ThemedText>
      <TextInput
        placeholder="Título"
        value={titulo}
        onChangeText={definirTitulo}
        placeholderTextColor="#AFC7FF"
        style={{
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
          backgroundColor: azulTitulo,
          color: '#ECF4FF',
          borderColor: '#3A4A7A',
          width: '100%',
          marginBottom: 4,
        }}
      />
      <TextInput
        placeholder="Conteúdo"
        value={conteudo}
        onChangeText={definirConteudo}
        multiline
        placeholderTextColor="#AFC7FF"
        style={{
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
          height: 160,
          backgroundColor: azulTitulo,
          color: '#ECF4FF',
          borderColor: '#3A4A7A',
          width: '100%',
        }}
      />
      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Pressable
          onPress={escolherImagem}
          style={({ pressed }: { pressed: boolean }) => [{
            borderRadius: 999,
            borderWidth: 2,
            borderColor: azulTitulo,
            paddingVertical: 10,
            paddingHorizontal: 18,
            backgroundColor: '#fff',
            marginBottom: 2,
            alignItems: 'center',
            minWidth: 80,
            opacity: pressed ? 0.7 : 1,
          }]}
        >
          <ThemedText style={{ color: azulTitulo, fontWeight: 'bold', fontSize: 14 }}>{imagemSelecionada ? 'Trocar imagem' : 'Adicionar imagem'}</ThemedText>
        </Pressable>
        <Pressable
          onPress={tirarFoto}
          style={({ pressed }: { pressed: boolean }) => [{
            borderRadius: 999,
            borderWidth: 2,
            borderColor: azulTitulo,
            paddingVertical: 10,
            paddingHorizontal: 18,
            backgroundColor: '#fff',
            marginBottom: 2,
            alignItems: 'center',
            minWidth: 80,
            opacity: pressed ? 0.7 : 1,
          }]}
        >
          <ThemedText style={{ color: azulTitulo, fontWeight: 'bold', fontSize: 14 }}>Tirar foto</ThemedText>
        </Pressable>
        <Pressable
          onPress={escolherVideo}
          style={({ pressed }: { pressed: boolean }) => [{
            borderRadius: 999,
            borderWidth: 2,
            borderColor: azulTitulo,
            paddingVertical: 10,
            paddingHorizontal: 18,
            backgroundColor: '#fff',
            marginBottom: 2,
            alignItems: 'center',
            minWidth: 80,
            opacity: pressed ? 0.7 : 1,
          }]}
        >
          <ThemedText style={{ color: azulTitulo, fontWeight: 'bold', fontSize: 14 }}>{videoSelecionado ? 'Trocar vídeo' : 'Adicionar vídeo'}</ThemedText>
        </Pressable>
        <Pressable
          onPress={gravarVideo}
          style={({ pressed }: { pressed: boolean }) => [{
            borderRadius: 999,
            borderWidth: 2,
            borderColor: azulTitulo,
            paddingVertical: 10,
            paddingHorizontal: 18,
            backgroundColor: '#fff',
            marginBottom: 2,
            alignItems: 'center',
            minWidth: 80,
            opacity: pressed ? 0.7 : 1,
          }]}
        >
          <ThemedText style={{ color: azulTitulo, fontWeight: 'bold', fontSize: 14 }}>Gravar vídeo</ThemedText>
        </Pressable>
        {gravando ? (
          <Pressable
            onPress={pararGravacao}
            style={({ pressed }: { pressed: boolean }) => [{
              borderRadius: 999,
              borderWidth: 2,
              borderColor: '#d11',
              paddingVertical: 10,
              paddingHorizontal: 18,
              backgroundColor: '#fff',
              marginBottom: 2,
              alignItems: 'center',
              minWidth: 80,
              opacity: pressed ? 0.7 : 1,
            }]}
          >
            <ThemedText style={{ color: '#d11', fontWeight: 'bold', fontSize: 14 }}>Parar gravação</ThemedText>
          </Pressable>
        ) : (
          <Pressable
            onPress={iniciarGravacao}
            style={({ pressed }: { pressed: boolean }) => [{
              borderRadius: 999,
              borderWidth: 2,
              borderColor: azulTitulo,
              paddingVertical: 10,
              paddingHorizontal: 18,
              backgroundColor: '#fff',
              marginBottom: 2,
              alignItems: 'center',
              minWidth: 80,
              opacity: pressed ? 0.7 : 1,
            }]}
          >
            <ThemedText style={{ color: azulTitulo, fontWeight: 'bold', fontSize: 14 }}>{audioUri ? 'Regravar áudio' : 'Gravar áudio'}</ThemedText>
          </Pressable>
        )}
      </View>
      <View style={{ marginTop: 4, width: '100%' }}>
        <Pressable
          onPress={salvar}
          disabled={carregando}
          style={({ pressed }: { pressed: boolean }) => [{
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
            backgroundColor: azulTitulo,
            opacity: carregando || pressed ? 0.7 : 1,
          }]}
        >
          <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{carregando ? 'Salvando...' : 'Salvar'}</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}


