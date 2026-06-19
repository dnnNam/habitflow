// src/screens/main/ProfileScreen.tsx

import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../../components/BottomNavBar';
import GlassCard from '../../components/GlassCard';
import Screen from '../../components/Screen';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import { fetchProfile, logout } from '../../features/auth/authSlice';
import { resetHabits } from '../../features/habits/habitsSlice';
import { resetHabitLogs } from '../../features/habitLogs/habitLogsSlice';
import { resetReminders } from '../../features/reminders/remindersSlice';
import { resetStatistics } from '../../features/statistics/statisticsSlice';
import { selectAccessToken, selectCurrentUser, selectProfileStatus } from '../../features/auth/authSelector';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { colors, fontSizes, fontWeights, gradients, radius, spacing } from '../../theme';

type ProfileNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Profile'>;

const stats = [
  { label: 'Total XP', value: '14,250', icon: 'military-tech', color: colors.primary },
  { label: 'Global Rank', value: '#4,092', icon: 'public', color: colors.secondary },
  { label: 'Days Active', value: '184', icon: 'calendar-month', color: colors.tertiary },
  { label: 'Habits Mastered', value: '12', icon: 'workspace-premium', color: colors.primaryContainer },
] as const;

const menuItems = [
  { label: 'Edit Profile', icon: 'edit' },
  { label: 'App Settings', icon: 'tune' },
  { label: 'Privacy', icon: 'shield' },
  { label: 'Help & Support', icon: 'help-outline' },
] as const;

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<ProfileNavigationProp>();
  const user = useAppSelector(selectCurrentUser);
  const accessToken = useAppSelector(selectAccessToken);
  const profileStatus = useAppSelector(selectProfileStatus);
  const displayName = user?.fullName ?? user?.name ?? 'HabitFlow user';
  const initials = getInitials(displayName);

  useEffect(() => {
    if (accessToken && profileStatus === 'idle') {
      dispatch(fetchProfile());
    }
  }, [accessToken, dispatch, profileStatus]);

  // Reset cả auth + habits khi logout
  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetHabits());
    dispatch(resetHabitLogs());
    dispatch(resetReminders());
    dispatch(resetStatistics());
  };

  return (
    <Screen
      bottomOverlay={(
        <BottomNavBar
          activeTab="Profile"
          onTodayPress={() => navigation.navigate('Dashboard')}
          onStatsPress={() => navigation.navigate('Statistics')}
          onProfilePress={() => dispatch(fetchProfile())}
        />
      )}
    >
      <View style={styles.topBar}>
        <TouchableOpacity activeOpacity={0.75} style={styles.smallAvatar} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.smallAvatarText}>{initials}</Text>
        </TouchableOpacity>
        <Text style={styles.brand}>HabitFlow</Text>
        <TouchableOpacity activeOpacity={0.75} style={styles.iconButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={21} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileHeader}>
        <View style={styles.avatarShell}>
          <LinearGradient colors={gradients.text} style={styles.avatarGradient}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          </LinearGradient>
          <View style={styles.proBadge}>
            <MaterialIcons name="bolt" size={13} color={colors.white} />
            <Text style={styles.proText}>PRO</Text>
          </View>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.subtitle}>{user?.timeZone ?? 'Consistent Climber'}</Text>
        <Text style={styles.email}>{user?.email ?? 'Loading profile...'}</Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <GlassCard key={stat.label} style={styles.statCard}>
            <MaterialIcons name={stat.icon} size={21} color={stat.color} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </GlassCard>
        ))}
      </View>

      <GlassCard style={styles.scoreCard}>
        <View>
          <Text style={styles.scoreTitle}>Productivity Score</Text>
          <Text style={styles.scoreSubtext}>Top 5% of users this week</Text>
        </View>
        <ScoreRing score={92} />
      </GlassCard>

      <View style={styles.menuList}>
        {menuItems.map((item) => (
          <TouchableOpacity activeOpacity={0.78} key={item.label}>
            <GlassCard style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <MaterialIcons name={item.icon} size={20} color={colors.primary} />
                <Text style={styles.menuText}>{item.label}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="rgba(203,195,215,0.55)" />
            </GlassCard>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity activeOpacity={0.78} style={styles.logoutPanel} onPress={handleLogout}>
        <MaterialIcons name="logout" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpace} />
    </Screen>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radiusValue = 28;
  const circumference = 2 * Math.PI * radiusValue;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <View style={styles.scoreRing}>
      <Svg width={64} height={64} viewBox="0 0 72 72">
        <Circle cx="36" cy="36" r={radiusValue} fill="transparent" stroke={colors.surfaceContainerHigh} strokeWidth={5} />
        <Circle
          cx="36"
          cy="36"
          r={radiusValue}
          fill="transparent"
          stroke={colors.primary}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          rotation="-90"
          origin="36, 36"
        />
      </Svg>
      <Text style={styles.scoreValue}>{score}</Text>
    </View>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'H';
}

const styles = StyleSheet.create({
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  smallAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallAvatarText: {
    color: colors.primary,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
  },
  brand: {
    color: colors.primary,
    fontSize: fontSizes.title,
    fontWeight: fontWeights.extrabold,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatarShell: {
    width: 112,
    height: 112,
    marginBottom: spacing.lg,
  },
  avatarGradient: {
    flex: 1,
    borderRadius: 56,
    padding: 3,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 53,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: colors.onSurface,
    fontSize: 34,
    fontWeight: fontWeights.extrabold,
  },
  proBadge: {
    position: 'absolute',
    right: -4,
    bottom: 4,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.primaryContainer,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  proText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: fontWeights.bold,
  },
  name: {
    color: colors.onSurface,
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.body,
    marginTop: 2,
  },
  email: {
    color: 'rgba(203,195,215,0.7)',
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  statCard: {
    width: '48%',
    minHeight: 108,
    gap: spacing.sm,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(45,52,73,0.72)',
  },
  statValue: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: fontWeights.extrabold,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 10,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  scoreCard: {
    marginBottom: spacing.xxl,
    backgroundColor: 'rgba(45,52,73,0.72)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreTitle: {
    color: colors.onSurface,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
    marginBottom: 4,
  },
  scoreSubtext: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  scoreRing: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    position: 'absolute',
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: fontWeights.bold,
    fontVariant: ['tabular-nums'],
  },
  menuList: {
    gap: spacing.md,
  },
  menuItem: {
    minHeight: 54,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(45,52,73,0.72)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuText: {
    color: colors.onSurface,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
  },
  logoutPanel: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,180,171,0.26)',
    backgroundColor: 'rgba(147,0,10,0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  logoutText: {
    color: colors.error,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  bottomSpace: {
    height: 110,
  },
});
