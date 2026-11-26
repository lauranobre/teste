import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ApiClientError, apiService } from '../services/api';
import { storageService } from '../services/storage';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { RootStackParamList } from '../types';
import { validarFormularioLogin } from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  async function handleLogin() {
    const validacao = validarFormularioLogin(email, senha);
    if (!validacao.valido) {
      Alert.alert('Atenção', validacao.erro);
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setCarregando(true);
    try {
      const usuario = await apiService.loginUsuario(
        { email: email.trim().toLowerCase(), senha },
        controller.signal
      );

      await storageService.salvarUsuarioLogado(usuario);
      navigation.replace('MainTabs');
    } catch (error) {
      if (error instanceof ApiClientError && error.isCanceled) {
        return;
      }
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível realizar o login.';
      Alert.alert('Erro ao entrar', mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="map-marker-radius" size={90} color={colors.primary} />
        <Text style={styles.logoText}>
          Recicla<Text style={styles.logoHighlight}>Spot</Text>
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={commonStyles.inputField}
          placeholder="E-mail"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          editable={!carregando}
        />

        <TextInput
          style={commonStyles.inputField}
          placeholder="Senha"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          editable={!carregando}
        />

        <TouchableOpacity
          style={[
            commonStyles.primaryButton,
            styles.loginButton,
            carregando && commonStyles.primaryButtonDisabled,
          ]}
          onPress={handleLogin}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={commonStyles.primaryButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Recuperação de senha',
              'Entre em contato com a central do ReciclaSpot ou crie uma nova conta em "Cadastre-se".'
            )
          }
        >
          <Text style={styles.forgotText}>Esqueci a senha</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.registerContainer}
        onPress={() => navigation.navigate('Cadastro')}
        disabled={carregando}
      >
        <Text style={styles.registerText}>Cadastre-se</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoText: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.darkBg,
    marginTop: 8,
  },
  logoHighlight: {
    color: colors.primary,
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: 4,
  },
  forgotText: {
    color: colors.textDark,
    fontSize: 13,
    marginTop: 12,
  },
  registerContainer: {
    alignItems: 'center',
  },
  registerText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
