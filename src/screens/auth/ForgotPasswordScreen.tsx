import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AppTextField from '../../components/AppTextField';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import Screen from '../../components/Screen';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { colors, fontSizes, fontWeights, radius, spacing } from '../../theme';

type ForgotPasswordNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotPasswordNavigationProp>();

  return (
    <Screen centered>
      <GlassCard style={styles.card}>
        <TouchableOpacity activeOpacity={0.75} style={styles.backButton} onPress={() => navigation.navigate('Login')}>
          <MaterialIcons name="arrow-back" size={20} color={colors.onSurfaceVariant} />
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>

        <View style={styles.iconBox}>
          <MaterialIcons name="lock-reset" size={26} color={colors.primary} />
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.description}>
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </Text>
        </View>

        <View style={styles.form}>
          <AppTextField
            label="Email Address"
            icon="mail"
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
          />
          <GradientButton title="Send Reset Link" onPress={() => navigation.navigate('Login')} />
        </View>
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.xxl,
    borderRadius: radius.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.section,
  },
  backText: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  copy: {
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  title: {
    color: colors.onSurface,
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
  },
  description: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.body,
    lineHeight: 24,
  },
  form: {
    gap: spacing.lg,
  },
});
