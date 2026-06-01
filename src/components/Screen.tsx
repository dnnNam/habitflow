import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

interface ScreenProps {
  children: ReactNode;
  bottomOverlay?: ReactNode;
  centered?: boolean;
  scroll?: boolean;
}

export default function Screen({ children, bottomOverlay, centered = false, scroll = true }: ScreenProps) {
  const contentStyle = [
    styles.content,
    centered && styles.centeredContent,
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      {scroll ? (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={contentStyle}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={contentStyle}>{children}</View>
      )}
      {bottomOverlay}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.section,
  },
  centeredContent: {
    justifyContent: 'center',
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primaryContainer,
    opacity: 0.12,
  },
  glowBottom: {
    position: 'absolute',
    right: -120,
    bottom: -120,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.secondaryContainer,
    opacity: 0.12,
  },
});
