import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, getTierColor } from '../../constants/theme';
export default function HomeScreen() {
  const { user } = useAuth();
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.greeting}>Welcome back,</Text>
      <Text style={s.name}>{user?.name || 'Veritas User'}</Text>
      <View style={s.card}><Text style={s.cardLabel}>TruScore</Text><Text style={[s.score, { color: getTierColor(user?.tier || 'Starter') }]}>{user?.truscore ?? 0}</Text><Text style={s.tier}>{user?.tier || 'Starter'}</Text></View>
      <View style={s.statsRow}>
        <View style={s.statBox}><Text style={s.statValue}>{user?.jobs_completed ?? 0}</Text><Text style={s.statLabel}>Jobs</Text></View>
        <View style={s.statBox}><Text style={s.statValue}>{user?.success_rate ?? 0}%</Text><Text style={s.statLabel}>Success</Text></View>
        <View style={s.statBox}><Text style={s.statValue}>${user?.balance ?? 0}</Text><Text style={s.statLabel}>Balance</Text></View>
      </View>
      <View style={s.serialBox}><Text style={s.serialLabel}>Your Badge Serial</Text><Text style={s.serial}>{user?.serial || '—'}</Text></View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg }, content: { padding: 24, paddingTop: 60 },
  greeting: { color: COLORS.muted, fontSize: 14 }, name: { color: COLORS.white, fontSize: 26, fontWeight: '800', marginBottom: 24 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 24, alignItems: 'center', marginBottom: 20 },
  cardLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600', letterSpacing: 1 }, score: { fontSize: 56, fontWeight: '900', marginVertical: 8 },
  tier: { color: COLORS.gold, fontSize: 14, fontWeight: '700', letterSpacing: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 16, alignItems: 'center' },
  statValue: { color: COLORS.white, fontSize: 20, fontWeight: '800' }, statLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginTop: 4 },
  serialBox: { backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderGold, padding: 16, alignItems: 'center' },
  serialLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', letterSpacing: 1 }, serial: { color: COLORS.gold, fontSize: 16, fontWeight: '700', marginTop: 6, letterSpacing: 2 },
});
