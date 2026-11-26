import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { validarCadastroUsuario } from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Cadastro'>;

export default function CadastroScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  async function handleCadastrar() {
    const validacao = validarCadastroUsuario({ nome, email, senha, confirmarSenha });
    if (!validacao.valido) {
      Alert.alert('Dados inválidos', validacao.erro);
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setCarregando(true);
    try {
      const novoUsuario = await apiService.cadastrarUsuario(
        {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          senha,
        },
        controller.signal
      );

      await storageService.salvarUsuarioLogado(novoUsuario);
      Alert.alert('Cadastro realizado!', `Bem-vindo(a) ao ReciclaSpot, ${novoUsuario.nome}!`, [
        { text: 'Continuar', onPress: () => navigation.replace('MainTabs') },
      ]);
    } catch (error) {
      if (error instanceof ApiClientError && error.isCanceled) {
        return;
      }
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Erro ao cadastrar cidadão. Verifique sua conexão.';
      Alert.alert('Erro no cadastro', mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={commonStyles.safeAreaWhite}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>
            Cadastre-se para registrar descartes, acumular pontos e sincronizar seus dados.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={commonStyles.inputField}
            placeholder="Nome completo"
            placeholderTextColor={colors.textMuted}
            value={nome}
            onChangeText={setNome}
            editable={!carregando}
          />

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
            placeholder="Senha (mínimo 6 caracteres)"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            editable={!carregando}
          />

          <TextInput
            style={commonStyles.inputField}
            placeholder="Confirmar senha"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            editable={!carregando}
          />

          <TouchableOpacity
            style={[
              commonStyles.primaryButton,
              styles.submitButton,
              carregando && commonStyles.primaryButtonDisabled,
            ]}
            onPress={handleCadastrar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={commonStyles.primaryButtonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 54,
    paddingBottom: 32,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  backText: {
    fontSize: 15,
    color: colors.textDark,
    fontWeight: '600',
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.darkBg,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: 8,
  },
});
