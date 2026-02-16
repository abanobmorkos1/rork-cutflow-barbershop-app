import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { CalendarDays, XCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppointmentStatus } from '@/types';
import { formatDateTime } from '@/utils/slots';

const statusColors: Record<AppointmentStatus, string> = {
  Booked: Colors.statusBooked,
  Completed: Colors.statusCompleted,
  Canceled: Colors.statusCanceled,
  NoShow: Colors.statusNoShow,
};

export default function CustomerAppointmentsScreen() {
  const { user } = useAuth();
  const { getCustomerAppointments, updateAppointmentStatus, getBarberById, getServiceById } = useData();

  const appointments = useMemo(() => {
    if (!user) return [];
    return getCustomerAppointments(user.id).sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );
  }, [user, getCustomerAppointments]);

  const upcoming = useMemo(() => appointments.filter((a) => a.status === 'Booked'), [appointments]);
  const past = useMemo(() => appointments.filter((a) => a.status !== 'Booked'), [appointments]);

  const handleCancel = (apptId: string) => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel?', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel It',
        style: 'destructive',
        onPress: () => updateAppointmentStatus(apptId, 'Canceled'),
      },
    ]);
  };

  const renderAppt = (appt: typeof appointments[0], showCancel: boolean) => {
    const barber = getBarberById(appt.barberId);
    const service = getServiceById(appt.serviceId);
    return (
      <View key={appt.id} style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[appt.status] + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColors[appt.status] }]} />
            <Text style={[styles.statusText, { color: statusColors[appt.status] }]}>
              {appt.status}
            </Text>
          </View>
          <Text style={styles.dateText}>{formatDateTime(appt.dateTime)}</Text>
        </View>
        <Text style={styles.serviceName}>{service?.name ?? 'Service'}</Text>
        <Text style={styles.barberName}>with {barber?.name ?? 'Barber'}</Text>
        {service && (
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>${service.price}</Text>
            <Text style={styles.durationText}>{service.duration} min</Text>
          </View>
        )}
        {showCancel && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => handleCancel(appt.id)}
            activeOpacity={0.7}
          >
            <XCircle size={16} color={Colors.error} />
            <Text style={styles.cancelText}>Cancel Appointment</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>My Bookings</Text>

      {upcoming.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>UPCOMING</Text>
          {upcoming.map((a) => renderAppt(a, true))}
        </>
      )}

      {past.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>PAST</Text>
          {past.map((a) => renderAppt(a, false))}
        </>
      )}

      {appointments.length === 0 && (
        <View style={styles.empty}>
          <CalendarDays size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No bookings yet</Text>
          <Text style={styles.emptySubtext}>Book your first appointment!</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '700' as const, color: Colors.text, marginBottom: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700' as const },
  dateText: { fontSize: 12, color: Colors.textSecondary },
  serviceName: { fontSize: 17, fontWeight: '600' as const, color: Colors.text },
  barberName: { fontSize: 14, color: Colors.textSecondary, marginTop: 3 },
  priceRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  priceText: { fontSize: 15, fontWeight: '700' as const, color: Colors.accent },
  durationText: { fontSize: 13, color: Colors.textMuted },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 6,
  },
  cancelText: { fontSize: 14, fontWeight: '600' as const, color: Colors.error },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: 17, fontWeight: '600' as const, color: Colors.textSecondary },
  emptySubtext: { fontSize: 14, color: Colors.textMuted },
});
