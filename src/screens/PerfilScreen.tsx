import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storageService } from '../services/storage';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { RootStackParamList, Usuario } from '../types';
import { POINTS_PER_DISPOSAL } from '../utils/constants';
import { resolveImageSource } from '../utils/image';

const USUARIO_PADRAO: Usuario = {
  id: 'u1',
  nome: 'Mariana Costa',
  username: 'Eco-mariana1234',
  email: 'mariana@email.com',
  pontosReciclagem: 450,
  descartesRealizados: 45,
  kgsReciclados: 12.3,
  fotoPerfilUri: 'images3.jpg',
};

export default function PerfilScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [usuario, setUsuario] = useState<Usuario>(USUARIO_PADRAO);
  const [ultimaFotoDescarte, setUltimaFotoDescarte] = useState<string | null>(null);
  const [carregandoCamera, setCarregandoCamera] = useState(false);

  useEffect(() => {
    async function carregarDadosLocais() {
      const [usuarioSalvo, fotosSalvas] = await Promise.all([
        storageService.obterUsuarioLogado(),
        storageService.obterPerfilFotos(),
      ]);

      if (usuarioSalvo) {
        setUsuario((prev) => ({
          ...prev,
          ...usuarioSalvo,
          fotoPerfilUri: fotosSalvas.fotoPerfilUri ?? usuarioSalvo.fotoPerfilUri,
        }));
      } else if (fotosSalvas.fotoPerfilUri) {
        setUsuario((prev) => ({
          ...prev,
          fotoPerfilUri: fotosSalvas.fotoPerfilUri ?? prev.fotoPerfilUri,
        }));
      }

      if (fotosSalvas.ultimaFotoDescarte) {
        setUltimaFotoDescarte(fotosSalvas.ultimaFotoDescarte);
      }
    }

    carregarDadosLocais();
  }, []);

  async function abrirCamera(modo: 'avatar' | 'descarte') {
    setCarregandoCamera(true);
    try {
      const permissao = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert(
          'Permissão necessária',
          'Ative a permissão da câmera nas configurações do celular para tirar fotos.'
        );
        return;
      }

      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        const novaUri = resultado.assets[0].uri;

        if (modo === 'avatar') {
          const atualizado = { ...usuario, fotoPerfilUri: novaUri };
          setUsuario(atualizado);
          await storageService.salvarPerfilFotos({ fotoPerfilUri: novaUri });
          await storageService.salvarUsuarioLogado(atualizado);
          Alert.alert('Sucesso', 'Foto de perfil atualizada!');
        } else {
          setUltimaFotoDescarte(novaUri);
          await storageService.salvarPerfilFotos({ ultimaFotoDescarte: novaUri });
          const atualizado: Usuario = {
            ...usuario,
            descartesRealizados: (usuario.descartesRealizados ?? 0) + 1,
            pontosReciclagem: usuario.pontosReciclagem + POINTS_PER_DISPOSAL,
          };
          setUsuario(atualizado);
          await storageService.salvarUsuarioLogado(atualizado);
          Alert.alert(
            'Descarte Registrado!',
            `Comprovante salvo e você ganhou +${POINTS_PER_DISPOSAL} pontos.`
          );
        }
      }
    } catch {
      Alert.alert(
        'Erro ao abrir câmera',
        'Verifique se o aparelho concedeu permissão de câmera.'
      );
    } finally {
      setCarregandoCamera(false);
    }
  }

  async function handleSair() {
    await storageService.removerUsuarioLogado();
    navigation.replace('Login');
  }

  return (
    <SafeAreaView style={commonStyles.safeAreaWhite} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBanner} />

        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={() => abrirCamera('avatar')} disabled={carregandoCamera}>
            <Image source={resolveImageSource(usuario.fotoPerfilUri)} style={styles.avatar} />
            <View style={styles.editAvatarBadge}>
              <Ionicons name="camera" size={14} color={colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{usuario.nome}</Text>
          <Text style={styles.username}>{usuario.username ?? usuario.email}</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Descartes</Text>
            <Text style={styles.statValue}>{usuario.descartesRealizados ?? 0}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Kgs Reciclados</Text>
            <Text style={styles.statValue}>{usuario.kgsReciclados ?? 0}</Text>
          </View>
        </View>

        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => abrirCamera('descarte')}
            disabled={carregandoCamera}
          >
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={22}
                color={colors.textDark}
              />
              <Text style={styles.menuText}>Registrar Descarte Consciente</Text>
            </View>
            {carregandoCamera ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert('Pontos Acumulados', `Você possui ${usuario.pontosReciclagem} pontos!`)
            }
          >
            <View style={styles.menuLeft}>
              <Ionicons name="logo-usd" size={22} color={colors.textDark} />
              <Text style={styles.menuText}>
                Pontos Acumulados ({usuario.pontosReciclagem})
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleSair}>
            <View style={styles.menuLeft}>
              <Ionicons name="log-out-outline" size={22} color={colors.badgeNaoReciclado} />
              <Text style={[styles.menuText, { color: colors.badgeNaoReciclado }]}>
                Sair da conta
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {ultimaFotoDescarte && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Último Comprovante de Descarte</Text>
            <Image source={{ uri: ultimaFotoDescarte }} style={styles.previewImage} />
          </View>
        )}

        <View style={styles.cameraWrapper}>
          <TouchableOpacity
            style={[commonStyles.primaryButton, styles.cameraButton]}
            onPress={() => abrirCamera('descarte')}
            disabled={carregandoCamera}
          >
            {carregandoCamera ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={24} color={colors.white} />
                <Text style={commonStyles.primaryButtonText}>Fotografar Descarte</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 30 },
  topBanner: { height: 110, backgroundColor: colors.primary },
  profileHeader: { alignItems: 'center', marginTop: -50 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: '#DDD',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  name: { fontSize: 22, fontWeight: '700', color: colors.textDark, marginTop: 8 },
  username: { fontSize: 13, color: colors.primary, marginTop: 2 },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#F3F5F4',
    marginHorizontal: 28,
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 14,
  },
  statBox: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: colors.border },
  statLabel: { fontSize: 12, color: colors.textMuted },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.textDark, marginTop: 4 },
  menu: { marginTop: 24, paddingHorizontal: 28 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuText: { fontSize: 15, color: colors.textDark, fontWeight: '500' },
  previewCard: {
    marginTop: 20,
    marginHorizontal: 28,
    padding: 12,
    backgroundColor: '#F3F5F4',
    borderRadius: 12,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: '#DDD',
  },
  cameraWrapper: { marginTop: 24, paddingHorizontal: 28, alignItems: 'center' },
  cameraButton: {
    width: '100%',
  },
});
