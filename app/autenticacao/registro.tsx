import { obterClienteSupabase } from '@/biblioteca/supabase';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, TextInput, View } from 'react-native';

/**
 * Tela de Registro: cria um usuário via Supabase Auth (email/senha).
 */
export default function TelaRegistro() {
  const supabase = obterClienteSupabase();
  const [email, definirEmail] = useState('');
  const [senha, definirSenha] = useState('');
  const [carregando, definirCarregando] = useState(false);

  async function registrar() {
    try {
      definirCarregando(true);
      const { error } = await supabase.auth.signUp({ email, password: senha });
      if (error) throw error;
      Alert.alert('Registro realizado', 'Verifique seu e-mail para confirmar a conta.');
    } catch (e: any) {
      Alert.alert('Erro no registro', e.message ?? String(e));
    } finally {
      definirCarregando(false);
    }
  }

  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 }}>
      <ThemedText type="title">Registro</ThemedText>
      <View style={{ width: '100%', gap: 8 }}>
        <TextInput
          placeholder="E-mail"
          autoCapitalize="none"
          inputMode="email"
          value={email}
          onChangeText={definirEmail}
          style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
        />
        <TextInput
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={definirSenha}
          style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
        />
        <Button title={carregando ? 'Registrando...' : 'Registrar'} onPress={registrar} disabled={carregando} />
      </View>
      <ThemedText>
        Já tem conta? <Link href="/autenticacao">Entrar</Link>
      </ThemedText>
    </ThemedView>
  );
}


