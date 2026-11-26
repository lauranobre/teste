import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFavoritos } from '../hooks/useFavoritos';
import { ApiClientError, apiService } from '../services/api';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { PontoColeta, RootStackParamList } from '../types';
import { DEFAULT_DISPOSAL_RULES } from '../utils/constants';
import { resolveImageSource } from '../utils/image';
import { formatarHorarioFuncionamento } from '../utils/schedule';

type Props = NativeStackScreenProps<RootStackParamList, 'Detalhes'>;

export default function DetalhesScreen({ route, navigation }: Props) {
  const { ponto: pontoInicial } = route.params;
  const [ponto, setPonto] = useState<PontoColeta>(pontoInicial);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(true);
  const [erroDetalhes, setErroDetalhes] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const { isFavorito, salvando: salvandoFavorito, toggleFavorito } = useFavoritos();

  const favoritoAtivo = isFavorito(ponto.id);

  const carregarDetalhes = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setCarregandoDetalhes(true);
    setErroDetalhes(null);

    try {
      const dadosAtualizados = await apiService.getEcopontoById(pontoInicial.id, controller.signal);
      setPonto((prev) => ({
        ...dadosAtualizados,
        distanciaKm: prev.distanciaKm ?? dadosAtualizados.distanciaKm,
      }));
    } catch (error) {
      if (error instanceof ApiClientError && error.isCanceled) {
        return;
      }
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível atualizar os detalhes.';
      setErroDetalhes(mensagem);
    } finally {
      setCarregandoDetalhes(false);
    }
  }, [pontoInicial.id]);

  useEffect(() => {
    let canceled = false;
    async function run() {
      await carregarDetalhes();
    }
    if (!canceled) run();
    return () => {
      canceled = true;
      abortControllerRef.current?.abort();
    };
  }, [carregarDetalhes]);

  const materiais = ponto.materiaisAceitos ?? [ponto.categoria, 'Plástico', 'Vidro'];
  const regras = ponto.regras?.length ? ponto.regras : [...DEFAULT_DISPOSAL_RULES];

  async function handleToggleFavorito() {
    try {
      await toggleFavorito(ponto);
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar seus favoritos offline.');
    }
  }

  function abrirRotaNoMapa() {
    const { latitude, longitude, nome } = ponto;
    const label = encodeURIComponent(nome);
    const webFallbackUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
      default: webFallbackUrl,
    });

    Linking.openURL(url || webFallbackUrl).catch(() => {
      Linking.openURL(webFallbackUrl);
    });
  }

  return (
    <View style={commonStyles.safeAreaWhite}>
      <View style={styles.imageWrapper}>
        <Image source={resolveImageSource(ponto.imagemUri)} style={styles.coverImage} />

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.topFavoriteButton}
          onPress={handleToggleFavorito}
          disabled={salvandoFavorito}
        >
          <Ionicons
            name={favoritoAtivo ? 'heart' : 'heart-outline'}
            size={24}
            color={favoritoAtivo ? '#E53935' : colors.white}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{ponto.nome}</Text>
          {carregandoDetalhes && <ActivityIndicator size="small" color={colors.primary} />}
        </View>

        {erroDetalhes && (
          <View style={styles.syncWarning}>
            <Text style={styles.syncWarningText}>Exibindo dados em cache. {erroDetalhes}</Text>
            <TouchableOpacity onPress={carregarDetalhes}>
              <Text style={styles.syncRetryText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={colors.textDark} />
          <Text style={styles.infoText}>
            {ponto.endereco} - {ponto.bairro}
          </Text>
        </View>

        {ponto.verificado !== false && (
          <View style={styles.infoRow}>
            <Ionicons name="checkmark" size={16} color={colors.verifiedBlue} />
            <Text style={[styles.infoText, { color: colors.verifiedBlue }]}>Verificado</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={colors.textDark} />
          <Text style={styles.infoText}>
            {formatarHorarioFuncionamento(ponto.horarioFuncionamento)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color={colors.textDark} />
          <Text style={styles.infoText}>{ponto.telefoneContato}</Text>
        </View>

        <View style={styles.badgesRow}>
          {materiais.map((mat, index) => (
            <View key={`${mat}-${index}`} style={styles.materialBadge}>
              <Text style={styles.materialText}>{mat}</Text>
            </View>
          ))}
        </View>

        <View style={styles.rulesContainer}>
          {regras.map((regra, idx) => (
            <Text key={idx} style={styles.ruleItem}>
              • {regra}
            </Text>
          ))}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.favoriteActionButton,
              favoritoAtivo && styles.favoriteActionButtonActive,
            ]}
            onPress={handleToggleFavorito}
            disabled={salvandoFavorito}
          >
            {salvandoFavorito ? (
              <ActivityIndicator
                size="small"
                color={favoritoAtivo ? colors.white : colors.primary}
              />
            ) : (
              <>
                <Ionicons
                  name={favoritoAtivo ? 'star' : 'star-outline'}
                  size={20}
                  color={favoritoAtivo ? colors.white : colors.primary}
                />
                <Text
                  style={[
                    styles.favoriteActionText,
                    favoritoAtivo && styles.favoriteActionTextActive,
                  ]}
                >
                  {favoritoAtivo ? 'Remover dos Favoritos' : 'Favoritar Ponto'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={commonStyles.primaryButton} onPress={abrirRotaNoMapa}>
            <Text style={commonStyles.primaryButtonText}>Traçar Rota</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrapper: { position: 'relative' },
  coverImage: { width: '100%', height: 220, backgroundColor: '#CCC' },
  backButton: {
    position: 'absolute',
    top: 44,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    padding: 6,
  },
  topFavoriteButton: {
    position: 'absolute',
    top: 44,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    padding: 7,
  },
  body: { padding: 20 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.textDark, flex: 1 },
  syncWarning: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: colors.badgeNaoReciclado,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  syncWarningText: { fontSize: 12, color: colors.textDark, flex: 1 },
  syncRetryText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  infoText: { fontSize: 13, color: colors.textDark },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 14 },
  materialBadge: {
    backgroundColor: colors.badgePapel,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  materialText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  rulesContainer: { marginTop: 4, marginBottom: 24 },
  ruleItem: { fontSize: 13, color: colors.textMuted, marginBottom: 6, lineHeight: 18 },
  actionsContainer: { gap: 12 },
  favoriteActionButton: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
  },
  favoriteActionButtonActive: {
    backgroundColor: colors.primary,
  },
  favoriteActionText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  favoriteActionTextActive: {
    color: colors.white,
  },
});
