import { Redirect } from 'expo-router';
import { usoAutenticacao } from '@/ganchos/usoAutenticacao';

export default function Index() {
  const { carregando, usuario } = usoAutenticacao();
  if (carregando) return null;
  return <Redirect href={usuario ? '/(tabs)' : '/autenticacao'} />;
}


