import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/theme';
import { getEscrows, releaseEscrow } from '../../services/api';

const STATUS_COLORS: Record<string, string> = { pending: '#f59e0b', active: '#06b6d4', funded: '#22c55e', released: '#22c55e', disputed: '#ef4444' };

export default function EscrowScreen() {
  const { user } = useAuth();
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try { const data = await getEscrows(user.user_id); setEscrows(data || []); } catch { setEscrows([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleRelease = async (id: string) => {
    setReleasing(id);
    try { await releaseEscrow(id); load(); } catch {}
    setReleasing(null);
  };

  const active = escrows.filter(e => ['active', 'funded', 'pending'].includes(e.status));
  const past = escrows.filter(e => ['released', 'disputed'].includes(e.status));

  if (loading) return <View style={s.center}><ActivityIndicator color={COLORS.gold} size="large" /></View>;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Escrow</Text>
      <Text style={s.subtitle}>{active.length} active · ${active.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0).toFixed(2)} locked</Text>

      {escrows.length === 0 ? (
        <View style={s.emptyCard}><Text style={s.emptyIcon}>🔒</Text><Text style={s.emptyText}>No escrows yet</Text></View>
      ) : (
        <>
          {active.length > 0 && <Text style={s.sectionTitle}>ACTIVE</Text>}
          {active.map(e => (
            <View key={e.escrow_id} style={s.card}>
              <View style={s.cardRow}>
                <Text style={s.cardTitle}>{e.title}</Text>
                <Text style={[s.status, { color: STATUS_COLORS[e.status] || COLORS.muted }]}>{e.status.toUpperCase()}</Text>
              </View>
              <Text style={s.amount}>${e.amount}</Text>
              <Text style={s.meta}>{e.escrow_id.slice(0, 8)}... · {new Date(e.created_at).toLocaleDateString()}</Text>
              {e.status === 'active' && (
                <TouchableOpacity style={s.releaseBtn} onPress={() => handleRelease(e.escrow_id)} disabled={releasing === e.escrow_id}>
                  <Text style={s.releaseBtnText}>{releasing === e.escrow_id ? 'Releasing...' : 'Release Funds'}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {past.length > 0 && <Text style={s.sectionTitle}>COMPLETED</Text>}
          {past.map(e => (
            <View key={e.escrow_id} style={[s.card, { opacity: 0.7 }]}>
              <View style={s.cardRow}>
                <Text style={s.cardTitle}>{e.title}</Text>
                <Text style={[s.status, { color: STATUS_COLORS[e.status] || COLORS.muted }]}>{e.status.toUpperCase()}</Text>
              </View>
              <Text style={s.amount}>${e.amount}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24, paddingTop: 60 },
  center: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  title: { color: COLORS.white, fontSize: 28, fontWeight: '800' },
  subtitle: { color: COLORS.muted, fontSize: 13, marginTop: 4, marginBottom: 24 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 12, marginTop: 8 },
  card: { backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border2, padding: 16, marginBottom: 12 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  status: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  amount: { color: COLORS.gold, fontSize: 20, fontWeight: '800', marginBottom: 4, fontVariant: ['tabular-nums'] },
  meta: { color: COLORS.muted, fontSize: 11, fontVariant: ['tabular-nums'] },
  releaseBtn: { backgroundColor: COLORS.gold, borderRadius: 999, paddingVertical: 10, alignItems: 'center', marginTop: 12 },
  releaseBtnText: { color: COLORS.bg, fontWeight: '700', fontSize: 13 },
  emptyCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 40, alignItems: 'center', marginTop: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: COLORS.muted, fontSize: 14 },
});
