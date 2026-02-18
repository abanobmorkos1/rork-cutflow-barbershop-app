import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { MapPin, Star, Clock, DollarSign, ChevronRight, Phone, Scissors, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useData } from '@/contexts/DataContext';

export default function ShopDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getShopById, getShopBarbers, getShopServices } = useData();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);
  const servicesRef = useRef<View>(null);
  const scrollRef = useRef<ScrollView>(null);

  const shop = id ? getShopById(id) : null;
  const barbers = useMemo(() => {
    if (!id) return [];
    return getShopBarbers(id).filter((b) => !b.inviteStatus || b.inviteStatus === 'accepted');
  }, [id, getShopBarbers]);
  const services = useMemo(() => (id ? getShopServices(id) : []), [id, getShopServices]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIndex = new Date().getDay();

  if (!shop) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Shop not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleBarberTap = useCallback((barberId: string) => {
    setSelectedBarberId((prev) => (prev === barberId ? null : barberId));
  }, []);

  const handleSelectService = (serviceId: string) => {
    if (selectedBarberId) {
      router.push(`/booking/pick-time?serviceId=${serviceId}&barberId=${selectedBarberId}&shopId=${shop.id}` as any);
      setSelectedBarberId(null);
    } else {
      router.push(`/booking/choose-barber?serviceId=${serviceId}&shopId=${shop.id}` as any);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.heroContainer}>
          <Image source={{ uri: shop.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 8 }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={Colors.white} />
          </TouchableOpacity>
          <View style={[styles.heroContent, { paddingBottom: 20 }]}>
            <View style={styles.ratingRow}>
              <Star size={14} color="#FFB800" fill="#FFB800" />
              <Text style={styles.heroRating}>{shop.rating}</Text>
              <Text style={styles.heroReviews}>({shop.reviewCount} reviews)</Text>
            </View>
            <Text style={styles.heroName}>{shop.name}</Text>
            <View style={styles.heroLocation}>
              <MapPin size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroAddress}>{shop.address}, {shop.city}</Text>
            </View>
          </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.descSection}>
            <Text style={styles.descText}>{shop.description}</Text>
            <View style={styles.contactRow}>
              <Phone size={14} color={Colors.accent} />
              <Text style={styles.contactText}>{shop.phone}</Text>
            </View>
          </View>

          <View style={styles.hoursCard}>
            <Text style={styles.sectionTitle}>Hours</Text>
            <View style={styles.hoursGrid}>
              {dayNames.map((day, i) => {
                const h = shop.hours[day];
                const isToday = i === todayIndex;
                return (
                  <View key={day} style={[styles.hourRow, isToday && styles.hourRowToday]}>
                    <Text style={[styles.hourDay, isToday && styles.hourDayToday]}>
                      {dayLabels[i]}
                    </Text>
                    <Text style={[styles.hourTime, isToday && styles.hourTimeToday]}>
                      {h ? `${h.open} – ${h.close}` : 'Closed'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Barbers</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{barbers.length}</Text>
              </View>
            </View>
            {selectedBarberId && (
              <View style={styles.selectedBarberBanner}>
                <Text style={styles.selectedBarberText}>
                  Select a service below to book with{' '}
                  <Text style={styles.selectedBarberName}>
                    {barbers.find((b) => b.id === selectedBarberId)?.name}
                  </Text>
                </Text>
                <TouchableOpacity onPress={() => setSelectedBarberId(null)}>
                  <Text style={styles.selectedBarberCancel}>Clear</Text>
                </TouchableOpacity>
              </View>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barbersScroll}>
              {barbers.map((barber) => {
                const isSelected = selectedBarberId === barber.id;
                const tags = barber.specialtyTags ?? [];
                return (
                  <TouchableOpacity
                    key={barber.id}
                    style={[styles.barberChip, isSelected && styles.barberChipSelected]}
                    onPress={() => handleBarberTap(barber.id)}
                    activeOpacity={0.7}
                  >
                    <Image source={{ uri: barber.avatar }} style={[styles.barberAvatar, isSelected && styles.barberAvatarSelected]} />
                    <Text style={[styles.barberChipName, isSelected && styles.barberChipNameSelected]} numberOfLines={1}>{barber.name}</Text>
                    {tags.length > 0 && (
                      <Text style={styles.barberChipTag} numberOfLines={1}>
                        {tags[0]}
                      </Text>
                    )}
                    <View style={[styles.bookBadge, isSelected && styles.bookBadgeSelected]}>
                      <Text style={[styles.bookBadgeText, isSelected && styles.bookBadgeTextSelected]}>
                        {isSelected ? 'Selected' : 'Tap to book'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Services</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{services.length}</Text>
              </View>
            </View>

            {services.map((svc, index) => (
              <TouchableOpacity
                key={svc.id}
                style={styles.serviceCard}
                onPress={() => handleSelectService(svc.id)}
                activeOpacity={0.7}
                testID={`shop-service-${index}`}
              >
                <View style={styles.serviceIcon}>
                  <Scissors size={18} color={Colors.accent} />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{svc.name}</Text>
                  <Text style={styles.serviceDesc} numberOfLines={2}>{svc.description}</Text>
                  <View style={styles.serviceMeta}>
                    <View style={styles.metaChip}>
                      <Clock size={12} color={Colors.textMuted} />
                      <Text style={styles.metaChipText}>{svc.duration} min</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <DollarSign size={12} color={Colors.success} />
                      <Text style={[styles.metaChipText, { color: Colors.success }]}>from ${svc.price}</Text>
                    </View>
                  </View>
                </View>
                <ChevronRight size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}

            {services.length === 0 && (
              <View style={styles.emptyServices}>
                <Scissors size={32} color={Colors.textMuted} />
                <Text style={styles.emptyText}>No services listed yet</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 17, color: Colors.textSecondary },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backButtonText: { fontSize: 14, color: Colors.text, fontWeight: '600' as const },
  heroContainer: { position: 'relative' },
  heroImage: { width: '100%', height: 240, backgroundColor: Colors.surface },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  heroRating: { fontSize: 14, fontWeight: '700' as const, color: '#FFB800' },
  heroReviews: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  heroName: { fontSize: 26, fontWeight: '800' as const, color: Colors.white, marginBottom: 6 },
  heroLocation: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroAddress: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  descSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  descText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  contactText: { fontSize: 14, color: Colors.accent, fontWeight: '600' as const },
  hoursCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hoursGrid: { gap: 6, marginTop: 12 },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  hourRowToday: {
    backgroundColor: 'rgba(200,149,108,0.1)',
  },
  hourDay: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary, width: 40 },
  hourDayToday: { color: Colors.accent },
  hourTime: { fontSize: 13, color: Colors.textMuted },
  hourTimeToday: { color: Colors.accent, fontWeight: '600' as const },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  countBadge: {
    backgroundColor: 'rgba(200,149,108,0.15)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countText: { fontSize: 13, fontWeight: '700' as const, color: Colors.accent },
  barbersScroll: { gap: 12, paddingRight: 20 },
  barberChip: {
    width: 100,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  barberAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.surface,
  },
  barberChipName: { fontSize: 12, fontWeight: '600' as const, color: Colors.text, textAlign: 'center' as const },
  barberChipTag: { fontSize: 10, color: Colors.accent, textAlign: 'center' as const },
  barberChipSelected: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(200,149,108,0.08)',
  },
  barberAvatarSelected: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  barberChipNameSelected: {
    color: Colors.accent,
  },
  bookBadge: {
    backgroundColor: 'rgba(200,149,108,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
  },
  bookBadgeSelected: {
    backgroundColor: Colors.accent,
  },
  bookBadgeText: {
    fontSize: 9,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  bookBadgeTextSelected: {
    color: Colors.black,
  },
  selectedBarberBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(200,149,108,0.1)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(200,149,108,0.2)',
  },
  selectedBarberText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  selectedBarberName: {
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  selectedBarberCancel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    marginLeft: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(200,149,108,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: { flex: 1, marginLeft: 14, marginRight: 8 },
  serviceName: { fontSize: 16, fontWeight: '600' as const, color: Colors.text },
  serviceDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 3, lineHeight: 18 },
  serviceMeta: { flexDirection: 'row', gap: 12, marginTop: 8 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaChipText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' as const },
  emptyServices: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
});
