import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarDays, Users, Scissors, TrendingUp, LogOut, DollarSign, Store, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

export default function OwnerDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { getShopByOwnerId, getShopBarbers, getShopServices, getShopAppointments } = useData();

  const shop = useMemo(() => {
    if (!user) return null;
    return getShopByOwnerId(user.id);
  }, [user, getShopByOwnerId]);

  const barbers = useMemo(() => (shop ? getShopBarbers(shop.id) : []), [shop, getShopBarbers]);
  const services = useMemo(() => (shop ? getShopServices(shop.id) : []), [shop, getShopServices]);
  const appointments = useMemo(() => (shop ? getShopAppointments(shop.id) : []), [shop, getShopAppointments]);

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
          {shop && (
            <View style={styles.shopBadge}>
              <Store size={12} color={Colors.accent} />
              <Text style={styles.shopBadgeText}>{shop.name}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <TouchableOpacity
          style={[styles.statCard, styles.statCardLarge]}
          onPress={() => router.push('/owner/appointments' as any)}
          activeOpacity={0.7}
        >
          <View style={styles.statCardInner}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(33,150,243,0.12)' }]}>
              <CalendarDays size={22} color={Colors.statusBooked} />
            </View>
            <View style={styles.statTextGroup}>
              <Text style={styles.statValue}>{stats.todayCount}</Text>
              <Text style={styles.statLabel}>Today's Bookings</Text>
            </View>
          </View>
          <ChevronRight size={16} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, styles.statCardLarge]}
          onPress={() => router.push('/owner/appointments' as any)}
          activeOpacity={0.7}
        >
          <View style={styles.statCardInner}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(76,175,80,0.12)' }]}>
              <DollarSign size={22} color={Colors.success} />
            </View>
            <View style={styles.statTextGroup}>
              <Text style={styles.statValue}>${stats.todayRevenue}</Text>
              <Text style={styles.statLabel}>Today's Revenue</Text>
            </View>
          </View>
          <ChevronRight size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => router.push('/owner/barbers' as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.statIconSm, { backgroundColor: 'rgba(200,149,108,0.12)' }]}>
            <Users size={16} color={Colors.accent} />
          </View>
          <Text style={styles.statValueSm}>{stats.totalBarbers}</Text>
          <Text style={styles.statLabelSm}>Barbers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => router.push('/owner/services' as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.statIconSm, { backgroundColor: 'rgba(200,149,108,0.12)' }]}>
            <Scissors size={16} color={Colors.accent} />
          </View>
          <Text style={styles.statValueSm}>{stats.totalServices}</Text>
          <Text style={styles.statLabelSm}>Services</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => router.push('/owner/appointments' as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.statIconSm, { backgroundColor: 'rgba(200,149,108,0.12)' }]}>
            <TrendingUp size={16} color={Colors.accent} />
          </View>
          <Text style={styles.statValueSm}>{stats.totalAppointments}</Text>
          <Text style={styles.statLabelSm}>Total Appts</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/owner/barbers' as any)}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconWrap}>
            <Users size={22} color={Colors.accent} />
          </View>
          <Text style={styles.actionText}>Manage Barbers</Text>
          <Text style={styles.actionSub}>{stats.totalBarbers} on team</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/owner/services' as any)}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconWrap}>
            <Scissors size={22} color={Colors.accent} />
          </View>
          <Text style={styles.actionText}>Services</Text>
          <Text style={styles.actionSub}>{stats.totalServices} offered</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/owner/appointments' as any)}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconWrap}>
            <CalendarDays size={22} color={Colors.accent} />
          </View>
          <Text style={styles.actionText}>Appointments</Text>
          <Text style={styles.actionSub}>View all</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/owner/pricing' as any)}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconWrap}>
            <DollarSign size={22} color={Colors.accent} />
          </View>
          <Text style={styles.actionText}>My Prices</Text>
          <Text style={styles.actionSub}>Set your rates</Text>
        </TouchableOpacity>
      </View>
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
  shopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    backgroundColor: 'rgba(200,149,108,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  shopBadgeText: { fontSize: 12, fontWeight: '600' as const, color: Colors.accent },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  statCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextGroup: {},
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statIconSm: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValueSm: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 3,
  },
  statLabelSm: { fontSize: 11, color: Colors.textSecondary },
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
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(200,149,108,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionText: { fontSize: 14, fontWeight: '700' as const, color: Colors.text, marginBottom: 3 },
  actionSub: { fontSize: 12, color: Colors.textMuted },
});
