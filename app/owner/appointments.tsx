import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CalendarDays, Filter } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { AppointmentStatus } from '@/types';
import { formatDateTime } from '@/utils/slots';

const STATUSES: (AppointmentStatus | 'All')[] = ['All', 'Booked', 'Completed', 'Canceled', 'NoShow'];

const statusColors: Record<AppointmentStatus, string> = {
  Booked: Colors.statusBooked,
  Completed: Colors.statusCompleted,
  Canceled: Colors.statusCanceled,
  NoShow: Colors.statusNoShow,
};

export default function AllAppointmentsScreen() {
  const { appointments, barbers, services } = useData();
  const { users } = useAuth();
  const [filter, setFilter] = useState<AppointmentStatus | 'All'>('All');

  const filtered = useMemo(() => {
    const sorted = [...appointments].sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );
    if (filter === 'All') return sorted;
    return sorted.filter((a) => a.status === filter);
  }, [appointments, filter]);

  const getBarberName = (id: string) => barbers.find((b) => b.id === id)?.name ?? 'Unknown';
  const getServiceName = (id: string) => services.find((s) => s.id === id)?.name ?? 'Unknown';
  const getCustomerName = (id: string) => users.find((u) => u.id === id)?.name ?? 'Customer';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>All Appointments</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {STATUSES.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.filterChip, filter === s && styles.filterChipActive]}
            onPress={() => setFilter(s)}
          >
            <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.map((appt) => (
        <View key={appt.id} style={styles.apptCard}>
          <View style={styles.apptHeader}>
            <View style={[styles.statusDot, { backgroundColor: statusColors[appt.status] }]} />
            <Text style={styles.apptStatus}>{appt.status}</Text>
            <Text style={styles.apptDate}>{formatDateTime(appt.dateTime)}</Text>
          </View>
          <View style={styles.apptDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service</Text>
              <Text style={styles.detailValue}>{getServiceName(appt.serviceId)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Barber</Text>
              <Text style={styles.detailValue}>{getBarberName(appt.barberId)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Customer</Text>
              <Text style={styles.detailValue}>{getCustomerName(appt.customerId)}</Text>
            </View>
          </View>
        </View>
      ))}

      {filtered.length === 0 && (
        <View style={styles.empty}>
          <CalendarDays size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No appointments found</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '700' as const, color: Colors.text, marginBottom: 16 },
  filterRow: { marginBottom: 20, flexGrow: 0 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterText: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary },
  filterTextActive: { color: Colors.black },
  apptCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  apptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  apptStatus: { fontSize: 13, fontWeight: '700' as const, color: Colors.text, marginRight: 'auto' },
  apptDate: { fontSize: 12, color: Colors.textSecondary },
  apptDetails: { gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 13, color: Colors.textMuted },
  detailValue: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600' as const, color: Colors.textSecondary },
});
