import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, DollarSign, ChevronRight, Scissors } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

export default function CustomerServicesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { services } = useData();

  const handleSelectService = (serviceId: string) => {
    router.push(`/booking/choose-barber?serviceId=${serviceId}` as any);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] ?? 'there'}</Text>
        <Text style={styles.title}>What would you like today?</Text>
      </View>

      <Text style={styles.sectionLabel}>SERVICES</Text>

      {services.map((svc, index) => (
        <TouchableOpacity
          key={svc.id}
          style={styles.serviceCard}
          onPress={() => handleSelectService(svc.id)}
          activeOpacity={0.7}
          testID={`service-${index}`}
        >
          <View style={styles.serviceIcon}>
            <Scissors size={20} color={Colors.accent} />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{svc.name}</Text>
            <Text style={styles.serviceDesc} numberOfLines={2}>{svc.description}</Text>
            <View style={styles.serviceMeta}>
              <View style={styles.metaItem}>
                <Clock size={13} color={Colors.textMuted} />
                <Text style={styles.metaText}>{svc.duration} min</Text>
              </View>
              <View style={styles.metaItem}>
                <DollarSign size={13} color={Colors.success} />
                <Text style={[styles.metaText, { color: Colors.success }]}>${svc.price}</Text>
              </View>
            </View>
          </View>
          <ChevronRight size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 14, color: Colors.textSecondary },
  title: { fontSize: 24, fontWeight: '700' as const, color: Colors.text, marginTop: 4 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(200,149,108,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: { flex: 1, marginLeft: 14, marginRight: 8 },
  serviceName: { fontSize: 16, fontWeight: '600' as const, color: Colors.text },
  serviceDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 3, lineHeight: 18 },
  serviceMeta: { flexDirection: 'row', gap: 16, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' as const },
});
