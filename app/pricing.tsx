import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Check, Store, Users, Smile, DollarSign } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

export default function PricingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const ownerFeatures = [
    'Full shop management dashboard',
    'Manage services & shop hours',
    'View all appointments',
    'Invite barbers via email',
    'Customer booking system',
    'Real-time schedule updates',
  ];

  const barberFeatures = [
    'Personal schedule & calendar',
    'Set your own availability',
    'Custom pricing per service',
    'Specialty tags & profile page',
    'Mark appointments status',
    'Client management',
  ];

  const customerFeatures = [
    'Browse available barbers',
    'Book appointments online',
    'View barber specialties',
    'Reschedule or cancel',
    'Booking history',
    'Profile management',
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Pricing',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.heading}>Simple, transparent pricing</Text>
          <Text style={styles.subheading}>
            One plan for shop owners. Customers use CutFlow for free. Barbers pay $10/mo.
          </Text>

          <View style={[styles.card, styles.cardOwner]}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>SHOP OWNER</Text>
            </View>
            <View style={styles.cardHeader}>
              <Store size={24} color={Colors.accent} />
              <Text style={styles.planName}>CutFlow Pro</Text>
            </View>

            <View style={styles.priceBlock}>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>One-time setup</Text>
                <View style={styles.priceValueRow}>
                  <Text style={styles.priceBig}>$500</Text>
                </View>
              </View>
              <View style={styles.priceDividerV} />
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Annual fee</Text>
                <View style={styles.priceValueRow}>
                  <Text style={styles.priceBig}>$100</Text>
                  <Text style={styles.pricePer}>/yr</Text>
                </View>
              </View>
            </View>

            <View style={styles.perBarberRow}>
              <Users size={16} color={Colors.accent} />
              <Text style={styles.perBarberText}>
                <Text style={styles.perBarberPrice}>$10</Text> / barber / month
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.featuresTitle}>Everything you need</Text>
            {ownerFeatures.map((f) => (
              <View key={f} style={styles.featureRow}>
                <Check size={16} color={Colors.success} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}

            <View style={styles.exampleBox}>
              <DollarSign size={14} color={Colors.accent} />
              <Text style={styles.exampleText}>
                Example: 3 barbers = $500 setup + $100/yr + $30/mo
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Users size={22} color={Colors.info} />
              <Text style={styles.planName}>For Barbers</Text>
              <View style={styles.barberPriceBadge}>
                <Text style={styles.barberPriceBadgeText}>$10/mo</Text>
              </View>
            </View>
            <Text style={styles.freeDesc}>
              Barbers are invited by the shop owner and manage their own $10/month subscription to access the platform.
            </Text>
            <View style={styles.divider} />
            {barberFeatures.map((f) => (
              <View key={f} style={styles.featureRow}>
                <Check size={16} color={Colors.info} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Smile size={22} color={Colors.success} />
              <Text style={styles.planName}>For Customers</Text>
              <View style={[styles.freeBadge, { backgroundColor: 'rgba(76,175,80,0.12)' }]}>
                <Text style={[styles.freeBadgeText, { color: Colors.success }]}>FREE</Text>
              </View>
            </View>
            <Text style={styles.freeDesc}>
              Customers book appointments at no cost. Always free.
            </Text>
            <View style={styles.divider} />
            {customerFeatures.map((f) => (
              <View key={f} style={styles.featureRow}>
                <Check size={16} color={Colors.success} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 12 },
  heading: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardOwner: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.black,
    letterSpacing: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  priceBlock: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  priceValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceBig: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  pricePer: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  priceDividerV: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 14,
  },
  perBarberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(200,149,108,0.08)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(200,149,108,0.15)',
  },
  perBarberText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  perBarberPrice: {
    fontWeight: '800' as const,
    color: Colors.accent,
    fontSize: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  exampleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(200,149,108,0.06)',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(200,149,108,0.12)',
  },
  exampleText: {
    fontSize: 13,
    color: Colors.accent,
    flex: 1,
    lineHeight: 18,
  },
  freeBadge: {
    backgroundColor: 'rgba(33,150,243,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freeBadgeText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.info,
    letterSpacing: 1,
  },
  barberPriceBadge: {
    backgroundColor: 'rgba(33,150,243,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  barberPriceBadgeText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.info,
    letterSpacing: 0.5,
  },
  freeDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
});
