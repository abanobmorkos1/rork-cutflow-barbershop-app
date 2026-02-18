import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Pressable,
} from 'react-native';
import { DollarSign, Save, Scissors, Tag, Plus, X, ToggleLeft, ToggleRight, Trash2, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { BarberPrices, PromoCode } from '@/types';
import DateDropdownPicker from '@/components/DateDropdownPicker';
import { formatDateDisplay } from '@/utils/slots';

export default function BarberPricingScreen() {
  const { user } = useAuth();
  const { getBarberByUserId, getShopServices, updateBarberPrices, getBarberPromoCodes, addPromoCode, removePromoCode, togglePromoCode } = useData();

  const barber = useMemo(() => {
    if (!user) return null;
    return getBarberByUserId(user.id);
  }, [user, getBarberByUserId]);

  const services = useMemo(() => {
    if (!barber) return [];
    return getShopServices(barber.shopId);
  }, [barber, getShopServices]);

  const myPromos = useMemo(() => {
    if (!barber) return [];
    return getBarberPromoCodes(barber.id);
  }, [barber, getBarberPromoCodes]);

  const [prices, setPrices] = useState<BarberPrices>(barber?.prices ?? {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (barber?.prices) {
      setPrices(barber.prices);
    }
  }, [barber]);

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');
  const [promoDateStart, setPromoDateStart] = useState('');
  const [promoDateEnd, setPromoDateEnd] = useState('');
  const [addingPromo, setAddingPromo] = useState(false);

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

  const handleAddPromo = async () => {
    if (!barber) return;
    const trimCode = promoCode.trim().toUpperCase();
    if (!trimCode) {
      Alert.alert('Missing', 'Enter a promo code');
      return;
    }
    const pct = parseInt(promoDiscount, 10);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      Alert.alert('Invalid', 'Discount must be between 1 and 100%');
      return;
    }
    if (!promoDateStart || !promoDateEnd) {
      Alert.alert('Missing', 'Pick both start and end dates');
      return;
    }
    if (promoDateEnd < promoDateStart) {
      Alert.alert('Invalid', 'End date must be on or after start date');
      return;
    }
    setAddingPromo(true);
    try {
      const promo: PromoCode = {
        id: `promo-${Date.now()}`,
        barberId: barber.id,
        code: trimCode,
        discountPercent: pct,
        validDateStart: promoDateStart,
        validDateEnd: promoDateEnd,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      await addPromoCode(promo);
      setPromoCode('');
      setPromoDiscount('');
      setPromoDateStart('');
      setPromoDateEnd('');
      setShowPromoModal(false);
      Alert.alert('Promo Created!', `Code "${trimCode}" is live from ${formatDateDisplay(promoDateStart)} to ${formatDateDisplay(promoDateEnd)}`);
    } catch {
      Alert.alert('Error', 'Failed to add promo');
    } finally {
      setAddingPromo(false);
    }
  };

  const handleDeletePromo = (promo: PromoCode) => {
    Alert.alert('Delete Promo', `Remove code "${promo.code}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removePromoCode(promo.id) },
    ]);
  };

  const formatPromoRange = (start: string, end: string) => {
    return `${formatDateDisplay(start)} → ${formatDateDisplay(end)}`;
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
        Set your own rate per service. Leave blank to use the shop default.
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

      <View style={styles.promosSection}>
        <View style={styles.promosSectionHeader}>
          <View>
            <Text style={styles.promosSectionTitle}>Promo Codes</Text>
            <Text style={styles.promosSectionDesc}>Boost traffic on slow days</Text>
          </View>
          <TouchableOpacity
            style={styles.addPromoBtn}
            onPress={() => setShowPromoModal(true)}
            activeOpacity={0.7}
          >
            <Plus size={16} color={Colors.black} />
            <Text style={styles.addPromoBtnText}>New Code</Text>
          </TouchableOpacity>
        </View>

        {myPromos.length === 0 && (
          <View style={styles.promosEmpty}>
            <Tag size={28} color={Colors.textMuted} />
            <Text style={styles.promosEmptyTitle}>No promo codes yet</Text>
            <Text style={styles.promosEmptyDesc}>
              Create a discount code for a specific day to attract more clients
            </Text>
          </View>
        )}

        {myPromos.map((promo) => (
          <View key={promo.id} style={[styles.promoCard, !promo.isActive && styles.promoCardInactive]}>
            <View style={styles.promoLeft}>
              <View style={styles.promoCodeBadge}>
                <Text style={styles.promoCodeText}>{promo.code}</Text>
              </View>
              <View style={styles.promoMeta}>
                <Text style={styles.promoDiscount}>{promo.discountPercent}% off</Text>
                <View style={styles.promoDateRow}>
                  <Calendar size={11} color={Colors.textMuted} />
                  <Text style={styles.promoDateText}>{formatPromoRange(promo.validDateStart, promo.validDateEnd)}</Text>
                </View>
              </View>
            </View>
            <View style={styles.promoActions}>
              <TouchableOpacity
                onPress={() => togglePromoCode(promo.id)}
                style={styles.promoToggle}
                activeOpacity={0.7}
              >
                {promo.isActive
                  ? <ToggleRight size={26} color={Colors.success} />
                  : <ToggleLeft size={26} color={Colors.textMuted} />
                }
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeletePromo(promo)}
                style={styles.promoDelete}
                activeOpacity={0.7}
              >
                <Trash2 size={16} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <Modal
        visible={showPromoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPromoModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowPromoModal(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>New Promo Code</Text>
              <TouchableOpacity onPress={() => setShowPromoModal(false)} style={styles.modalClose}>
                <X size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>
              Clients can use this code when booking during the selected dates to get a discount.
            </Text>

            <Text style={styles.modalFieldLabel}>CODE</Text>
            <View style={styles.modalInput}>
              <Tag size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.modalTextField}
                value={promoCode}
                onChangeText={(v) => setPromoCode(v.toUpperCase())}
                placeholder="e.g. FRIDAY20"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.modalFieldLabel}>DISCOUNT %</Text>
            <View style={styles.modalInput}>
              <DollarSign size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.modalTextField}
                value={promoDiscount}
                onChangeText={setPromoDiscount}
                placeholder="e.g. 20"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
              />
            </View>

            <Text style={styles.modalFieldLabel}>START DATE</Text>
            <DateDropdownPicker
              value={promoDateStart}
              onChange={setPromoDateStart}
              label="Promo Start Date"
            />
            <View style={{ height: 12 }} />
            <Text style={styles.modalFieldLabel}>END DATE</Text>
            <DateDropdownPicker
              value={promoDateEnd}
              onChange={setPromoDateEnd}
              label="Promo End Date"
            />

            <TouchableOpacity
              style={[styles.modalConfirmBtn, addingPromo && styles.modalConfirmBtnDisabled]}
              onPress={handleAddPromo}
              disabled={addingPromo}
              activeOpacity={0.85}
            >
              <Text style={styles.modalConfirmBtnText}>
                {addingPromo ? 'Creating...' : 'Create Promo'}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
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
  priceRow: { flexDirection: 'row', gap: 14 },
  defaultPrice: { flex: 1 },
  defaultLabel: {
    fontSize: 11, fontWeight: '600' as const, color: Colors.textMuted,
    textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 6,
  },
  defaultValue: {
    fontSize: 18, fontWeight: '700' as const, color: Colors.textSecondary,
    backgroundColor: Colors.surface, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 10, textAlign: 'center' as const, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  customPriceWrap: { flex: 1 },
  customLabel: {
    fontSize: 11, fontWeight: '600' as const, color: Colors.textMuted,
    textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 6,
  },
  priceInput: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: 10, paddingHorizontal: 12, height: 44,
    borderWidth: 1, borderColor: Colors.border, gap: 4,
  },
  priceInputActive: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(200,149,108,0.06)',
  },
  priceField: { flex: 1, color: Colors.text, fontSize: 16, fontWeight: '700' as const },
  diffBadge: {
    marginTop: 10, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, alignSelf: 'flex-start' as const,
  },
  diffText: { fontSize: 12, fontWeight: '600' as const },
  emptyServices: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.accent, height: 54, borderRadius: 14, gap: 8, marginTop: 4,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.black },
  promosSection: {
    marginTop: 32,
  },
  promosSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  promosSectionTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  promosSectionDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  addPromoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.accent, paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 12,
  },
  addPromoBtnText: { fontSize: 13, fontWeight: '700' as const, color: Colors.black },
  promosEmpty: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 28,
    alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.border,
    borderStyle: 'dashed' as const,
  },
  promosEmptyTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.textSecondary },
  promosEmptyDesc: {
    fontSize: 13, color: Colors.textMuted, textAlign: 'center' as const, lineHeight: 19,
  },
  promoCard: {
    backgroundColor: Colors.card, borderRadius: 14, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  promoCardInactive: {
    opacity: 0.5,
  },
  promoLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  promoCodeBadge: {
    backgroundColor: 'rgba(200,149,108,0.15)',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(200,149,108,0.3)',
  },
  promoCodeText: { fontSize: 15, fontWeight: '800' as const, color: Colors.accent, letterSpacing: 1 },
  promoMeta: { gap: 4 },
  promoDiscount: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  promoDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  promoDateText: { fontSize: 12, color: Colors.textMuted },
  promoActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  promoToggle: { padding: 4 },
  promoDelete: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(229,57,53,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
    borderTopWidth: 1, borderColor: Colors.border,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border,
    alignSelf: 'center' as const, marginBottom: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' as const, color: Colors.text },
  modalClose: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.card,
    alignItems: 'center', justifyContent: 'center',
  },
  modalDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 20 },
  modalFieldLabel: {
    fontSize: 11, fontWeight: '700' as const, color: Colors.textMuted,
    letterSpacing: 1, marginBottom: 6,
  },
  modalInput: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    borderRadius: 12, paddingHorizontal: 14, height: 50,
    borderWidth: 1, borderColor: Colors.border, gap: 10, marginBottom: 16,
  },
  modalTextField: { flex: 1, color: Colors.text, fontSize: 16 },
  modalConfirmBtn: {
    backgroundColor: Colors.accent, height: 54, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  modalConfirmBtnDisabled: { opacity: 0.6 },
  modalConfirmBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.black },
});
