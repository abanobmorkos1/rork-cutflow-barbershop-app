import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Check, CalendarDays, User, Scissors, Clock, DollarSign, Store } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Appointment } from '@/types';
import { formatTime } from '@/utils/slots';

export default function ConfirmBookingScreen() {
  const router = useRouter();
  const { serviceId, barberId, date, time, shopId } = useLocalSearchParams<{
    serviceId: string;
    barberId: string;
    date: string;
    time: string;
    shopId: string;
  }>();
  const { user } = useAuth();
  const { getBarberById, getServiceById, addAppointment, getBarberPrice, getShopById } = useData();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const checkScale = useRef(new Animated.Value(0)).current;

  const barber = barberId ? getBarberById(barberId) : null;
  const service = serviceId ? getServiceById(serviceId) : null;
  const shop = shopId ? getShopById(shopId) : null;

  const price = useMemo(() => {
    if (!barberId || !serviceId) return 0;
    return getBarberPrice(barberId, serviceId);
  }, [barberId, serviceId, getBarberPrice]);

  const formattedDate = date
    ? (() => {
        const [y, m, d] = date.split('-').map(Number);
        const dt = new Date(y, m - 1, d);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `${days[dt.getDay()]}, ${months[dt.getMonth()]} ${dt.getDate()}`;
      })()
    : '';

  const handleConfirm = async () => {
    if (!user || !barberId || !serviceId || !date || !time || !shopId) return;
    setLoading(true);
    try {
      const [y, m, d] = date.split('-').map(Number);
      const [h, min] = time.split(':').map(Number);
      const dateTime = new Date(y, m - 1, d, h, min, 0, 0);

      const appt: Appointment = {
        id: `appt-${Date.now()}`,
        shopId,
        barberId,
        customerId: user.id,
        serviceId,
        dateTime: dateTime.toISOString(),
        status: 'Booked',
        createdAt: new Date().toISOString(),
      };
      await addAppointment(appt);
      setConfirmed(true);
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }).start();
    } catch {
      Alert.alert('Error', 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.successContainer}>
          <Animated.View style={[styles.checkCircle, { transform: [{ scale: checkScale }] }]}>
            <Check size={40} color={Colors.black} strokeWidth={3} />
          </Animated.View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your appointment has been booked successfully
          </Text>

          <View style={styles.summaryCard}>
            {shop && <Text style={styles.summaryShop}>{shop.name}</Text>}
            <Text style={styles.summaryService}>{service?.name}</Text>
            <Text style={styles.summaryBarber}>with {barber?.name}</Text>
            <Text style={styles.summaryDateTime}>
              {formattedDate} at {time ? formatTime(time) : ''}
            </Text>
            <Text style={styles.summaryPrice}>${price}</Text>
          </View>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.replace((user?.role === 'owner' ? '/owner' : '/customer') as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Confirm Booking',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <View style={styles.content}>
        <Text style={styles.heading}>Review your booking</Text>

        <View style={styles.detailCard}>
          {shop && (
            <>
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Store size={18} color={Colors.accent} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Shop</Text>
                  <Text style={styles.detailValue}>{shop.name}</Text>
                </View>
              </View>
              <View style={styles.detailDivider} />
            </>
          )}

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Scissors size={18} color={Colors.accent} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Service</Text>
              <Text style={styles.detailValue}>{service?.name ?? 'Service'}</Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <User size={18} color={Colors.accent} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Barber</Text>
              <Text style={styles.detailValue}>{barber?.name ?? 'Barber'}</Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <CalendarDays size={18} color={Colors.accent} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Clock size={18} color={Colors.accent} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{time ? formatTime(time) : '—'}</Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <DollarSign size={18} color={Colors.success} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Price</Text>
              <Text style={[styles.detailValue, { color: Colors.accent }]}>
                ${price}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmBtnText}>
            {loading ? 'Booking...' : 'Confirm Booking'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  heading: { fontSize: 22, fontWeight: '700' as const, color: Colors.text, marginBottom: 24 },
  detailCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 4,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(200,149,108,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 12, color: Colors.textMuted },
  detailValue: { fontSize: 16, fontWeight: '600' as const, color: Colors.text, marginTop: 2 },
  detailDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 14, marginLeft: 54 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  confirmBtn: {
    backgroundColor: Colors.accent,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.black },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 32,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    marginBottom: 32,
  },
  summaryShop: { fontSize: 13, color: Colors.textMuted, marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: 1 },
  summaryService: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  summaryBarber: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  summaryDateTime: { fontSize: 15, color: Colors.accent, fontWeight: '600' as const, marginTop: 10 },
  summaryPrice: { fontSize: 20, fontWeight: '800' as const, color: Colors.accent, marginTop: 8 },
  doneBtn: {
    backgroundColor: Colors.accent,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  doneBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.black },
});
