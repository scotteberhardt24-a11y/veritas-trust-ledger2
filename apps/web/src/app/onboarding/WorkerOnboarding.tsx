'use client';
// Worker Onboarding Wizard - Comprehensive Profile Setup
// apps/web/src/app/onboarding/WorkerOnboarding.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SERVICES = [
  'Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Painting', 
  'Roofing', 'Landscaping', 'Cleaning', 'Moving', 'Handyman',
  'Web Development', 'Graphic Design', 'Writing', 'Photography',
  'Auto Repair', 'Pet Care', 'Tutoring', 'Personal Training'
];

export default function WorkerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    // Step 1: Services
    primaryServices: [] as string[],
    secondaryServices: [] as string[],
    experience: {} as Record<string, number>,
    
    // Step 2: Rates
    hasBaseRate: false,
    baseRateHourly: '',
    serviceRates: [] as any[],
    travelFee: '',
    emergencyMultiplier: '1.5',
    
    // Step 3: Service Area
    primaryZip: '',
    travelRadius: '25',
    additionalAreas: [] as string[],
    
    // Step 4: Portfolio
    photos: [] as File[],
    videoUrl: '',
    bio: '',
    
    // Step 5: Verification
    hasLicense: false,
    licenseNumber: '',
    hasInsurance: false,
    insuranceProvider: '',
    
    // Step 6: Schedule
    availability: {
      monday: { available: true, start: '08:00', end: '18:00' },
      tuesday: { available: true, start: '08:00', end: '18:00' },
      wednesday: { available: true, start: '08:00', end: '18:00' },
      thursday: { available: true, start: '08:00', end: '18:00' },
      friday: { available: true, start: '08:00', end: '18:00' },
      saturday: { available: false, start: '09:00', end: '15:00' },
      sunday: { available: false, start: '09:00', end: '15:00' },
    },
    responseTime: '1-2 hours',
    jobSizePreference: ['small', 'medium'],
    clientTypePreference: ['residential'],
  });

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const saveAndExit = async () => {
    try {
      await fetch('/api/workers/onboarding/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ step, data })
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await fetch('/api/workers/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      router.push('/dashboard?welcome=true');
    } catch (error) {
      console.error('Complete failed:', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Header with Progress */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h1 style={{ fontSize: 20, fontWeight: 600 }}>Profile Setup</h1>
            <button onClick={saveAndExit} style={{
              padding: '0.5rem 1rem',
              background: 'none',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13
            }}>
              Save & Exit
            </button>
          </div>
          
          {/* Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, height: 8, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00D4AA 0%, #10B981 100%)',
                transition: 'width 0.3s'
              }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#6B7280' }}>
              {step}/{totalSteps}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 2rem' }}>
        
        {/* STEP 1: SERVICES */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '0.5rem' }}>
              What services do you offer?
            </h2>
            <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
              Select your primary services (1-3) and optionally add secondary services
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                Primary Services *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
                {SERVICES.map(service => (
                  <button
                    key={service}
                    onClick={() => {
                      const primary = data.primaryServices;
                      if (primary.includes(service)) {
                        setData({ ...data, primaryServices: primary.filter(s => s !== service) });
                      } else if (primary.length < 3) {
                        setData({ ...data, primaryServices: [...primary, service] });
                      }
                    }}
                    style={{
                      padding: '0.75rem',
                      border: `2px solid ${data.primaryServices.includes(service) ? '#00D4AA' : '#E5E7EB'}`,
                      borderRadius: 8,
                      background: data.primaryServices.includes(service) ? '#ECFDF5' : 'white',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center'
                    }}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience per service */}
            {data.primaryServices.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: '1rem', display: 'block' }}>
                  Years of experience
                </label>
                {data.primaryServices.map(service => (
                  <div key={service} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1, fontSize: 14 }}>{service}</div>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={data.experience[service] || ''}
                      onChange={e => setData({
                        ...data,
                        experience: { ...data.experience, [service]: parseInt(e.target.value) || 0 }
                      })}
                      placeholder="Years"
                      style={{
                        width: 100,
                        padding: '0.5rem',
                        border: '1px solid #E5E7EB',
                        borderRadius: 6,
                        fontSize: 14
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={nextStep}
              disabled={data.primaryServices.length === 0}
              style={{
                width: '100%',
                padding: '1rem',
                background: data.primaryServices.length > 0 ? '#00D4AA' : '#E5E7EB',
                color: data.primaryServices.length > 0 ? 'white' : '#9CA3AF',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: data.primaryServices.length > 0 ? 'pointer' : 'not-allowed',
                fontSize: 15
              }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2: RATES */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '0.5rem' }}>
              Set your rates
            </h2>
            <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
              How do you charge for your services?
            </p>

            {/* Rate Structure Choice */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button
                  onClick={() => setData({ ...data, hasBaseRate: true })}
                  style={{
                    padding: '1.5rem',
                    border: `2px solid ${data.hasBaseRate ? '#00D4AA' : '#E5E7EB'}`,
                    borderRadius: 12,
                    background: data.hasBaseRate ? '#ECFDF5' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: '0.5rem' }}>
                    💰 One Rate for Everything
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>
                    Charge the same hourly rate for all services
                  </div>
                </button>

                <button
                  onClick={() => setData({ ...data, hasBaseRate: false })}
                  style={{
                    padding: '1.5rem',
                    border: `2px solid ${!data.hasBaseRate ? '#00D4AA' : '#E5E7EB'}`,
                    borderRadius: 12,
                    background: !data.hasBaseRate ? '#ECFDF5' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: '0.5rem' }}>
                    📊 Different Rates per Service
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>
                    Set custom rates for each service
                  </div>
                </button>
              </div>
            </div>

            {/* Base Rate Input */}
            {data.hasBaseRate ? (
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                  Your Hourly Rate *
                </label>
                <div style={{ position: 'relative' }}>
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
                    value={data.baseRateHourly}
                    onChange={e => setData({ ...data, baseRateHourly: e.target.value })}
                    placeholder="75"
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 2.5rem',
                      border: '1px solid #E5E7EB',
                      borderRadius: 8,
                      fontSize: 18,
                      fontWeight: 600
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: '0.5rem' }}>
                  💡 Average in your area: $65-$95/hr
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '2rem' }}>
                {data.primaryServices.map(service => (
                  <div key={service} style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: 14, fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                      {service}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#6B7280'
                      }}>$</span>
                      <input
                        type="number"
                        placeholder="0"
                        style={{
                          width: '100%',
                          padding: '0.75rem 0.75rem 0.75rem 2.5rem',
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
                        fontSize: 14,
                        color: '#9CA3AF'
                      }}>/hr</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Additional Fees */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                Travel Fee (per mile)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#6B7280'
                }}>$</span>
                <input
                  type="number"
                  value={data.travelFee}
                  onChange={e => setData({ ...data, travelFee: e.target.value })}
                  placeholder="0.50"
                  step="0.10"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={prevStep} style={{
                flex: 1,
                padding: '1rem',
                background: 'white',
                color: '#374151',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                ← Back
              </button>
              <button
                onClick={nextStep}
                disabled={!data.baseRateHourly && !data.hasBaseRate}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: '#00D4AA',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SERVICE AREA */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '0.5rem' }}>
              Where do you work?
            </h2>
            <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
              Define your service area
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                Primary Zip Code *
              </label>
              <input
                type="text"
                value={data.primaryZip}
                onChange={e => setData({ ...data, primaryZip: e.target.value })}
                placeholder="98101"
                maxLength={5}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 16
                }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                How far will you travel?
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={data.travelRadius}
                  onChange={e => setData({ ...data, travelRadius: e.target.value })}
                  style={{ flex: 1 }}
                />
                <div style={{
                  padding: '0.5rem 1rem',
                  background: '#F3F4F6',
                  borderRadius: 6,
                  fontSize: 16,
                  fontWeight: 600,
                  minWidth: 80,
                  textAlign: 'center'
                }}>
                  {data.travelRadius} miles
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={prevStep} style={{
                flex: 1,
                padding: '1rem',
                background: 'white',
                color: '#374151',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                ← Back
              </button>
              <button onClick={nextStep} style={{
                flex: 1,
                padding: '1rem',
                background: '#00D4AA',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PORTFOLIO */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '0.5rem' }}>
              Show your work
            </h2>
            <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
              Upload photos and add a bio (optional but recommended)
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                Professional Bio
              </label>
              <textarea
                value={data.bio}
                onChange={e => setData({ ...data, bio: e.target.value })}
                placeholder="Tell clients about yourself, your experience, and what makes you great at what you do..."
                rows={5}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: '0.5rem' }}>
                {data.bio.length}/500 characters
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={prevStep} style={{
                flex: 1,
                padding: '1rem',
                background: 'white',
                color: '#374151',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                ← Back
              </button>
              <button onClick={nextStep} style={{
                flex: 1,
                padding: '1rem',
                background: '#00D4AA',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: VERIFICATION */}
        {step === 5 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '0.5rem' }}>
              Get verified
            </h2>
            <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
              Verified workers get 3x more jobs
            </p>

            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: '#92400E' }}>
                ⭐ <strong>Pro Tip:</strong> Verified workers appear first in search results and charge 15% higher rates on average
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={data.hasLicense}
                  onChange={e => setData({ ...data, hasLicense: e.target.checked })}
                  style={{ width: 20, height: 20 }}
                />
                <span style={{ fontSize: 15, fontWeight: 500 }}>
                  I have a professional license/certification
                </span>
              </label>
              {data.hasLicense && (
                <input
                  type="text"
                  value={data.licenseNumber}
                  onChange={e => setData({ ...data, licenseNumber: e.target.value })}
                  placeholder="License number"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    fontSize: 14,
                    marginTop: '0.75rem'
                  }}
                />
              )}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={data.hasInsurance}
                  onChange={e => setData({ ...data, hasInsurance: e.target.checked })}
                  style={{ width: 20, height: 20 }}
                />
                <span style={{ fontSize: 15, fontWeight: 500 }}>
                  I have liability insurance
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={prevStep} style={{
                flex: 1,
                padding: '1rem',
                background: 'white',
                color: '#374151',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                ← Back
              </button>
              <button onClick={nextStep} style={{
                flex: 1,
                padding: '1rem',
                background: '#00D4AA',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: SCHEDULE */}
        {step === 6 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '0.5rem' }}>
              Set your schedule
            </h2>
            <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
              When are you typically available?
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                Response Time Commitment
              </label>
              <select
                value={data.responseTime}
                onChange={e => setData({ ...data, responseTime: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 14
                }}
              >
                <option value="immediate">Within 15 minutes</option>
                <option value="1-2 hours">Within 1-2 hours</option>
                <option value="same-day">Same day</option>
                <option value="24-hours">Within 24 hours</option>
              </select>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                Job Size Preference
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {['Small (<2 hrs)', 'Medium (2-8 hrs)', 'Large (1+ days)'].map((size, idx) => {
                  const value = ['small', 'medium', 'large'][idx];
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        const prefs = data.jobSizePreference;
                        setData({
                          ...data,
                          jobSizePreference: prefs.includes(value)
                            ? prefs.filter(p => p !== value)
                            : [...prefs, value]
                        });
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        border: `2px solid ${data.jobSizePreference.includes(value) ? '#00D4AA' : '#E5E7EB'}`,
                        borderRadius: 8,
                        background: data.jobSizePreference.includes(value) ? '#ECFDF5' : 'white',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500
                      }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={prevStep} style={{
                flex: 1,
                padding: '1rem',
                background: 'white',
                color: '#374151',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                ← Back
              </button>
              <button onClick={completeOnboarding} style={{
                flex: 1,
                padding: '1rem',
                background: 'linear-gradient(135deg, #FFB020 0%, #F59E0B 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 15
              }}>
                🎉 Complete Setup
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
