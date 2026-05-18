import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployeeRankings } from '../api/api';
import toast from 'react-hot-toast';

const scoreColor = (s) => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
const medal = (r) => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : null;

export default function RankingsPage() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getEmployeeRankings()
      .then(res => setRankings(res.data))
      .catch(() => toast.error('Failed to load rankings'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="ai-loading"><div className="spinner" /></div>;

  const top3 = rankings.slice(0, 3);

  return (
    <div>
      <div className="page-header">
        <h2>🏆 Employee Rankings</h2>
        <p>Ranked by overall performance score</p>
      </div>

      {/* Podium */}
      {top3.length > 0 && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          {top3.map(emp => (
            <div key={emp._id} className="card" style={{ flex: 1, minWidth: 200, textAlign: 'center', cursor: 'pointer', borderColor: emp.rank === 1 ? '#ffd700' : emp.rank === 2 ? '#c0c0c0' : '#cd7f32' }}
              onClick={() => navigate(`/employees/${emp._id}`)}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{medal(emp.rank)}</div>
              <div className="emp-avatar" style={{ margin: '0 auto 12px', width: 52, height: 52, fontSize: 20 }}>{emp.name[0]}</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{emp.name}</div>
              <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>{emp.position}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: scoreColor(emp.overallScore) }}>{emp.overallScore}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Overall Score</div>
              <span className="badge badge-purple" style={{ marginTop: 10 }}>{emp.department}</span>
            </div>
          ))}
        </div>
      )}

      {/* Full Rankings Table */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📋 Full Rankings</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Rank</th><th>Employee</th><th>Department</th>
                <th>Performance</th><th>Productivity</th><th>Teamwork</th>
                <th>Communication</th><th>Leadership</th><th>Overall</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map(emp => (
                <tr key={emp._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/employees/${emp._id}`)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className={`rank-badge rank-${emp.rank <= 3 ? emp.rank : 'other'}`}>{emp.rank}</div>
                      {medal(emp.rank)}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="emp-avatar" style={{ width: 34, height: 34, fontSize: 14 }}>{emp.name[0]}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{emp.name}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{emp.position}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-purple">{emp.department}</span></td>
                  {[emp.performanceScore, emp.productivity, emp.teamwork, emp.communication, emp.leadership].map((val, i) => (
                    <td key={i}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600, color: scoreColor(val), minWidth: 28 }}>{val}</span>
                        <div className="score-bar" style={{ width: 50 }}>
                          <div className="score-fill" style={{ width: `${val}%`, background: scoreColor(val) }} />
                        </div>
                      </div>
                    </td>
                  ))}
                  <td>
                    <span style={{ fontSize: 18, fontWeight: 800, color: scoreColor(emp.overallScore) }}>{emp.overallScore}</span>
                  </td>
                </tr>
              ))}
              {rankings.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No active employees to rank</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
