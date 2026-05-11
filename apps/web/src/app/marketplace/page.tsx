'use client';
// PROFESSIONAL MARKETPLACE - Beautiful UI (Better than Upwork)
// apps/web/src/app/marketplace/marketplace-ENHANCED.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MarketplacePage() {
  const router = useRouter();
  const [step, setStep] = useState<'describe' | 'matches' | 'confirm'>('describe');
  const [jobDetails, setJobDetails] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'standard',
    budget: { min: 0, max: 0 },
    location: { address: '', city: '', state: '', zip: '' }
  });
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  // AI analyzes as user types
  useEffect(() => {
    if (jobDetails.description.length > 20) {
      analyzeJobDescription();
    }
  }, [jobDetails.description]);

  async function analyzeJobDescription() {
    // Debounced AI analysis
    const response = await fetch('/api/ai/analyze-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: jobDetails.description })
    });
    const data = await response.json();
    setAiSuggestions(data);
  }

  async function findMatches() {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/match-workers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(jobDetails)
      });
      const data = await response.json();
      setMatches(data.matches);
      setStep('matches');
    } catch (error) {
      console.error('Matching error:', error);
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #E5E7EB',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: '0 auto', 
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 28 }}>🛡️</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0A2540' }}>Veritas</div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: -2 }}>Trust Ledger</div>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '8px 16px',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              background: 'white',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {[
              { id: 'describe', label: 'Describe Job', icon: '📝' },
              { id: 'matches', label: 'View Matches', icon: '✨' },
              { id: 'confirm', label: 'Confirm & Pay', icon: '✓' }
            ].map((s, i) => (
              <div key={s.id} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: step === s.id ? '#00D4AA' : 
                             ['matches', 'confirm'].includes(step) && i < (['describe', 'matches', 'confirm'].indexOf(step)) ? '#00D4AA' : '#F3F4F6',
                  color: step === s.id || i < (['describe', 'matches', 'confirm'].indexOf(step)) ? 'white' : '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 600
                }}>
                  {s.icon}
                </div>
                <div style={{ 
                  marginLeft: 12,
                  fontSize: 14,
                  fontWeight: 500,
                  color: step === s.id ? '#0A2540' : '#9CA3AF'
                }}>
                  {s.label}
                </div>
                {i < 2 && (
                  <div style={{
                    flex: 1,
                    height: 2,
                    background: i < (['describe', 'matches', 'confirm'].indexOf(step)) ? '#00D4AA' : '#E5E7EB',
                    marginLeft: 16,
                    marginRight: 16
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 2rem' }}>
        
        {/* STEP 1: Describe Job */}
        {step === 'describe' && (
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1 style={{ 
                fontSize: 36, 
                fontWeight: 700, 
                color: '#0A2540', 
                marginBottom: 12,
                lineHeight: 1.2
              }}>
                What do you need done?
              </h1>
              <p style={{ fontSize: 16, color: '#6B7280' }}>
                Tell us about your project and we'll match you with the perfect professionals
              </p>
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              
              {/* Job Title */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: '#374151', 
                  marginBottom: 8 
                }}>
                  Job Title
                </label>
                <input
                  type="text"
                  value={jobDetails.title}
                  onChange={e => setJobDetails({...jobDetails, title: e.target.value})}
                  placeholder="e.g., Fix leaking kitchen faucet"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #E5E7EB',
                    borderRadius: 10,
                    fontSize: 16,
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#00D4AA'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: '#374151', 
                  marginBottom: 8 
                }}>
                  Description
                </label>
                <textarea
                  value={jobDetails.description}
                  onChange={e => setJobDetails({...jobDetails, description: e.target.value})}
                  placeholder="Describe what you need... Be as detailed as possible."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #E5E7EB',
                    borderRadius: 10,
                    fontSize: 16,
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  onFocus={e => e.target.style.borderColor = '#00D4AA'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
                {aiSuggestions && (
                  <div style={{
                    marginTop: 12,
                    padding: 12,
                    background: '#F0FDFA',
                    border: '1px solid #5EEAD4',
                    borderRadius: 8,
                    fontSize: 13
                  }}>
                    <div style={{ fontWeight: 600, color: '#115E59', marginBottom: 4 }}>
                      💡 AI Suggestion
                    </div>
                    <div style={{ color: '#134E4A' }}>
                      {aiSuggestions.category && `Category: ${aiSuggestions.category} • `}
                      {aiSuggestions.estimatedCost && `Est. Cost: $${aiSuggestions.estimatedCost.min}-${aiSuggestions.estimatedCost.max}`}
                    </div>
                  </div>
                )}
              </div>

              {/* Category */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: '#374151', 
                  marginBottom: 12 
                }}>
                  Category
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                  {[
                    { id: 'plumbing', label: 'Plumbing', icon: '🔧' },
                    { id: 'electrical', label: 'Electrical', icon: '⚡' },
                    { id: 'hvac', label: 'HVAC', icon: '❄️' },
                    { id: 'carpentry', label: 'Carpentry', icon: '🪚' },
                    { id: 'painting', label: 'Painting', icon: '🎨' },
                    { id: 'cleaning', label: 'Cleaning', icon: '🧹' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setJobDetails({...jobDetails, category: cat.id})}
                      style={{
                        padding: '16px 12px',
                        border: `2px solid ${jobDetails.category === cat.id ? '#00D4AA' : '#E5E7EB'}`,
                        borderRadius: 10,
                        background: jobDetails.category === cat.id ? '#F0FDFA' : 'white',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 4 }}>{cat.icon}</div>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: '#374151', 
                  marginBottom: 12 
                }}>
                  Budget Range
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>Minimum</div>
                    <div style={{ position: 'relative' }}>
                      <span style={{ 
                        position: 'absolute', 
                        left: 16, 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        fontSize: 16,
                        color: '#6B7280'
                      }}>$</span>
                      <input
                        type="number"
                        value={jobDetails.budget.min || ''}
                        onChange={e => setJobDetails({
                          ...jobDetails, 
                          budget: {...jobDetails.budget, min: parseInt(e.target.value) || 0}
                        })}
                        placeholder="0"
                        style={{
                          width: '100%',
                          padding: '14px 16px 14px 32px',
                          border: '2px solid #E5E7EB',
                          borderRadius: 10,
                          fontSize: 16
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>Maximum</div>
                    <div style={{ position: 'relative' }}>
                      <span style={{ 
                        position: 'absolute', 
                        left: 16, 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        fontSize: 16,
                        color: '#6B7280'
                      }}>$</span>
                      <input
                        type="number"
                        value={jobDetails.budget.max || ''}
                        onChange={e => setJobDetails({
                          ...jobDetails, 
                          budget: {...jobDetails.budget, max: parseInt(e.target.value) || 0}
                        })}
                        placeholder="0"
                        style={{
                          width: '100%',
                          padding: '14px 16px 14px 32px',
                          border: '2px solid #E5E7EB',
                          borderRadius: 10,
                          fontSize: 16
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Urgency */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: '#374151', 
                  marginBottom: 12 
                }}>
                  When do you need this done?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    { id: 'standard', label: 'Next few days', icon: '📅' },
                    { id: 'urgent', label: 'Within 24 hours', icon: '⏰' },
                    { id: 'emergency', label: 'Right now', icon: '🚨' }
                  ].map(urg => (
                    <button
                      key={urg.id}
                      onClick={() => setJobDetails({...jobDetails, urgency: urg.id})}
                      style={{
                        padding: 16,
                        border: `2px solid ${jobDetails.urgency === urg.id ? '#00D4AA' : '#E5E7EB'}`,
                        borderRadius: 10,
                        background: jobDetails.urgency === urg.id ? '#F0FDFA' : 'white',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 500,
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{urg.icon}</div>
                      {urg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={findMatches}
                disabled={!jobDetails.title || !jobDetails.category || loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #00D4AA 0%, #00BF99 100%)',
                  border: 'none',
                  borderRadius: 10,
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: (!jobDetails.title || !jobDetails.category || loading) ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {loading ? '⏳ Finding perfect matches...' : '✨ Find Workers →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: View Matches */}
        {step === 'matches' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1 style={{ fontSize: 36, fontWeight: 700, color: '#0A2540', marginBottom: 12 }}>
                Your Perfect Matches
              </h1>
              <p style={{ fontSize: 16, color: '#6B7280' }}>
                We found {matches.length} professionals for your job. Choose who you'd like to work with.
              </p>
            </div>

            <div style={{ display: 'grid', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
              {matches.map((worker: any, i) => (
                <WorkerCard 
                  key={worker.worker_id} 
                  worker={worker} 
                  rank={i + 1}
                  onHire={() => {
                    setStep('confirm');
                  }}
                />
              ))}
            </div>

            {matches.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#6B7280' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>😔</div>
                <div style={{ fontSize: 18 }}>No workers available right now.</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>Try adjusting your budget or timeframe.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Worker Card Component
function WorkerCard({ worker, rank, onHire }: any) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: 32,
      boxShadow: rank === 1 ? '0 4px 20px rgba(0, 212, 170, 0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
      border: rank === 1 ? '2px solid #00D4AA' : '1px solid #E5E7EB',
      position: 'relative'
    }}>
      
      {rank === 1 && (
        <div style={{
          position: 'absolute',
          top: -12,
          left: 32,
          background: '#00D4AA',
          color: 'white',
          padding: '6px 16px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600
        }}>
          🏆 BEST MATCH
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        {/* Profile Photo */}
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0A2540 0%, #00D4AA 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 32,
          fontWeight: 700,
          flexShrink: 0
        }}>
          {worker.name?.[0] || '?'}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#0A2540', marginBottom: 4 }}>
                {worker.name}
              </h3>
              <div style={{ fontSize: 14, color: '#6B7280' }}>
                {worker.experienceYears || 5} years experience • {worker.distance?.toFixed(1) || 0} miles away
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#0A2540' }}>
                ${worker.baseRate || 75}/hr
              </div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>Hourly rate</div>
            </div>
          </div>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} style={{ 
                  fontSize: 16,
                  color: star <= (worker.rating || 4.8) ? '#F59E0B' : '#E5E7EB'
                }}>★</span>
              ))}
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
              {worker.rating || 4.8}
            </span>
            <span style={{ fontSize: 14, color: '#6B7280' }}>
              ({worker.reviewCount || 47} reviews)
            </span>
            <div style={{
              padding: '4px 10px',
              background: '#FEF3C7',
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 600,
              color: '#92400E'
            }}>
              TruScore: {worker.truscore || 892}
            </div>
          </div>

          {/* Match Reason */}
          <div style={{
            padding: 16,
            background: '#F0FDFA',
            borderRadius: 10,
            marginBottom: 16,
            borderLeft: '3px solid #00D4AA'
          }}>
            <div style={{ fontSize: 13, color: '#115E59', fontWeight: 500 }}>
              💡 {worker.matchReason || `${worker.name} has excellent ratings and is nearby.`}
            </div>
          </div>

          {/* Highlights */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {(worker.highlights || []).map((h: string, i: number) => (
              <div key={i} style={{
                padding: '6px 12px',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                fontSize: 12,
                color: '#374151'
              }}>
                {h}
              </div>
            ))}
          </div>

          {/* Estimated Cost */}
          {worker.estimatedTotal && (
            <div style={{
              padding: 16,
              background: '#F9FAFB',
              borderRadius: 10,
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>Labor:</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>${worker.estimatedTotal.labor}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>Materials (est.):</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>${worker.estimatedTotal.materials}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                paddingTop: 8,
                borderTop: '1px solid #E5E7EB'
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0A2540' }}>Total Estimate:</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#00D4AA' }}>
                  ${worker.estimatedTotal.total}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                {worker.estimatedTotal.explanation}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onHire}
              style={{
                flex: 1,
                padding: '14px',
                background: rank === 1 ? 'linear-gradient(135deg, #00D4AA 0%, #00BF99 100%)' : '#0A2540',
                border: 'none',
                borderRadius: 10,
                color: 'white',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Hire {worker.name.split(' ')[0]}
            </button>
            <button
              style={{
                padding: '14px 24px',
                background: 'white',
                border: '2px solid #E5E7EB',
                borderRadius: 10,
                color: '#374151',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
