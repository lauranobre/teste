import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EcopontoCard } from '../components/EcopontoCard';
import { LoadingState } from '../components/LoadingState';
import { useFavoritos } from '../hooks/useFavoritos';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { RootStackParamList } from '../types';

export default function FavoritosScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { favoritos, carregando, recarregarFavoritos } = useFavoritos();
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      recarregarFavoritos();
    }, [recarregarFavoritos])
  );

  const favoritosFiltrados = useMemo(() => {
    if (!filtroCategoria) return favoritos;
    return favoritos.filter(
      (item) =>
        item.categoria?.toLowerCase().includes(filtroCategoria.toLowerCase()) ||
        (filtroCategoria === 'E-lixo' && item.categoria === 'Eletrônicos')
    );
  }, [favoritos, filtroCategoria]);

  return (
    <SafeAreaView style={commonStyles.safeAreaWhite} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Favoritos</Text>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.pill,
              { backgroundColor: filtroCategoria === null ? colors.primary : '#E0E4E2' },
            ]}
            onPress={() => setFiltroCategoria(null)}
          >
            <Text
              style={[
                styles.pillText,
                { color: filtroCategoria === null ? colors.white : colors.textDark },
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pill,
              { backgroundColor: filtroCategoria === 'E-lixo' ? colors.primary : '#E0E4E2' },
            ]}
            onPress={() => setFiltroCategoria(filtroCategoria === 'E-lixo' ? null : 'E-lixo')}
          >
            <Text
              style={[
                styles.pillText,
                { color: filtroCategoria === 'E-lixo' ? colors.white : colors.textDark },
              ]}
            >
              E-lixo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pill,
              { backgroundColor: filtroCategoria === 'Óleo' ? colors.badgeOleo : '#E0E4E2' },
            ]}
            onPress={() => setFiltroCategoria(filtroCategoria === 'Óleo' ? null : 'Óleo')}
          >
            <Text
              style={[
                styles.pillText,
                { color: filtroCategoria === 'Óleo' ? colors.white : colors.textDark },
              ]}
            >
              Óleo
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>
          Meus Ecopontos Favoritos ({favoritosFiltrados.length})
        </Text>

        {carregando ? (
          <LoadingState mensagem="Carregando favoritos salvos..." />
        ) : favoritosFiltrados.length === 0 ? (
          <View style={commonStyles.centerContainer}>
            <Ionicons name="star-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhum favorito encontrado</Text>
            <Text style={styles.emptyText}>
              {filtroCategoria
                ? `Você ainda não favoritou nenhum ponto na categoria ${filtroCategoria}.`
                : 'Abra os detalhes de um ecoponto e toque em "Favoritar Ponto" para acessá-lo mesmo sem internet.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={favoritosFiltrados}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={carregando}
                onRefresh={recarregarFavoritos}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            renderItem={({ item }) => (
              <EcopontoCard
                ponto={{
                  ...item,
                  statusProjeto: item.id === '1' ? 'Projeto finalizado' : item.statusProjeto,
                }}
                showStatusBadge={item.id === '1'}
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
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 22, fontWeight: '700', color: colors.textDark, marginBottom: 14 },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  pill: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20 },
  pillText: { fontWeight: '700', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark, marginBottom: 12 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
});
