import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fontSizes, fontWeights, gradients, radius, spacing } from '../theme';

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
      <LinearGradient
        colors={gradients.text}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.titleBackdrop}
      >
        <Text style={styles.title}>HabitFlow</Text>
      </LinearGradient>
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
  titleBackdrop: {
    borderRadius: radius.sm,
    paddingHorizontal: 1,
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
