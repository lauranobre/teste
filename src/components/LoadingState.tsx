import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';

interface LoadingStateProps {
  mensagem?: string;
}

export function LoadingState({ mensagem = 'Carregando...' }: LoadingStateProps) {
  return (
    <View style={commonStyles.centerContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
