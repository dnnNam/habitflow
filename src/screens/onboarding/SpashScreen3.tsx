import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  InteractionManager,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { completeOnboarding } from '../../features/auth/authSlice';

const { width } = Dimensions.get('window');
const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ENTRY_DURATION = 1250;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function SplashScreen3() {
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);
  const entryAnim = useRef(new Animated.Value(0)).current;
  const strokeOffset = useRef(new Animated.Value(CIRCUMFERENCE)).current;
  const chipFloatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let chipLoop: Animated.CompositeAnimation | undefined;
    let chipTimer: ReturnType<typeof setTimeout> | undefined;
    const interactionTask = InteractionManager.runAfterInteractions(() => {
      setIsReady(true);

      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(entryAnim, {
            toValue: 1,
            duration: ENTRY_DURATION,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(360),
            Animated.timing(strokeOffset, {
              toValue: CIRCUMFERENCE * 0.25,
              duration: 2300,
              easing: Easing.out(Easing.quad),
              useNativeDriver: false,
            }),
          ]),
        ]).start();

        chipLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(chipFloatAnim, {
              toValue: -6,
              duration: 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(chipFloatAnim, {
              toValue: 0,
              duration: 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
        chipTimer = setTimeout(() => chipLoop?.start(), 650);
      });
    });

    return () => {
      interactionTask.cancel();
      if (chipTimer) {
        clearTimeout(chipTimer);
      }
      chipLoop?.stop();
      entryAnim.stopAnimation();
      strokeOffset.stopAnimation();
      chipFloatAnim.stopAnimation();
    };
  }, [chipFloatAnim, entryAnim, strokeOffset]);

  const headerEntryStyle = {
    opacity: entryAnim.interpolate({
      inputRange: [0, 0.45, 1],
      outputRange: [0, 0, 1],
    }),
  };

  const heroEntryStyle = {
    opacity: entryAnim.interpolate({
      inputRange: [0, 0.55, 1],
      outputRange: [0, 0.85, 1],
    }),
    transform: [
      {
        translateY: entryAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [76, 0],
        }),
      },
      {
        scale: entryAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.94, 1],
        }),
      },
    ],
  };

  const bottomEntryStyle = {
    opacity: entryAnim.interpolate({
      inputRange: [0, 0.35, 1],
      outputRange: [0, 0, 1],
    }),
    transform: [
      {
        translateY: entryAnim.interpolate({
          inputRange: [0, 0.35, 1],
          outputRange: [60, 60, 0],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={[styles.glowLeft, { backgroundColor: 'rgba(160, 120, 255, 0.1)' }]} />
      <View style={[styles.glowRight, { backgroundColor: 'rgba(5, 102, 217, 0.1)' }]} />

      <SafeAreaView style={styles.safeArea}>
        {isReady && (
        <Animated.View style={[styles.header, headerEntryStyle]}>
          <TouchableOpacity accessibilityRole="button">
            <Text style={styles.skipText}>SKIP</Text>
          </TouchableOpacity>
        </Animated.View>
        )}

        {isReady && (
        <Animated.View style={[styles.centerCanvas, heroEntryStyle]}>
          <View style={styles.glassCard}>
            <View style={styles.ringContainer}>
              <Svg width="100%" height="100%" viewBox="0 0 100 100" style={styles.svgRotate}>
                <Defs>
                  <SvgGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#a078ff" />
                    <Stop offset="100%" stopColor="#0566d9" />
                  </SvgGradient>
                </Defs>

                <Circle
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="transparent"
                  stroke="rgba(45, 52, 73, 0.5)"
                  strokeWidth={4}
                />

                <AnimatedCircle
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="transparent"
                  stroke="url(#progress-gradient)"
                  strokeWidth={4}
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeOffset as any}
                  strokeLinecap="round"
                />
              </Svg>

              <View style={styles.iconCenterWrapper}>
                <View style={styles.iconCircle}>
                  <MaterialIcons name="auto-awesome" size={32} color="#d0bcff" />
                </View>
              </View>
            </View>

            <Animated.View style={[styles.streakChip, { transform: [{ translateY: chipFloatAnim }] }]}>
              <View style={styles.fireIconContainer}>
                <MaterialIcons name="local-fire-department" size={16} color="#ffb4ab" />
              </View>
              <View style={styles.streakTextContainer}>
                <Text style={styles.streakLabel}>CURRENT STREAK</Text>
                <Text style={styles.streakValue}>14</Text>
              </View>
            </Animated.View>
          </View>
        </Animated.View>
        )}

        {isReady && (
        <Animated.View style={[styles.bottomSection, bottomEntryStyle]}>
          <View style={styles.typography}>
            <Text style={styles.displayTitle}>Track with Precision</Text>
            <Text style={styles.bodyDescription}>
              Consistency made beautiful. Track your daily rituals with intuitive gestures.
            </Text>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.buttonWrapper}
              onPress={() => dispatch(completeOnboarding())}
            >
              <LinearGradient
                colors={['#a078ff', '#0566d9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Next</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dotContainer}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={[styles.dot, styles.activeDot]} />
            </View>
          </View>
        </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1326',
  },
  glowLeft: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    opacity: 0.6,
  },
  glowRight: {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width,
    height: width,
    borderRadius: width / 2,
    opacity: 0.6,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skipText: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '600',
    color: '#cbc3d7',
    letterSpacing: 1.5,
  },
  centerCanvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  glassCard: {
    position: 'relative',
    width: 280,
    height: 280,
    backgroundColor: 'rgba(11, 19, 38, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 10,
  },
  ringContainer: {
    width: 192,
    height: 192,
    position: 'relative',
  },
  svgRotate: {
    transform: [{ rotate: '-90deg' }],
  },
  iconCenterWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(49, 57, 77, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakChip: {
    position: 'absolute',
    bottom: -16,
    right: 0,
    backgroundColor: 'rgba(49, 57, 77, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 999,
    paddingLeft: 12,
    paddingRight: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  fireIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(147, 0, 10, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  streakTextContainer: {
    flexDirection: 'column',
  },
  streakLabel: {
    fontFamily: 'System',
    fontSize: 9,
    fontWeight: '600',
    color: '#cbc3d7',
    letterSpacing: 1,
  },
  streakValue: {
    fontFamily: 'System',
    fontSize: 20,
    fontWeight: '600',
    color: '#dae2fd',
    marginTop: 2,
  },
  bottomSection: {
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  typography: {
    alignItems: 'center',
    marginBottom: 40,
  },
  displayTitle: {
    fontFamily: 'System',
    fontSize: 40,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  bodyDescription: {
    fontFamily: 'System',
    fontSize: 16,
    lineHeight: 24,
    color: '#cbc3d7',
    textAlign: 'center',
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#a078ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 4,
  },
  gradientButton: {
    width: '100%',
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2d3449',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#d0bcff',
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: '#ecddff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
});
