import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { COLORS } from '../../constants/theme';
import { getJobs, applyToJob } from '../../services/api';

export default function JobsScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getJobs(search ? { search } : undefined);
      setJobs(data || []);
    } catch { setJobs([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleApply = async (jobId: string) => {
    setApplying(jobId);
    try { await applyToJob(jobId, 'Interested in this opportunity'); } catch {}
    setApplying(null);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Jobs</Text>
        <Text style={s.subtitle}>{jobs.length} open positions</Text>
      </View>

      <View style={s.searchRow}>
        <TextInput style={s.searchInput} placeholder="Search jobs..." placeholderTextColor={COLORS.muted} value={search} onChangeText={setSearch} onSubmitEditing={load} returnKeyType="search" />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.gold} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          {jobs.length === 0 ? (
            <Text style={s.empty}>No jobs found</Text>
          ) : (
            jobs.map(job => (
              <View key={job.job_id} style={s.card}>
                <View style={s.cardHeader}>
                  <Text style={s.jobTitle}>{job.title}</Text>
                  {job.budget > 0 && <Text style={s.budget}>${job.budget}</Text>}
                </View>
                {job.description ? <Text style={s.desc} numberOfLines={2}>{job.description}</Text> : null}
                <View style={s.cardFooter}>
                  <Text style={s.meta}>{job.category || 'General'} · {new Date(job.created_at).toLocaleDateString()}</Text>
                  <TouchableOpacity style={s.applyBtn} onPress={() => handleApply(job.job_id)} disabled={applying === job.job_id}>
                    <Text style={s.applyText}>{applying === job.job_id ? '...' : 'Apply'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  title: { color: COLORS.white, fontSize: 28, fontWeight: '800' },
  subtitle: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
  searchRow: { paddingHorizontal: 24, marginBottom: 16 },
  searchInput: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border2, borderRadius: 12, padding: 12, color: COLORS.white, fontSize: 14 },
  list: { padding: 24, paddingTop: 0 },
  empty: { color: COLORS.muted, textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border2, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  jobTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', flex: 1 },
  budget: { color: COLORS.gold, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  desc: { color: COLORS.muted, fontSize: 13, marginBottom: 8, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { color: COLORS.muted2, fontSize: 11 },
  applyBtn: { backgroundColor: COLORS.gold, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999 },
  applyText: { color: COLORS.bg, fontSize: 12, fontWeight: '700' },
});
