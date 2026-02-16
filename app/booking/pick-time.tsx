import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useData } from '@/contexts/DataContext';
import { getAvailableSlots, formatTime, getCalendarDays, MONTH_NAMES, WEEKDAY_HEADERS, toDateStr } from '@/utils/slots';

export default function PickTimeScreen() {
  const router = useRouter();
  const { serviceId, barberId, shopId } = useLocalSearchParams<{ serviceId: string; barberId: string; shopId: string }>();
  const { getBarberById, getServiceById, appointments, getShopById, getBarberPrice } = useData();

  const barber = barberId ? getBarberById(barberId) : null;
  const service = serviceId ? getServiceById(serviceId) : null;
  const shop = shopId ? getShopById(shopId) : null;
  const shopHours = shop?.hours ?? {};

  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(now);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const todayStr = useMemo(() => toDateStr(new Date()), []);
  const calendarDays = useMemo(() => getCalendarDays(calYear, calMonth), [calYear, calMonth]);

  const price = useMemo(() => {
    if (!barberId || !serviceId) return 0;
    return getBarberPrice(barberId, serviceId);
  }, [barberId, serviceId, getBarberPrice]);

  const slots = useMemo(() => {
    if (!barber || !service) return [];
    return getAvailableSlots(selectedDate, barber, shopHours, appointments, service.duration);
  }, [selectedDate, barber, service, shopHours, appointments]);

  const goNextMonth = useCallback(() => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  }, [calMonth]);

  const goPrevMonth = useCallback(() => {
    const minMonth = now.getMonth();
    const minYear = now.getFullYear();
    if (calYear === minYear && calMonth <= minMonth) return;
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  }, [calMonth, calYear, now]);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  }, []);

  const handleContinue = () => {
    if (!selectedTime) return;
    const dateStr = toDateStr(selectedDate);
    router.push(
      `/booking/confirm?serviceId=${serviceId}&barberId=${barberId}&date=${dateStr}&time=${selectedTime}&shopId=${shopId}` as any
    );
  };

  const selectedDateStr = useMemo(() => toDateStr(selectedDate), [selectedDate]);

  const formatSelectedLabel = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[selectedDate.getDay()]}, ${months[selectedDate.getMonth()]} ${selectedDate.getDate()}`;
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Pick Date & Time',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {barber && service && (
          <View style={styles.infoBar}>
            <Text style={styles.infoText}>
              {service.name} with {barber.name}
            </Text>
            <Text style={styles.infoPrice}>${price}</Text>
          </View>
        )}

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
              const isPast = dateStr < todayStr;
              const isSelected = selectedDateStr === dateStr;
              const isToday = dateStr === todayStr;

              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[
                    styles.calCell,
                    isToday && !isSelected && styles.calCellToday,
                    isSelected && styles.calCellSelected,
                    isPast && styles.calCellPast,
                  ]}
                  onPress={() => !isPast && handleDateSelect(day)}
                  disabled={isPast}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.calCellText,
                    isToday && !isSelected && styles.calCellTextToday,
                    isSelected && styles.calCellTextSelected,
                    isPast && styles.calCellTextPast,
                  ]}>
                    {day.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionLabel}>{formatSelectedLabel}</Text>
        {slots.length === 0 ? (
          <View style={styles.noSlots}>
            <Clock size={28} color={Colors.textMuted} />
            <Text style={styles.noSlotsText}>No available slots</Text>
            <Text style={styles.noSlotsHint}>Try another date</Text>
          </View>
        ) : (
          <>
            <Text style={styles.slotCount}>{slots.length} slots available</Text>
            <View style={styles.slotsGrid}>
              {slots.map((slot) => {
                const active = selectedTime === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.slotChip, active && styles.slotChipActive]}
                    onPress={() => setSelectedTime(slot)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.slotText, active && styles.slotTextActive]}>
                      {formatTime(slot)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !selectedTime && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selectedTime}
          activeOpacity={0.8}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
          <ChevronRight size={20} color={Colors.black} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingTop: 12, paddingBottom: 120 },
  infoBar: {
    backgroundColor: 'rgba(200,149,108,0.08)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(200,149,108,0.15)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: { fontSize: 14, fontWeight: '600' as const, color: Colors.accent },
  infoPrice: { fontSize: 16, fontWeight: '800' as const, color: Colors.accent },
  calendarCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  calNav: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calTitle: { fontSize: 17, fontWeight: '700' as const, color: Colors.text },
  weekdayRow: { flexDirection: 'row', marginBottom: 6 },
  weekdayCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  weekdayText: { fontSize: 12, fontWeight: '600' as const, color: Colors.textMuted },
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
  calCellPast: { opacity: 0.25 },
  calCellText: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  calCellTextToday: { color: Colors.accent },
  calCellTextSelected: { color: Colors.black },
  calCellTextPast: { color: Colors.textMuted },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
    paddingHorizontal: 20,
  },
  slotCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  noSlots: {
    alignItems: 'center',
    paddingVertical: 36,
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  noSlotsText: { fontSize: 15, fontWeight: '600' as const, color: Colors.textSecondary },
  noSlotsHint: { fontSize: 13, color: Colors.textMuted },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  slotChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  slotChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  slotText: { fontSize: 14, fontWeight: '600' as const, color: Colors.textSecondary },
  slotTextActive: { color: Colors.black },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  continueBtn: {
    backgroundColor: Colors.accent,
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.black },
});
