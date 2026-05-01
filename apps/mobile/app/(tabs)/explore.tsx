import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { COLORS, getTierColor, TIER_CONFIG } from '../../constants/theme';
import { getJobs, applyToJob } from '../../services/api';

export default function ExploreScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { const data = await getJobs(search ? { search } : undefined); setJobs(data || []); } catch { setJobs([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleApply = async (jobId: string) => {
    setApplying(jobId);
    try { await applyToJob(jobId); } catch {}
    setApplying(null);
    load();
  };

  const categories = ['All', 'Development', 'Design', 'Writing', 'Marketing'];
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All' ? jobs : jobs.filter(j => j.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Explore</Text>
        <Text style={s.subtitle}>Find your next opportunity</Text>
      </View>

      <View style={s.searchRow}>
        <TextInput style={s.searchInput} placeholder="Search jobs & gigs..." placeholderTextColor={COLORS.muted} value={search} onChangeText={setSearch} onSubmitEditing={load} returnKeyType="search" />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={s.catContainer}>
        {categories.map(cat => (
          <TouchableOpacity key={cat} style={[s.catPill, activeCategory === cat && s.catPillActive]} onPress={() => setActiveCategory(cat)}>
            <Text style={[s.catText, activeCategory === cat && s.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={COLORS.gold} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          {filtered.length === 0 ? (
            <View style={s.emptyCard}><Text style={s.emptyIcon}>🔍</Text><Text style={s.emptyText}>No results found</Text></View>
          ) : (
            filtered.map(job => (
              <TouchableOpacity key={job.job_id} style={s.card} activeOpacity={0.8}>
                <View style={s.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.jobTitle}>{job.title}</Text>
                    {job.client_name && <Text style={s.clientName}>{job.client_name}</Text>}
                  </View>
                  {job.budget > 0 && (
                    <View style={s.budgetBadge}><Text style={s.budgetText}>${job.budget}</Text></View>
                  )}
                </View>
                {job.description ? <Text style={s.desc} numberOfLines={2}>{job.description}</Text> : null}
                <View style={s.cardBottom}>
                  {job.category && <View style={s.catTag}><Text style={s.catTagText}>{job.category}</Text></View>}
                  <TouchableOpacity style={s.applyBtn} onPress={() => handleApply(job.job_id)} disabled={applying === job.job_id}>
                    <Text style={s.applyText}>{applying === job.job_id ? '...' : 'Apply →'}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 8 },
  title: { color: COLORS.white, fontSize: 28, fontWeight: '800' },
  subtitle: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
  searchRow: { paddingHorizontal: 24, marginVertical: 12 },
  searchInput: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border2, borderRadius: 12, padding: 12, color: COLORS.white, fontSize: 14 },
  catScroll: { maxHeight: 40, marginBottom: 8 },
  catContainer: { paddingHorizontal: 24, gap: 8 },
  catPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border2 },
  catPillActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  catText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  catTextActive: { color: COLORS.bg },
  list: { padding: 24, paddingTop: 8 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border2, padding: 16, marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  jobTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  clientName: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  budgetBadge: { backgroundColor: 'rgba(201,168,76,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: COLORS.borderGold },
  budgetText: { color: COLORS.gold, fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  desc: { color: COLORS.muted, fontSize: 13, lineHeight: 18, marginBottom: 10 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catTag: { backgroundColor: 'rgba(6,182,212,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  catTagText: { color: COLORS.cyan, fontSize: 10, fontWeight: '600' },
  applyBtn: { backgroundColor: COLORS.gold, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  applyText: { color: COLORS.bg, fontSize: 12, fontWeight: '700' },
  emptyCard: { alignItems: 'center', marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: COLORS.muted, fontSize: 14 },
});
