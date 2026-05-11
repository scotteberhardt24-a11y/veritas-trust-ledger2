'use client';
// ADMIN DASHBOARD - Complete Control Panel
// apps/web/src/app/admin/dashboard-ENHANCED.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardMetrics {
  totalUsers: number;
  activeJobs: number;
  escrowVolume: number;
  todayRevenue: number;
  weeklyGrowth: number;
  disputeCount: number;
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
  status: string;
  client_name: string;
  worker_name: string;
  budget: number;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'jobs' | 'finance' | 'ai'>('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const token = localStorage.getItem('token');
      
      // Load metrics
      const metricsRes = await fetch('/api/admin/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const metricsData = await metricsRes.json();
      setMetrics(metricsData.data);

      // Load users
      const usersRes = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      setUsers(usersData.data || []);

      // Load jobs
      const jobsRes = await fetch('/api/admin/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const jobsData = await jobsRes.json();
      setJobs(jobsData.data || []);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setLoading(false);
    }
  }

  async function suspendUser(userId: string, reason: string) {
    if (!confirm('Are you sure you want to suspend this user?')) return;
    
    const token = localStorage.getItem('token');
    await fetch(`/api/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });
    
    loadDashboardData();
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredJobs = jobs.filter(j => {
    const matchesStatus = filterStatus === 'all' || j.status === filterStatus;
    return matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)',
        padding: '2rem',
        color: 'white'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: 32, marginBottom: 8 }}>🛡️ Admin Dashboard</h1>
              <p style={{ opacity: 0.8, fontSize: 14 }}>Veritas Trust Ledger Control Panel</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
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
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 8, padding: '0 2rem' }}>
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'users', label: '👥 Users', icon: '👥' },
            { id: 'jobs', label: '💼 Jobs', icon: '💼' },
            { id: 'finance', label: '💰 Finance', icon: '💰' },
            { id: 'ai', label: '🤖 AI Performance', icon: '🤖' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                background: activeTab === tab.id ? '#F9FAFB' : 'transparent',
                borderBottom: activeTab === tab.id ? '3px solid #00D4AA' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                color: activeTab === tab.id ? '#0A2540' : '#6B7280'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem' }}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && metrics && (
          <>
            {/* Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 32 }}>
              <MetricCard
                title="Total Users"
                value={metrics.totalUsers.toLocaleString()}
                change={`+${metrics.weeklyGrowth}% this week`}
                icon="👥"
                color="#00D4AA"
              />
              <MetricCard
                title="Active Jobs"
                value={metrics.activeJobs.toLocaleString()}
                change="Real-time"
                icon="💼"
                color="#3B82F6"
              />
              <MetricCard
                title="Escrow Volume"
                value={`$${(metrics.escrowVolume / 1000).toFixed(1)}K`}
                change="Total held"
                icon="💰"
                color="#F59E0B"
              />
              <MetricCard
                title="Today's Revenue"
                value={`$${metrics.todayRevenue.toLocaleString()}`}
                change="Platform fees"
                icon="📈"
                color="#10B981"
              />
            </div>

            {/* Quick Stats */}
            <div style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, marginBottom: 20, color: '#0A2540' }}>System Health</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                <StatRow label="⚠️ Active Disputes" value={metrics.disputeCount} status={metrics.disputeCount > 0 ? 'warning' : 'success'} />
                <StatRow label="✅ API Uptime" value="99.9%" status="success" />
                <StatRow label="⚡ Avg Response Time" value="142ms" status="success" />
                <StatRow label="🔒 Verified Workers" value="87%" status="success" />
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ background: 'white', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 18, marginBottom: 20, color: '#0A2540' }}>Recent Activity</h2>
              <ActivityFeed />
            </div>
          </>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div style={{ background: 'white', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, color: '#0A2540' }}>User Management</h2>
              <button className="btn btn-primary" style={{ fontSize: 14 }}>
                + Add User
              </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <input
                type="text"
                placeholder="🔍 Search users..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 14
                }}
              />
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                style={{
                  padding: '10px 16px',
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
            </div>

            {/* Users Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
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
                          <div style={{ fontWeight: 500, marginBottom: 2 }}>{user.name}</div>
                          <div style={{ fontSize: 12, color: '#6B7280' }}>{user.email}</div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 500,
                          background: user.role === 'admin' ? '#FEE2E2' : user.role === 'worker' ? '#DBEAFE' : '#F3F4F6',
                          color: user.role === 'admin' ? '#991B1B' : user.role === 'worker' ? '#1E40AF' : '#374151'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 500, color: '#F59E0B' }}>{user.truscore}</div>
                      </td>
                      <td style={tdStyle}>
                        {user.suspended ? (
                          <span style={{ color: '#EF4444', fontSize: 12 }}>🚫 Suspended</span>
                        ) : user.email_verified ? (
                          <span style={{ color: '#10B981', fontSize: 12 }}>✓ Active</span>
                        ) : (
                          <span style={{ color: '#F59E0B', fontSize: 12 }}>⏳ Unverified</span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: 12, color: '#6B7280' }}>
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => router.push(`/admin/users/${user.user_id}`)}
                            style={{
                              padding: '4px 12px',
                              border: '1px solid #E5E7EB',
                              borderRadius: 6,
                              background: 'white',
                              cursor: 'pointer',
                              fontSize: 12
                            }}
                          >
                            View
                          </button>
                          {!user.suspended && (
                            <button
                              onClick={() => suspendUser(user.user_id, 'Admin action')}
                              style={{
                                padding: '4px 12px',
                                border: '1px solid #FCA5A5',
                                borderRadius: 6,
                                background: '#FEE2E2',
                                color: '#991B1B',
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

            {filteredUsers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
                No users found matching your filters
              </div>
            )}
          </div>
        )}

        {/* JOBS TAB */}
        {activeTab === 'jobs' && (
          <div style={{ background: 'white', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 20, color: '#0A2540' }}>Job Management</h2>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{
                  padding: '10px 16px',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 14
                }}
              >
                <option value="all">All Status</option>
                <option value="posted">Posted</option>
                <option value="matched">Matched</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>

            {/* Jobs Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                    <th style={thStyle}>Job</th>
                    <th style={thStyle}>Client</th>
                    <th style={thStyle}>Worker</th>
                    <th style={thStyle}>Budget</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Posted</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map(job => (
                    <tr key={job.job_id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 500 }}>{job.title}</div>
                      </td>
                      <td style={tdStyle}>{job.client_name}</td>
                      <td style={tdStyle}>{job.worker_name || '—'}</td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 500 }}>${job.budget}</div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 500,
                          background: job.status === 'completed' ? '#D1FAE5' : 
                                     job.status === 'disputed' ? '#FEE2E2' : '#DBEAFE',
                          color: job.status === 'completed' ? '#065F46' :
                                job.status === 'disputed' ? '#991B1B' : '#1E40AF'
                        }}>
                          {job.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: 12, color: '#6B7280' }}>
                          {new Date(job.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => router.push(`/admin/jobs/${job.job_id}`)}
                          style={{
                            padding: '4px 12px',
                            border: '1px solid #E5E7EB',
                            borderRadius: 6,
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          View Details
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
        {activeTab === 'finance' && metrics && (
          <div style={{ display: 'grid', gap: 24 }}>
            <div style={{ background: 'white', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 18, marginBottom: 20, color: '#0A2540' }}>Financial Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                <FinanceStat label="Escrow Balance" value={`$${metrics.escrowVolume.toLocaleString()}`} />
                <FinanceStat label="Pending Payouts" value="$12,450" />
                <FinanceStat label="Total Revenue" value={`$${metrics.todayRevenue.toLocaleString()}`} />
                <FinanceStat label="Avg Transaction" value="$287" />
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 18, marginBottom: 20, color: '#0A2540' }}>Revenue Breakdown</h2>
              <RevenueChart />
            </div>
          </div>
        )}

        {/* AI TAB */}
        {activeTab === 'ai' && (
          <div style={{ display: 'grid', gap: 24 }}>
            <div style={{ background: 'white', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 18, marginBottom: 20, color: '#0A2540' }}>AI Performance Metrics</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                <AIMetric label="Match Accuracy" value="94.2%" trend="+2.1%" />
                <AIMetric label="Avg Response Time" value="1.3s" trend="-0.2s" />
                <AIMetric label="Price Accuracy" value="91.7%" trend="+3.4%" />
                <AIMetric label="Dispute Prediction" value="87.5%" trend="+1.8%" />
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 18, marginBottom: 20, color: '#0A2540' }}>Active Experiments</h2>
              <ExperimentsList />
            </div>

            <div style={{ background: 'white', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 18, marginBottom: 20, color: '#0A2540' }}>Learning Pipeline</h2>
              <LearningPipeline />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({ title, value, change, icon, color }: any) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      padding: 24,
      border: `1px solid #E5E7EB`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 24 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#0A2540', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color, fontWeight: 500 }}>{change}</div>
    </div>
  );
}

function StatRow({ label, value, status }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
      <div style={{ fontSize: 13, color: '#6B7280' }}>{label}</div>
      <div style={{
        fontSize: 14,
        fontWeight: 600,
        color: status === 'success' ? '#10B981' : status === 'warning' ? '#F59E0B' : '#EF4444'
      }}>
        {value}
      </div>
    </div>
  );
}

function ActivityFeed() {
  const activities = [
    { icon: '👤', text: 'New user registered: John Smith', time: '2m ago' },
    { icon: '💼', text: 'Job posted: Plumbing repair needed', time: '5m ago' },
    { icon: '✓', text: 'Job completed: Kitchen renovation', time: '12m ago' },
    { icon: '⚠️', text: 'Dispute opened: Payment issue', time: '18m ago' },
    { icon: '💰', text: 'Payment released: $450 to worker', time: '25m ago' }
  ];

  return (
    <div>
      {activities.map((activity, i) => (
        <div key={i} style={{
          display: 'flex',
          gap: 12,
          padding: '12px 0',
          borderBottom: i < activities.length - 1 ? '1px solid #F3F4F6' : 'none'
        }}>
          <div style={{ fontSize: 20 }}>{activity.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: '#374151' }}>{activity.text}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{activity.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FinanceStat({ label, value }: any) {
  return (
    <div>
      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#0A2540' }}>{value}</div>
    </div>
  );
}

function RevenueChart() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
      📊 Chart visualization coming soon
    </div>
  );
}

function AIMetric({ label, value, trend }: any) {
  const isPositive = trend.startsWith('+');
  return (
    <div>
      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#0A2540', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: isPositive ? '#10B981' : '#EF4444', fontWeight: 500 }}>
        {trend} from last week
      </div>
    </div>
  );
}

function ExperimentsList() {
  return (
    <div style={{ padding: '1rem', textAlign: 'center', color: '#6B7280' }}>
      🧪 No active experiments
    </div>
  );
}

function LearningPipeline() {
  return (
    <div style={{ padding: '1rem', textAlign: 'center', color: '#6B7280' }}>
      🤖 AI learning pipeline status: Active
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  fontSize: 12,
  fontWeight: 600,
  color: '#6B7280',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const tdStyle: React.CSSProperties = {
  padding: '16px',
  fontSize: 14,
  color: '#374151'
};
