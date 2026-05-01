import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, getTierColor, TIER_CONFIG } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const tier = user?.tier || 'Starter';
  const tierCfg = TIER_CONFIG[tier] || TIER_CONFIG.Starter;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?';

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Avatar + Name */}
      <View style={s.avatarSection}>
        <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
        <Text style={s.name}>{user?.name || 'Veritas User'}</Text>
        <Text style={s.email}>{user?.email || ''}</Text>
        <View style={[s.tierBadge, { borderColor: getTierColor(tier) }]}>
          <Text style={[s.tierText, { color: getTierColor(tier) }]}>{tierCfg.icon} {tier.toUpperCase()}</Text>
        </View>
      </View>

      {/* Score */}
      <View style={s.scoreCard}>
        <Text style={s.scoreLabel}>TRUSCORE</Text>
        <Text style={[s.score, { color: getTierColor(tier) }]}>{user?.truscore ?? 0}</Text>
      </View>

      {/* Stats Grid */}
      <View style={s.statsGrid}>
        {[
          { label: 'Jobs', value: user?.jobs_completed ?? 0, icon: '💼' },
          { label: 'Success', value: `${user?.success_rate ?? 0}%`, icon: '🎯' },
          { label: 'Rating', value: (user?.avg_rating ?? 0).toFixed(1), icon: '⭐' },
          { label: 'Balance', value: `$${user?.balance ?? 0}`, icon: '💰' },
        ].map((stat, i) => (
          <View key={i} style={s.statCard}>
            <Text style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</Text>
            <Text style={s.statValue}>{stat.value}</Text>
            <Text style={s.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Info Rows */}
      <View style={s.infoSection}>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Role</Text>
          <Text style={s.infoValue}>{user?.role || '—'}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Serial</Text>
          <Text style={[s.infoValue, { color: COLORS.gold, fontVariant: ['tabular-nums'] }]}>{user?.serial || '—'}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Verified</Text>
          <Text style={[s.infoValue, { color: user?.is_verified ? COLORS.success : COLORS.warning }]}>{user?.is_verified ? '✓ Yes' : 'Pending'}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Total Earned</Text>
          <Text style={s.infoValue}>${user?.total_earned ?? 0}</Text>
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24, paddingTop: 60 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.borderGold, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: COLORS.white, fontSize: 28, fontWeight: '800' },
  name: { color: COLORS.white, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  email: { color: COLORS.muted, fontSize: 13, marginBottom: 8 },
  tierBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 4 },
  tierText: { fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  scoreCard: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.borderGold, padding: 24, alignItems: 'center', marginBottom: 20 },
  scoreLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', letterSpacing: 2 },
  score: { fontSize: 48, fontWeight: '900', fontVariant: ['tabular-nums'] },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border2, padding: 16, alignItems: 'center' },
  statValue: { color: COLORS.white, fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  infoSection: { backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border2, marginBottom: 24 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { color: COLORS.muted, fontSize: 13 },
  infoValue: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  logoutBtn: { borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: 14, alignItems: 'center' },
  logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 14 },
});
