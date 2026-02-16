import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronRight, DollarSign, Award } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useData } from '@/contexts/DataContext';

export default function ChooseBarberScreen() {
  const router = useRouter();
  const { serviceId, shopId } = useLocalSearchParams<{ serviceId: string; shopId: string }>();
  const { getServiceById, getBarberPrice, getShopBarbers } = useData();

  const service = serviceId ? getServiceById(serviceId) : null;

  const activeBarbers = useMemo(() => {
    if (!shopId) return [];
    return getShopBarbers(shopId).filter((b) => b.inviteStatus !== 'pending');
  }, [shopId, getShopBarbers]);

  const handleSelect = (barberId: string) => {
    router.push(`/booking/pick-time?serviceId=${serviceId}&barberId=${barberId}&shopId=${shopId}` as any);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Choose Barber',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {service && (
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceLabel}>Service selected</Text>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceMeta}>{service.duration} min · from ${service.price}</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>AVAILABLE BARBERS</Text>

        {activeBarbers.map((barber) => {
          const barberPrice = serviceId ? getBarberPrice(barber.id, serviceId) : service?.price ?? 0;
          const isCustomPrice = barberPrice !== service?.price;

          return (
            <TouchableOpacity
              key={barber.id}
              style={styles.barberCard}
              onPress={() => handleSelect(barber.id)}
              activeOpacity={0.7}
            >
              <Image source={{ uri: barber.avatar }} style={styles.avatar} />
              <View style={styles.barberInfo}>
                <Text style={styles.barberName}>{barber.name}</Text>
                {barber.specialtyTags && barber.specialtyTags.length > 0 ? (
                  <View style={styles.tagsRow}>
                    {barber.specialtyTags.slice(0, 3).map((tag) => (
                      <View key={tag} style={styles.tagChip}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                    {barber.specialtyTags.length > 3 && (
                      <Text style={styles.moreTagsText}>+{barber.specialtyTags.length - 3}</Text>
                    )}
                  </View>
                ) : (
                  <Text style={styles.barberSpecialty}>{barber.specialty}</Text>
                )}
                <View style={styles.metaRow}>
                  <View style={styles.priceRow}>
                    <DollarSign size={13} color={Colors.accent} />
                    <Text style={styles.barberPrice}>{barberPrice}</Text>
                    {isCustomPrice && (
                      <Text style={styles.customTag}>Custom price</Text>
                    )}
                  </View>
                  {barber.yearsExperience > 0 && (
                    <View style={styles.expRow}>
                      <Award size={11} color={Colors.textMuted} />
                      <Text style={styles.expText}>{barber.yearsExperience}yr exp</Text>
                    </View>
                  )}
                </View>
              </View>
              <ChevronRight size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          );
        })}

        {activeBarbers.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No barbers available</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  serviceInfo: {
    backgroundColor: 'rgba(200,149,108,0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(200,149,108,0.15)',
  },
  serviceLabel: { fontSize: 11, color: Colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: 1 },
  serviceName: { fontSize: 18, fontWeight: '700' as const, color: Colors.text, marginTop: 4 },
  serviceMeta: { fontSize: 14, color: Colors.accent, marginTop: 4 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  barberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.surface,
  },
  barberInfo: { flex: 1, marginLeft: 14 },
  barberName: { fontSize: 17, fontWeight: '600' as const, color: Colors.text },
  barberSpecialty: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  tagChip: {
    backgroundColor: 'rgba(200,149,108,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(200,149,108,0.2)',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  moreTagsText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    alignSelf: 'center',
    marginLeft: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  barberPrice: { fontSize: 15, fontWeight: '700' as const, color: Colors.accent },
  customTag: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.info,
    backgroundColor: 'rgba(33,150,243,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
    overflow: 'hidden',
  },
  expRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  expText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
});
