import type { ReactNode } from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fontSizes, fontWeights, gradients, radius, spacing } from '../theme';

interface GradientButtonProps {
  title?: string;
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  gradientStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export default function GradientButton({
  title,
  onPress,
  icon = 'arrow-forward',
  gradientStyle,
  style,
  children,
  disabled = false,
  loading = false,
}: GradientButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      onPress={onPress}
      style={[styles.wrapper, (disabled || loading) && styles.disabled, style]}
    >
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, gradientStyle]}
      >
        {children ?? (
          <>
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                {title ? <Text style={styles.title}>{title}</Text> : null}
                <MaterialIcons name={icon} size={18} color={colors.white} />
              </>
            )}
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  disabled: {
    opacity: 0.64,
  },
  gradient: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  title: {
    color: colors.white,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
