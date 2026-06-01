import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AppTextField from '../../components/AppTextField';
import BrandHeader from '../../components/BrandHeader';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import Screen from '../../components/Screen';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { clearAuthError, fetchProfile, register } from '../../features/auth/authSlice';
import { selectAuthError, selectAuthIsLoading } from '../../features/auth/authSelector';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { colors, fontSizes, fontWeights, spacing } from '../../theme';
import { hasValidationErrors, validateRegisterForm } from '../../utils/authValidation';
import type { RegisterValidationErrors } from '../../utils/authValidation';

type RegisterNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<RegisterNavigationProp>();
  const isLoading = useAppSelector(selectAuthIsLoading);
  const authError = useAppSelector(selectAuthError);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<RegisterValidationErrors>({});

  const handleCreateAccount = async () => {
    const nextValidationErrors = validateRegisterForm({ fullName, email, password });
    setValidationErrors(nextValidationErrors);

    if (hasValidationErrors(nextValidationErrors)) {
      return;
    }

    const result = await dispatch(register({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
    }));

    if (register.fulfilled.match(result)) {
      dispatch(fetchProfile());
    }
  };

  const handleNavigateToLogin = () => {
    dispatch(clearAuthError());
    navigation.navigate('Login');
  };

  const handleFullNameChange = (nextFullName: string) => {
    setFullName(nextFullName);
    setValidationErrors((current) => ({ ...current, fullName: undefined }));
    dispatch(clearAuthError());
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
        <BrandHeader subtitle="Begin your journey to better habits." />
      </View>

      <GlassCard style={styles.card}>
        <View style={styles.form}>
          <AppTextField
            label="Full Name"
            icon="person"
            placeholder="Jane Doe"
            autoCapitalize="words"
            textContentType="name"
            value={fullName}
            onChangeText={handleFullNameChange}
            error={validationErrors.fullName}
          />
          <AppTextField
            label="Email"
            icon="mail"
            placeholder="jane@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
            value={email}
            onChangeText={handleEmailChange}
            error={validationErrors.email}
          />
          <AppTextField
            label="Password"
            icon="lock"
            placeholder="Password"
            secureTextEntry
            showPasswordToggle
            textContentType="newPassword"
            value={password}
            onChangeText={handlePasswordChange}
            error={validationErrors.password}
          />
          {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
          <GradientButton
            title="Create Account"
            onPress={handleCreateAccount}
            disabled={!canSubmit}
            loading={isLoading}
          />
        </View>
      </GlassCard>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity activeOpacity={0.75} onPress={handleNavigateToLogin}>
          <Text style={styles.footerLink}>Log in</Text>
        </TouchableOpacity>
      </View>
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
  footer: {
    marginTop: spacing.section,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
    lineHeight: 18,
  },
  footerLink: {
    color: colors.primary,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
  },
});
