'use client';

const PARTNERS = [
  { id:'p1', name:'Craigslist',  category:'Marketplace', status:'connected', jobs:48, icon:'📋', color:'#7b68ee', desc:'Your TruScore badge appears on all Craigslist service listings.' },
  { id:'p2', name:'Angi',        category:'Home Services',status:'connected', jobs:31, icon:'🏠', color:'#f97316', desc:'Verified Angi Pro with Veritas trust seal on your profile.' },
  { id:'p3', name:'Thumbtack',   category:'Marketplace', status:'connected', jobs:24, icon:'📌', color:'#22d3ee', desc:'Thumbtack customers see your live TruScore before hiring.' },
  { id:'p4', name:'TaskRabbit',  category:'Gig Platform', status:'available', jobs:0,  icon:'🐇', color:'#22c55e', desc:'Connect to display your reputation on TaskRabbit listings.' },
  { id:'p5', name:'Upwork',      category:'Freelance',   status:'available', jobs:0,  icon:'💻', color:'#6ee7b7', desc:'Bring your Veritas score to Upwork proposals and profiles.' },
  { id:'p6', name:'Fiverr',      category:'Freelance',   status:'available', jobs:0,  icon:'🟢', color:'#1dbf73', desc:'Display your TruScore badge on Fiverr service pages.' },
  { id:'p7', name:'HomeAdvisor', category:'Home Services',status:'available', jobs:0,  icon:'🔨', color:'#f59e0b', desc:'Verified HomeAdvisor pro with Veritas trust credentials.' },
  { id:'p8', name:'Bark.com',    category:'Marketplace', status:'coming',    jobs:0,  icon:'🐾', color:'#a855f7', desc:'Integration coming soon — join the waitlist.' },
];

export default function PartnersPage() {
  const connected = PARTNERS.filter(p => p.status === 'connected');
  const available = PARTNERS.filter(p => p.status === 'available');
  const coming    = PARTNERS.filter(p => p.status === 'coming');

  const Section = ({ title, items }: { title: string; items: typeof PARTNERS }) => (
    <div style={{ marginBottom:'2rem' }}>
      <div style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--muted)', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'1rem' }}>{title}</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
        {items.map(p => (
          <div key={p.id} className="card" style={{ transition:'all 0.2s', opacity: p.status === 'coming' ? 0.6 : 1 }}
            onMouseEnter={e => { if (p.status !== 'coming') (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:`${p.color}18`, border:`1px solid ${p.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                {p.icon}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                  <span style={{ fontSize:14, fontWeight:500 }}>{p.name}</span>
                  {p.status === 'connected' && <span className="status-pill active">Connected</span>}
                  {p.status === 'coming' && <span style={{ fontSize:9, fontFamily:'var(--font-mono)', padding:'2px 7px', borderRadius:999, background:'rgba(168,85,247,0.12)', border:'1px solid rgba(168,85,247,0.3)', color:'#c084fc', textTransform:'uppercase' }}>Soon</span>}
                </div>
                <div style={{ fontSize:11, color:'var(--muted)' }}>{p.category}</div>
              </div>
            </div>
            <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6, marginBottom:14 }}>{p.desc}</p>
            {p.status === 'connected' && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:12, color:'var(--muted)' }}>{p.jobs} jobs via this platform</span>
                <button className="btn btn-outline" style={{ fontSize:11, padding:'4px 12px' }}>Manage</button>
              </div>
            )}
            {p.status === 'available' && (
              <button className="btn btn-gold" style={{ width:'100%', fontSize:13 }}>Connect</button>
            )}
            {p.status === 'coming' && (
              <button className="btn btn-outline" style={{ width:'100%', fontSize:13 }}>Join Waitlist</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:1100 }}>
      <div className="animate-fade-up" style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, marginBottom:6 }}>Partner Network</h2>
        <p style={{ fontSize:13, color:'var(--muted)' }}>Your TruScore works everywhere. Connect platforms to display your verified reputation across the web.</p>
      </div>

      {/* Stats */}
      <div className="animate-fade-up-2" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.75rem' }}>
        {[
          { icon:'🌐', label:'Connected',     value:connected.length,  color:'var(--success)' },
          { icon:'🔗', label:'Available',     value:available.length,  color:'var(--cyan-2)'  },
          { icon:'💼', label:'Partner Jobs',  value:'103',             color:'var(--gold-2)'  },
          { icon:'⭐', label:'Avg Trust Lift', value:'+31%',           color:'var(--gold-2)'  },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign:'center' }}>
            <div style={{ fontSize:22, marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:26, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Network banner */}
      <div className="animate-fade-up-2 network-banner" style={{ marginBottom:'1.75rem' }}>
        <span style={{ fontSize:28 }}>🛡</span>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:14, color:'var(--gold-2)', marginBottom:3 }}>Your TruScore Badge is Live</div>
          <div style={{ fontSize:12, color:'var(--muted)' }}>
            Serial: <span style={{ fontFamily:'var(--font-mono)', color:'var(--cyan-2)' }}>VTX-EMMAJ-912-D24A</span> · Accepted on all connected platforms · Real-time sync enabled
          </div>
        </div>
        <span className="status-pill active" style={{ flexShrink:0 }}>All Systems Active</span>
      </div>

      <div className="animate-fade-up-3">
        <Section title={`✓ Connected (${connected.length})`} items={connected} />
        <Section title={`+ Available to Connect (${available.length})`} items={available} />
        <Section title={`⏳ Coming Soon (${coming.length})`} items={coming} />
      </div>
    </div>
  );
}
