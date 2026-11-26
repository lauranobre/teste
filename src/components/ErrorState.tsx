import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';

interface ErrorStateProps {
  titulo?: string;
  mensagem?: string;
  onRetry: () => void;
  onOfflineFallback?: () => void;
}

export function ErrorState({
  titulo = 'Erro ao carregar dados. Verifique sua conexão',
  mensagem,
  onRetry,
  onOfflineFallback,
}: ErrorStateProps) {
  return (
    <View style={commonStyles.centerContainer}>
      <Ionicons name="cloud-offline-outline" size={52} color={colors.badgeNaoReciclado} />
      <Text style={styles.title}>{titulo}</Text>
      {mensagem ? <Text style={styles.message}>{mensagem}</Text> : null}

      <TouchableOpacity
        style={[commonStyles.primaryButton, styles.retryButton]}
        onPress={onRetry}
        activeOpacity={0.85}
      >
        <Ionicons name="refresh" size={18} color={colors.white} />
        <Text style={commonStyles.primaryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>

      {onOfflineFallback ? (
        <TouchableOpacity style={styles.offlineButton} onPress={onOfflineFallback}>
          <Text style={styles.offlineButtonText}>Ver dados salvos offline (SQLite)</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
    marginTop: 14,
  },
  message: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  retryButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    width: '100%',
    maxWidth: 260,
  },
  offlineButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  offlineButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
