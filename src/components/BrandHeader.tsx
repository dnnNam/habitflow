import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fontSizes, fontWeights, radius, spacing } from '../theme';

interface BrandHeaderProps {
  subtitle: string;
  compact?: boolean;
}

export default function BrandHeader({ subtitle, compact = false }: BrandHeaderProps) {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      {!compact && (
        <View style={styles.logo}>
          <MaterialIcons name="water-drop" size={32} color={colors.primary} />
        </View>
      )}
      <Text style={styles.title}>HabitFlow</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  compact: {
    gap: 4,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(19, 27, 46, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.primary,
    fontSize: fontSizes.display,
    lineHeight: 48,
    fontWeight: fontWeights.extrabold,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.body,
    textAlign: 'center',
  },
});
