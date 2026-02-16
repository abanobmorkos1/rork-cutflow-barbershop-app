import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Image,
} from 'react-native';
import { Plus, Trash2, UserCircle, Mail, Send, Clock, CheckCircle2, DollarSign } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Barber } from '@/types';

export default function ManageBarbersScreen() {
  const { barbers, inviteBarber, removeBarber } = useData();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const nonOwnerBarbers = useMemo(() => {
    return barbers.filter((b) => b.userId !== user?.id);
  }, [barbers, user]);

  const ownerBarber = useMemo(() => {
    return barbers.find((b) => b.userId === user?.id);
  }, [barbers, user]);


  const handleInvite = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    const existing = barbers.find(
      (b) => b.inviteEmail?.toLowerCase() === trimmed
    );
    if (existing) {
      Alert.alert('Already invited', 'This email has already been invited');
      return;
    }
    setSending(true);
    try {
      await inviteBarber(trimmed);
      setEmail('');
      setShowForm(false);
      Alert.alert(
        'Invite Sent',
        `An invitation link has been sent to ${trimmed}. They can create a password and set up their profile.`,
      );
    } catch {
      Alert.alert('Error', 'Failed to send invite');
    } finally {
      setSending(false);
    }
  };

  const handleRemove = (barber: Barber) => {
    Alert.alert(
      'Remove Barber',
      `Remove ${barber.inviteEmail || barber.name} from the team? Their $10/mo subscription will be canceled.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeBarber(barber.id),
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Your Team</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowForm(!showForm)}
          activeOpacity={0.7}
        >
          <Plus size={18} color={Colors.black} />
          <Text style={styles.addBtnText}>Invite</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.billingCard}>
        <View style={styles.billingRow}>
          <DollarSign size={18} color={Colors.accent} />
          <View style={styles.billingInfo}>
            <Text style={styles.billingLabel}>Team overview</Text>
            <Text style={styles.billingValue}>
              {nonOwnerBarbers.length} barber{nonOwnerBarbers.length !== 1 ? 's' : ''} on your team
            </Text>
            <Text style={styles.billingNote}>
              Each barber manages their own $10/mo subscription
            </Text>
          </View>
        </View>
      </View>

      {showForm && (
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Mail size={18} color={Colors.accent} />
            <Text style={styles.formTitle}>Invite by Email</Text>
          </View>
          <Text style={styles.formDesc}>
            Enter the barber's email. They'll receive a link to create their password and set up their profile.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="barber@email.com"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => { setShowForm(false); setEmail(''); }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
              onPress={handleInvite}
              disabled={sending}
            >
              <Send size={16} color={Colors.black} />
              <Text style={styles.sendBtnText}>
                {sending ? 'Sending...' : 'Send Invite'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {ownerBarber && (
        <View style={styles.barberCard}>
          <Image source={{ uri: ownerBarber.avatar }} style={styles.avatar} />
          <View style={styles.barberInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.barberName}>{ownerBarber.name}</Text>
              <View style={styles.ownerBadge}>
                <Text style={styles.ownerBadgeText}>OWNER</Text>
              </View>
            </View>
            <Text style={styles.barberSpecialty}>{ownerBarber.specialty}</Text>
            {ownerBarber.specialtyTags && ownerBarber.specialtyTags.length > 0 && (
              <View style={styles.tagsRow}>
                {ownerBarber.specialtyTags.slice(0, 3).map((tag) => (
                  <View key={tag} style={styles.miniTag}>
                    <Text style={styles.miniTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      )}

      {nonOwnerBarbers.map((barber) => {
        const isPending = barber.inviteStatus === 'pending';
        return (
          <View key={barber.id} style={styles.barberCard}>
            <Image source={{ uri: barber.avatar }} style={styles.avatar} />
            <View style={styles.barberInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.barberName}>{barber.name}</Text>
                {isPending ? (
                  <View style={styles.pendingBadge}>
                    <Clock size={10} color={Colors.warning} />
                    <Text style={styles.pendingBadgeText}>PENDING</Text>
                  </View>
                ) : (
                  <View style={styles.activeBadge}>
                    <CheckCircle2 size={10} color={Colors.success} />
                    <Text style={styles.activeBadgeText}>ACTIVE</Text>
                  </View>
                )}
              </View>
              {barber.inviteEmail && isPending && (
                <Text style={styles.barberEmail}>{barber.inviteEmail}</Text>
              )}
              {!isPending && (
                <Text style={styles.barberSpecialty}>{barber.specialty}</Text>
              )}
              {barber.specialtyTags && barber.specialtyTags.length > 0 && (
                <View style={styles.tagsRow}>
                  {barber.specialtyTags.slice(0, 3).map((tag) => (
                    <View key={tag} style={styles.miniTag}>
                      <Text style={styles.miniTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
              <Text style={styles.costLabel}>Pays $10/mo</Text>
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemove(barber)}
            >
              <Trash2 size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        );
      })}

      {nonOwnerBarbers.length === 0 && (
        <View style={styles.empty}>
          <UserCircle size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No barbers added yet</Text>
          <Text style={styles.emptySubtext}>Invite your first team member by email</Text>
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
    marginBottom: 16,
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
  billingCard: {
    backgroundColor: 'rgba(200,149,108,0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(200,149,108,0.15)',
  },
  billingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  billingInfo: { flex: 1 },
  billingLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  billingValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  billingTotal: {
    fontWeight: '800' as const,
    color: Colors.accent,
    fontSize: 16,
  },
  billingNote: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  formTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  formDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
    color: Colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
  },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '600' as const },
  sendBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  sendBtnDisabled: { opacity: 0.6 },
  sendBtnText: { color: Colors.black, fontWeight: '700' as const },
  barberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.surface },
  barberInfo: { flex: 1, marginLeft: 14 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barberName: { fontSize: 16, fontWeight: '600' as const, color: Colors.text },
  barberSpecialty: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  barberEmail: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  ownerBadge: {
    backgroundColor: 'rgba(200,149,108,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ownerBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,152,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pendingBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.warning,
    letterSpacing: 0.5,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(76,175,80,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.success,
    letterSpacing: 0.5,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  miniTag: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniTagText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  costLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.accent,
    marginTop: 4,
  },
  removeBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(229,57,53,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyText: { fontSize: 16, fontWeight: '600' as const, color: Colors.textSecondary },
  emptySubtext: { fontSize: 14, color: Colors.textMuted },
});
