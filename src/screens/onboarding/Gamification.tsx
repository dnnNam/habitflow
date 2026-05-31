// screens/OnboardingScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type GamificationNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'Gamification'>;

export default function Gamification() {
  const navigation = useNavigation<GamificationNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('SplashScreen1');
  };
  return (
    <View style={styles.container}>
      
      {/* Floating Cards */}
      <View style={styles.visualContainer}>

        {/* Star */}
        <View style={[styles.cardSmall, styles.starCard]}>
          <MaterialIcons name="star" size={32} color="#4EDEA3" />
        </View>

        {/* Crown Main */}
        <View style={[styles.cardLarge, styles.crownCard]}>
          <MaterialIcons
            name="workspace-premium"
            size={72}
            color="#D0BCFF"
          />
        </View>

        {/* Fire */}
        <View style={[styles.cardMini, styles.fireCard]}>
          <MaterialIcons
            name="local-fire-department"
            size={28}
            color="#FFB4AB"
          />
        </View>

      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Unlock Your Potential
        </Text>

        <Text style={styles.description}>
          Stay motivated. Earn XP, unlock badges,
          and level up your life one habit at a time.
        </Text>
      </View>

      {/* Bottom */}
      <View style={styles.bottomContainer}>

        {/* Dots */}
        <View style={styles.dotsContainer}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.activeDot} />
        </View>

        {/* Button */}
        <TouchableOpacity activeOpacity={0.8} onPress={handleGetStarted}>
          <LinearGradient
            colors={['#6D3BD7', '#A078FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              GET STARTED
            </Text>
          </LinearGradient>
        </TouchableOpacity>

      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1326',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },

  visualContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  cardSmall: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(23,31,51,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#494454',
  },

  cardLarge: {
    width: 150,
    height: 150,
    borderRadius: 32,
    backgroundColor: 'rgba(23,31,51,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#494454',
  },

  cardMini: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(23,31,51,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#494454',
  },

  starCard: {
    top: 120,
    left: 30,
  },

  crownCard: {
    right: 20,
  },

  fireCard: {
    bottom: 130,
    left: 80,
  },

  content: {
    alignItems: 'center',
    marginBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
    textAlign: 'center',
  },

  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#CBC3D7',
    textAlign: 'center',
    maxWidth: 280,
  },

  bottomContainer: {
    // Đã xóa gap: 30 để tránh crash Android
  },

  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30, // Thay thế gap: 30 của khối bottomContainer cũ bằng cách đẩy nút xuống dưới 30px
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 10,
    backgroundColor: '#2D3449',
    marginHorizontal: 4, // Thay thế gap: 8 giúp cách đều các chấm tròn
  },

  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 10,
    backgroundColor: '#D0BCFF',
    marginHorizontal: 4, // Đảm bảo khoảng cách đồng bộ với dot thường
  },

  button: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
