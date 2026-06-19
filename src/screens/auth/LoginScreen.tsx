import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AppTextField from '../../components/AppTextField';
import BrandHeader from '../../components/BrandHeader';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import Screen from '../../components/Screen';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import { clearAuthError, fetchProfile, login } from '../../features/auth/authSlice';
import { selectAuthError, selectAuthIsLoading } from '../../features/auth/authSelector';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { colors, fontSizes, fontWeights, radius, spacing } from '../../theme';
import { hasValidationErrors, validateLoginForm } from '../../utils/authValidation';
import type { LoginValidationErrors } from '../../utils/authValidation';

type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<LoginNavigationProp>();
  const isLoading = useAppSelector(selectAuthIsLoading);
  const authError = useAppSelector(selectAuthError);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<LoginValidationErrors>({});

  const handleSignIn = async () => {
    const nextValidationErrors = validateLoginForm({ email, password });
    setValidationErrors(nextValidationErrors);

    if (hasValidationErrors(nextValidationErrors)) {
      return;
    }

    const result = await dispatch(login({
      email: email.trim(),
      password,
    }));

    if (login.fulfilled.match(result)) {
      dispatch(fetchProfile());
    }
  };

  const handleNavigateToRegister = () => {
    dispatch(clearAuthError());
    navigation.navigate('Register');
  };

  const handleNavigateToForgotPassword = () => {
    dispatch(clearAuthError());
    navigation.navigate('ForgotPassword');
  };

  const handleEmailChange = (nextEmail: string) => {
    setEmail(nextEmail);
    setValidationErrors((current) => ({ ...current, email: undefined }));
    dispatch(clearAuthError());
  };

  const handlePasswordChange = (nextPassword: string) => {
    setPassword(nextPassword);
    setValidationErrors((current) => ({ ...current, password: undefined }));
    dispatch(clearAuthError());
  };

  const canSubmit = !isLoading;

  return (
    <Screen centered>
      <View style={styles.header}>
        <BrandHeader subtitle="Welcome back. Ready to flow?" compact />
      </View>

      <GlassCard style={styles.card}>
        <View style={styles.form}>
          <AppTextField
            label="Email Address"
            icon="mail"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
            value={email}
            onChangeText={handleEmailChange}
            error={validationErrors.email}
          />

          <View style={styles.passwordHeader}>
            <Text style={styles.inlineLabel}>Password</Text>
            <TouchableOpacity activeOpacity={0.75} onPress={handleNavigateToForgotPassword}>
              <Text style={styles.link}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <AppTextField
            label=""
            icon="lock"
            placeholder="Password"
            secureTextEntry
            showPasswordToggle
            textContentType="password"
            value={password}
            onChangeText={handlePasswordChange}
            error={validationErrors.password}
          />

          {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

          <GradientButton
            title="Sign In"
            onPress={handleSignIn}
            icon="login"
            disabled={!canSubmit}
            loading={isLoading}
          />
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialGrid}>
          <TouchableOpacity activeOpacity={0.8} style={styles.socialButton}>
            <MaterialIcons name="g-mobiledata" size={24} color={colors.tertiary} />
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.socialButton}>
            <MaterialIcons name="phone-iphone" size={20} color={colors.onSurface} />
            <Text style={styles.socialText}>Apple</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity activeOpacity={0.75} onPress={handleNavigateToRegister}>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.section,
  },
  card: {
    padding: spacing.xxl,
  },
  form: {
    gap: spacing.lg,
  },
  passwordHeader: {
    marginBottom: -spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inlineLabel: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
    paddingLeft: spacing.xs,
  },
  link: {
    color: colors.primary,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
    lineHeight: 18,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(73,68,84,0.45)',
  },
  dividerText: {
    color: 'rgba(203,195,215,0.55)',
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  socialGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(73,68,84,0.45)',
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  socialText: {
    color: colors.onSurface,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  cardFooter: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  footerText: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
});
