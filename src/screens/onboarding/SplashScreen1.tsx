import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { OnboardingStackParamList } from "../../navigation/OnboardingNavigator";

const { width } = Dimensions.get("window");

type SplashScreen1NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, "SplashScreen1">;

export default function SplashScreen1() {
  const navigation = useNavigation<SplashScreen1NavigationProp>();
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<any>(null);

  const handleNext = () => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
    navigation.navigate("SplashScreen2");
  };

  useEffect(() => {
    const floatSequence = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -12,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    
    animationRef.current = floatSequence;
    floatSequence.start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Background - Chuẩn hóa màu sắc an toàn cho Android */}
      <LinearGradient
        colors={["rgba(45, 52, 73, 0.2)", "#0b1326", "#0b1326"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        {/* Aura */}
        <LinearGradient
          colors={["#a078ff", "#0566d9"]}
          style={styles.aura}
        />

        {/* Glass Card */}
        <View style={styles.glassCard}>
          <Text style={styles.wavySymbol}>~</Text>
        </View>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          HabitFlow
        </Animated.Text>

        {/* Khối Dots đã loại bỏ thuộc tính gap gây lỗi */}
        <View style={styles.dots}>
          <Animated.View style={[styles.dot, { opacity: 1 }]} />
          <Animated.View style={[styles.dot, { opacity: 0.7 }]} />
          <Animated.View style={[styles.dot, { opacity: 0.4 }]} />
        </View>

        {/* Next Button */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={handleNext}
          style={styles.nextButton}
        >
          <LinearGradient
            colors={["#6D3BD7", "#A078FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>NEXT</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1326",
    justifyContent: "center",
    alignItems: "center",
  },

  logoWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },

  aura: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.4,
  },

  glassCard: {
    width: 128,
    height: 128,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  logoText: {
    fontSize: 64,
    fontWeight: "800",
    color: "#d0bcff",
  },

  wavySymbol: {
    fontSize: 80,
    color: "#d0bcff",
    fontWeight: "300",
  },

  footer: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
  },

  title: {
    fontSize: 40,
    fontWeight: "800",
    color: "#d0bcff",
    letterSpacing: -1,
  },

  dots: {
    flexDirection: "row",
    marginTop: 24,
    // Đã xóa gap: 8 ở đây để tránh lỗi ép kiểu tầng Native
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d0bcff",
    marginHorizontal: 4, // Thay thế gap bằng cách cách đều hai bên 4px (tổng cộng giữa 2 chấm là 8px)
  },

  nextButton: {
    marginTop: 30,
  },

  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
