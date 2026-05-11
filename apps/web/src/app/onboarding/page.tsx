'use client';
// WORKER ONBOARDING - Complete Multi-Step Flow
// apps/web/src/app/onboarding/worker-onboarding.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    // Step 1: Services
    primaryServices: [],
    secondaryServices: [],
    experienceYears: {},
    
    // Step 2: Rates
    hasBaseRate: true,
    baseRateHourly: 0,
    serviceRates: [],
    travelFee: 0,
    emergencyRate: 1.5,
    
    // Step 3: Service Area
    primaryZip: '',
    travelRadius: 15,
    serviceAreas: [],
    
    // Step 4: Portfolio
    photos: [],
    videoIntro: null,
    
    // Step 5: Verification
    governmentId: null,
    businessLicense: null,
    insurance: null,
    
    // Step 6: Schedule
    workingHours: {},
    daysAvailable: [],
    responseTimeCommitment: '1hour',
    
    // Step 7: Preferences
    jobSizePreference: ['small', 'medium'],
    clientTypePreference: ['residential']
  });

  const totalSteps = 7;

  async function saveProgress() {
    const token = localStorage.getItem('token');
    await fetch('/api/workers/onboarding/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ step, profile })
    });
  }

  async function completeOnboarding() {
    const token = localStorage.getItem('token');
    await fetch('/api/workers/onboarding/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(profile)
    });
    router.push('/dashboard?onboarding=complete');
  }

  const progress = (step / totalSteps) * 100;

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      {/* Header with Progress */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '1.5rem 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
              Step {step} of {totalSteps}
            </div>
            <div style={{ 
              height: 6, 
              background: '#E5E7EB', 
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #00D4AA 0%, #00BF99 100%)',
                width: `${progress}%`,
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0A2540' }}>
            {step === 1 && 'What services do you offer?'}
            {step === 2 && 'Set your rates'}
            {step === 3 && 'Where do you work?'}
            {step === 4 && 'Show your work'}
            {step === 5 && 'Get verified'}
            {step === 6 && 'Your schedule'}
            {step === 7 && 'Final preferences'}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          
          {/* STEP 1: Services */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                  Select your primary services (Choose 1-3)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                  {[
                    'Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Painting', 'Cleaning',
                    'Landscaping', 'Roofing', 'Flooring', 'Drywall', 'Appliance Repair', 'Moving'
                  ].map(service => {
                    const isSelected = profile.primaryServices.includes(service);
                    return (
                      <button
                        key={service}
                        onClick={() => {
                          const current = profile.primaryServices;
                          if (isSelected) {
                            setProfile({
                              ...profile,
                              primaryServices: current.filter(s => s !== service)
                            });
                          } else if (current.length < 3) {
                            setProfile({
                              ...profile,
                              primaryServices: [...current, service]
                            });
                          }
                        }}
                        style={{
                          padding: '16px 12px',
                          border: `2px solid ${isSelected ? '#00D4AA' : '#E5E7EB'}`,
                          borderRadius: 10,
                          background: isSelected ? '#F0FDFA' : 'white',
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 500
                        }}
                      >
                        {service}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Experience Years */}
              {profile.primaryServices.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16 }}>
                    Years of experience
                  </label>
                  {profile.primaryServices.map(service => (
                    <div key={service} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid #F3F4F6'
                    }}>
                      <span style={{ fontSize: 14, color: '#374151' }}>{service}</span>
                      <select
                        value={profile.experienceYears[service] || ''}
                        onChange={e => setProfile({
                          ...profile,
                          experienceYears: {
                            ...profile.experienceYears,
                            [service]: e.target.value
                          }
                        })}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #E5E7EB',
                          borderRadius: 6,
                          fontSize: 14
                        }}
                      >
                        <option value="">Select years</option>
                        <option value="0-1">Less than 1 year</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-10">5-10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Rates */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                  How do you charge?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button
                    onClick={() => setProfile({...profile, hasBaseRate: true})}
                    style={{
                      padding: 20,
                      border: `2px solid ${profile.hasBaseRate ? '#00D4AA' : '#E5E7EB'}`,
                      borderRadius: 10,
                      background: profile.hasBaseRate ? '#F0FDFA' : 'white',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>One rate for everything</div>
                    <div style={{ fontSize: 13, color: '#6B7280' }}>Simple pricing</div>
                  </button>
                  <button
                    onClick={() => setProfile({...profile, hasBaseRate: false})}
                    style={{
                      padding: 20,
                      border: `2px solid ${!profile.hasBaseRate ? '#00D4AA' : '#E5E7EB'}`,
                      borderRadius: 10,
                      background: !profile.hasBaseRate ? '#F0FDFA' : 'white',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 8 }}>🎯</div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Different rates by service</div>
                    <div style={{ fontSize: 13, color: '#6B7280' }}>Custom pricing</div>
                  </button>
                </div>
              </div>

              {profile.hasBaseRate ? (
                <div>
                  <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    Your hourly rate
                  </label>
                  <div style={{ position: 'relative', maxWidth: 300 }}>
                    <span style={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 18,
                      fontWeight: 600,
                      color: '#6B7280'
                    }}>$</span>
                    <input
                      type="number"
                      value={profile.baseRateHourly || ''}
                      onChange={e => setProfile({...profile, baseRateHourly: parseInt(e.target.value) || 0})}
                      placeholder="75"
                      style={{
                        width: '100%',
                        padding: '16px 16px 16px 36px',
                        border: '2px solid #E5E7EB',
                        borderRadius: 10,
                        fontSize: 24,
                        fontWeight: 700
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 14,
                      color: '#6B7280'
                    }}>/hour</span>
                  </div>
                  <div style={{ 
                    marginTop: 12, 
                    padding: 12, 
                    background: '#F0FDFA', 
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#115E59'
                  }}>
                    💡 Most professionals in your area charge $65-$95/hr
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                    Set rates for each service
                  </label>
                  {profile.primaryServices.map(service => (
                    <div key={service} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 6 }}>{service}</div>
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
                          placeholder="75"
                          style={{
                            width: '100%',
                            padding: '12px 16px 12px 36px',
                            border: '1px solid #E5E7EB',
                            borderRadius: 8,
                            fontSize: 16
                          }}
                        />
                        <span style={{
                          position: 'absolute',
                          right: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: 13,
                          color: '#6B7280'
                        }}>/hour</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Service Area */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Primary ZIP Code
                </label>
                <input
                  type="text"
                  value={profile.primaryZip}
                  onChange={e => setProfile({...profile, primaryZip: e.target.value})}
                  placeholder="98101"
                  maxLength={5}
                  style={{
                    width: 200,
                    padding: '14px 16px',
                    border: '2px solid #E5E7EB',
                    borderRadius: 10,
                    fontSize: 16
                  }}
                />
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                  How far will you travel?
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 24,
                  background: '#F9FAFB',
                  borderRadius: 10
                }}>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={profile.travelRadius}
                    onChange={e => setProfile({...profile, travelRadius: parseInt(e.target.value)})}
                    style={{ flex: 1 }}
                  />
                  <div style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: '#00D4AA',
                    minWidth: 100,
                    textAlign: 'right'
                  }}>
                    {profile.travelRadius} mi
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Portfolio */}
          {step === 4 && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                  Upload work photos (5-10 photos)
                </label>
                <div
                  style={{
                    border: '2px dashed #E5E7EB',
                    borderRadius: 10,
                    padding: 48,
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#FAFAFA'
                  }}
                  onClick={() => {/* TODO: File upload */}}
                >
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                    Click to upload photos
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>
                    JPG, PNG up to 5MB each
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                  Video introduction (optional)
                </label>
                <div
                  style={{
                    border: '2px dashed #E5E7EB',
                    borderRadius: 10,
                    padding: 48,
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#FAFAFA'
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🎥</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                    Record or upload video
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>
                    30-60 seconds introducing yourself
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Verification */}
          {step === 5 && (
            <div>
              <div style={{
                marginBottom: 32,
                padding: 16,
                background: '#FEF3C7',
                borderRadius: 10,
                borderLeft: '4px solid #F59E0B'
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>
                  🔒 Why verification matters
                </div>
                <div style={{ fontSize: 13, color: '#78350F' }}>
                  Verified workers get 3x more jobs. Clients trust verified pros.
                </div>
              </div>

              <VerificationUpload 
                label="Government ID"
                description="Driver's license or passport"
                icon="🪪"
              />
              <VerificationUpload 
                label="Business License (if applicable)"
                description="Contractor or business license"
                icon="📄"
              />
              <VerificationUpload 
                label="Insurance Certificate (optional)"
                description="Liability insurance"
                icon="🛡️"
              />
            </div>
          )}

          {/* STEP 6: Schedule */}
          {step === 6 && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                  Days you work
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                    const isSelected = profile.daysAvailable.includes(day);
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          const current = profile.daysAvailable;
                          if (isSelected) {
                            setProfile({
                              ...profile,
                              daysAvailable: current.filter(d => d !== day)
                            });
                          } else {
                            setProfile({
                              ...profile,
                              daysAvailable: [...current, day]
                            });
                          }
                        }}
                        style={{
                          padding: '16px 8px',
                          border: `2px solid ${isSelected ? '#00D4AA' : '#E5E7EB'}`,
                          borderRadius: 10,
                          background: isSelected ? '#F0FDFA' : 'white',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 600
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                  How quickly do you respond?
                </label>
                <select
                  value={profile.responseTimeCommitment}
                  onChange={e => setProfile({...profile, responseTimeCommitment: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #E5E7EB',
                    borderRadius: 10,
                    fontSize: 15
                  }}
                >
                  <option value="15min">Within 15 minutes</option>
                  <option value="1hour">Within 1 hour</option>
                  <option value="4hours">Within 4 hours</option>
                  <option value="24hours">Within 24 hours</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 7: Preferences */}
          {step === 7 && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                  Preferred job sizes
                </label>
                {['small', 'medium', 'large'].map(size => {
                  const isSelected = profile.jobSizePreference.includes(size);
                  return (
                    <div
                      key={size}
                      onClick={() => {
                        const current = profile.jobSizePreference;
                        if (isSelected) {
                          setProfile({
                            ...profile,
                            jobSizePreference: current.filter(s => s !== size)
                          });
                        } else {
                          setProfile({
                            ...profile,
                            jobSizePreference: [...current, size]
                          });
                        }
                      }}
                      style={{
                        padding: 16,
                        marginBottom: 12,
                        border: `2px solid ${isSelected ? '#00D4AA' : '#E5E7EB'}`,
                        borderRadius: 10,
                        background: isSelected ? '#F0FDFA' : 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                        {size === 'small' && 'Small jobs (under $500)'}
                        {size === 'medium' && 'Medium jobs ($500-$2,000)'}
                        {size === 'large' && 'Large projects ($2,000+)'}
                      </div>
                      <div style={{ fontSize: 13, color: '#6B7280' }}>
                        {size === 'small' && 'Quick fixes, minor repairs'}
                        {size === 'medium' && 'Standard installations, moderate work'}
                        {size === 'large' && 'Major renovations, complex projects'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: 48,
            paddingTop: 32,
            borderTop: '1px solid #E5E7EB'
          }}>
            <button
              onClick={() => {
                if (step > 1) setStep(step - 1);
              }}
              disabled={step === 1}
              style={{
                padding: '12px 24px',
                border: '2px solid #E5E7EB',
                borderRadius: 8,
                background: 'white',
                cursor: step === 1 ? 'not-allowed' : 'pointer',
                fontSize: 15,
                fontWeight: 600,
                opacity: step === 1 ? 0.5 : 1
              }}
            >
              ← Back
            </button>

            {step < totalSteps ? (
              <button
                onClick={() => {
                  saveProgress();
                  setStep(step + 1);
                }}
                style={{
                  padding: '12px 32px',
                  border: 'none',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #00D4AA 0%, #00BF99 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 15,
                  fontWeight: 600
                }}
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={completeOnboarding}
                style={{
                  padding: '12px 32px',
                  border: 'none',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #FFB020 0%, #F59E0B 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 15,
                  fontWeight: 600
                }}
              >
                🎉 Complete Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VerificationUpload({ label, description, icon }: any) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
        {label}
      </label>
      <div
        style={{
          border: '2px dashed #E5E7EB',
          borderRadius: 10,
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          cursor: 'pointer',
          background: 'white'
        }}
      >
        <div style={{ fontSize: 32 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 2 }}>
            Click to upload
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}
