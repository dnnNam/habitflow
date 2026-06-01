import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fontSizes, fontWeights, spacing } from '../theme';

interface HeaderProps {
  title?: string;
  onSettingsPress?: () => void;
}

export default function Header({ title = 'HabitFlow', onSettingsPress }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>H</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity activeOpacity={0.75} style={styles.iconButton} onPress={onSettingsPress}>
        <MaterialIcons name="settings" size={21} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
  },
  title: {
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
    marginLeft: spacing.sm,
  },
});
