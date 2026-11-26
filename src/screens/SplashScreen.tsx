import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { storageService } from '../services/storage';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../types';
import { SPLASH_DELAY_MS } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    let ativo = true;

    const timer = setTimeout(async () => {
      const usuarioLogado = await storageService.obterUsuarioLogado();
      if (!ativo) return;
      navigation.replace(usuarioLogado ? 'MainTabs' : 'Login');
    }, SPLASH_DELAY_MS);

    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={() => navigation.replace('Login')}
    >
      <MaterialCommunityIcons name="leaf-circle" size={110} color={colors.accentGreen} />
      <Text style={styles.logoText}>
        Recicla<Text style={styles.logoHighlight}>Spot</Text>
      </Text>
      <Text style={styles.subtitle}>
        Conectando o cidadão ao descarte consciente
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoText: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.white,
    marginTop: 16,
  },
  logoHighlight: {
    color: colors.accentGreen,
  },
  subtitle: {
    fontSize: 14,
    color: '#D0D7D5',
    textAlign: 'center',
    marginTop: 8,
  },
});
