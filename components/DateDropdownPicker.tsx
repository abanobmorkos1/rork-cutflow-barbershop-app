import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, ScrollView,
} from 'react-native';
import { ChevronDown, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface DateDropdownPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DateDropdownPicker({ value, onChange, label }: DateDropdownPickerProps) {
  const [showModal, setShowModal] = useState(false);

  const parsed = useMemo(() => {
    if (!value) {
      const now = new Date();
      return { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() };
    }
    const [y, m, d] = value.split('-').map(Number);
    return { day: d || 1, month: m || 1, year: y || new Date().getFullYear() };
  }, [value]);

  const [selectedDay, setSelectedDay] = useState(parsed.day);
  const [selectedMonth, setSelectedMonth] = useState(parsed.month);
  const [selectedYear, setSelectedYear] = useState(parsed.year);

  const handleOpen = useCallback(() => {
    setSelectedDay(parsed.day);
    setSelectedMonth(parsed.month);
    setSelectedYear(parsed.year);
    setShowModal(true);
  }, [parsed]);

  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear + i);
  }, []);

  const handleConfirm = useCallback(() => {
    const day = Math.min(selectedDay, daysInMonth);
    const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    onChange(dateStr);
    setShowModal(false);
  }, [selectedDay, selectedMonth, selectedYear, daysInMonth, onChange]);

  const displayValue = useMemo(() => {
    if (!value) return 'Select date';
    return `${parsed.day.toString().padStart(2, '0')}-${parsed.month.toString().padStart(2, '0')}-${parsed.year}`;
  }, [value, parsed]);

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={handleOpen} activeOpacity={0.7}>
        <Calendar size={16} color={Colors.textMuted} />
        <Text style={[styles.triggerText, !value && styles.triggerPlaceholder]}>
          {displayValue}
        </Text>
        <ChevronDown size={16} color={Colors.textMuted} />
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowModal(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{label || 'Select Date'}</Text>

            <View style={styles.previewRow}>
              <Text style={styles.previewText}>
                {Math.min(selectedDay, daysInMonth).toString().padStart(2, '0')}-{selectedMonth.toString().padStart(2, '0')}-{selectedYear}
              </Text>
            </View>

            <View style={styles.columnsRow}>
              <View style={styles.column}>
                <Text style={styles.columnLabel}>DAY</Text>
                <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                  {days.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.option, selectedDay === d && styles.optionSelected]}
                      onPress={() => setSelectedDay(d)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionText, selectedDay === d && styles.optionTextSelected]}>
                        {d.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.column}>
                <Text style={styles.columnLabel}>MONTH</Text>
                <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                  {MONTH_LABELS.map((m, i) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.option, selectedMonth === i + 1 && styles.optionSelected]}
                      onPress={() => setSelectedMonth(i + 1)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionText, selectedMonth === i + 1 && styles.optionTextSelected]}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.column}>
                <Text style={styles.columnLabel}>YEAR</Text>
                <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                  {years.map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[styles.option, selectedYear === y && styles.optionSelected]}
                      onPress={() => setSelectedYear(y)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionText, selectedYear === y && styles.optionTextSelected]}>
                        {y.toString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  triggerText: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  triggerPlaceholder: {
    color: Colors.textMuted,
    fontWeight: '400' as const,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  previewRow: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.accent,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.accent,
    letterSpacing: 1,
  },
  columnsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  columnLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  columnScroll: {
    maxHeight: 200,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: 'rgba(200,149,108,0.15)',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  optionTextSelected: {
    color: Colors.accent,
    fontWeight: '700' as const,
  },
  confirmBtn: {
    backgroundColor: Colors.accent,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.black,
  },
});
