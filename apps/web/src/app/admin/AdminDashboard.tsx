'use client';
// ADMIN DASHBOARD - Full Control Panel
// apps/web/src/app/admin/AdminDashboard.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";

interface DashboardMetrics {
  totalUsers: number;
  activeJobs: number;
  escrowVolume: number;
  todayRevenue: number;
  workers: number;
  clients: number;
  verifiedUsers: number;
  pendingDisputes: number;
}

interface User {
  user_id: string;
  name: string;
  email: string;
  role: string;
  truscore: number;
  email_verified: boolean;
  suspended: boolean;
  created_at: string;
  last_login: string;
}

interface Job {
  job_id: string;
  title: string;
  client_name: string;
  worker_name: string;
  status: string;
  amount: number;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      // Load metrics
      const metricsRes = await fetch('/api/admin/metrics', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const metricsData = await metricsRes.json();
      setMetrics(metricsData.data);

      // Load users
      const usersRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const usersData = await usersRes.json();
      setUsers(usersData.data);

      // Load jobs
      const jobsRes = await fetch('/api/admin/jobs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const jobsData = await jobsRes.json();
      setJobs(jobsData.data);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
    setLoading(false);
  }

  async function suspendUser(userId: string, reason: string) {
    if (!confirm('Are you sure you want to suspend this user?')) return;
    
    try {
      await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason })
      });
      loadData();
    } catch (error) {
      console.error('Failed to suspend user:', error);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm('DELETE USER? This cannot be undone!')) return;
    
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      loadData();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredJobs = jobs.filter(j => {
    return filterStatus === 'all' || j.status === filterStatus;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: 24 }}>⏳ Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)',
        color: 'white',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>🛡️ Admin Control Panel</h1>
          <p style={{ opacity: 0.8, fontSize: 14 }}>Full system management and oversight</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 4, padding: '0 2rem' }}>
          {['overview', 'users', 'jobs', 'finance', 'system'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '1rem 1.5rem',
                background: 'none',
                border: 'none',
                borderBottom: `3px solid ${activeTab === tab ? '#00D4AA' : 'transparent'}`,
                color: activeTab === tab ? '#0A2540' : '#6B7280',
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontSize: 14
              }}
            >
              {tab === 'overview' && '📊'}
              {tab === 'users' && '👥'}
              {tab === 'jobs' && '💼'}
              {tab === 'finance' && '💰'}
              {tab === 'system' && '⚙️'}
              {' '}{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem' }}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && metrics && (
          <div>
            {/* Metrics Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <MetricCard
                icon="👥"
                label="Total Users"
                value={metrics.totalUsers}
                subtitle={`${metrics.workers} workers · ${metrics.clients} clients`}
                color="#0A2540"
              />
              <MetricCard
                icon="💼"
                label="Active Jobs"
                value={metrics.activeJobs}
                subtitle="In progress right now"
                color="#00D4AA"
              />
              <MetricCard
                icon="💰"
                label="Escrow Volume"
                value={`$${metrics.escrowVolume.toLocaleString()}`}
                subtitle={`$${metrics.todayRevenue.toLocaleString()} today`}
                color="#FFB020"
              />
              <MetricCard
                icon="⚠️"
                label="Pending Disputes"
                value={metrics.pendingDisputes}
                subtitle="Require attention"
                color="#EF4444"
              />
            </div>

            {/* Quick Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem'
            }}>
              {/* Recent Activity */}
              <div style={{
                background: 'white',
                borderRadius: 12,
                padding: '1.5rem',
                border: '1px solid #E5E7EB'
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1rem' }}>
                  📈 Recent Activity
                </h3>
                <div style={{ fontSize: 13, color: '#6B7280' }}>
                  <div style={{ marginBottom: 8 }}>• 12 new users today</div>
                  <div style={{ marginBottom: 8 }}>• 47 jobs completed this week</div>
                  <div style={{ marginBottom: 8 }}>• 234 active workers online</div>
                  <div style={{ marginBottom: 8 }}>• 98.7% uptime this month</div>
                </div>
              </div>

              {/* System Health */}
              <div style={{
                background: 'white',
                borderRadius: 12,
                padding: '1.5rem',
                border: '1px solid #E5E7EB'
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1rem' }}>
                  ⚡ System Health
                </h3>
                <HealthBar label="API Response" value={98} />
                <HealthBar label="Database" value={100} />
                <HealthBar label="Job Matching" value={95} />
                <HealthBar label="User Satisfaction" value={92} />
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            {/* Filters */}
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: '1.5rem',
              marginBottom: '1.5rem',
              border: '1px solid #E5E7EB',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder="🔍 Search users by name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 14
                }}
              />
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 14
                }}
              >
                <option value="all">All Roles</option>
                <option value="worker">Workers</option>
                <option value="client">Clients</option>
                <option value="admin">Admins</option>
              </select>
              <button
                onClick={loadData}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#00D4AA',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                🔄 Refresh
              </button>
            </div>

            {/* Users Table */}
            <div style={{
              background: 'white',
              borderRadius: 12,
              border: '1px solid #E5E7EB',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <th style={thStyle}>User</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>TruScore</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Joined</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.user_id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={tdStyle}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                          <div style={{ fontSize: 12, color: '#6B7280' }}>{user.email}</div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          background: user.role === 'admin' ? '#FEE2E2' : user.role === 'worker' ? '#DBEAFE' : '#F3F4F6',
                          color: user.role === 'admin' ? '#991B1B' : user.role === 'worker' ? '#1E40AF' : '#374151'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>{user.truscore}</div>
                      </td>
                      <td style={tdStyle}>
                        {user.suspended ? (
                          <span style={{ color: '#EF4444', fontSize: 12 }}>🚫 Suspended</span>
                        ) : user.email_verified ? (
                          <span style={{ color: '#10B981', fontSize: 12 }}>✓ Verified</span>
                        ) : (
                          <span style={{ color: '#F59E0B', fontSize: 12 }}>⏳ Pending</span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: 13, color: '#6B7280' }}>
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => router.push(`/admin/users/${user.user_id}`)}
                            style={{
                              padding: '4px 12px',
                              background: '#F3F4F6',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 12
                            }}
                          >
                            View
                          </button>
                          {!user.suspended && (
                            <button
                              onClick={() => suspendUser(user.user_id, 'Manual suspension')}
                              style={{
                                padding: '4px 12px',
                                background: '#FEE2E2',
                                color: '#991B1B',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 12
                              }}
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* JOBS TAB */}
        {activeTab === 'jobs' && (
          <div>
            {/* Job Filters */}
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: '1.5rem',
              marginBottom: '1.5rem',
              border: '1px solid #E5E7EB',
              display: 'flex',
              gap: '1rem'
            }}>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 14
                }}
              >
                <option value="all">All Jobs</option>
                <option value="posted">Posted</option>
                <option value="matched">Matched</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>

            {/* Jobs Table */}
            <div style={{
              background: 'white',
              borderRadius: 12,
              border: '1px solid #E5E7EB',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <th style={thStyle}>Job</th>
                    <th style={thStyle}>Client</th>
                    <th style={thStyle}>Worker</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Created</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map(job => (
                    <tr key={job.job_id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{job.title}</div>
                      </td>
                      <td style={tdStyle}>{job.client_name}</td>
                      <td style={tdStyle}>{job.worker_name || '—'}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          background: getJobStatusColor(job.status).bg,
                          color: getJobStatusColor(job.status).text
                        }}>
                          {job.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600 }}>${job.amount}</div>
                      </td>
                      <td style={tdStyle}>
                        {new Date(job.created_at).toLocaleDateString()}
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => router.push(`/admin/jobs/${job.job_id}`)}
                          style={{
                            padding: '4px 12px',
                            background: '#F3F4F6',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (
          <div>
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: '2rem',
              border: '1px solid #E5E7EB',
              textAlign: 'center'
            }}>
              <h2 style={{ fontSize: 24, marginBottom: '1rem' }}>💰 Financial Dashboard</h2>
              <p style={{ color: '#6B7280' }}>Coming soon: Revenue analytics, payout queue, refunds</p>
            </div>
          </div>
        )}

        {/* SYSTEM TAB */}
        {activeTab === 'system' && (
          <div>
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: '2rem',
              border: '1px solid #E5E7EB',
              textAlign: 'center'
            }}>
              <h2 style={{ fontSize: 24, marginBottom: '1rem' }}>⚙️ System Settings</h2>
              <p style={{ color: '#6B7280' }}>Coming soon: API logs, error tracking, feature flags</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Helper Components
function MetricCard({ icon, label, value, subtitle, color }: any) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      padding: '1.5rem',
      border: '1px solid #E5E7EB'
    }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#9CA3AF' }}>{subtitle}</div>
    </div>
  );
}

function HealthBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
        <span style={{ color: '#374151' }}>{label}</span>
        <span style={{ fontWeight: 600, color: getHealthColor(value) }}>{value}%</span>
      </div>
      <div style={{
        height: 6,
        background: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${value}%`,
          height: '100%',
          background: getHealthColor(value),
          transition: 'width 0.3s'
        }} />
      </div>
    </div>
  );
}

function getHealthColor(value: number) {
  if (value >= 95) return '#10B981';
  if (value >= 80) return '#F59E0B';
  return '#EF4444';
}

function getJobStatusColor(status: string) {
  const colors: Record<string, { bg: string; text: string }> = {
    posted: { bg: '#DBEAFE', text: '#1E40AF' },
    matched: { bg: '#E0E7FF', text: '#4338CA' },
    active: { bg: '#D1FAE5', text: '#065F46' },
    completed: { bg: '#D1FAE5', text: '#065F46' },
    disputed: { bg: '#FEE2E2', text: '#991B1B' },
  };
  return colors[status] || { bg: '#F3F4F6', text: '#374151' };
}

const thStyle = {
  padding: '1rem',
  textAlign: 'left' as const,
  fontSize: 12,
  fontWeight: 600,
  color: '#6B7280',
  textTransform: 'uppercase' as const
};

const tdStyle = {
  padding: '1rem',
  fontSize: 14
};
