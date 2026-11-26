import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Callout, Marker, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEcopontos } from '../hooks/useEcopontos';
import { useLocation } from '../hooks/useLocation';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { RootStackParamList } from '../types';
import {
  DEFAULT_REGION,
  FOCUSED_REGION_DELTA,
  MAP_ANIMATION_DURATION_MS,
} from '../utils/constants';

export default function MapaScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const mapRef = useRef<MapView>(null);

  const [busca, setBusca] = useState('');

  const { coords, loading: loadingGps, error: gpsError, atualizarLocalizacao } = useLocation(true);
  const { ecopontos, loading: loadingApi, error: apiError, recarregar } = useEcopontos({
    userCoords: coords,
  });

  // Animate map to user position whenever coords update (external side-effect on the map ref).
  // We do NOT store region in state; MapView's initialRegion handles initial position.
  function animarParaCoordenadas(latitude: number, longitude: number) {
    const novaRegiao: Region = {
      latitude,
      longitude,
      latitudeDelta: FOCUSED_REGION_DELTA,
      longitudeDelta: FOCUSED_REGION_DELTA,
    };
    mapRef.current?.animateToRegion(novaRegiao, MAP_ANIMATION_DURATION_MS);
  }

  async function handleCentralizarGps() {
    const pos = await atualizarLocalizacao();
    if (pos) {
      animarParaCoordenadas(pos.latitude, pos.longitude);
    } else if (gpsError) {
      Alert.alert('Localização', gpsError);
    }
  }

  const pontosMapa = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return ecopontos;
    return ecopontos.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.bairro.toLowerCase().includes(termo)
    );
  }, [ecopontos, busca]);

  return (
    <SafeAreaView style={commonStyles.safeAreaWhite} edges={['top']}>
      <View style={styles.searchWrapper}>
        <View style={[commonStyles.searchBox, commonStyles.cardShadow]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={commonStyles.searchInput}
            placeholder="Buscar ecoponto no mapa"
            placeholderTextColor={colors.textMuted}
            value={busca}
            onChangeText={setBusca}
          />
        </View>
      </View>

      {(loadingGps || loadingApi) && (
        <View style={[styles.statusBanner, commonStyles.cardShadow]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.statusText}>
            {loadingGps ? 'Obtendo sua localização...' : 'Sincronizando ecopontos...'}
          </Text>
        </View>
      )}

      {apiError && !loadingApi && (
        <View style={[styles.errorBanner, commonStyles.cardShadow]}>
          <Text style={styles.errorBannerText} numberOfLines={2}>
            {apiError}
          </Text>
          <TouchableOpacity style={styles.retryPill} onPress={recarregar}>
            <Text style={styles.retryPillText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{ ...DEFAULT_REGION }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {pontosMapa.map((ponto) => (
          <Marker
            key={ponto.id}
            coordinate={{
              latitude: ponto.latitude,
              longitude: ponto.longitude,
            }}
            pinColor={colors.primary}
          >
            <Callout
              tooltip={false}
              onPress={() => navigation.navigate('Detalhes', { ponto })}
            >
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{ponto.nome}</Text>

                <Text style={styles.calloutMaterials}>
                  Materiais: {(ponto.materiaisAceitos ?? [ponto.categoria]).join(', ')}
                </Text>

                <View style={styles.calloutButton}>
                  <Text style={styles.calloutButtonText}>Ver detalhes</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity
        style={[styles.gpsButton, commonStyles.cardShadow]}
        onPress={handleCentralizarGps}
        disabled={loadingGps}
      >
        {loadingGps ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="locate" size={24} color={colors.primary} />
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Meus arredores ({pontosMapa.length} pontos)</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchWrapper: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  statusBanner: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    color: colors.textDark,
    fontWeight: '600',
  },
  errorBanner: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.badgeNaoReciclado,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: colors.textDark,
  },
  retryPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryPillText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  map: {
    flex: 1,
  },
  callout: {
    width: 190,
    padding: 6,
  },
  calloutTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.textDark,
  },
  calloutMaterials: {
    fontSize: 12,
    color: colors.textMuted,
    marginVertical: 4,
    lineHeight: 16,
  },
  calloutButton: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  calloutButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  gpsButton: {
    position: 'absolute',
    right: 16,
    bottom: 76,
    backgroundColor: colors.white,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    backgroundColor: colors.white,
    padding: 18,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 6,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
  },
});
