'use client';

import { useState } from 'react';

const THREADS = [
  { id:'t1', name:'Marcus Thompson', initials:'MT', last:'Sounds good! I\'ll send the final files by tomorrow morning.', time:'2m ago',   unread:2, job:'Web Dev Phase 2',    online:true  },
  { id:'t2', name:'Aria Santos',     initials:'AS', last:'Can you review the latest logo concepts I sent over?',        time:'1h ago',  unread:0, job:'Logo Design',         online:true  },
  { id:'t3', name:'Bob Klein',       initials:'BK', last:'The repair is scheduled for Thursday at 2pm.',               time:'3h ago',  unread:1, job:'Plumbing Repair',     online:false },
  { id:'t4', name:'Diana Wu',        initials:'DW', last:'Payment has been released. Great work on the project!',      time:'Yesterday',unread:0,job:'Mobile App UI',       online:false },
  { id:'t5', name:'Veritas Support', initials:'VS', last:'Your dispute case has been assigned to a mediator.',         time:'2d ago',  unread:2, job:'Support Case #4821',  online:true  },
];

const MESSAGES: Record<string, { from:'me'|'them'; text:string; time:string }[]> = {
  t1: [
    { from:'them', text:'Hey! Quick update on Phase 2 — backend API is 80% done.', time:'10:21 AM' },
    { from:'me',   text:'Great progress! When do you think the full build will be ready?', time:'10:24 AM' },
    { from:'them', text:'I\'m targeting end of this week. Want to hop on a call Thursday?', time:'10:26 AM' },
    { from:'me',   text:'Thursday works. Let\'s do 3pm EST.', time:'10:28 AM' },
    { from:'them', text:'Sounds good! I\'ll send the final files by tomorrow morning.', time:'11:45 AM' },
  ],
  t2: [
    { from:'them', text:'Hi Emma! I\'ve uploaded three logo concepts to the shared folder.', time:'9:00 AM' },
    { from:'me',   text:'I\'ll take a look and give you feedback today.', time:'9:15 AM' },
    { from:'them', text:'Can you review the latest logo concepts I sent over?', time:'9:18 AM' },
  ],
  t3: [
    { from:'them', text:'I\'ve assessed the issue — it\'s a main supply line blockage.', time:'Yesterday' },
    { from:'me',   text:'How long will the repair take?', time:'Yesterday' },
    { from:'them', text:'The repair is scheduled for Thursday at 2pm.', time:'Yesterday' },
  ],
  t4: [
    { from:'them', text:'The final deliverables have been submitted. All screens included!', time:'2d ago' },
    { from:'me',   text:'Everything looks amazing. Releasing payment now.', time:'2d ago' },
    { from:'them', text:'Payment has been released. Great work on the project!', time:'2d ago' },
  ],
  t5: [
    { from:'them', text:'Hello Emma, we\'ve received your dispute case #4821.', time:'2d ago' },
    { from:'them', text:'Your dispute case has been assigned to a mediator.', time:'2d ago' },
  ],
};

export default function MessagesPage() {
  const [active, setActive] = useState('t1');
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState(MESSAGES);
  const [threads, setThreads] = useState(THREADS);

  const thread = threads.find(t => t.id === active)!;
  const msgs = localMessages[active] ?? [];

  function send() {
    if (!input.trim()) return;
    const msg = { from: 'me' as const, text: input.trim(), time: 'Just now' };
    setLocalMessages(prev => ({ ...prev, [active]: [...(prev[active]??[]), msg] }));
    setThreads(prev => prev.map(t => t.id === active ? { ...t, last: input.trim(), time: 'Just now', unread: 0 } : t));
    setInput('');
  }

  return (
    <div style={{ maxWidth:1100, height:'calc(100vh - 140px)', display:'flex', flexDirection:'column' }}>
      <div className="animate-fade-up" style={{ marginBottom:'1rem' }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, marginBottom:4 }}>Messages</h2>
        <p style={{ fontSize:13, color:'var(--muted)' }}>
          {threads.reduce((s,t)=>s+t.unread,0)} unread messages
        </p>
      </div>

      <div className="animate-fade-up-2" style={{ flex:1, display:'grid', gridTemplateColumns:'300px 1fr', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', overflow:'hidden', minHeight:0 }}>

        {/* Thread List */}
        <div style={{ borderRight:'1px solid var(--border)', overflowY:'auto', background:'rgba(1,12,38,0.5)' }}>
          {threads.map(t => (
            <div key={t.id} onClick={() => { setActive(t.id); setThreads(prev => prev.map(th => th.id === t.id ? { ...th, unread:0 } : th)); }}
              style={{ padding:'14px 16px', cursor:'pointer', borderBottom:'1px solid var(--border)', transition:'background 0.15s',
                background: active === t.id ? 'rgba(6,182,212,0.08)' : 'transparent',
                borderLeft: active === t.id ? '3px solid var(--cyan)' : '3px solid transparent',
              }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,var(--navy-3),var(--cyan))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:600 }}>
                    {t.initials}
                  </div>
                  {t.online && <div style={{ position:'absolute', bottom:1, right:1, width:9, height:9, borderRadius:'50%', background:'var(--success)', border:'1.5px solid var(--navy)' }} />}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
                    <span style={{ fontSize:13, fontWeight: t.unread > 0 ? 600 : 400 }}>{t.name}</span>
                    <span style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--font-mono)', flexShrink:0 }}>{t.time}</span>
                  </div>
                  <div style={{ fontSize:11, color:'var(--muted)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:2 }}>{t.last}</div>
                  <div style={{ fontSize:10, color:'var(--cyan)', fontFamily:'var(--font-mono)' }}>{t.job}</div>
                </div>
                {t.unread > 0 && <div style={{ background:'var(--danger)', color:'#fff', fontSize:10, fontFamily:'var(--font-mono)', padding:'1px 6px', borderRadius:999, flexShrink:0 }}>{t.unread}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Message View */}
        <div style={{ display:'flex', flexDirection:'column', background:'rgba(2,15,46,0.4)', minHeight:0 }}>

          {/* Chat Header */}
          <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
            <div style={{ position:'relative' }}>
              <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,var(--navy-3),var(--cyan))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:600 }}>
                {thread.initials}
              </div>
              {thread.online && <div style={{ position:'absolute', bottom:1, right:1, width:9, height:9, borderRadius:'50%', background:'var(--success)', border:'1.5px solid var(--navy)' }} />}
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:500 }}>{thread.name}</div>
              <div style={{ fontSize:11, color: thread.online ? 'var(--success)' : 'var(--muted)' }}>
                {thread.online ? '● Online' : '○ Offline'} · {thread.job}
              </div>
            </div>
            <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
              <button className="btn btn-outline" style={{ fontSize:12, padding:'5px 12px' }}>View Escrow</button>
              <button className="btn btn-outline" style={{ fontSize:12, padding:'5px 12px' }}>📋 Files</button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'1.25rem', display:'flex', flexDirection:'column', gap:10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display:'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth:'68%', padding:'10px 14px', borderRadius: m.from === 'me' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.from === 'me' ? 'linear-gradient(135deg,var(--cyan),var(--cyan-2))' : 'rgba(255,255,255,0.06)',
                  border: m.from === 'me' ? 'none' : '1px solid var(--border)',
                  color: m.from === 'me' ? 'var(--navy)' : 'var(--white)',
                }}>
                  <div style={{ fontSize:13, lineHeight:1.5, fontWeight: m.from === 'me' ? 500 : 400 }}>{m.text}</div>
                  <div style={{ fontSize:10, marginTop:4, opacity:0.65, textAlign: m.from === 'me' ? 'right' : 'left', fontFamily:'var(--font-mono)' }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding:'1rem', borderTop:'1px solid var(--border)', display:'flex', gap:10, flexShrink:0 }}>
            <input className="v-input" style={{ flex:1 }} placeholder="Type a message…"
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()} />
            <button className="btn btn-cyan" onClick={send} disabled={!input.trim()}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
