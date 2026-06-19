// src/screens/main/createHabit/HabitSuccessScreen.tsx

import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../../../components/GlassCard';
import Screen from '../../../components/Screen';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { resetCreateHabit } from '../../../features/createHabit/createHabitSlice';
import {
  selectCreatedHabit,
  selectHabitDraft,
} from '../../../features/createHabit/createHabitSelectors';
import { fetchHabits } from '../../../features/habits/habitsSlice';
import { selectAccessToken } from '../../../features/auth/authSelector';
import { colors, fontSizes, fontWeights, gradients, radius, spacing } from '../../../theme';

interface Props {
  onDone: () => void;
}

export default function HabitSuccessScreen({ onDone }: Props) {
  const dispatch = useAppDispatch();
  const createdHabit = useAppSelector(selectCreatedHabit);
  const draft = useAppSelector(selectHabitDraft);
  const accessToken = useAppSelector(selectAccessToken);

  // Animations
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const xpSlide = useRef(new Animated.Value(30)).current;
  const xpOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let xpTimer: ReturnType<typeof setTimeout> | undefined;

    // Trophy entrance
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    // Float loop
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -12, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    floatLoop.start();

    // XP badge slide in
    xpTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(xpSlide, { toValue: 0, duration: 400, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
        Animated.timing(xpOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }, 600);

    return () => {
      if (xpTimer) clearTimeout(xpTimer);
      floatLoop.stop();
    };
  }, [float, opacity, scale, xpOpacity, xpSlide]);

  const handleDone = () => {
    // Refresh habits list
    if (accessToken) {
      dispatch(fetchHabits({ accessToken }));
    }
    dispatch(resetCreateHabit());
    onDone();
  };

  const habitName = createdHabit?.name ?? draft.name;

  return (
    <Screen centered scroll={false}>
      {/* Ambient glow */}
      <View style={styles.glowPrimary} />
      <View style={styles.glowTertiary} />

      {/* Floating trophy */}
      <Animated.View
        style={[
          styles.trophyWrap,
          { transform: [{ scale }, { translateY: float }] },
        ]}
      >
        <LinearGradient
          colors={gradients.primary}
          style={styles.trophyGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialIcons name="emoji-events" size={72} color={colors.white} />
        </LinearGradient>
      </Animated.View>

      {/* Text */}
      <Animated.View style={[styles.textWrap, { opacity }]}>
        <Text style={styles.headline}>Outstanding!</Text>
        <Text style={styles.subtext}>
          <Text style={styles.habitNameHighlight}>"{habitName}"</Text>
          {' '}has been added to your flow.
        </Text>
      </Animated.View>

      {/* XP Badge */}
      <Animated.View
        style={[
          styles.xpBadge,
          { opacity: xpOpacity, transform: [{ translateY: xpSlide }] },
        ]}
      >
        <GlassCard style={styles.xpCard}>
          <Text style={styles.xpGained}>Gained</Text>
          <View style={styles.xpRow}>
            <MaterialIcons name="bolt" size={24} color={colors.tertiary} />
            <Text style={styles.xpValue}>+50 XP</Text>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Habit summary */}
      <Animated.View style={[styles.summaryWrap, { opacity }]}>
        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <MaterialIcons name="track-changes" size={18} color={colors.primary} />
            <Text style={styles.summaryLabel}>Habit</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>{habitName}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <MaterialIcons name="repeat" size={18} color={colors.secondary} />
            <Text style={styles.summaryLabel}>Frequency</Text>
            <Text style={styles.summaryValue}>
              {(createdHabit?.schedule?.repeatType ?? draft.repeatType)
                .charAt(0).toUpperCase() +
                (createdHabit?.schedule?.repeatType ?? draft.repeatType).slice(1)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <MaterialIcons name="event" size={18} color={colors.tertiary} />
            <Text style={styles.summaryLabel}>Start</Text>
            <Text style={styles.summaryValue}>{createdHabit?.startDate ?? draft.startDate}</Text>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Done button */}
      <Animated.View style={[styles.btnWrap, { opacity }]}>
        <TouchableOpacity activeOpacity={0.85} onPress={handleDone} style={styles.doneBtn}>
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.doneBtnGradient}
          >
            <Text style={styles.doneBtnText}>Go to Dashboard</Text>
            <MaterialIcons name="arrow-forward" size={18} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  glowPrimary: {
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.primaryContainer,
    opacity: 0.15,
  },
  glowTertiary: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.tertiaryContainer,
    opacity: 0.1,
  },
  trophyWrap: {
    marginBottom: spacing.section,
  },
  trophyGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  textWrap: {
    alignItems: 'center',
    marginBottom: spacing.section,
    gap: spacing.sm,
  },
  headline: {
    color: colors.onSurface,
    fontSize: fontSizes.display,
    fontWeight: fontWeights.extrabold,
    textAlign: 'center',
  },
  subtext: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.body,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.xl,
  },
  habitNameHighlight: {
    color: colors.primary,
    fontWeight: fontWeights.bold,
  },
  xpBadge: {
    marginBottom: spacing.section,
  },
  xpCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  xpGained: {
    color: colors.outline,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  xpValue: {
    color: colors.tertiary,
    fontSize: 22,
    fontWeight: fontWeights.extrabold,
    fontVariant: ['tabular-nums'],
  },
  summaryWrap: {
    width: '100%',
    marginBottom: spacing.section,
  },
  summaryCard: {
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryLabel: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
    flex: 1,
  },
  summaryValue: {
    color: colors.onSurface,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
    maxWidth: '55%',
    textAlign: 'right',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  btnWrap: {
    width: '100%',
  },
  doneBtn: {
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
  },
  doneBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: 52,
  },
  doneBtnText: {
    color: colors.white,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
