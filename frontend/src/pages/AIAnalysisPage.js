import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bulkAnalyze } from '../api/api';
import toast from 'react-hot-toast';

export default function AIAnalysisPage() {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [employeeCount, setEmployeeCount] = useState(0);
  const navigate = useNavigate();

  const handleBulkAnalyze = async () => {
    setLoading(true);
    setAnalysis('');
    try {
      const res = await bulkAnalyze();
      setAnalysis(res.data.analysis);
      setEmployeeCount(res.data.employeeCount);
      toast.success('Team analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header-row page-header">
        <div>
          <h2>🤖 AI Team Analysis</h2>
          <p>Generate AI-powered insights across your entire team</p>
        </div>
        <button className="btn btn-primary" onClick={handleBulkAnalyze} disabled={loading}>
          {loading ? '⏳ Analyzing...' : '🚀 Run Team Analysis'}
        </button>
      </div>

      {/* Info Cards */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { icon: '📊', title: 'Team Rankings', desc: 'Compare performance across all employees' },
          { icon: '🌟', title: 'Top Performers', desc: 'Identify employees ready for promotion' },
          { icon: '🎯', title: 'Training Needs', desc: 'Spot who needs skill development' },
          { icon: '💡', title: 'Action Items', desc: 'Get concrete improvement steps' },
        ].map(c => (
          <div className="card" key={c.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ fontSize: 28 }}>{c.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{c.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Individual Employee Note */}
      <div className="alert alert-success" style={{ marginBottom: 20 }}>
        💡 <strong>Tip:</strong> For individual employee AI recommendations, visit the{' '}
        <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/employees')}>
          Employees page
        </span>{' '}
        and click on any employee to generate personalized insights.
      </div>

      {/* Analysis Output */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          🧠 Team Intelligence Report
          {employeeCount > 0 && <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 400, marginLeft: 12 }}>Analyzed {employeeCount} employees</span>}
        </h3>

        {loading ? (
          <div className="ai-loading">
            <div className="spinner" />
            <p style={{ fontWeight: 600 }}>AI is analyzing your team...</p>
            <p style={{ fontSize: 13, color: '#64748b' }}>Generating comprehensive insights. This may take 20-40 seconds.</p>
          </div>
        ) : analysis ? (
          <div className="ai-box">{analysis}</div>
        ) : (
          <div className="empty-state">
            <div className="icon">🤖</div>
            <h3>Ready for Analysis</h3>
            <p>Click "Run Team Analysis" to generate AI-powered insights about your team's performance, top performers, and improvement areas.</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={handleBulkAnalyze}>
              🚀 Run Team Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
