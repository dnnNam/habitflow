// src/components/CheckInModal.tsx
//
// Modal check-in cho 1 habit. Mở từ HabitListItem trên DashboardScreen.
// - boolean: 1 tap Done hoặc Skip
// - count/duration/distance: nhập số + Done hoặc Skip
// - Sau khi Done → dispatch checkIn → toast nhẹ → đóng
// - Sau khi Skip → dispatch skipToday → đóng

import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { checkIn, skipToday } from '../features/habitLogs/habitLogsSlice';
import { selectTodayLogForHabit, selectIsHabitMutating } from '../features/habitLogs/habitLogsSelectors';
import { colors, fontSizes, fontWeights, gradients, radius, spacing } from '../theme';
import type { GoalType } from '../types/habit';

interface CheckInModalProps {
  visible: boolean;
  habitId: string;
  habitName: string;
  goalType: GoalType;
  goalValue?: number | null;
  goalUnit?: string | null;
  onClose: () => void;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const GOAL_CONFIG: Record<GoalType, { label: string; unit: string; placeholder: string }> = {
  boolean: { label: 'Complete', unit: '', placeholder: '' },
  count:   { label: 'Times',    unit: 'times', placeholder: '0' },
  duration:{ label: 'Minutes',  unit: 'min',   placeholder: '0' },
  distance:{ label: 'Distance', unit: 'km',    placeholder: '0.0' },
};

export default function CheckInModal({
  visible,
  habitId,
  habitName,
  goalType,
  goalValue,
  goalUnit,
  onClose,
}: CheckInModalProps) {
  const dispatch = useAppDispatch();
  const todayLog = useAppSelector(selectTodayLogForHabit(habitId));
  const isMutating = useAppSelector(selectIsHabitMutating(habitId));

  const [progressInput, setProgressInput] = useState('');
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Animation for success checkmark
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const cfg = GOAL_CONFIG[goalType];
  const displayUnit = goalUnit || cfg.unit;
  const alreadyDone = todayLog?.status === 'completed';
  const alreadySkipped = todayLog?.status === 'skipped';

  // Reset state when opening
  useEffect(() => {
    if (visible) {
      setProgressInput('');
      setNote('');
      setShowSuccess(false);
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const playSuccess = (afterMs = 0) => {
    setShowSuccess(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 6,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(onClose, afterMs || 900);
    });
  };

  const handleDone = async () => {
    let progressValue: number | undefined;

    if (goalType !== 'boolean') {
      const parsed = parseFloat(progressInput);
      if (!isNaN(parsed) && parsed > 0) {
        progressValue = parsed;
      }
    }

    // Determine status based on progress vs goal
    let status: 'completed' | 'partial' | 'pending' = 'completed';
    if (goalType !== 'boolean' && goalValue) {
      const val = progressValue ?? 0;
      if (val === 0) status = 'pending';
      else if (val < goalValue) status = 'partial';
      else status = 'completed';
    }

    const result = await dispatch(
      checkIn({
        habitId,
        logDate: todayISO(),
        status,
        progressValue,
        note: note.trim() || undefined,
      }),
    );

    if (checkIn.fulfilled.match(result)) {
      playSuccess();
    }
  };

  const handleSkip = async () => {
    const result = await dispatch(skipToday({ habitId }));
    if (skipToday.fulfilled.match(result)) {
      onClose();
    }
  };

  const progressPercent = (() => {
    if (goalType === 'boolean') return alreadyDone ? 1 : 0;
    if (!goalValue || !progressInput) return 0;
    return Math.min(parseFloat(progressInput) / goalValue, 1) || 0;
  })();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* ── Success overlay ── */}
          {showSuccess && (
            <Animated.View
              style={[styles.successOverlay, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}
            >
              <LinearGradient
                colors={gradients.primary}
                style={styles.successCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialIcons name="check" size={48} color={colors.white} />
              </LinearGradient>
              <Text style={styles.successText}>Logged!</Text>
            </Animated.View>
          )}

          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.habitIconWrap}>
                <MaterialIcons name="track-changes" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle} numberOfLines={1}>{habitName}</Text>
                <Text style={styles.headerDate}>{todayISO()}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.75}>
              <MaterialIcons name="close" size={18} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* ── Already done / skipped state ── */}
          {(alreadyDone || alreadySkipped) && (
            <View style={[styles.alreadyBadge, alreadyDone ? styles.doneBadge : styles.skipBadge]}>
              <MaterialIcons
                name={alreadyDone ? 'check-circle' : 'do-not-disturb'}
                size={16}
                color={alreadyDone ? colors.tertiary : colors.onSurfaceVariant}
              />
              <Text style={[styles.alreadyText, alreadyDone ? styles.doneText : styles.skipText]}>
                {alreadyDone ? 'Already completed today!' : 'Skipped today'}
              </Text>
            </View>
          )}

          {/* ── Boolean: big check button ── */}
          {goalType === 'boolean' && (
            <View style={styles.booleanSection}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleDone}
                disabled={isMutating || alreadyDone || alreadySkipped}
                style={styles.bigCheckButton}
              >
                <LinearGradient
                  colors={
                    alreadyDone
                      ? ['rgba(78,222,163,0.3)', 'rgba(78,222,163,0.15)']
                      : gradients.primary
                  }
                  style={styles.bigCheckGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons
                    name={alreadyDone ? 'check-circle' : 'check'}
                    size={52}
                    color={alreadyDone ? colors.tertiary : colors.white}
                  />
                  <Text style={[styles.bigCheckLabel, alreadyDone && styles.bigCheckLabelDone]}>
                    {alreadyDone ? 'Done' : 'Mark Complete'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Quantitative: input + progress bar ── */}
          {goalType !== 'boolean' && (
            <View style={styles.quantSection}>
              {/* Progress bar */}
              {goalValue && (
                <View style={styles.progressBarWrap}>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${Math.min(progressPercent * 100, 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressBarLabel}>
                    {progressInput || '0'} / {goalValue} {displayUnit}
                  </Text>
                </View>
              )}

              {/* Number input */}
              <View style={styles.inputRow}>
                <View style={styles.numberInputWrap}>
                  <TextInput
                    style={styles.numberInput}
                    value={progressInput}
                    onChangeText={setProgressInput}
                    keyboardType="numeric"
                    placeholder={cfg.placeholder}
                    placeholderTextColor={colors.outlineVariant}
                    selectionColor={colors.primary}
                    editable={!alreadyDone && !alreadySkipped}
                  />
                  {displayUnit ? (
                    <Text style={styles.unitLabel}>{displayUnit}</Text>
                  ) : null}
                </View>

                {/* Quick increment buttons */}
                <View style={styles.quickBtns}>
                  {getQuickValues(goalType, goalValue).map((v) => (
                    <TouchableOpacity
                      key={v}
                      style={styles.quickBtn}
                      activeOpacity={0.75}
                      onPress={() => setProgressInput(String(v))}
                      disabled={alreadyDone || alreadySkipped}
                    >
                      <Text style={styles.quickBtnText}>{v}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ── Note input (optional) ── */}
          {!alreadyDone && !alreadySkipped && (
            <View style={styles.noteSection}>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Add a note (optional)"
                placeholderTextColor={colors.outlineVariant}
                selectionColor={colors.primary}
                multiline
                numberOfLines={2}
              />
            </View>
          )}

          {/* ── Action buttons ── */}
          {!alreadyDone && !alreadySkipped && (
            <View style={styles.actions}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleSkip}
                disabled={isMutating}
                style={styles.skipBtn}
              >
                <MaterialIcons name="do-not-disturb" size={16} color={colors.onSurfaceVariant} />
                <Text style={styles.skipBtnText}>Skip Today</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleDone}
                disabled={isMutating || (goalType !== 'boolean' && !progressInput)}
                style={[
                  styles.doneBtn,
                  (isMutating || (goalType !== 'boolean' && !progressInput)) && styles.doneBtnDisabled,
                ]}
              >
                <LinearGradient
                  colors={gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.doneBtnGradient}
                >
                  <MaterialIcons name="check" size={18} color={colors.white} />
                  <Text style={styles.doneBtnText}>
                    {isMutating ? 'Saving…' : 'Done'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Close when already logged */}
          {(alreadyDone || alreadySkipped) && (
            <TouchableOpacity
              style={styles.closePrimaryBtn}
              activeOpacity={0.85}
              onPress={onClose}
            >
              <Text style={styles.closePrimaryText}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** Quick-select values based on goal type */
function getQuickValues(type: GoalType, goalValue?: number | null): number[] {
  if (type === 'count') return [1, 5, 10, goalValue ?? 20].filter((v, i, a) => a.indexOf(v) === i);
  if (type === 'duration') return [15, 30, 45, goalValue ?? 60].filter((v, i, a) => a.indexOf(v) === i);
  if (type === 'distance') return [1, 3, 5, goalValue ?? 10].filter((v, i, a) => a.indexOf(v) === i);
  return [];
}

// ── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.section + (Platform.OS === 'ios' ? 20 : 0),
    minHeight: 320,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceContainerHighest,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },

  // Success overlay
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.section,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    color: colors.onSurface,
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  habitIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(208,188,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.onSurface,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
    maxWidth: 220,
  },
  headerDate: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Already done/skipped badge
  alreadyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
  },
  doneBadge: {
    backgroundColor: 'rgba(78,222,163,0.1)',
    borderColor: 'rgba(78,222,163,0.3)',
  },
  skipBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  alreadyText: {
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  doneText: { color: colors.tertiary },
  skipText: { color: colors.onSurfaceVariant },

  // Boolean
  booleanSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  bigCheckButton: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    width: '80%',
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  bigCheckGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.section,
    gap: spacing.sm,
  },
  bigCheckLabel: {
    color: colors.white,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.5,
  },
  bigCheckLabelDone: {
    color: colors.tertiary,
  },

  // Quantitative
  quantSection: {
    marginBottom: spacing.xl,
    gap: spacing.lg,
  },
  progressBarWrap: {
    gap: spacing.sm,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceContainerHighest,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  progressBarLabel: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  numberInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(208,188,255,0.2)',
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  numberInput: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 28,
    fontWeight: fontWeights.bold,
    fontVariant: ['tabular-nums'],
  },
  unitLabel: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  quickBtns: {
    gap: spacing.sm,
  },
  quickBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  quickBtnText: {
    color: colors.primary,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
  },

  // Note
  noteSection: {
    marginBottom: spacing.xl,
  },
  noteInput: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.onSurface,
    fontSize: fontSizes.body,
    minHeight: 72,
    textAlignVertical: 'top',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: colors.surfaceContainerHigh,
    minHeight: 48,
  },
  skipBtnText: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  doneBtn: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  doneBtnDisabled: {
    opacity: 0.5,
  },
  doneBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  doneBtnText: {
    color: colors.white,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  closePrimaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  closePrimaryText: {
    color: colors.onSurface,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
  },
});
