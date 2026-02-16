import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { DollarSign, Save, Scissors } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { BarberPrices } from '@/types';

export default function BarberPricingScreen() {
  const { user } = useAuth();
  const { getBarberByUserId, services, updateBarberPrices } = useData();

  const barber = useMemo(() => {
    if (!user) return null;
    return getBarberByUserId(user.id);
  }, [user, getBarberByUserId]);

  const [prices, setPrices] = useState<BarberPrices>(barber?.prices ?? {});
  const [saving, setSaving] = useState(false);

  const handlePriceChange = useCallback((serviceId: string, value: string) => {
    const num = parseFloat(value);
    if (value === '') {
      setPrices((prev) => {
        const next = { ...prev };
        delete next[serviceId];
        return next;
      });
    } else if (!isNaN(num)) {
      setPrices((prev) => ({ ...prev, [serviceId]: num }));
    }
  }, []);

  const handleSave = async () => {
    if (!barber) return;
    setSaving(true);
    try {
      await updateBarberPrices(barber.id, prices);
      Alert.alert('Saved', 'Your prices have been updated');
    } catch {
      Alert.alert('Error', 'Failed to save prices');
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
      <Text style={styles.title}>My Prices</Text>
      <Text style={styles.subtitle}>
        Set your own price for each service. Leave blank to use the default shop price.
      </Text>

      {services.map((svc) => {
        const customPrice = prices[svc.id];
        const hasCustom = customPrice !== undefined;

        return (
          <View key={svc.id} style={styles.serviceCard}>
            <View style={styles.serviceTop}>
              <View style={styles.serviceIcon}>
                <Scissors size={18} color={Colors.accent} />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{svc.name}</Text>
                <Text style={styles.serviceDuration}>{svc.duration} min</Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <View style={styles.defaultPrice}>
                <Text style={styles.defaultLabel}>Shop price</Text>
                <Text style={styles.defaultValue}>${svc.price}</Text>
              </View>

              <View style={styles.customPriceWrap}>
                <Text style={styles.customLabel}>Your price</Text>
                <View style={[styles.priceInput, hasCustom && styles.priceInputActive]}>
                  <DollarSign size={16} color={hasCustom ? Colors.accent : Colors.textMuted} />
                  <TextInput
                    style={styles.priceField}
                    value={hasCustom ? customPrice.toString() : ''}
                    onChangeText={(v) => handlePriceChange(svc.id, v)}
                    placeholder={svc.price.toString()}
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            {hasCustom && customPrice !== svc.price && (
              <View style={[
                styles.diffBadge,
                { backgroundColor: customPrice > svc.price ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)' },
              ]}>
                <Text style={[
                  styles.diffText,
                  { color: customPrice > svc.price ? Colors.success : Colors.warning },
                ]}>
                  {customPrice > svc.price ? '+' : ''}${(customPrice - svc.price).toFixed(0)} from shop price
                </Text>
              </View>
            )}
          </View>
        );
      })}

      {services.length === 0 && (
        <View style={styles.emptyServices}>
          <Scissors size={40} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No services available</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.8}
      >
        <Save size={18} color={Colors.black} />
        <Text style={styles.saveBtnText}>
          {saving ? 'Saving...' : 'Save Prices'}
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
  title: { fontSize: 22, fontWeight: '700' as const, color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 24, lineHeight: 20 },
  serviceCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  serviceIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(200,149,108,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: '600' as const, color: Colors.text },
  serviceDuration: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  priceRow: {
    flexDirection: 'row',
    gap: 14,
  },
  defaultPrice: { flex: 1 },
  defaultLabel: { fontSize: 11, fontWeight: '600' as const, color: Colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 6 },
  defaultValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    textAlign: 'center' as const,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  customPriceWrap: { flex: 1 },
  customLabel: { fontSize: 11, fontWeight: '600' as const, color: Colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 6 },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  priceInputActive: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(200,149,108,0.06)',
  },
  priceField: { flex: 1, color: Colors.text, fontSize: 16, fontWeight: '700' as const },
  diffBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
  },
  diffText: { fontSize: 12, fontWeight: '600' as const },
  emptyServices: { alignItems: 'center', paddingVertical: 48, gap: 8 },
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
