import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppointmentStatus } from '@/types';
import { formatDateTime, formatTime, getCalendarDays, MONTH_NAMES, WEEKDAY_HEADERS, toDateStr } from '@/utils/slots';

const statusColors: Record<AppointmentStatus, string> = {
  Booked: Colors.statusBooked,
  Completed: Colors.statusCompleted,
  Canceled: Colors.statusCanceled,
  NoShow: Colors.statusNoShow,
};

export default function BarberScheduleScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { getBarberByUserId, getBarberAppointments, services, updateAppointmentStatus } = useData();
  const { users } = useAuth();

  const barber = useMemo(() => {
    if (!user) return null;
    return getBarberByUserId(user.id);
  }, [user, getBarberByUserId]);

  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(toDateStr(now));

  const calendarDays = useMemo(() => getCalendarDays(calYear, calMonth), [calYear, calMonth]);
  const todayStr = useMemo(() => toDateStr(new Date()), []);

  const allAppointments = useMemo(() => {
    if (!barber) return [];
    return getBarberAppointments(barber.id).sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
  }, [barber, getBarberAppointments]);

  const appointmentsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    allAppointments.forEach((a) => {
      if (a.status === 'Booked') {
        const d = a.dateTime.substring(0, 10);
        map[d] = (map[d] || 0) + 1;
      }
    });
    return map;
  }, [allAppointments]);

  const selectedAppts = useMemo(() => {
    return allAppointments.filter((a) => a.dateTime.startsWith(selectedDate));
  }, [allAppointments, selectedDate]);

  const upcomingCount = useMemo(
    () => allAppointments.filter((a) => a.status === 'Booked').length,
    [allAppointments]
  );

  const completedCount = useMemo(
    () => allAppointments.filter((a) => a.status === 'Completed').length,
    [allAppointments]
  );

  const goNextMonth = useCallback(() => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  }, [calMonth]);

  const goPrevMonth = useCallback(() => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  }, [calMonth]);

  const handleStatusChange = (apptId: string, status: AppointmentStatus) => {
    const labels: Record<string, string> = {
      Completed: 'Mark as Completed',
      Canceled: 'Cancel Appointment',
      NoShow: 'Mark as No-Show',
    };
    Alert.alert(labels[status] ?? status, 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => updateAppointmentStatus(apptId, status) },
    ]);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const getServiceName = (id: string) => services.find((s) => s.id === id)?.name ?? 'Service';
  const getCustomerName = (id: string) => users.find((u) => u.id === id)?.name ?? 'Customer';

  const formatSelectedDate = useMemo(() => {
    if (!selectedDate) return '';
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[dt.getDay()]}, ${months[dt.getMonth()]} ${dt.getDate()}`;
  }, [selectedDate]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey,</Text>
          <Text style={styles.name}>{user?.name ?? 'Barber'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{upcomingCount}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.calHeader}>
          <TouchableOpacity onPress={goPrevMonth} style={styles.calNav}>
            <ChevronLeft size={18} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.calTitle}>{MONTH_NAMES[calMonth]} {calYear}</Text>
          <TouchableOpacity onPress={goNextMonth} style={styles.calNav}>
            <ChevronRight size={18} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekdayRow}>
          {WEEKDAY_HEADERS.map((d, i) => (
            <View key={i} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{d}</Text>
            </View>
          ))}
        </View>

        <View style={styles.calGrid}>
          {calendarDays.map((day, i) => {
            if (!day) return <View key={`empty-${i}`} style={styles.calCell} />;
            const dateStr = toDateStr(day);
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === todayStr;
            const hasAppts = (appointmentsByDate[dateStr] || 0) > 0;

            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.calCell,
                  isToday && styles.calCellToday,
                  isSelected && styles.calCellSelected,
                ]}
                onPress={() => setSelectedDate(dateStr)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.calCellText,
                  isToday && styles.calCellTextToday,
                  isSelected && styles.calCellTextSelected,
                ]}>
                  {day.getDate()}
                </Text>
                {hasAppts && !isSelected && <View style={styles.apptDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Text style={styles.sectionTitle}>{formatSelectedDate}</Text>

      {selectedAppts.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No appointments this day</Text>
        </View>
      )}

      {selectedAppts.map((appt) => {
        const isBooked = appt.status === 'Booked';
        const apptDate = new Date(appt.dateTime);
        const timeStr = `${apptDate.getHours().toString().padStart(2, '0')}:${apptDate.getMinutes().toString().padStart(2, '0')}`;

        return (
          <View key={appt.id} style={styles.apptCard}>
            <View style={styles.apptTop}>
              <View style={styles.apptTimeBlock}>
                <Text style={styles.apptTimeText}>{formatTime(timeStr)}</Text>
              </View>
              <View style={styles.apptDetails}>
                <Text style={styles.apptService}>{getServiceName(appt.serviceId)}</Text>
                <Text style={styles.apptCustomer}>{getCustomerName(appt.customerId)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColors[appt.status] + '20' }]}>
                <Text style={[styles.statusText, { color: statusColors[appt.status] }]}>{appt.status}</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: Colors.textSecondary },
  name: { fontSize: 24, fontWeight: '700' as const, color: Colors.text, marginTop: 2 },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statValue: { fontSize: 28, fontWeight: '800' as const, color: Colors.text },
  statLabel: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  calendarCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calNav: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  weekdayRow: { flexDirection: 'row', marginBottom: 4 },
  weekdayCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  weekdayText: { fontSize: 11, fontWeight: '600' as const, color: Colors.textMuted },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: {
    width: '14.28%' as unknown as number,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calCellToday: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  calCellSelected: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
  },
  calCellText: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
  calCellTextToday: { color: Colors.accent },
  calCellTextSelected: { color: Colors.black },
  apptDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.statusBooked,
    position: 'absolute' as const,
    bottom: 5,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
  apptCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  apptTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  apptTimeBlock: {
    backgroundColor: 'rgba(200,149,108,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  apptTimeText: { fontSize: 13, fontWeight: '700' as const, color: Colors.accent },
  apptDetails: { flex: 1 },
  apptService: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  apptCustomer: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: '700' as const },
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
});
