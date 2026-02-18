import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Scissors, ChevronRight, Calendar, TrendingUp, Star, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useAuth();

  const logoAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const card1Anim = useRef(new Animated.Value(40)).current;
  const card2Anim = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoAnim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(card1Anim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
        Animated.spring(card2Anim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
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
        colors={['#120C05', '#0A0A0A', '#0A0A0A']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.gridOverlay}>
        {[...Array(5)].map((_, i) => (
          <View
            key={`v${i}`}
            style={[styles.gridLine, styles.gridLineV, { left: (width / 4) * i }]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoAnim }] }]}>
          <View style={styles.logoRing}>
            <View style={styles.logoInner}>
              <Scissors size={28} color={Colors.accent} strokeWidth={1.5} />
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[styles.heroText, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <Text style={styles.brand}>CUTFLOW</Text>
          <Text style={styles.headline}>Your Next Great{'\n'}Cut Starts Here</Text>
          <Text style={styles.sub}>
            Book top barbers near you — or grow your barbershop with powerful tools built for pros.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.cardCustomer, { transform: [{ translateY: card1Anim }] }]}>
          <LinearGradient
            colors={['rgba(200,149,108,0.18)', 'rgba(200,149,108,0.06)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>FOR CUSTOMERS</Text>
          </View>
          <Text style={styles.cardTitle}>Find Your Barber</Text>
          <Text style={styles.cardDesc}>
            Browse local barbershops, see real availability, and book your slot in seconds.
          </Text>

          <View style={styles.cardFeatures}>
            <View style={styles.featureItem}>
              <Calendar size={13} color={Colors.accent} />
              <Text style={styles.featureText}>Instant booking</Text>
            </View>
            <View style={styles.featureItem}>
              <Star size={13} color={Colors.accent} />
              <Text style={styles.featureText}>Top-rated barbers</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.cardBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/signup' as any)}
            testID="customer-signup-btn"
          >
            <Text style={styles.cardBtnText}>Book a Haircut</Text>
            <ChevronRight size={18} color={Colors.black} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.cardPro, { transform: [{ translateY: card2Anim }] }]}>
          <View style={styles.cardBadgePro}>
            <Text style={styles.cardBadgeProText}>FOR BARBERS & OWNERS</Text>
          </View>
          <Text style={styles.cardTitlePro}>Run Your Chair</Text>
          <Text style={styles.cardDescPro}>
            Manage your schedule, set your own prices, attract clients with promos, and grow your brand.
          </Text>

          <View style={styles.cardFeaturesPro}>
            <View style={styles.featureItemPro}>
              <TrendingUp size={13} color={Colors.textSecondary} />
              <Text style={styles.featureTextPro}>Revenue tracking</Text>
            </View>
            <View style={styles.featureItemPro}>
              <Users size={13} color={Colors.textSecondary} />
              <Text style={styles.featureTextPro}>Team management</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.cardBtnPro}
            activeOpacity={0.85}
            onPress={() => router.push('/signup' as any)}
            testID="pro-signup-btn"
          >
            <Text style={styles.cardBtnProText}>Join as a Pro</Text>
            <ChevronRight size={18} color={Colors.text} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.loginBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/login' as any)}
            testID="login-btn"
          >
            <Text style={styles.loginText}>Already have an account? </Text>
            <Text style={styles.loginTextBold}>Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pricingBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/pricing' as any)}
            testID="pricing-btn"
          >
            <Text style={styles.pricingText}>View Pricing Plans</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: Colors.accent,
    opacity: 0.04,
  },
  gridLineV: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  scroll: {
    paddingHorizontal: 24,
    alignItems: 'stretch',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoRing: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(200,149,108,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(200,149,108,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(200,149,108,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    marginBottom: 28,
  },
  brand: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 6,
    color: Colors.accent,
    marginBottom: 10,
  },
  headline: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: Colors.text,
    lineHeight: 44,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 23,
  },
  cardCustomer: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(200,149,108,0.25)',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  cardBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
    marginBottom: 12,
  },
  cardBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.black,
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 16,
  },
  cardFeatures: {
    flexDirection: 'row' as const,
    gap: 16,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  cardBtn: {
    backgroundColor: Colors.accent,
    height: 50,
    borderRadius: 14,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
  },
  cardBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.black,
  },
  cardPro: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 22,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardBadgePro: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardBadgeProText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  cardTitlePro: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  cardDescPro: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 16,
  },
  cardFeaturesPro: {
    flexDirection: 'row' as const,
    gap: 16,
    marginBottom: 20,
  },
  featureItemPro: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
  },
  featureTextPro: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  cardBtnPro: {
    backgroundColor: Colors.surface,
    height: 50,
    borderRadius: 14,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardBtnProText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  footer: {
    alignItems: 'center' as const,
    gap: 8,
  },
  loginBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 8,
  },
  loginText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginTextBold: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  pricingBtn: {
    paddingVertical: 8,
  },
  pricingText: {
    fontSize: 13,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
});
