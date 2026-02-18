import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { CalendarDays, CheckCircle, XCircle, AlertTriangle } from 'lucide-react-native';
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

type ViewMode = 'mine' | 'all';

export default function AllAppointmentsScreen() {
  const { barbers, services, getShopByOwnerId, getShopAppointments, getBarberByUserId, updateAppointmentStatus } = useData();
  const { user, users } = useAuth();
  const [filter, setFilter] = useState<AppointmentStatus | 'All'>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('mine');

  const shop = useMemo(() => {
    if (!user) return null;
    return getShopByOwnerId(user.id);
  }, [user, getShopByOwnerId]);

  const ownerBarber = useMemo(() => {
    if (!user) return null;
    return getBarberByUserId(user.id);
  }, [user, getBarberByUserId]);

  const allAppointments = useMemo(() => {
    if (!shop) return [];
    return getShopAppointments(shop.id);
  }, [shop, getShopAppointments]);

  const appointments = useMemo(() => {
    if (viewMode === 'mine' && ownerBarber) {
      return allAppointments.filter(a => a.barberId === ownerBarber.id);
    }
    return allAppointments;
  }, [allAppointments, viewMode, ownerBarber]);

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

  const handleStatusChange = useCallback((apptId: string, status: AppointmentStatus) => {
    const labels: Record<string, string> = {
      Completed: 'Mark as Completed',
      Canceled: 'Cancel Appointment',
      NoShow: 'Mark as No-Show',
    };
    Alert.alert(labels[status] ?? status, 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => updateAppointmentStatus(apptId, status) },
    ]);
  }, [updateAppointmentStatus]);

  const mineCount = useMemo(() => {
    if (!ownerBarber) return 0;
    return allAppointments.filter(a => a.barberId === ownerBarber.id).length;
  }, [allAppointments, ownerBarber]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Appointments</Text>

      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeBtn, viewMode === 'mine' && styles.modeBtnActive]}
          onPress={() => setViewMode('mine')}
          activeOpacity={0.7}
        >
          <Text style={[styles.modeBtnText, viewMode === 'mine' && styles.modeBtnTextActive]}>
            Mine ({mineCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, viewMode === 'all' && styles.modeBtnActive]}
          onPress={() => setViewMode('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.modeBtnText, viewMode === 'all' && styles.modeBtnTextActive]}>
            All Shop ({allAppointments.length})
          </Text>
        </TouchableOpacity>
      </View>

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

      {filtered.map((appt) => {
        const isBooked = appt.status === 'Booked';
        const isMineView = viewMode === 'mine';
        return (
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
              {!isMineView && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Barber</Text>
                  <Text style={styles.detailValue}>{getBarberName(appt.barberId)}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Customer</Text>
                <Text style={styles.detailValue}>{getCustomerName(appt.customerId)}</Text>
              </View>
            </View>
            {isBooked && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: 'rgba(76,175,80,0.12)' }]}
                  onPress={() => handleStatusChange(appt.id, 'Completed')}
                >
                  <CheckCircle size={15} color={Colors.success} />
                  <Text style={[styles.actionBtnText, { color: Colors.success }]}>Done</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: 'rgba(229,57,53,0.12)' }]}
                  onPress={() => handleStatusChange(appt.id, 'Canceled')}
                >
                  <XCircle size={15} color={Colors.error} />
                  <Text style={[styles.actionBtnText, { color: Colors.error }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: 'rgba(255,152,0,0.12)' }]}
                  onPress={() => handleStatusChange(appt.id, 'NoShow')}
                >
                  <AlertTriangle size={15} color={Colors.warning} />
                  <Text style={[styles.actionBtnText, { color: Colors.warning }]}>No-Show</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}

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
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  modeBtnActive: {
    backgroundColor: Colors.accent,
  },
  modeBtnText: { fontSize: 14, fontWeight: '600' as const, color: Colors.textSecondary },
  modeBtnTextActive: { color: Colors.black },
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
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  actionBtnText: { fontSize: 12, fontWeight: '600' as const },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600' as const, color: Colors.textSecondary },
});
