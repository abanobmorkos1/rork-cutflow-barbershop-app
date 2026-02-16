import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, MapPin, Star, Users, Clock, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function ExploreShopsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { shops, getShopBarbers } = useData();
  const [search, setSearch] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return shops;
    const q = search.toLowerCase();
    return shops.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
    );
  }, [shops, search]);

  const getTodayStatus = (shop: typeof shops[0]) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const h = shop.hours[today];
    if (!h) return 'Closed today';
    return `Open ${h.open} – ${h.close}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Hey, {user?.name?.split(' ')[0] ?? 'there'}</Text>
            <Text style={styles.title}>Find your barber</Text>
          </View>

          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search shops, cities..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
              testID="search-shops"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <X size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.sectionLabel}>
            {search ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : 'NEARBY SHOPS'}
          </Text>

          {filtered.map((shop, index) => {
            const barberCount = getShopBarbers(shop.id).filter((b) => b.inviteStatus !== 'pending').length;
            const todayStatus = getTodayStatus(shop);
            const isOpen = !todayStatus.startsWith('Closed');

            return (
              <TouchableOpacity
                key={shop.id}
                style={styles.shopCard}
                activeOpacity={0.85}
                onPress={() => router.push(`/shop/${shop.id}` as any)}
                testID={`shop-${index}`}
              >
                <Image source={{ uri: shop.image }} style={styles.shopImage} />
                <View style={styles.shopImageOverlay} />

                <View style={styles.ratingBadge}>
                  <Star size={12} color="#FFB800" fill="#FFB800" />
                  <Text style={styles.ratingText}>{shop.rating}</Text>
                  <Text style={styles.reviewCount}>({shop.reviewCount})</Text>
                </View>

                <View style={styles.shopInfo}>
                  <Text style={styles.shopName}>{shop.name}</Text>

                  <View style={styles.shopMeta}>
                    <View style={styles.metaItem}>
                      <MapPin size={13} color={Colors.textSecondary} />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {shop.address}, {shop.city}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.shopFooter}>
                    <View style={styles.footerLeft}>
                      <View style={styles.barberCountChip}>
                        <Users size={12} color={Colors.accent} />
                        <Text style={styles.barberCountText}>
                          {barberCount} barber{barberCount !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      <View style={[styles.statusChip, isOpen ? styles.statusOpen : styles.statusClosed]}>
                        <Clock size={11} color={isOpen ? '#4CAF50' : Colors.error} />
                        <Text style={[styles.statusText, { color: isOpen ? '#4CAF50' : Colors.error }]}>
                          {todayStatus}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {filtered.length === 0 && (
            <View style={styles.empty}>
              <MapPin size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No shops found</Text>
              <Text style={styles.emptySubtext}>Try a different search</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 32 },
  header: { paddingHorizontal: 20, paddingTop: 12, marginBottom: 16 },
  greeting: { fontSize: 14, color: Colors.textSecondary },
  title: { fontSize: 26, fontWeight: '700' as const, color: Colors.text, marginTop: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    height: '100%' as unknown as number,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  shopCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  shopImage: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.surface,
  },
  shopImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFB800',
  },
  reviewCount: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  shopInfo: {
    padding: 16,
  },
  shopName: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  shopMeta: {
    gap: 6,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  shopFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  barberCountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(200,149,108,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  barberCountText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusOpen: {
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  statusClosed: {
    backgroundColor: 'rgba(229,57,53,0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
