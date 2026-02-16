import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { User, Mail, Phone, Shield, Users, CreditCard, Info } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);

  const roles: { key: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: 'customer', label: 'Customer', icon: <User size={22} color={role === 'customer' ? Colors.accent : Colors.textSecondary} />, desc: 'Book appointments for free' },
    { key: 'owner', label: 'Shop Owner', icon: <Shield size={22} color={role === 'owner' ? Colors.accent : Colors.textSecondary} />, desc: 'Run & manage your shop' },
  ];

  const handleSignup = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill in your name and email');
      return;
    }
    setLoading(true);
    try {
      const user = await signup(name.trim(), email.trim(), phone.trim(), role);
      const route = user.role === 'owner' ? '/owner' : user.role === 'barber' ? '/barber' : '/customer';
      router.replace(route as any);
    } catch {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join CutFlow and get started</Text>

          <Text style={styles.sectionLabel}>I am a...</Text>
          <View style={styles.roleRow}>
            {roles.map((r) => (
              <TouchableOpacity
                key={r.key}
                style={[styles.roleCard, role === r.key && styles.roleCardActive]}
                onPress={() => setRole(r.key)}
                activeOpacity={0.7}
              >
                {r.icon}
                <Text style={[styles.roleLabel, role === r.key && styles.roleLabelActive]}>
                  {r.label}
                </Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {role === 'owner' && (
            <View style={styles.paymentNotice}>
              <View style={styles.paymentNoticeHeader}>
                <CreditCard size={18} color={Colors.accent} />
                <Text style={styles.paymentNoticeTitle}>Owner Account Pricing</Text>
              </View>
              <View style={styles.paymentBreakdown}>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>One-time setup fee</Text>
                  <Text style={styles.paymentAmount}>$500</Text>
                </View>
                <View style={styles.paymentDivider} />
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Annual subscription</Text>
                  <Text style={styles.paymentAmount}>$100/yr</Text>
                </View>
              </View>
              <View style={styles.paymentNote}>
                <Info size={14} color={Colors.textMuted} />
                <Text style={styles.paymentNoteText}>
                  Payment will be processed after account creation. Barbers you invite will handle their own $10/mo subscription.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Users size={18} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
                testID="signup-name"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Mail size={18} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                testID="signup-email"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Phone size={18} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Phone number"
                placeholderTextColor={Colors.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                testID="signup-phone"
              />
            </View>

            <TouchableOpacity
              style={[styles.signupBtn, loading && styles.signupBtnDisabled]}
              activeOpacity={0.8}
              onPress={handleSignup}
              disabled={loading}
              testID="signup-submit"
            >
              <Text style={styles.signupBtnText}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24 },
  backBtn: { marginBottom: 32 },
  backText: { color: Colors.textSecondary, fontSize: 15 },
  title: { fontSize: 28, fontWeight: '700' as const, color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, marginBottom: 28 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 12,
  },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  roleCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 6,
  },
  roleCardActive: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(200,149,108,0.08)',
  },
  roleLabel: { fontSize: 14, fontWeight: '600' as const, color: Colors.textSecondary },
  roleLabelActive: { color: Colors.accent },
  roleDesc: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' as const },
  form: { gap: 16 },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 54,
  },
  inputIcon: { paddingLeft: 16, paddingRight: 4 },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    paddingHorizontal: 12,
    height: '100%' as unknown as number,
  },
  signupBtn: {
    backgroundColor: Colors.accent,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signupBtnDisabled: { opacity: 0.6 },
  signupBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.black },
  paymentNotice: {
    backgroundColor: 'rgba(200,149,108,0.06)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(200,149,108,0.15)',
  },
  paymentNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  paymentNoticeTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  paymentBreakdown: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  paymentLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  paymentDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 6,
  },
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  paymentNoteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
});
