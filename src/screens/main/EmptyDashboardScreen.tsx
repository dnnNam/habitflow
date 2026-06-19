// src/screens/main/EmptyDashboardScreen.tsx

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../../components/BottomNavBar';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import Screen from '../../components/Screen';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { colors, fontSizes, fontWeights, radius, spacing } from '../../theme';

type EmptyDashboardNavigationProp = NativeStackNavigationProp<MainStackParamList, 'EmptyDashboard'>;

export default function EmptyDashboardScreen() {
  const navigation = useNavigation<EmptyDashboardNavigationProp>();

  return (
    <Screen
      centered
      bottomOverlay={(
        <BottomNavBar
          activeTab="Today"
          onStatsPress={() => navigation.navigate('Statistics')}
          onProfilePress={() => navigation.navigate('Profile')}
        />
      )}
    >
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.75} style={styles.backButton} onPress={() => navigation.navigate('Dashboard')}>
          <MaterialIcons name="arrow-back" size={20} color={colors.onSurfaceVariant} />
          <Text style={styles.backText}>Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.brand}>HabitFlow</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.illustration}>
        <View style={styles.seedGlow} />
        <View style={styles.pond}>
          <View style={styles.stem} />
          <View style={[styles.leaf, styles.leftLeaf]} />
          <View style={[styles.leaf, styles.rightLeaf]} />
          <View style={styles.waterRing} />
        </View>
      </View>

      <GlassCard style={styles.messageCard}>
        <Text style={styles.title}>Start your journey.</Text>
        <Text style={styles.description}>
          Your first habit is just a tap away. Plant the seed for a better routine today.
        </Text>
      </GlassCard>


      <GradientButton
        title="Add Your First Habit"
        icon="add"
        onPress={() => navigation.navigate('CreateHabit')}
        style={styles.button}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.xl,
    right: spacing.xl,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backText: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  brand: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: fontWeights.extrabold,
  },
  headerSpacer: {
    width: 84,
  },
  illustration: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.section,
  },
  seedGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.primaryContainer,
    opacity: 0.16,
  },
  pond: {
    width: 124,
    height: 124,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(208,188,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stem: {
    width: 4,
    height: 58,
    borderRadius: 2,
    backgroundColor: colors.tertiary,
    opacity: 0.9,
  },
  leaf: {
    position: 'absolute',
    width: 42,
    height: 18,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    opacity: 0.72,
    top: 42,
  },
  leftLeaf: {
    left: 32,
    transform: [{ rotate: '28deg' }],
  },
  rightLeaf: {
    right: 32,
    transform: [{ rotate: '-28deg' }],
  },
  waterRing: {
    position: 'absolute',
    bottom: 28,
    width: 84,
    height: 22,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: 'rgba(208,188,255,0.34)',
  },
  messageCard: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.onSurface,
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  description: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.body,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    marginBottom: 110,
  },
});
