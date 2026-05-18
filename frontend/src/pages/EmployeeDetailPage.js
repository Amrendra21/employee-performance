import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById, generateRecommendation } from '../api/api';
import toast from 'react-hot-toast';

const scoreColor = (s) => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    getEmployeeById(id)
      .then(res => setEmployee(res.data))
      .catch(() => { toast.error('Employee not found'); navigate('/employees'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleGenerateAI = async () => {
    setAiLoading(true);
    try {
      const res = await generateRecommendation(id);
      setEmployee(res.data.employee);
      toast.success('AI recommendation generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="ai-loading"><div className="spinner" /></div>;
  if (!employee) return null;

  const metrics = [
    { label: 'Performance', value: employee.performanceScore, icon: '📈' },
    { label: 'Productivity', value: employee.productivity, icon: '⚡' },
    { label: 'Teamwork', value: employee.teamwork, icon: '🤝' },
    { label: 'Communication', value: employee.communication, icon: '💬' },
    { label: 'Leadership', value: employee.leadership, icon: '👑' },
    { label: 'Overall Score', value: employee.overallScore, icon: '⭐' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/employees')}>← Back to Employees</button>
      </div>

      {/* Header */}
      <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div className="emp-avatar" style={{ width: 72, height: 72, fontSize: 28 }}>{employee.name[0]}</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>{employee.name}</h2>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>{employee.position} · {employee.department}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <span className={`badge ${employee.status === 'active' ? 'badge-green' : 'badge-yellow'}`}>{employee.status}</span>
            <span className="badge badge-blue">📧 {employee.email}</span>
            <span className="badge badge-purple">🏢 {employee.yearsOfExperience} yrs exp</span>
            {employee.salary > 0 && <span className="badge badge-green">💰 ${employee.salary.toLocaleString()}/yr</span>}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 42, fontWeight: 800, color: scoreColor(employee.overallScore) }}>{employee.overallScore}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Overall Score</div>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid" style={{ marginBottom: 24 }}>
        {metrics.map(m => (
          <div className="metric-card" key={m.label}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{m.icon}</div>
            <div className="metric-value" style={{ color: scoreColor(m.value) }}>{m.value}</div>
            <div className="metric-label">{m.label}</div>
            <div className="score-bar" style={{ marginTop: 8 }}>
              <div className="score-fill" style={{ width: `${m.value}%`, background: scoreColor(m.value) }} />
            </div>
          </div>
        ))}
      </div>

      {/* Skills */}
      {employee.skills?.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>🛠️ Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {employee.skills.map(s => (
              <span key={s} className="badge badge-blue" style={{ fontSize: 13, padding: '5px 14px' }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendation */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>🤖 AI Performance Recommendation</h3>
          <button className="btn btn-primary btn-sm" onClick={handleGenerateAI} disabled={aiLoading}>
            {aiLoading ? '⏳ Generating...' : employee.aiRecommendation ? '🔄 Regenerate' : '✨ Generate AI Insight'}
          </button>
        </div>

        {aiLoading ? (
          <div className="ai-loading">
            <div className="spinner" />
            <p>AI is analyzing performance data...</p>
            <p style={{ fontSize: 12, color: '#64748b' }}>This may take 15-30 seconds</p>
          </div>
        ) : employee.aiRecommendation ? (
          <>
            {employee.lastRecommendationDate && (
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                Last generated: {new Date(employee.lastRecommendationDate).toLocaleString()}
              </p>
            )}
            <div className="ai-box">{employee.aiRecommendation}</div>
          </>
        ) : (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="icon">🤖</div>
            <h3>No AI Recommendation Yet</h3>
            <p>Click "Generate AI Insight" to get personalized recommendations</p>
          </div>
        )}
      </div>
    </div>
  );
}
