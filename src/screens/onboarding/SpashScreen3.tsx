import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, {
  Circle,
  Defs,
  Stop,
  G,
  LinearGradient as SvgGradient,
} from "react-native-svg";
import { useDispatch } from "react-redux";
import { completeOnboarding } from "../../features/auth/authSlice";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function SplashScreen3() {
  const dispatch = useDispatch();
  const progress = useRef(new Animated.Value(CIRCUMFERENCE)).current;
  const [offset, setOffset] = useState(CIRCUMFERENCE);

  useEffect(() => {
    const listener = progress.addListener(({ value }) => {
      setOffset(value);
    });

    const timer = setTimeout(() => {
      Animated.timing(progress, {
        toValue: 66,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }, 300);

  // Mẹo: Sửa lỗi dùng sai "strokeWidth" là string dạng số ("4"). Bản chất nó nhận dạng Double, đổi thành số thuần {4} hoặc 4.

    return () => {
      clearTimeout(timer);
      progress.removeListener(listener);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Glows */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.skip}>SKIP</Text>
        </TouchableOpacity>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.glassCard}>
          {/* Neon glow overlay */}
          <View style={styles.cardGlow} />

          {/* Progress Ring */}
          <View style={styles.ringContainer}>
            <Svg
              width={192}
              height={192}
              viewBox="0 0 100 100"
              style={styles.ringDropShadow}
            >
              <Defs>
                <SvgGradient
                  id="progressGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <Stop offset="0%" stopColor="#a078ff" />
                  <Stop offset="100%" stopColor="#0566d9" />
                </SvgGradient>
              </Defs>

              {/* Track */}
              <Circle
                cx="50"
                cy="50"
                r={RADIUS}
                stroke="#494454"
                strokeWidth={4}
                fill="transparent"
                opacity={0.5}
              />

              {/* Animated Progress */}
              <G rotation={-90} originX={50} originY={50}>
                <Circle
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  stroke="url(#progressGradient)"
                  strokeWidth={4}
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={offset}
                />
              </G>
            </Svg>

            {/* Center Icon */}
            <View style={styles.iconWrapper}>
              <MaterialIcons name="auto-awesome" size={32} color="#d0bcff" />
            </View>
          </View>

          {/* Streak Chip */}
          <View style={styles.streakChip}>
            <View style={styles.fireCircle}>
              <MaterialIcons
                name="local-fire-department"
                size={16}
                color="#ffb4ab"
              />
            </View>
            <View>
              <Text style={styles.streakLabel}>CURRENT STREAK</Text>
              <Text style={styles.streakValue}>14</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom */}
      <View style={styles.bottom}>
        {/* Text */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>Track with Precision</Text>
          <Text style={styles.description}>
            Consistency made beautiful. Track your daily rituals with intuitive
            gestures.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => dispatch(completeOnboarding())}
          >
            <LinearGradient
              colors={["#a078ff", "#0566d9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Next</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Dots */}
          <View style={styles.dots}>
            <View style={styles.activeDot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1326",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Background glows
  glowTopLeft: {
    position: "absolute",
    top: -120,
    left: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#a078ff",
    opacity: 0.1,
  },
  glowBottomRight: {
    position: "absolute",
    bottom: -100,
    right: -100,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#0566d9",
    opacity: 0.1,
  },

  // Header
  header: {
    alignItems: "flex-end",
  },
  skip: {
    color: "#cbc3d7",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },

  // Hero glass card
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  glassCard: {
    width: 280,
    height: 280,
    borderRadius: 24,
    backgroundColor: "rgba(11,19,38,0.70)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    shadowColor: "#d0bcff",
    shadowOpacity: 0.15,
    shadowRadius: 40,
  },

  // Ring
  ringContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  ringDropShadow: {
    // drop-shadow approximated via card glow
  },
  iconWrapper: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(49,57,77,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Streak chip
  streakChip: {
    position: "absolute",
    bottom: -24,
    right: -8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(49,57,77,0.85)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingLeft: 12,
    paddingRight: 16,
    paddingVertical: 8,
  },
  fireCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(147,0,10,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  streakLabel: {
    color: "#cbc3d7",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
  },
  streakValue: {
    color: "#dae2fd",
    fontSize: 20,
    fontWeight: "700",
  },

  // Bottom section
  bottom: {
    paddingBottom: 8,
  },
  textBlock: {
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#cbc3d7",
    textAlign: "center",
  },

  // Actions
  actions: {
    // replaces gap:24 with marginTop on dots
  },
  button: {
    height: 56,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginRight: 8,  // replaces gap
  },

  // Dots
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#d0bcff",
    marginHorizontal: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#494454",
    marginHorizontal: 5,
  },
});