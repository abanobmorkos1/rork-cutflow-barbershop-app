import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { Clock, Save, ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { WeeklyAvailability, DaySlot, DateOverrides } from '@/types';
import { getCalendarDays, MONTH_NAMES, WEEKDAY_HEADERS, toDateStr, getBarberSlotsForDate } from '@/utils/slots';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

type ViewMode = 'weekly' | 'calendar';

export default function AvailabilityScreen() {
  const { user } = useAuth();
  const { getBarberByUserId, updateBarberAvailability, updateBarberDateOverrides } = useData();

  const barber = useMemo(() => {
    if (!user) return null;
    return getBarberByUserId(user.id);
  }, [user, getBarberByUserId]);

  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [availability, setAvailability] = useState<WeeklyAvailability>(barber?.availability ?? {});
  const [dateOverrides, setDateOverrides] = useState<DateOverrides>(barber?.dateOverrides ?? {});
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [overrideStart, setOverrideStart] = useState('');
  const [overrideEnd, setOverrideEnd] = useState('');

  const calendarDays = useMemo(() => getCalendarDays(calYear, calMonth), [calYear, calMonth]);

  const today = useMemo(() => toDateStr(new Date()), []);

  const goNextMonth = useCallback(() => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  }, [calMonth]);

  const goPrevMonth = useCallback(() => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  }, [calMonth]);

  const getDateStatus = useCallback((date: Date): 'available' | 'off' | 'override' => {
    if (!barber) return 'off';
    const dateStr = toDateStr(date);
    if (dateOverrides[dateStr]) {
      return dateOverrides[dateStr].length > 0 ? 'override' : 'off';
    }
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
    const slots = availability[dayName] || [];
    return slots.length > 0 ? 'available' : 'off';
  }, [barber, availability, dateOverrides]);

  const handleDatePress = useCallback((date: Date) => {
    const dateStr = toDateStr(date);
    setSelectedDate(dateStr);
    const existingOverride = dateOverrides[dateStr];
    if (existingOverride && existingOverride.length > 0) {
      setOverrideStart(existingOverride[0].start);
      setOverrideEnd(existingOverride[0].end);
    } else {
      const slots = barber ? getBarberSlotsForDate(date, barber) : [];
      if (slots.length > 0) {
        setOverrideStart(slots[0].start);
        setOverrideEnd(slots[0].end);
      } else {
        setOverrideStart('09:00');
        setOverrideEnd('17:00');
      }
    }
  }, [dateOverrides, barber]);

  const handleSetOverride = useCallback(() => {
    if (!selectedDate) return;
    if (!overrideStart || !overrideEnd) {
      Alert.alert('Error', 'Please enter start and end times');
      return;
    }
    setDateOverrides((prev) => ({
      ...prev,
      [selectedDate]: [{ start: overrideStart, end: overrideEnd }],
    }));
    setSelectedDate(null);
  }, [selectedDate, overrideStart, overrideEnd]);

  const handleSetDayOff = useCallback(() => {
    if (!selectedDate) return;
    setDateOverrides((prev) => ({
      ...prev,
      [selectedDate]: [],
    }));
    setSelectedDate(null);
  }, [selectedDate]);

  const handleRemoveOverride = useCallback(() => {
    if (!selectedDate) return;
    setDateOverrides((prev) => {
      const next = { ...prev };
      delete next[selectedDate];
      return next;
    });
    setSelectedDate(null);
  }, [selectedDate]);

  const toggleDay = (day: string) => {
    setAvailability((prev) => {
      const current = prev[day] ?? [];
      if (current.length > 0) return { ...prev, [day]: [] };
      return { ...prev, [day]: [{ start: '09:00', end: '17:00' }] };
    });
  };

  const updateSlot = (day: string, field: 'start' | 'end', value: string) => {
    setAvailability((prev) => {
      const current = prev[day] ?? [];
      if (current.length === 0) return prev;
      const updated: DaySlot[] = [{ ...current[0], [field]: value }];
      return { ...prev, [day]: updated };
    });
  };

  const handleSave = async () => {
    if (!barber) return;
    setSaving(true);
    try {
      await updateBarberAvailability(barber.id, availability);
      await updateBarberDateOverrides(barber.id, dateOverrides);
      Alert.alert('Saved', 'Your availability has been updated');
    } catch {
      Alert.alert('Error', 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  if (!barber) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Barber profile not found</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeBtn, viewMode === 'calendar' && styles.modeBtnActive]}
          onPress={() => setViewMode('calendar')}
        >
          <CalendarDays size={16} color={viewMode === 'calendar' ? Colors.black : Colors.textSecondary} />
          <Text style={[styles.modeBtnText, viewMode === 'calendar' && styles.modeBtnTextActive]}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, viewMode === 'weekly' && styles.modeBtnActive]}
          onPress={() => setViewMode('weekly')}
        >
          <Clock size={16} color={viewMode === 'weekly' ? Colors.black : Colors.textSecondary} />
          <Text style={[styles.modeBtnText, viewMode === 'weekly' && styles.modeBtnTextActive]}>Weekly</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'calendar' && (
        <>
          <View style={styles.calHeader}>
            <TouchableOpacity onPress={goPrevMonth} style={styles.calNav}>
              <ChevronLeft size={20} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.calTitle}>{MONTH_NAMES[calMonth]} {calYear}</Text>
            <TouchableOpacity onPress={goNextMonth} style={styles.calNav}>
              <ChevronRight size={20} color={Colors.text} />
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
              const isPast = dateStr < today;
              const isSelected = selectedDate === dateStr;
              const status = getDateStatus(day);
              const isOverride = dateOverrides[dateStr] !== undefined;

              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[
                    styles.calCell,
                    status === 'available' && styles.calCellAvailable,
                    status === 'override' && styles.calCellOverride,
                    status === 'off' && styles.calCellOff,
                    isSelected && styles.calCellSelected,
                    isPast && styles.calCellPast,
                  ]}
                  onPress={() => !isPast && handleDatePress(day)}
                  disabled={isPast}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.calCellText,
                    status === 'available' && styles.calCellTextAvailable,
                    status === 'override' && styles.calCellTextOverride,
                    isSelected && styles.calCellTextSelected,
                    isPast && styles.calCellTextPast,
                  ]}>
                    {day.getDate()}
                  </Text>
                  {isOverride && <View style={styles.overrideDot} />}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: 'rgba(76,175,80,0.3)' }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: 'rgba(33,150,243,0.3)' }]} />
              <Text style={styles.legendText}>Custom</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.surface }]} />
              <Text style={styles.legendText}>Off</Text>
            </View>
          </View>

          {selectedDate && (
            <View style={styles.overrideCard}>
              <View style={styles.overrideHeader}>
                <Text style={styles.overrideTitle}>
                  {selectedDate}
                </Text>
                <TouchableOpacity onPress={() => setSelectedDate(null)}>
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {dateOverrides[selectedDate] !== undefined && (
                <TouchableOpacity style={styles.removeOverrideBtn} onPress={handleRemoveOverride}>
                  <Text style={styles.removeOverrideText}>Remove custom override</Text>
                </TouchableOpacity>
              )}

              <View style={styles.overrideTimeRow}>
                <View style={styles.overrideTimeInput}>
                  <Clock size={14} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.timeField}
                    value={overrideStart}
                    onChangeText={setOverrideStart}
                    placeholder="09:00"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
                <Text style={styles.timeSep}>to</Text>
                <View style={styles.overrideTimeInput}>
                  <Clock size={14} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.timeField}
                    value={overrideEnd}
                    onChangeText={setOverrideEnd}
                    placeholder="17:00"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              </View>

              <View style={styles.overrideActions}>
                <TouchableOpacity style={styles.dayOffBtn} onPress={handleSetDayOff}>
                  <Text style={styles.dayOffBtnText}>Set Day Off</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.setHoursBtn} onPress={handleSetOverride}>
                  <Text style={styles.setHoursBtnText}>Set Hours</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}

      {viewMode === 'weekly' && (
        <>
          <Text style={styles.weeklyTitle}>Default Weekly Hours</Text>
          <Text style={styles.weeklySubtitle}>These repeat every week unless overridden</Text>

          {DAYS.map((day) => {
            const slots = availability[day] ?? [];
            const isActive = slots.length > 0;
            const slot = slots[0];

            return (
              <View key={day} style={styles.dayCard}>
                <TouchableOpacity
                  style={styles.dayHeader}
                  onPress={() => toggleDay(day)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.dayToggle, isActive && styles.dayToggleActive]}>
                    <View style={[styles.dayToggleInner, isActive && styles.dayToggleInnerActive]} />
                  </View>
                  <Text style={[styles.dayName, isActive && styles.dayNameActive]}>
                    {DAY_LABELS[day]}
                  </Text>
                  {!isActive && <Text style={styles.offLabel}>OFF</Text>}
                </TouchableOpacity>

                {isActive && slot && (
                  <View style={styles.timeRow}>
                    <View style={styles.timeInput}>
                      <Clock size={14} color={Colors.textSecondary} />
                      <TextInput
                        style={styles.timeField}
                        value={slot.start}
                        onChangeText={(v) => updateSlot(day, 'start', v)}
                        placeholder="09:00"
                        placeholderTextColor={Colors.textMuted}
                      />
                    </View>
                    <Text style={styles.timeSep}>to</Text>
                    <View style={styles.timeInput}>
                      <Clock size={14} color={Colors.textSecondary} />
                      <TextInput
                        style={styles.timeField}
                        value={slot.end}
                        onChangeText={(v) => updateSlot(day, 'end', v)}
                        placeholder="17:00"
                        placeholderTextColor={Colors.textMuted}
                      />
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </>
      )}

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.8}
      >
        <Save size={18} color={Colors.black} />
        <Text style={styles.saveBtnText}>
          {saving ? 'Saving...' : 'Save Availability'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  modeBtnActive: {
    backgroundColor: Colors.accent,
  },
  modeBtnText: { fontSize: 14, fontWeight: '600' as const, color: Colors.textSecondary },
  modeBtnTextActive: { color: Colors.black },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calNav: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  weekdayText: { fontSize: 12, fontWeight: '600' as const, color: Colors.textMuted },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  calCell: {
    width: '14.28%' as unknown as number,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  calCellAvailable: {
    backgroundColor: 'rgba(76,175,80,0.12)',
    borderRadius: 10,
  },
  calCellOverride: {
    backgroundColor: 'rgba(33,150,243,0.12)',
    borderRadius: 10,
  },
  calCellOff: {
    backgroundColor: 'transparent',
  },
  calCellSelected: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
  },
  calCellPast: {
    opacity: 0.3,
  },
  calCellText: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  calCellTextAvailable: { color: Colors.success },
  calCellTextOverride: { color: Colors.info },
  calCellTextSelected: { color: Colors.black },
  calCellTextPast: { color: Colors.textMuted },
  overrideDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.info,
    position: 'absolute' as const,
    bottom: 6,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: { fontSize: 12, color: Colors.textSecondary },
  overrideCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overrideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  overrideTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  removeOverrideBtn: {
    backgroundColor: 'rgba(229,57,53,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
    marginBottom: 12,
  },
  removeOverrideText: { fontSize: 13, fontWeight: '600' as const, color: Colors.error },
  overrideTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  overrideTimeInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  overrideActions: {
    flexDirection: 'row',
    gap: 10,
  },
  dayOffBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOffBtnText: { fontSize: 14, fontWeight: '600' as const, color: Colors.error },
  setHoursBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setHoursBtnText: { fontSize: 14, fontWeight: '700' as const, color: Colors.black },
  weeklyTitle: { fontSize: 20, fontWeight: '700' as const, color: Colors.text, marginBottom: 4 },
  weeklySubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 20 },
  dayCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  dayToggleActive: {
    backgroundColor: 'rgba(200,149,108,0.2)',
    borderColor: Colors.accent,
  },
  dayToggleInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.textMuted,
  },
  dayToggleInnerActive: {
    backgroundColor: Colors.accent,
    alignSelf: 'flex-end' as const,
  },
  dayName: { flex: 1, fontSize: 16, fontWeight: '600' as const, color: Colors.textMuted },
  dayNameActive: { color: Colors.text },
  offLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
  },
  timeInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  timeField: { flex: 1, color: Colors.text, fontSize: 15 },
  timeSep: { fontSize: 13, color: Colors.textMuted },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    height: 54,
    borderRadius: 14,
    gap: 8,
    marginTop: 16,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.black },
});
