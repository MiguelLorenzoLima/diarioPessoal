import { obterClienteSupabase } from '@/biblioteca/supabase';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, TextInput, View } from 'react-native';


export default function TelaLogin() {
  const supabase = obterClienteSupabase();
  const roteador = useRouter();
  const [email, definirEmail] = useState('');
  const [senha, definirSenha] = useState('');
  const [carregando, definirCarregando] = useState(false);

  async function entrar() {
    try {
      definirCarregando(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;
      // Redireciona para as abas ao autenticar com sucesso
      roteador.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Erro ao entrar', e.message ?? String(e));
    } finally {
      definirCarregando(false);
    }
  }

  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 16 }}>
      <ThemedText type="title">Entrar</ThemedText>
      <View style={{ width: '100%', gap: 12 }}>
        <TextInput
          placeholder="E-mail"
          autoCapitalize="none"
          inputMode="email"
          value={email}
          onChangeText={definirEmail}
          style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
        />
        <TextInput
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={definirSenha}
          style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
        />
        <Button title={carregando ? 'Entrando...' : 'Entrar'} onPress={entrar} disabled={carregando} />
      </View>
      <ThemedText>
        Não tem conta? <Link href="/autenticacao/registro">Registre-se</Link>
      </ThemedText>
    </ThemedView>
  );
}


