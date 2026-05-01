'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../layout';

/* ─── CONSTANTS ────────────────────────────────────────── */
const CATEGORIES = ['All','Web Development','Mobile App','Graphic Design','UI/UX Design','Writing','Marketing','Video','Photography','Plumbing','Electrical','HVAC','Carpentry','Cleaning','Moving','Landscaping','Auto Repair','Personal Training','Tutoring','Other'];

const URGENCY = [
  { id: 'standard', label: 'Standard', desc: '3-5 day matching', icon: '📋' },
  { id: 'priority', label: 'Priority', desc: '24hr matching', icon: '⚡' },
  { id: 'emergency', label: 'Emergency', desc: 'Instant matching', icon: '🚨' },
];

/* ── Mock AI-Matched Workers ────────────────────────── */
const AI_MATCHES = [
  { id:'w1', name:'ElectricMike', score:972, tier:'Diamond', rating:4.97, jobs:248, responseTime:'1.2h', hourlyRate:85, matchPct:97, skills:['React','Node.js','PostgreSQL','TypeScript'], matchReasons:['98% skill overlap with job requirements','Top 1% completion rate in Web Development','Average response time under 2 hours','$180K+ in successful escrows'], avatar:'⚡', successRate:99, escrowVolume:182400, category:'Web Development' },
  { id:'w2', name:'CodeNinja', score:934, tier:'Platinum', rating:4.92, jobs:189, responseTime:'2.1h', hourlyRate:75, matchPct:91, skills:['React','Python','AWS','Docker'], matchReasons:['92% skill match','189 completed jobs with zero disputes','Platinum tier with consistent upward trajectory','Specialized in full-stack applications'], avatar:'💻', successRate:97, escrowVolume:134200, category:'Web Development' },
  { id:'w3', name:'SarahBuilds', score:867, tier:'Gold', rating:4.88, jobs:156, responseTime:'3.4h', hourlyRate:65, matchPct:84, skills:['React','CSS','Figma','JavaScript'], matchReasons:['Strong frontend specialization','156 jobs with 4.88 average rating','Competitive rate at $65/hr','Fast turnaround on similar projects'], avatar:'🏗', successRate:96, escrowVolume:89600, category:'Web Development' },
];

const BROWSE_WORKERS = [
  ...AI_MATCHES,
  { id:'w4', name:'DesignQueen', score:948, tier:'Diamond', rating:4.95, jobs:312, responseTime:'1.8h', hourlyRate:90, matchPct:0, skills:['Figma','Photoshop','Branding','UI/UX'], matchReasons:[], avatar:'🎨', successRate:98, escrowVolume:210000, category:'Graphic Design' },
  { id:'w5', name:'WriterPro', score:843, tier:'Gold', rating:4.85, jobs:534, responseTime:'0.8h', hourlyRate:45, matchPct:0, skills:['SEO','Copywriting','Blog','Technical'], matchReasons:[], avatar:'✍️', successRate:95, escrowVolume:67200, category:'Writing' },
  { id:'w6', name:'ProPlumber', score:891, tier:'Platinum', rating:4.89, jobs:420, responseTime:'0.5h', hourlyRate:70, matchPct:0, skills:['Residential','Commercial','Emergency','Permits'], matchReasons:[], avatar:'🔧', successRate:98, escrowVolume:156000, category:'Plumbing' },
  { id:'w7', name:'HVACKing', score:798, tier:'Gold', rating:4.82, jobs:178, responseTime:'1.5h', hourlyRate:80, matchPct:0, skills:['Installation','Repair','Maintenance','Ductwork'], matchReasons:[], avatar:'❄️', successRate:94, escrowVolume:98400, category:'HVAC' },
  { id:'w8', name:'PhotoLens', score:776, tier:'Silver', rating:4.80, jobs:203, responseTime:'2.8h', hourlyRate:55, matchPct:0, skills:['Portrait','Commercial','Events','Editing'], matchReasons:[], avatar:'📸', successRate:93, escrowVolume:72000, category:'Photography' },
];

/* ─── SMART PRICING DATA ───────────────────────────── */
const PRICING = {
  'Web Development': { low: 2000, mid: 5000, high: 15000, hourly: '$50–$120/hr' },
  'Mobile App': { low: 5000, mid: 15000, high: 50000, hourly: '$60–$150/hr' },
  'Graphic Design': { low: 200, mid: 800, high: 3000, hourly: '$30–$90/hr' },
  'UI/UX Design': { low: 500, mid: 2000, high: 8000, hourly: '$40–$100/hr' },
  'Writing': { low: 50, mid: 300, high: 1500, hourly: '$20–$60/hr' },
  'Plumbing': { low: 150, mid: 500, high: 2000, hourly: '$50–$100/hr' },
  'Electrical': { low: 200, mid: 800, high: 3000, hourly: '$60–$120/hr' },
};

/* ─── TIER COLORS ──────────────────────────────────── */
const tc = (t) => ({ Starter:'#94a3b8', Bronze:'#cd7f32', Silver:'#c0c0c0', Gold:'#ffd700', Platinum:'#e5e4e2', Diamond:'#b9f2ff' }[t] || '#94a3b8');

/* ═══════════════════════════════════════════════════════ */
export default function MarketplacePage() {
  const { user } = useAuth();
  const [step, setStep] = useState(0); // 0=browse/post, 1=describe, 2=AI matching, 3=results, 4=browse-pick, 5=confirm
  const [mode, setMode] = useState(''); // 'ai' or 'browse'
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobCat, setJobCat] = useState('Web Development');
  const [budget, setBudget] = useState('');
  const [urgency, setUrgency] = useState('standard');
  const [aiLoading, setAiLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [browseCat, setBrowseCat] = useState('All');
  const [browseSearch, setBrowseSearch] = useState('');
  const [confirming, setConfirming] = useState(false);

  const pricing = PRICING[jobCat] || null;
  const browseFiltered = BROWSE_WORKERS.filter(w => (browseCat === 'All' || w.category === browseCat) && (!browseSearch || w.name.toLowerCase().includes(browseSearch.toLowerCase())));

  const toggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(x => x !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  const startAiMatch = () => {
    setAiLoading(true);
    setTimeout(() => { setAiLoading(false); setStep(3); }, 2500); // Simulate AI processing
  };

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => { setConfirming(false); setStep(6); }, 1500);
  };

  const selectedWorkers = BROWSE_WORKERS.filter(w => selected.includes(w.id));

  /* ── Worker Card Component ──────────────────────── */
  const WorkerCard = ({ w, showMatch = false, selectable = false }) => {
    const isSelected = selected.includes(w.id);
    return (
      <div style={{
        background: isSelected ? 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(7,20,53,0.95))' : 'linear-gradient(135deg, rgba(7,20,53,0.9), rgba(5,26,74,0.7))',
        border: `1px solid ${isSelected ? 'rgba(201,168,76,0.3)' : showMatch ? `${tc(w.tier)}22` : 'rgba(6,182,212,0.1)'}`,
        borderRadius: 16, padding: '20px', transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
      }}>
        {showMatch && w.matchPct > 0 && (
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'linear-gradient(135deg, #22c55e, #06b6d4)', borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 800, color: '#020f2e' }}>{w.matchPct}% MATCH</div>
        )}

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${tc(w.tier)}18`, border: `2px solid ${tc(w.tier)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: `0 0 15px ${tc(w.tier)}22` }}>{w.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>@{w.name}</span>
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: tc(w.tier), padding: '1px 8px', borderRadius: 999, background: `${tc(w.tier)}12`, border: `1px solid ${tc(w.tier)}33` }}>{w.tier}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--muted)', flexWrap: 'wrap', marginBottom: 8 }}>
              <span>🛡 <strong style={{ color: tc(w.tier) }}>{w.score}</strong></span>
              <span>⭐ {w.rating}</span>
              <span>🏗 {w.jobs} jobs</span>
              <span>⚡ {w.responseTime} avg</span>
              <span>✅ {w.successRate}%</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {w.skills.slice(0, 4).map(s => (
                <span key={s} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 999, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)', color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>{s}</span>
              ))}
            </div>

            {showMatch && w.matchReasons.length > 0 && (
              <div style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#22c55e', letterSpacing: '0.1em', marginBottom: 4 }}>WHY THIS MATCH</div>
                {w.matchReasons.map((r, i) => (
                  <div key={i} style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 2 }}>
                    <span style={{ color: '#22c55e' }}>✓</span>{r}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--gold-2)' }}>${w.hourlyRate}</span>
                <span style={{ fontSize: 10, color: 'var(--muted)' }}>/hr</span>
                <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 12 }}>💰 ${(w.escrowVolume / 1000).toFixed(0)}K escrow volume</span>
              </div>
              {selectable && (
                <button onClick={() => toggleSelect(w.id)} style={{
                  fontSize: 11, padding: '8px 18px', borderRadius: 999, cursor: 'pointer', fontWeight: 600, border: 'none',
                  background: isSelected ? 'rgba(239,68,68,0.1)' : 'var(--gold)',
                  color: isSelected ? '#ef4444' : '#020f2e',
                }}>{isSelected ? '✕ Remove' : '+ Select'}</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1000 }} className="animate-fade-up">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 4 }}>Veritas Marketplace</h2>
        <p style={{ color: 'var(--muted)', fontSize: 12 }}>Trust-first hiring. No bid credits. No spam proposals. AI-powered matching or hand-pick your top 3.</p>
      </div>

      {/* ── Zero-fee banner ───────────────────────── */}
      <div style={{ background: 'linear-gradient(90deg, rgba(34,197,94,0.06), rgba(6,182,212,0.06))', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 12, padding: '12px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 20 }}>🎉</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#22c55e' }}>Zero bid credits. Zero proposal fees. Ever.</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Workers only pay 2.5% on completed escrows — never to apply. Clients post for free.</div>
        </div>
      </div>

      {/* ── STEP 0: Choose Mode ──────────────────── */}
      {step === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <button onClick={() => { setMode('ai'); setStep(1); }} style={{ background: 'linear-gradient(135deg, rgba(7,20,53,0.95), rgba(5,26,74,0.8))', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20, padding: '32px 24px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold-2)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>AI Smart Match</div>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 12 }}>Describe what you need. Our AI analyzes TruScores, skills, response times, escrow history, and peer reviews to find your perfect 3 workers.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Trust-Weighted','Skill Matched','Instant'].map(t => (
                <span key={t} style={{ fontSize: 9, padding: '3px 10px', borderRadius: 999, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--gold)' }}>{t}</span>
              ))}
            </div>
          </button>
          <button onClick={() => { setMode('browse'); setStep(4); }} style={{ background: 'linear-gradient(135deg, rgba(7,20,53,0.95), rgba(5,26,74,0.8))', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 20, padding: '32px 24px', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--cyan)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>Browse & Pick 3</div>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 12 }}>Browse verified workers by category, compare TruScores, and hand-pick your top 3. Each gets a direct invitation to respond within 24 hours.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Full Control','Compare Stats','24hr Response'].map(t => (
                <span key={t} style={{ fontSize: 9, padding: '3px 10px', borderRadius: 999, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', color: 'var(--cyan)' }}>{t}</span>
              ))}
            </div>
          </button>
        </div>
      )}

      {/* ── STEP 1: Describe Job ─────────────────── */}
      {step === 1 && (
        <div style={{ background: 'linear-gradient(135deg, rgba(7,20,53,0.95), rgba(5,26,74,0.8))', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20, padding: '28px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--gold)', marginBottom: 20 }}>🤖 Describe What You Need</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div><label className="v-label">Job Title</label><input className="v-input" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Full Stack Web App for Inventory" /></div>
            <div><label className="v-label">Category</label>
              <select className="v-input" value={jobCat} onChange={e => setJobCat(e.target.value)}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="v-label">Detailed Description</label>
            <textarea className="v-input" rows={4} value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder="The more detail you provide, the better the AI match. Include technologies, timeline, requirements, experience level..." style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label className="v-label">Budget ($)</label>
              <input className="v-input" type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder={pricing ? String(pricing.mid) : '5000'} />
              {pricing && <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>💡 Typical range for {jobCat}: <strong style={{ color: 'var(--gold)' }}>${pricing.low.toLocaleString()}–${pricing.high.toLocaleString()}</strong> ({pricing.hourly})</div>}
            </div>
            <div>
              <label className="v-label">Urgency</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {URGENCY.map(u => (
                  <button key={u.id} type="button" onClick={() => setUrgency(u.id)} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: `1px solid ${urgency === u.id ? 'var(--gold)' : 'var(--border-2)'}`, background: urgency === u.id ? 'rgba(201,168,76,0.08)' : 'transparent', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: 16 }}>{u.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: urgency === u.id ? 'var(--gold)' : 'var(--muted)', marginTop: 2 }}>{u.label}</div>
                    <div style={{ fontSize: 8, color: 'var(--muted)' }}>{u.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setStep(0)} className="btn btn-outline" style={{ fontSize: 12 }}>← Back</button>
            <button onClick={startAiMatch} className="btn btn-gold" style={{ flex: 1, padding: '14px 0', fontSize: 14, fontWeight: 800 }} disabled={!jobTitle || !jobDesc}>🤖 Find My Top 3 Workers →</button>
          </div>
        </div>
      )}

      {/* ── STEP 2: AI Processing ────────────────── */}
      {aiLoading && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'pulse 1.5s infinite' }}>🤖</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8 }}>Finding Your Perfect Match...</h3>
          <p style={{ color: 'var(--muted)', fontSize: 12 }}>Analyzing TruScores, skill embeddings, response times, and escrow history across 43,207 verified workers</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
            {['Parsing skills...','Matching trust profiles...','Ranking candidates...'].map((t, i) => (
              <span key={i} style={{ fontSize: 10, padding: '4px 12px', borderRadius: 999, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', animation: `fadeIn 0.5s ${i * 0.8}s both` }}>{t}</span>
            ))}
          </div>
          <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
        </div>
      )}

      {/* ── STEP 3: AI Results ────────────────────── */}
      {step === 3 && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--cyan)', letterSpacing: '0.15em', marginBottom: 4 }}>AI SMART MATCH COMPLETE</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 4 }}>Your Top 3 for &ldquo;{jobTitle}&rdquo;</h3>
            <p style={{ color: 'var(--muted)', fontSize: 12 }}>Ranked by trust-weighted match score. Select your workers to send invitations.</p>
          </div>
          <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
            {AI_MATCHES.map((w, i) => (
              <div key={w.id}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : '#cd7f32', marginBottom: 6, letterSpacing: '0.1em' }}>#{i + 1} {i === 0 ? 'BEST MATCH' : i === 1 ? 'STRONG MATCH' : 'GOOD MATCH'}</div>
                <WorkerCard w={w} showMatch selectable />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setStep(1)} className="btn btn-outline" style={{ fontSize: 12 }}>← Refine Search</button>
            <button onClick={() => setStep(5)} className="btn btn-gold" style={{ flex: 1, padding: '14px 0', fontSize: 14, fontWeight: 800 }} disabled={selected.length === 0}>
              Send Invitation{selected.length > 0 ? ` to ${selected.length} Worker${selected.length > 1 ? 's' : ''}` : ''} →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Browse & Pick ─────────────────── */}
      {step === 4 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Browse Verified Workers</div>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>Pick up to 3 workers. Each gets a direct invitation with 24hr guaranteed response.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-mono)', color: selected.length === 3 ? '#22c55e' : 'var(--gold)' }}>{selected.length}/3</div>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>selected</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <input className="v-input" value={browseSearch} onChange={e => setBrowseSearch(e.target.value)} placeholder="Search workers..." style={{ maxWidth: 200, marginBottom: 0 }} />
            {['All','Web Development','Graphic Design','Writing','Plumbing','Electrical','HVAC','Photography'].map(c => (
              <button key={c} onClick={() => setBrowseCat(c)} style={{ fontSize: 10, padding: '5px 12px', borderRadius: 999, border: `1px solid ${browseCat === c ? 'var(--cyan)' : 'var(--border-2)'}`, background: browseCat === c ? 'rgba(6,182,212,0.1)' : 'transparent', color: browseCat === c ? 'var(--cyan)' : 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>{c}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
            {browseFiltered.map(w => <WorkerCard key={w.id} w={w} selectable />)}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => { setStep(0); setSelected([]); }} className="btn btn-outline" style={{ fontSize: 12 }}>← Back</button>
            <button onClick={() => setStep(5)} className="btn btn-gold" style={{ flex: 1, padding: '14px 0', fontSize: 14, fontWeight: 800 }} disabled={selected.length === 0}>
              Invite {selected.length} Worker{selected.length > 1 ? 's' : ''} →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5: Confirm & Send ────────────────── */}
      {step === 5 && (
        <div style={{ background: 'linear-gradient(135deg, rgba(7,20,53,0.95), rgba(5,26,74,0.8))', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20, padding: '28px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--gold)', marginBottom: 20 }}>✉️ Confirm & Send Invitations</div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>These workers will receive your job invitation and have 24 hours to respond. If they accept, they commit to a conversation — no ghosting.</p>
          <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
            {selectedWorkers.map(w => (
              <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${tc(w.tier)}18`, border: `1px solid ${tc(w.tier)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{w.avatar}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>@{w.name}</div><div style={{ fontSize: 10, color: 'var(--muted)' }}>{w.tier} · {w.score} TruScore · ${w.hourlyRate}/hr</div></div>
                <button onClick={() => toggleSelect(w.id)} style={{ fontSize: 10, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕ Remove</button>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 11, color: 'var(--muted)' }}>
            <strong style={{ color: '#22c55e' }}>Guaranteed Response:</strong> Workers who accept your invitation commit to respond within 24 hours. Non-responders lose TruScore points — ensuring you never get ghosted.
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setStep(mode === 'ai' ? 3 : 4)} className="btn btn-outline" style={{ fontSize: 12 }}>← Back</button>
            <button onClick={handleConfirm} className="btn btn-gold" style={{ flex: 1, padding: '14px 0', fontSize: 14, fontWeight: 800 }}>{confirming ? '⏳ Sending...' : `🚀 Send ${selected.length} Invitation${selected.length > 1 ? 's' : ''}`}</button>
          </div>
        </div>
      )}

      {/* ── STEP 6: Success ───────────────────────── */}
      {step === 6 && (
        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎯</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--gold-2)', marginBottom: 8 }}>Invitations Sent!</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24, maxWidth: 450, margin: '0 auto 24px' }}>Your selected workers have been notified. They have 24 hours to accept. You will receive a notification when they respond.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <a href="/dashboard" className="btn btn-gold" style={{ textDecoration: 'none', fontSize: 14, padding: '12px 28px' }}>Dashboard</a>
            <button onClick={() => { setStep(0); setSelected([]); setJobTitle(''); setJobDesc(''); setBudget(''); }} className="btn btn-cyan" style={{ fontSize: 14, padding: '12px 28px' }}>Post Another Job</button>
          </div>
        </div>
      )}
    </div>
  );
}
