import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarDays, Users, Scissors, TrendingUp, LogOut, DollarSign, CalendarPlus, X, Clock, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

export default function OwnerDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { barbers, services, appointments } = useData();
  const [showServicePicker, setShowServicePicker] = useState(false);

  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const todayAppts = appointments.filter((a) => a.dateTime.startsWith(todayStr) && a.status === 'Booked');
    const completedToday = appointments.filter((a) => a.dateTime.startsWith(todayStr) && a.status === 'Completed');
    const totalRevenue = completedToday.reduce((sum, a) => {
      const svc = services.find((s) => s.id === a.serviceId);
      return sum + (svc?.price ?? 0);
    }, 0);

    return {
      todayCount: todayAppts.length,
      completedCount: completedToday.length,
      totalBarbers: barbers.length,
      totalServices: services.length,
      totalAppointments: appointments.length,
      todayRevenue: totalRevenue,
    };
  }, [appointments, barbers, services]);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day,</Text>
          <Text style={styles.name}>{user?.name ?? 'Owner'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardLarge]}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(33,150,243,0.12)' }]}>
            <CalendarDays size={22} color={Colors.statusBooked} />
          </View>
          <Text style={styles.statValue}>{stats.todayCount}</Text>
          <Text style={styles.statLabel}>Today's Bookings</Text>
        </View>
        <View style={[styles.statCard, styles.statCardLarge]}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(76,175,80,0.12)' }]}>
            <DollarSign size={22} color={Colors.success} />
          </View>
          <Text style={styles.statValue}>${stats.todayRevenue}</Text>
          <Text style={styles.statLabel}>Today's Revenue</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(200,149,108,0.12)' }]}>
            <Users size={18} color={Colors.accent} />
          </View>
          <Text style={styles.statValue}>{stats.totalBarbers}</Text>
          <Text style={styles.statLabel}>Barbers</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(200,149,108,0.12)' }]}>
            <Scissors size={18} color={Colors.accent} />
          </View>
          <Text style={styles.statValue}>{stats.totalServices}</Text>
          <Text style={styles.statLabel}>Services</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(200,149,108,0.12)' }]}>
            <TrendingUp size={18} color={Colors.accent} />
          </View>
          <Text style={styles.statValue}>{stats.totalAppointments}</Text>
          <Text style={styles.statLabel}>Total Appts</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/owner/barbers' as any)}
          activeOpacity={0.7}
        >
          <Users size={24} color={Colors.accent} />
          <Text style={styles.actionText}>Manage Barbers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/owner/services' as any)}
          activeOpacity={0.7}
        >
          <Scissors size={24} color={Colors.accent} />
          <Text style={styles.actionText}>Manage Services</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/owner/appointments' as any)}
          activeOpacity={0.7}
        >
          <CalendarDays size={24} color={Colors.accent} />
          <Text style={styles.actionText}>All Appointments</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setShowServicePicker(true)}
          activeOpacity={0.7}
        >
          <CalendarPlus size={24} color={Colors.accent} />
          <Text style={styles.actionText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={showServicePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowServicePicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowServicePicker(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Service</Text>
              <TouchableOpacity onPress={() => setShowServicePicker(false)} style={styles.modalClose}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {services.map((svc) => (
                <TouchableOpacity
                  key={svc.id}
                  style={styles.modalServiceCard}
                  activeOpacity={0.7}
                  onPress={() => {
                    setShowServicePicker(false);
                    router.push(`/booking/choose-barber?serviceId=${svc.id}` as any);
                  }}
                >
                  <View style={styles.modalServiceIcon}>
                    <Scissors size={18} color={Colors.accent} />
                  </View>
                  <View style={styles.modalServiceInfo}>
                    <Text style={styles.modalServiceName}>{svc.name}</Text>
                    <View style={styles.modalServiceMeta}>
                      <Clock size={12} color={Colors.textMuted} />
                      <Text style={styles.modalServiceMetaText}>{svc.duration} min</Text>
                      <DollarSign size={12} color={Colors.success} />
                      <Text style={[styles.modalServiceMetaText, { color: Colors.success }]}>${svc.price}</Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
              {services.length === 0 && (
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>No services available. Add services first.</Text>
                </View>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
    marginBottom: 24,
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
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statCardLarge: {
    padding: 20,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 12,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%' as unknown as number,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%' as unknown as number,
    paddingBottom: 32,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center' as const,
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.card,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  modalList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalServiceCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalServiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(200,149,108,0.1)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  modalServiceInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  modalServiceName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  modalServiceMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    marginTop: 6,
  },
  modalServiceMetaText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    marginRight: 8,
  },
  modalEmpty: {
    alignItems: 'center' as const,
    paddingVertical: 32,
  },
  modalEmptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
});
