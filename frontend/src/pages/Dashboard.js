import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalytics, getEmployees } from '../api/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const scoreColor = (s) => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getAnalytics(), getEmployees({ sortBy: 'createdAt', order: 'desc' })])
      .then(([aRes, eRes]) => {
        setAnalytics(aRes.data);
        setRecentEmployees(eRes.data.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="ai-loading"><div className="spinner" /><p>Loading dashboard...</p></div>;

  const deptChartData = analytics?.departmentStats?.map(d => ({
    name: d._id, score: Math.round(d.avgPerformance || 0), count: d.count,
  })) || [];

  const pieData = analytics?.departmentStats?.map(d => ({ name: d._id, value: d.count })) || [];

  return (
    <div>
      <div className="page-header">
        <h2>📊 Dashboard</h2>
        <p>Overview of employee performance across your organization</p>
      </div>

      <div className="stats-grid">
        {[
          { icon: '👥', label: 'Total Employees', value: analytics?.totalEmployees || 0, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
          { icon: '✅', label: 'Active Employees', value: analytics?.activeEmployees || 0, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
          { icon: '⭐', label: 'Avg Performance', value: `${analytics?.avgOverallScore || 0}%`, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
          { icon: '🏢', label: 'Departments', value: analytics?.departmentStats?.length || 0, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>📈 Avg Performance by Department</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptChartData}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8 }} />
              <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>🥧 Employee Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>🕒 Recently Added Employees</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/employees')}>View All</button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th><th>Department</th><th>Position</th><th>Score</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEmployees.map(emp => (
                <tr key={emp._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/employees/${emp._id}`)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="emp-avatar" style={{ width: 34, height: 34, fontSize: 14 }}>{emp.name[0]}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{emp.name}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-purple">{emp.department}</span></td>
                  <td style={{ color: '#94a3b8' }}>{emp.position}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: scoreColor(emp.overallScore) }}>{emp.overallScore}%</span>
                      <div className="score-bar" style={{ width: 60 }}>
                        <div className="score-fill" style={{ width: `${emp.overallScore}%`, background: scoreColor(emp.overallScore) }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${emp.status === 'active' ? 'badge-green' : emp.status === 'on-leave' ? 'badge-yellow' : 'badge-red'}`}>
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentEmployees.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>No employees yet. Add some!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
