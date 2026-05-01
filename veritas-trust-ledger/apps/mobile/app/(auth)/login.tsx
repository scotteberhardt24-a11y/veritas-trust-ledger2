'use client';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Colors, Radius } from '../constants/theme';
import { api } from '../constants/api';

type Screen = 'login' | 'register';
type Role = 'worker' | 'client';

export function AuthScreen({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [screen, setScreen] = useState<Screen>('login');
  const [role, setRole] = useState<Role>('worker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    const res = await api.login(email, password);
    setLoading(false);
    if (res?.token) { onSuccess(res.token); }
    else { setError('Invalid email or password'); }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    const res = await api.register({ name, email, password, role });
    setLoading(false);
    if (res?.token) { onSuccess(res.token); }
    else { setError(res?.error || 'Registration failed'); }
  };

  const demoLogin = () => onSuccess('demo-token-veritas-2026');

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.navy} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={s.logoSection}>
            <View style={s.logoRing}>
              <Text style={s.logoV}>V</Text>
            </View>
            <Text style={s.logoName}>VERITAS</Text>
            <Text style={s.logoTagline}>Trust. Verified.</Text>
          </View>

          {/* Tab switch */}
          <View style={s.tabs}>
            <TouchableOpacity
              style={[s.tab, screen === 'login' && s.tabActive]}
              onPress={() => { setScreen('login'); setError(''); }}
            >
              <Text style={[s.tabText, screen === 'login' && s.tabTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tab, screen === 'register' && s.tabActive]}
              onPress={() => { setScreen('register'); setError(''); }}
            >
              <Text style={[s.tabText, screen === 'register' && s.tabTextActive]}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={s.form}>
            {screen === 'register' && (
              <>
                <Text style={s.label}>Full Name</Text>
                <TextInput
                  style={s.input} placeholder="Emma Johnson"
                  placeholderTextColor={Colors.textDim} value={name}
                  onChangeText={setName} autoCapitalize="words"
                />

                {/* Role picker */}
                <Text style={s.label}>I am a...</Text>
                <View style={s.roleRow}>
                  <TouchableOpacity
                    style={[s.roleBtn, role === 'worker' && s.roleBtnActive]}
                    onPress={() => setRole('worker')}
                  >
                    <Text style={s.roleIcon}>🔧</Text>
                    <Text style={[s.roleText, role === 'worker' && s.roleTextActive]}>Worker</Text>
                    <Text style={s.roleDesc}>Offer services & earn</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.roleBtn, role === 'client' && s.roleBtnActive]}
                    onPress={() => setRole('client')}
                  >
                    <Text style={s.roleIcon}>🏠</Text>
                    <Text style={[s.roleText, role === 'client' && s.roleTextActive]}>Client</Text>
                    <Text style={s.roleDesc}>Hire & pay securely</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <Text style={s.label}>Email</Text>
            <TextInput
              style={s.input} placeholder="you@example.com"
              placeholderTextColor={Colors.textDim} value={email}
              onChangeText={setEmail} keyboardType="email-address"
              autoCapitalize="none" autoCorrect={false}
            />

            <Text style={s.label}>Password</Text>
            <TextInput
              style={s.input} placeholder="••••••••"
              placeholderTextColor={Colors.textDim} value={password}
              onChangeText={setPassword} secureTextEntry
            />

            {error ? <Text style={s.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[s.submitBtn, loading && { opacity: 0.6 }]}
              onPress={screen === 'login' ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={Colors.navy} />
                : <Text style={s.submitText}>{screen === 'login' ? 'Sign In →' : 'Create Account →'}</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={s.demoBtn} onPress={demoLogin}>
              <Text style={s.demoText}>Continue with Demo Mode</Text>
            </TouchableOpacity>
          </View>

          {/* Trust badge */}
          <View style={s.trustRow}>
            <Text style={s.trustText}>⊛ Escrow Protected</Text>
            <Text style={s.trustDot}>·</Text>
            <Text style={s.trustText}>⬡ TruScore Verified</Text>
            <Text style={s.trustDot}>·</Text>
            <Text style={s.trustText}>◈ Badge System</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.navy },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoRing: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: Colors.gold,
    backgroundColor: Colors.navyLight,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.gold, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 20,
  },
  logoV: { color: Colors.gold, fontSize: 40, fontWeight: '900' },
  logoName: {
    color: Colors.text, fontSize: 28, fontWeight: '900',
    letterSpacing: 6, marginTop: 12,
  },
  logoTagline: { color: Colors.gold, fontSize: 12, letterSpacing: 3, marginTop: 4 },
  tabs: {
    flexDirection: 'row', backgroundColor: Colors.card,
    borderRadius: Radius.full, padding: 4, marginBottom: 24,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: Radius.full, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.gold },
  tabText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: Colors.navy, fontWeight: '800' },
  form: { gap: 4 },
  label: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
    paddingHorizontal: 16, paddingVertical: 13,
    color: Colors.text, fontSize: 14,
  },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  roleBtn: {
    flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: 14, alignItems: 'center',
  },
  roleBtnActive: { borderColor: Colors.gold, backgroundColor: Colors.gold + '15' },
  roleIcon: { fontSize: 24 },
  roleText: { color: Colors.textMuted, fontSize: 13, fontWeight: '700', marginTop: 4 },
  roleTextActive: { color: Colors.gold },
  roleDesc: { color: Colors.textDim, fontSize: 10, marginTop: 2, textAlign: 'center' },
  error: { color: Colors.red, fontSize: 13, marginTop: 8 },
  submitBtn: {
    backgroundColor: Colors.gold, borderRadius: Radius.full,
    paddingVertical: 15, alignItems: 'center', marginTop: 20,
  },
  submitText: { color: Colors.navy, fontSize: 16, fontWeight: '800' },
  demoBtn: {
    borderRadius: Radius.full, paddingVertical: 13, alignItems: 'center',
    marginTop: 10, borderWidth: 1, borderColor: Colors.cardBorder,
  },
  demoText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
  trustRow: {
    flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap',
    gap: 6, marginTop: 32,
  },
  trustText: { color: Colors.textDim, fontSize: 10, fontWeight: '600' },
  trustDot: { color: Colors.textDim, fontSize: 10 },
});
