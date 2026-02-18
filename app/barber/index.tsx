import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated,
  Share, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  LogOut, CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight,
  Share2, Instagram, Flame, Star,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppointmentStatus } from '@/types';
import { formatTime, getCalendarDays, MONTH_NAMES, WEEKDAY_HEADERS, toDateStr } from '@/utils/slots';

const statusColors: Record<AppointmentStatus, string> = {
  Booked: Colors.statusBooked,
  Completed: Colors.statusCompleted,
  Canceled: Colors.statusCanceled,
  NoShow: Colors.statusNoShow,
};

export default function BarberScheduleScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { getBarberByUserId, getBarberAppointments, getShopServices, updateAppointmentStatus } = useData();
  const { users } = useAuth();

  const barber = useMemo(() => {
    if (!user) return null;
    return getBarberByUserId(user.id);
  }, [user, getBarberByUserId]);

  const services = useMemo(() => {
    if (!barber) return [];
    return getShopServices(barber.shopId);
  }, [barber, getShopServices]);

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

  const weekRevenue = useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    return allAppointments
      .filter((a) => {
        if (a.status !== 'Completed') return false;
        const d = new Date(a.dateTime);
        return d >= weekStart && d <= today;
      })
      .reduce((sum, a) => {
        const svc = services.find((s) => s.id === a.serviceId);
        return sum + (svc?.price ?? 0);
      }, 0);
  }, [allAppointments, services]);

  const streakDays = useMemo(() => {
    const datesWithAppts = Object.keys(appointmentsByDate).sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const ds = toDateStr(d);
      if (datesWithAppts.includes(ds)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, [appointmentsByDate]);

  const clientVisitCount = useCallback((customerId: string) => {
    return allAppointments.filter(
      (a) => a.customerId === customerId && a.status === 'Completed'
    ).length;
  }, [allAppointments]);

  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

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

  const handleShare = async () => {
    const name = barber?.name ?? user?.name ?? 'Your Barber';
    const instagram = barber?.instagram ? `@${barber.instagram}` : '';
    const message = [
      `✂️ Book with ${name} on CUTFLOW`,
      instagram ? `Instagram: ${instagram}` : '',
      `📅 ${upcomingCount} upcoming appointments`,
      `🔥 ${streakDays} day streak this week`,
      `💰 $${weekRevenue} earned this week`,
      '',
      'Download CUTFLOW to book your next cut!',
    ].filter(Boolean).join('\n');

    try {
      await Share.share({ message, title: `Book with ${name}` });
    } catch {
    }
  };

  const handleInstagram = () => {
    const handle = barber?.instagram?.replace('@', '') ?? '';
    if (!handle) {
      Alert.alert('No Instagram', 'Add your Instagram handle in your profile to link here.');
      return;
    }
    Alert.alert(
      'Share to Instagram',
      `Open Instagram as @${handle} and share your stats or availability with your followers!`,
      [{ text: 'Got it' }]
    );
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
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{user?.name ?? 'Barber'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleInstagram}>
            <Instagram size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <Share2 size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
            <LogOut size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{upcomingCount}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={[styles.statCard, styles.statCardRevenue]}>
          <Text style={[styles.statValue, styles.statValueGreen]}>${weekRevenue}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        {streakDays > 0 && (
          <View style={[styles.statCard, styles.statCardStreak]}>
            <View style={styles.streakRow}>
              <Flame size={16} color="#FF6B35" />
              <Text style={[styles.statValue, { color: '#FF6B35' }]}>{streakDays}</Text>
            </View>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        )}
      </ScrollView>

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

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>{formatSelectedDate}</Text>
        {selectedAppts.length > 0 && (
          <Text style={styles.sectionCount}>{selectedAppts.length} appt{selectedAppts.length !== 1 ? 's' : ''}</Text>
        )}
      </View>

      {selectedAppts.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>📅</Text>
          <Text style={styles.emptyTitle}>All clear</Text>
          <Text style={styles.emptyText}>No appointments scheduled for this day</Text>
        </View>
      )}

      {selectedAppts.map((appt) => {
        const isBooked = appt.status === 'Booked';
        const apptDate = new Date(appt.dateTime);
        const timeStr = `${apptDate.getHours().toString().padStart(2, '0')}:${apptDate.getMinutes().toString().padStart(2, '0')}`;
        const visitCount = clientVisitCount(appt.customerId);
        const isNewClient = visitCount === 0;
        const isRegular = visitCount >= 5;

        return (
          <View key={appt.id} style={styles.apptCard}>
            <View style={styles.apptTop}>
              <View style={styles.apptTimeBlock}>
                <Text style={styles.apptTimeText}>{formatTime(timeStr)}</Text>
              </View>
              <View style={styles.apptDetails}>
                <View style={styles.apptNameRow}>
                  <Text style={styles.apptService}>{getServiceName(appt.serviceId)}</Text>
                  {isNewClient && (
                    <View style={styles.newClientBadge}>
                      <Star size={9} color={Colors.accent} />
                      <Text style={styles.newClientText}>New</Text>
                    </View>
                  )}
                  {isRegular && (
                    <View style={styles.regularBadge}>
                      <Flame size={9} color="#FF6B35" />
                      <Text style={styles.regularText}>Regular</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.apptCustomer}>
                  {getCustomerName(appt.customerId)}
                  {visitCount > 0 && (
                    <Text style={styles.visitCount}> · {visitCount} visit{visitCount !== 1 ? 's' : ''}</Text>
                  )}
                </Text>
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
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsScroll: { flexGrow: 0, marginBottom: 20 },
  statCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  statCardRevenue: {
    borderColor: 'rgba(76,175,80,0.25)',
    backgroundColor: 'rgba(76,175,80,0.06)',
  },
  statCardStreak: {
    borderColor: 'rgba(255,107,53,0.25)',
    backgroundColor: 'rgba(255,107,53,0.06)',
  },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 24, fontWeight: '800' as const, color: Colors.text },
  statValueGreen: { color: Colors.success },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' as const },
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
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
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
  calCellToday: { borderRadius: 10, borderWidth: 1, borderColor: Colors.accent },
  calCellSelected: { backgroundColor: Colors.accent, borderRadius: 10 },
  calCellText: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
  calCellTextToday: { color: Colors.accent },
  calCellTextSelected: { color: Colors.black },
  apptDot: {
    width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.statusBooked,
    position: 'absolute' as const, bottom: 5,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700' as const, color: Colors.text },
  sectionCount: {
    fontSize: 13, fontWeight: '600' as const, color: Colors.accent,
    backgroundColor: 'rgba(200,149,108,0.1)',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8,
  },
  emptyCard: {
    backgroundColor: Colors.card, borderRadius: 14, padding: 32,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border, gap: 6,
  },
  emptyEmoji: { fontSize: 28, marginBottom: 4 },
  emptyTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  emptyText: { fontSize: 13, color: Colors.textSecondary },
  apptCard: {
    backgroundColor: Colors.card, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  apptTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  apptTimeBlock: {
    backgroundColor: 'rgba(200,149,108,0.1)', paddingHorizontal: 10,
    paddingVertical: 8, borderRadius: 10,
  },
  apptTimeText: { fontSize: 13, fontWeight: '700' as const, color: Colors.accent },
  apptDetails: { flex: 1 },
  apptNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  apptService: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  newClientBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(200,149,108,0.15)',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  newClientText: { fontSize: 9, fontWeight: '800' as const, color: Colors.accent },
  regularBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,107,53,0.12)',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  regularText: { fontSize: 9, fontWeight: '800' as const, color: '#FF6B35' },
  apptCustomer: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
  visitCount: { fontSize: 12, color: Colors.textMuted },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' as const },
  actionRow: {
    flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, borderRadius: 10, gap: 4,
  },
  actionBtnText: { fontSize: 12, fontWeight: '600' as const },
});
