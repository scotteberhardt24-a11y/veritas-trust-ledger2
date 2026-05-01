import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, TIER_CONFIG, getTierColor } from '../../constants/theme';

export default function TrustScreen() {
  const { user } = useAuth();
  const score = user?.truscore ?? 0;
  const tier = user?.tier || 'Starter';
  const tierCfg = TIER_CONFIG[tier] || TIER_CONFIG.Starter;

  const factors = [
    { label: 'Identity Verification', value: user?.is_verified ? 'Verified' : 'Pending', pct: user?.is_verified ? 100 : 20 },
    { label: 'Jobs Completed', value: `${user?.jobs_completed ?? 0}`, pct: Math.min((user?.jobs_completed ?? 0) * 5, 100) },
    { label: 'Success Rate', value: `${user?.success_rate ?? 0}%`, pct: user?.success_rate ?? 0 },
    { label: 'Avg Rating', value: `${(user?.avg_rating ?? 0).toFixed(1)}`, pct: ((user?.avg_rating ?? 0) / 5) * 100 },
    { label: 'Ledger Integrity', value: 'Intact', pct: 100 },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.headerTitle}>Trust Ledger</Text>

      {/* Score Card */}
      <View style={s.scoreCard}>
        <Text style={s.scoreLabel}>YOUR TRUSCORE</Text>
        <Text style={[s.score, { color: getTierColor(tier) }]}>{score}</Text>
        <Text style={[s.tierText, { color: getTierColor(tier) }]}>{tierCfg.icon} {tier.toUpperCase()}</Text>
        <View style={s.barTrack}>
          <View style={[s.barFill, { width: `${score / 10}%`, backgroundColor: getTierColor(tier) }]} />
        </View>
        <View style={s.barLabels}>
          <Text style={s.barLabel}>0</Text>
          <Text style={s.barLabel}>500</Text>
          <Text style={s.barLabel}>1000</Text>
        </View>
      </View>

      {/* Badge */}
      <View style={s.badgeCard}>
        <Text style={s.badgeLabel}>BADGE SERIAL</Text>
        <Text style={s.badgeSerial}>{user?.serial || '—'}</Text>
      </View>

      {/* Factors */}
      <Text style={s.sectionTitle}>SCORE FACTORS</Text>
      {factors.map((f, i) => (
        <View key={i} style={s.factorRow}>
          <View style={s.factorHeader}>
            <Text style={s.factorLabel}>{f.label}</Text>
            <Text style={s.factorValue}>{f.value}</Text>
          </View>
          <View style={s.factorTrack}>
            <View style={[s.factorFill, { width: `${f.pct}%` }]} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24, paddingTop: 60 },
  headerTitle: { color: COLORS.white, fontSize: 28, fontWeight: '800', marginBottom: 24 },
  scoreCard: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.borderGold, padding: 32, alignItems: 'center', marginBottom: 16 },
  scoreLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 8 },
  score: { fontSize: 64, fontWeight: '900', fontVariant: ['tabular-nums'] },
  tierText: { fontSize: 14, fontWeight: '700', letterSpacing: 2, marginTop: 4 },
  barTrack: { width: '100%', height: 6, backgroundColor: COLORS.bg, borderRadius: 3, marginTop: 24, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 6 },
  barLabel: { color: COLORS.muted, fontSize: 10, fontVariant: ['tabular-nums'] },
  badgeCard: { backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderGold, padding: 16, alignItems: 'center', marginBottom: 24 },
  badgeLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  badgeSerial: { color: COLORS.gold, fontSize: 18, fontWeight: '700', letterSpacing: 2, marginTop: 6, fontVariant: ['tabular-nums'] },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 12 },
  factorRow: { marginBottom: 16 },
  factorHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  factorLabel: { color: COLORS.white, fontSize: 13 },
  factorValue: { color: COLORS.cyan, fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] },
  factorTrack: { height: 4, backgroundColor: COLORS.bg, borderRadius: 2, overflow: 'hidden' },
  factorFill: { height: '100%', backgroundColor: COLORS.cyan, borderRadius: 2 },
});
