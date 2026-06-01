import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fontSizes, fontWeights, radius, spacing } from '../theme';

interface AppTextFieldProps extends TextInputProps {
  label?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  showPasswordToggle?: boolean;
}

export default function AppTextField({
  label,
  icon,
  style,
  secureTextEntry,
  showPasswordToggle = false,
  ...inputProps
}: AppTextFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const shouldShowToggle = showPasswordToggle || Boolean(secureTextEntry);

  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputWrapper}>
        <MaterialIcons name={icon} size={20} color={colors.outline} style={styles.icon} />
        <TextInput
          {...inputProps}
          placeholderTextColor={colors.outlineVariant}
          selectionColor={colors.primary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          style={[styles.input, style]}
        />
        {shouldShowToggle ? (
          <MaterialIcons
            name={isPasswordVisible ? 'visibility-off' : 'visibility'}
            size={21}
            color={colors.outline}
            style={styles.trailingIcon}
            onPress={() => setIsPasswordVisible((current) => !current)}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
    paddingLeft: spacing.xs,
  },
  inputWrapper: {
    minHeight: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(149,142,160,0.3)',
    backgroundColor: 'rgba(19, 27, 46, 0.72)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.onSurface,
    fontSize: fontSizes.body,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
  },
  trailingIcon: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
