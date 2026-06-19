// Modal quản lý reminder cho 1 habit cụ thể.
// Mở từ HabitCard trên DashboardScreen (icon chuông).
// Cho phép: xem list giờ nhắc, thêm giờ mới, bật/tắt, xóa.
 
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  addReminder,
  editReminder,
  removeReminder,
  fetchReminders,
  clearMutationError,
} from '../features/reminders/remindersSlice';
import {
  selectRemindersErrorForHabit,
  selectRemindersForHabit,
  selectRemindersMutationError,
  selectRemindersMutationStatus,
  selectRemindersStatusForHabit,
} from '../features/reminders/remindersSelectors';
import { colors, fontSizes, fontWeights, radius, spacing } from '../theme';
 
interface ReminderModalProps {
  visible: boolean;
  habitId: string;
  habitName: string;
  onClose: () => void;
}
 
function formatTimeLabel(remindAt: string) {
  // API trả remindAt dạng ISO datetime đầy đủ (vd '1970-01-01T10:25:00.000Z').
  // Lấy giờ/phút theo UTC vì server lưu giờ nhắc dưới dạng epoch UTC giả định.
  const date = new Date(remindAt);
  if (Number.isNaN(date.getTime())) {
    return remindAt;
  }
  const h = date.getUTCHours();
  const mStr = String(date.getUTCMinutes()).padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = ((h + 11) % 12) + 1;
  return `${String(displayHour).padStart(2, '0')}:${mStr} ${period}`;
}
 
export default function ReminderModal({ visible, habitId, habitName, onClose }: ReminderModalProps) {
  const dispatch = useAppDispatch();
  const reminders = useAppSelector(selectRemindersForHabit(habitId));
  const status = useAppSelector(selectRemindersStatusForHabit(habitId));
  const error = useAppSelector(selectRemindersErrorForHabit(habitId));
  const mutationStatus = useAppSelector(selectRemindersMutationStatus);
  const mutationError = useAppSelector(selectRemindersMutationError);
 
  const [isAddingTime, setIsAddingTime] = useState(false);
  const [remindAtInput, setRemindAtInput] = useState('');
  const [timeInputError, setTimeInputError] = useState('');
 
  const isMutating = mutationStatus === 'loading';
  const isLoadingList = status === 'idle' || status === 'loading';
 
  useEffect(() => {
    if (visible && habitId) {
      dispatch(fetchReminders({ habitId }));
    }
  }, [visible, habitId, dispatch]);
 
  const handleClose = () => {
    dispatch(clearMutationError());
    setIsAddingTime(false);
    setRemindAtInput('');
    setTimeInputError('');
    onClose();
  };
 
  const handleAddTime = () => {
    setIsAddingTime(true);
    setRemindAtInput('');
    setTimeInputError('');
  };
 
  const handleCancelAddTime = () => {
    setIsAddingTime(false);
    setRemindAtInput('');
    setTimeInputError('');
  };

  const handleConfirmAddTime = () => {
    const normalized = normalizeTimeInput(remindAtInput);
    if (!normalized) {
      setTimeInputError('Use HH:mm format, for example 07:30.');
      return;
    }
 
    dispatch(addReminder({ habitId, payload: { remindAt: normalized, isEnabled: true } }));
    setIsAddingTime(false);
    setRemindAtInput('');
    setTimeInputError('');
  };
 
  const handleToggle = (reminderId: string, nextEnabled: boolean) => {
    dispatch(editReminder({ habitId, reminderId, payload: { isEnabled: nextEnabled } }));
  };
 
  const handleDelete = (reminderId: string) => {
    dispatch(removeReminder({ habitId, reminderId }));
  };
 
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouchable} activeOpacity={1} onPress={handleClose} />
 
        <View style={styles.sheet}>
          <View style={styles.handle} />
 
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconWrap}>
              <MaterialIcons name="notifications-active" size={20} color={colors.primary} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>Reminders</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>{habitName}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.75} onPress={handleClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={18} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
 
          {/* List */}
          {isLoadingList ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : reminders.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <MaterialIcons name="notifications-none" size={28} color={colors.onSurfaceVariant} />
              <Text style={styles.emptyText}>No reminders yet. Add a time to get nudged.</Text>
            </GlassCard>
          ) : (
            <View style={styles.list}>
              {reminders.map((reminder) => (
                <GlassCard key={reminder.id} style={styles.reminderRow}>
                  <View style={styles.reminderLeft}>
                    <View
                      style={[
                        styles.timeIconWrap,
                        reminder.isEnabled && styles.timeIconWrapActive,
                      ]}
                    >
                      <MaterialIcons
                        name="alarm"
                        size={18}
                        color={reminder.isEnabled ? colors.primary : colors.onSurfaceVariant}
                      />
                    </View>
                    <Text
                      style={[
                        styles.timeText,
                        !reminder.isEnabled && styles.timeTextDisabled,
                      ]}
                    >
                      {formatTimeLabel(reminder.remindAt)}
                    </Text>
                  </View>
 
                  <View style={styles.reminderRight}>
                    <Switch
                      value={reminder.isEnabled}
                      onValueChange={(val) => handleToggle(reminder.id, val)}
                      trackColor={{ false: colors.surfaceContainerHighest, true: colors.primaryContainer }}
                      thumbColor={colors.white}
                      disabled={isMutating}
                    />
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => handleDelete(reminder.id)}
                      style={styles.deleteBtn}
                      disabled={isMutating}
                    >
                      <MaterialIcons name="delete-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              ))}
            </View>
          )}
 
          {mutationError ? <Text style={styles.errorText}>{mutationError}</Text> : null}

          {isAddingTime ? (
            <GlassCard style={styles.timeInputCard}>
              <View style={styles.timeInputHeader}>
                <MaterialIcons name="schedule" size={18} color={colors.primary} />
                <Text style={styles.timeInputTitle}>Reminder time</Text>
              </View>
              <TextInput
                value={remindAtInput}
                onChangeText={(value) => {
                  setRemindAtInput(value);
                  setTimeInputError('');
                }}
                placeholder="HH:mm"
                placeholderTextColor={colors.outlineVariant}
                keyboardType="numbers-and-punctuation"
                style={styles.timeInput}
                maxLength={5}
              />
              {timeInputError ? <Text style={styles.errorText}>{timeInputError}</Text> : null}
              <View style={styles.timeInputActions}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleCancelAddTime}
                  style={styles.cancelTimeBtn}
                  disabled={isMutating}
                >
                  <Text style={styles.cancelTimeText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleConfirmAddTime}
                  style={styles.saveTimeBtn}
                  disabled={isMutating}
                >
                  <Text style={styles.saveTimeText}>Save</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          ) : null}
 
          {/* Add time */}
          <GradientButton
            title="Add Reminder Time"
            icon="add-alarm"
            onPress={handleAddTime}
            loading={isMutating}
            disabled={isAddingTime || isMutating}
            style={styles.addButton}
          />
        </View>
      </View>
    </Modal>
  );
}

function normalizeTimeInput(value: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
 
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
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
    paddingBottom: spacing.section,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceContainerHighest,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(208,188,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    color: colors.onSurface,
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
  },
  headerSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHigh,
  },
  loadingBox: {
    paddingVertical: spacing.section,
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.section,
  },
  emptyText: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
    textAlign: 'center',
    maxWidth: '80%',
  },
  list: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  timeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeIconWrapActive: {
    backgroundColor: 'rgba(208,188,255,0.14)',
  },
  timeText: {
    color: colors.onSurface,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
    fontVariant: ['tabular-nums'],
  },
  timeTextDisabled: {
    color: colors.onSurfaceVariant,
  },
  reminderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  timeInputCard: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  timeInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeInputTitle: {
    color: colors.onSurface,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  timeInput: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(208,188,255,0.2)',
    backgroundColor: colors.surfaceContainerHigh,
    color: colors.onSurface,
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    fontVariant: ['tabular-nums'],
    paddingHorizontal: spacing.lg,
  },
  timeInputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  cancelTimeBtn: {
    minHeight: 40,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHigh,
  },
  cancelTimeText: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
  },
  saveTimeBtn: {
    minHeight: 40,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
  },
  saveTimeText: {
    color: colors.white,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
  },
  addButton: {
    marginTop: spacing.sm,
  },
});
