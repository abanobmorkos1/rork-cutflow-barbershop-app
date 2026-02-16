import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Scissors, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      const route = user.role === 'owner' ? '/owner' : user.role === 'barber' ? '/barber' : '/customer';
      router.replace(route as any);
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Scissors size={32} color={Colors.accent} />
      </View>
    );
  }

  if (user) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A1008', '#0A0A0A', '#0A0A0A']}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.topDecor]}>
        {[...Array(6)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.decorLine,
              {
                left: (width / 5) * i - 20,
                height: 120 + (i % 3) * 40,
                opacity: 0.03 + (i % 3) * 0.02,
              },
            ]}
          />
        ))}
      </View>

      <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoInner}>
            <Scissors size={36} color={Colors.accent} strokeWidth={1.5} />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.textBlock,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.brand}>CUTFLOW</Text>
          <Text style={styles.tagline}>Premium Barbershop{'\n'}Management</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>
            Book appointments, manage your team,{'\n'}and grow your business — all in one place.
          </Text>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.actions,
          {
            paddingBottom: insets.bottom + 32,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.8}
          onPress={() => router.push('/signup' as any)}
          testID="signup-btn"
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
          <ChevronRight size={20} color={Colors.black} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.7}
          onPress={() => router.push('/login' as any)}
          testID="login-btn"
        >
          <Text style={styles.secondaryBtnText}>I already have an account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkBtn}
          activeOpacity={0.7}
          onPress={() => router.push('/pricing' as any)}
          testID="pricing-btn"
        >
          <Text style={styles.linkBtnText}>View Pricing Plans</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  decorLine: {
    position: 'absolute',
    top: 0,
    width: 1,
    backgroundColor: Colors.accent,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(200,149,108,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(200,149,108,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoInner: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(200,149,108,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {},
  brand: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 6,
    color: Colors.accent,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: Colors.text,
    lineHeight: 42,
    marginBottom: 20,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: Colors.accent,
    marginBottom: 20,
    borderRadius: 1,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  actions: {
    paddingHorizontal: 32,
  },
  primaryBtn: {
    backgroundColor: Colors.accent,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.black,
  },
  secondaryBtn: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkBtnText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
