import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EcopontoCard } from '../components/EcopontoCard';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { useEcopontos } from '../hooks/useEcopontos';
import { useLocation } from '../hooks/useLocation';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { CategoriaResiduo, RootStackParamList } from '../types';
import { FILTROS_MATERIAIS } from '../utils/constants';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<CategoriaResiduo | null>(null);

  const { coords } = useLocation(true);

  const materialQuery = useMemo(() => {
    if (!categoriaSelecionada) return undefined;
    return FILTROS_MATERIAIS.find((item) => item.valor === categoriaSelecionada)?.queryMaterial;
  }, [categoriaSelecionada]);

  const {
    ecopontos,
    loading,
    refreshing,
    error,
    offlineCacheDisponivel,
    recarregar,
    pullToRefresh,
    carregarCacheOffline,
  } = useEcopontos({
    material: materialQuery,
    userCoords: coords,
  });

  const pontosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return ecopontos;

    return ecopontos.filter(
      (item) =>
        item.nome.toLowerCase().includes(termo) ||
        item.bairro.toLowerCase().includes(termo) ||
        item.endereco.toLowerCase().includes(termo)
    );
  }, [ecopontos, busca]);

  return (
    <SafeAreaView style={commonStyles.safeAreaPrimary} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ReciclaSpot</Text>
        <View style={commonStyles.searchBox}>
          <TextInput
            style={commonStyles.searchInput}
            placeholder="Buscar coletas por nome ou bairro"
            placeholderTextColor={colors.textMuted}
            value={busca}
            onChangeText={setBusca}
          />
          {busca.length > 0 ? (
            <TouchableOpacity onPress={() => setBusca('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="search" size={20} color={colors.textMuted} />
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.filterRow}>
          {FILTROS_MATERIAIS.map((filtro) => {
            const ativo = categoriaSelecionada === filtro.valor;
            return (
              <TouchableOpacity
                key={filtro.valor}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: filtro.cor,
                    opacity: ativo || !categoriaSelecionada ? 1 : 0.4,
                    borderWidth: ativo ? 2 : 0,
                    borderColor: colors.darkBg,
                  },
                ]}
                onPress={() => setCategoriaSelecionada(ativo ? null : filtro.valor)}
              >
                <Text style={styles.filterText}>{filtro.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading && !refreshing ? (
          <LoadingState mensagem="Carregando ecopontos..." />
        ) : error ? (
          <ErrorState
            mensagem={error}
            onRetry={recarregar}
            onOfflineFallback={offlineCacheDisponivel ? carregarCacheOffline : undefined}
          />
        ) : (
          <FlatList
            data={pontosFiltrados}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={pullToRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum ecoponto encontrado para este filtro.</Text>
            }
            renderItem={({ item }) => (
              <EcopontoCard
                ponto={item}
                onPress={() => navigation.navigate('Detalhes', { ponto: item })}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 12,
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  filterText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 40,
    fontSize: 15,
  },
});
