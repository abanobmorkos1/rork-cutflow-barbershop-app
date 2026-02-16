import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert,
} from 'react-native';
import { Plus, Trash2, Clock, DollarSign, Scissors } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useData } from '@/contexts/DataContext';
import { Service } from '@/types';

export default function ManageServicesScreen() {
  const { services, addService, removeService } = useData();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = async () => {
    if (!name.trim() || !duration.trim() || !price.trim()) {
      Alert.alert('Error', 'Please fill in name, duration, and price');
      return;
    }
    const newService: Service = {
      id: `service-${Date.now()}`,
      name: name.trim(),
      duration: parseInt(duration, 10) || 30,
      price: parseFloat(price) || 0,
      description: description.trim(),
    };
    await addService(newService);
    setName('');
    setDuration('');
    setPrice('');
    setDescription('');
    setShowForm(false);
  };

  const handleRemove = (svc: Service) => {
    Alert.alert('Remove Service', `Remove "${svc.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeService(svc.id) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Services</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowForm(!showForm)}
          activeOpacity={0.7}
        >
          <Plus size={18} color={Colors.black} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>New Service</Text>
          <TextInput
            style={styles.input}
            placeholder="Service name"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Duration (min)"
              placeholderTextColor={Colors.textMuted}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Price ($)"
              placeholderTextColor={Colors.textMuted}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
              <Text style={styles.saveBtnText}>Add Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {services.map((svc) => (
        <View key={svc.id} style={styles.serviceCard}>
          <View style={styles.serviceHeader}>
            <View style={styles.serviceIcon}>
              <Scissors size={18} color={Colors.accent} />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{svc.name}</Text>
              <Text style={styles.serviceDesc} numberOfLines={2}>{svc.description}</Text>
            </View>
            <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(svc)}>
              <Trash2 size={16} color={Colors.error} />
            </TouchableOpacity>
          </View>
          <View style={styles.serviceMeta}>
            <View style={styles.metaItem}>
              <Clock size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{svc.duration} min</Text>
            </View>
            <View style={styles.metaItem}>
              <DollarSign size={14} color={Colors.success} />
              <Text style={styles.metaText}>${svc.price}</Text>
            </View>
          </View>
        </View>
      ))}

      {services.length === 0 && (
        <View style={styles.empty}>
          <Scissors size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No services yet</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '700' as const, color: Colors.text },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  addBtnText: { fontSize: 14, fontWeight: '600' as const, color: Colors.black },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  formTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  textArea: { height: 80, textAlignVertical: 'top' as const, paddingTop: 14 },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '600' as const },
  saveBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { color: Colors.black, fontWeight: '700' as const },
  serviceCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(200,149,108,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: '600' as const, color: Colors.text },
  serviceDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(229,57,53,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceMeta: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: Colors.textSecondary },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600' as const, color: Colors.textSecondary },
});
