import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  InteractionManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const ENTRY_DURATION = 1250;

type SplashScreen2NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'SplashScreen2'>;

export default function SplashScreen2() {
  const navigation = useNavigation<SplashScreen2NavigationProp>();
  const [isReady, setIsReady] = useState(false);
  const entryAnim = useRef(new Animated.Value(0)).current;
  const badgeFloatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let badgeLoop: Animated.CompositeAnimation | undefined;
    let badgeTimer: ReturnType<typeof setTimeout> | undefined;
    const interactionTask = InteractionManager.runAfterInteractions(() => {
      setIsReady(true);

      requestAnimationFrame(() => {
        Animated.timing(entryAnim, {
          toValue: 1,
          duration: ENTRY_DURATION,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();

        badgeLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(badgeFloatAnim, {
              toValue: -6,
              duration: 1800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(badgeFloatAnim, {
              toValue: 0,
              duration: 1800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
        badgeTimer = setTimeout(() => badgeLoop?.start(), 500);
      });
    });

    return () => {
      interactionTask.cancel();
      if (badgeTimer) {
        clearTimeout(badgeTimer);
      }
      badgeLoop?.stop();
      entryAnim.stopAnimation();
      badgeFloatAnim.stopAnimation();
    };
  }, [entryAnim, badgeFloatAnim]);

  const cardEntryStyle = {
    opacity: entryAnim.interpolate({
      inputRange: [0, 0.55, 1],
      outputRange: [0, 0.8, 1],
    }),
    transform: [
      {
        translateY: entryAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [72, 0],
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

  const textEntryStyle = {
    opacity: entryAnim.interpolate({
      inputRange: [0, 0.28, 1],
      outputRange: [0, 0, 1],
    }),
    transform: [
      {
        translateY: entryAnim.interpolate({
          inputRange: [0, 0.28, 1],
          outputRange: [56, 56, 0],
        }),
      },
    ],
  };

  const controlsEntryStyle = {
    opacity: entryAnim.interpolate({
      inputRange: [0, 0.45, 1],
      outputRange: [0, 0, 1],
    }),
    transform: [
      {
        translateY: entryAnim.interpolate({
          inputRange: [0, 0.45, 1],
          outputRange: [48, 48, 0],
        }),
      },
    ],
  };

  const handleNext = () => {
    navigation.navigate('SplashScreen3');
  };
  return (
    <View style={styles.container}>
      {/* Ambient Background Glows */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      {/* Main Canvas Container */}
      <View style={styles.mainCanvas}>
        
        {/* Top Spacer for visual balance */}
        <View style={styles.flexSpacer1} />

        {/* Visual Analytics Card (Glassmorphism) */}
        {isReady && (
        <Animated.View style={[styles.cardContainer, cardEntryStyle]}>
          
          {/* Floating Decorative Element (+42%) */}
          <Animated.View style={[styles.floatingBadge, { transform: [{ translateY: badgeFloatAnim }] }]}>
            <MaterialIcons name="trending-up" size={14} color="#4edea3" />
            <Text style={styles.badgeText}>+42%</Text>
          </Animated.View>

          {/* The Glass Container */}
          <View style={styles.glassCard}>
            {/* Background Grid Lines */}
            <View style={styles.gridContainer}>
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
            </View>

            {/* Glowing Line Chart SVG */}
            <Svg 
              width="100%" 
              height={150} 
              viewBox="0 0 300 150" 
              style={styles.svgChart}
            >
              <Defs>
                <SvgGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#d0bcff" stopOpacity={0.3} />
                  <Stop offset="100%" stopColor="#d0bcff" stopOpacity={0} />
                </SvgGradient>
              </Defs>
              
              {/* Area Fill */}
              <Path
                d="M0,150 L0,110 C40,110 60,130 100,120 C140,110 160,60 210,70 C250,78 280,30 300,20 L300,150 Z"
                fill="url(#chartGradient)"
              />
              
              {/* Line */}
              <Path
                d="M0,110 C40,110 60,130 100,120 C140,110 160,60 210,70 C250,78 280,30 300,20"
                fill="none"
                stroke="#d0bcff"
                strokeWidth={4}
                strokeLinecap="round"
              />
              
              {/* Data Points */}
              <Circle cx={100} cy={120} r={5} fill="#0b1326" stroke="#d0bcff" strokeWidth={3} />
              <Circle cx={210} cy={70} r={5} fill="#0b1326" stroke="#d0bcff" strokeWidth={3} />
              <Circle cx={300} cy={20} r={6} fill="#d0bcff" />
            </Svg>

            {/* X-Axis Labels */}
            <View style={styles.xAxis}>
              <Text style={styles.xAxisText}>Mon</Text>
              <Text style={styles.xAxisText}>Wed</Text>
              <Text style={styles.xAxisText}>Fri</Text>
              <Text style={styles.xAxisText}>Sun</Text>
            </View>
          </View>
        </Animated.View>
        )}

        {/* Copy Content */}
        {isReady && (
        <Animated.View style={[styles.textContent, textEntryStyle]}>
          <Text style={styles.title}>Insights that inspire.</Text>
          <Text style={styles.description}>
            See your progress through stunning visualizations and AI-driven recommendations.
          </Text>
        </Animated.View>
        )}

        {/* Spacer */}
        <View style={styles.flexSpacer2} />

        {/* Controls (Bottom) */}
        {isReady && (
        <Animated.View style={[styles.controls, controlsEntryStyle]}>
          {/* Navigation Dots */}
          <View style={styles.dotsContainer}>
            <View style={styles.dot} />
            <View style={styles.activeDot} />
            <View style={styles.dot} />
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity activeOpacity={0.8} onPress={handleNext}>
            <LinearGradient
              colors={['#a078ff', '#0566d9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Next</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1326',
  },
  
  // Ambient Glows
  glowTopLeft: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: (width * 0.6) / 2,
    backgroundColor: '#a078ff',
    opacity: 0.15,
  },
  glowBottomRight: {
    position: 'absolute',
    top: '40%',
    right: '-20%',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    backgroundColor: '#0566d9',
    opacity: 0.1,
  },

  mainCanvas: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 32,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },

  flexSpacer1: {
    flexGrow: 1,
  },

  // Chart Card Container
  cardContainer: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 320,
    alignSelf: 'center',
    marginBottom: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  floatingBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 20,
    backgroundColor: 'rgba(45, 52, 73, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  badgeText: {
    fontFamily: 'JetBrains Mono',
    fontSize: 14,
    color: '#4edea3',
    fontWeight: '700',
    marginLeft: 4,
  },

  glassCard: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(11, 19, 38, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },

  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    padding: 16,
    justifyContent: 'space-between',
    opacity: 0.2,
  },

  gridLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#494454',
    width: '100%',
    height: 1,
  },

  svgChart: {
    zIndex: 10,
    overflow: 'visible',
  },

  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    zIndex: 10,
  },

  xAxisText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(203, 195, 215, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Content
  textContent: {
    alignItems: 'center',
    marginBottom: 32,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#cbc3d7',
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  flexSpacer2: {
    flexGrow: 2,
  },

  // Bottom Controls
  controls: {
    width: '100%',
    paddingBottom: 16,
  },

  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  dot: {
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(73, 68, 84, 0.5)',
    marginHorizontal: 4,
  },

  activeDot: {
    height: 6,
    width: 24,
    borderRadius: 3,
    backgroundColor: '#d0bcff',
    marginHorizontal: 4,
    // Hiệu ứng đổ bóng nhẹ cho active dot giống CSS shadow
    shadowColor: '#d0bcff',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },

  button: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // Đổ bóng nút bấm
    shadowColor: '#a078ff',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
});
