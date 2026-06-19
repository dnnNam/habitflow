import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fontWeights, radius, spacing } from '../theme';

type NavItem = {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

interface BottomNavBarProps {
  activeTab?: 'Today' | 'Stats' | 'Social' | 'Profile';
  onTodayPress?: () => void;
  onStatsPress?: () => void;
  onProfilePress?: () => void;
}

const items: NavItem[] = [
  { label: 'Today', icon: 'event-available' },
  { label: 'Stats', icon: 'query-stats' },
  { label: 'Social', icon: 'group' },
  { label: 'Profile', icon: 'person' },
];

export default function BottomNavBar({
  activeTab = 'Today',
  onTodayPress,
  onStatsPress,
  onProfilePress,
}: BottomNavBarProps) {
  return (
    <View style={styles.bottomNav}>
      {items.map((item) => {
        const isActive = item.label === activeTab;

        return (
          <TouchableOpacity
            activeOpacity={0.75}
            key={item.label}
            style={styles.navItem}
            onPress={getNavPressHandler(item.label, onTodayPress, onStatsPress, onProfilePress)}
          >
            <MaterialIcons
              name={item.icon}
              size={22}
              color={isActive ? colors.primary : 'rgba(203,195,215,0.58)'}
            />
            <Text style={[styles.navText, isActive && styles.activeNavText]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function getNavPressHandler(
  label: string,
  onTodayPress?: () => void,
  onStatsPress?: () => void,
  onProfilePress?: () => void,
) {
  if (label === 'Today') {
    return onTodayPress;
  }

  if (label === 'Profile') {
    return onProfilePress;
  }

  if (label === 'Stats') {
    return onStatsPress;
  }

  return undefined;
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    bottom: spacing.lg,
    minHeight: 70,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(19,27,46,0.94)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navText: {
    color: 'rgba(203,195,215,0.58)',
    fontSize: 10,
    fontWeight: fontWeights.semibold,
  },
  activeNavText: {
    color: colors.primary,
  },
});
