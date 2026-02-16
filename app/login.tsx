import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Animated,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      shake();
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (user) {
        const route = user.role === 'owner' ? '/owner' : user.role === 'barber' ? '/barber' : '/customer';
        router.replace(route as any);
      } else {
        shake();
        Alert.alert('Login Failed', 'No account found with this email. Try one of the demo accounts:\n\nowner@cutflow.com\njames@cutflow.com\ncustomer@cutflow.com');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email: string) => {
    setLoading(true);
    const user = await login(email, '');
    if (user) {
      const route = user.role === 'owner' ? '/owner' : user.role === 'barber' ? '/barber' : '/customer';
      router.replace(route as any);
    }
    setLoading(false);
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

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your CutFlow account</Text>

          <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>
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
                testID="login-email"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Lock size={18} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                testID="login-password"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={18} color={Colors.textSecondary} />
                ) : (
                  <Eye size={18} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={loading}
              testID="login-submit"
            >
              <Text style={styles.loginBtnText}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.demoSection}>
            <View style={styles.demoHeader}>
              <View style={styles.demoLine} />
              <Text style={styles.demoLabel}>Quick Demo Login</Text>
              <View style={styles.demoLine} />
            </View>

            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => quickLogin('owner@cutflow.com')}
              activeOpacity={0.7}
            >
              <View style={[styles.demoDot, { backgroundColor: '#E8B86D' }]} />
              <View style={styles.demoInfo}>
                <Text style={styles.demoName}>Marcus Cole</Text>
                <Text style={styles.demoRole}>Shop Owner</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => quickLogin('james@cutflow.com')}
              activeOpacity={0.7}
            >
              <View style={[styles.demoDot, { backgroundColor: '#6DB8E8' }]} />
              <View style={styles.demoInfo}>
                <Text style={styles.demoName}>James Rivera</Text>
                <Text style={styles.demoRole}>Barber</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => quickLogin('customer@cutflow.com')}
              activeOpacity={0.7}
            >
              <View style={[styles.demoDot, { backgroundColor: '#6DE8A0' }]} />
              <View style={styles.demoInfo}>
                <Text style={styles.demoName}>Alex Turner</Text>
                <Text style={styles.demoRole}>Customer</Text>
              </View>
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
  subtitle: { fontSize: 15, color: Colors.textSecondary, marginBottom: 36 },
  form: { gap: 16, marginBottom: 40 },
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
  eyeBtn: { padding: 16 },
  loginBtn: {
    backgroundColor: Colors.accent,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.black },
  demoSection: { gap: 12 },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  demoLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  demoLabel: { fontSize: 12, color: Colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: 1 },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  demoDot: { width: 10, height: 10, borderRadius: 5 },
  demoInfo: {},
  demoName: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  demoRole: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
});
