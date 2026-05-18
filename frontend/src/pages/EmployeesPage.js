import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployees, deleteEmployee, createEmployee, updateEmployee } from '../api/api';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Product'];
const STATUSES = ['active', 'inactive', 'on-leave'];

const emptyForm = {
  name: '', email: '', department: 'Engineering', position: '', skills: '',
  performanceScore: 0, productivity: 0, teamwork: 0, communication: 0, leadership: 0,
  yearsOfExperience: 0, salary: 0, status: 'active',
};

const scoreColor = (s) => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [showModal, setShowModal] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmployees({ search, department, status, sortBy, order: 'desc' });
      setEmployees(res.data);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [search, department, status, sortBy]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const openAdd = () => { setEditEmp(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (emp) => {
    setEditEmp(emp);
    setForm({ ...emp, skills: emp.skills.join(', ') });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) };
      if (editEmp) {
        await updateEmployee(editEmp._id, data);
        toast.success('Employee updated!');
      } else {
        await createEmployee(data);
        toast.success('Employee added!');
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await deleteEmployee(id);
      toast.success('Employee deleted');
      fetchEmployees();
    } catch {
      toast.error('Delete failed');
    }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header-row page-header">
        <div>
          <h2>👥 Employees</h2>
          <p>Manage and track all employee records</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Employee</button>
      </div>

      {/* Search & Filter */}
      <div className="search-bar">
        <div className="search-input-wrap" style={{ flex: 2 }}>
          <span className="search-icon">🔍</span>
          <input className="form-control search-input" placeholder="Search by name, email, position, skills..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 160 }} value={department} onChange={e => setDepartment(e.target.value)}>
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <select className="form-control" style={{ width: 140 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="form-control" style={{ width: 160 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="createdAt">Sort: Recent</option>
          <option value="performanceScore">Sort: Performance</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {/* Employee Grid */}
      {loading ? (
        <div className="ai-loading"><div className="spinner" /></div>
      ) : employees.length === 0 ? (
        <div className="empty-state">
          <div className="icon">👤</div>
          <h3>No employees found</h3>
          <p>Try adjusting your filters or add a new employee</p>
        </div>
      ) : (
        <div className="employees-grid">
          {employees.map(emp => (
            <div className="emp-card" key={emp._id}>
              <div className="emp-card-header">
                <div className="emp-avatar">{emp.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{emp.name}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{emp.position}</div>
                  <span className="badge badge-purple" style={{ marginTop: 4 }}>{emp.department}</span>
                </div>
                <span className={`badge ${emp.status === 'active' ? 'badge-green' : emp.status === 'on-leave' ? 'badge-yellow' : 'badge-red'}`}>
                  {emp.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['Perf', emp.performanceScore], ['Prod', emp.productivity], ['Team', emp.teamwork], ['Comm', emp.communication]].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                      <span>{l}</span><span style={{ color: scoreColor(v), fontWeight: 600 }}>{v}%</span>
                    </div>
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${v}%`, background: scoreColor(v) }} />
                    </div>
                  </div>
                ))}
              </div>

              {emp.skills?.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {emp.skills.slice(0, 4).map(s => (
                    <span key={s} className="badge badge-blue" style={{ fontSize: 11 }}>{s}</span>
                  ))}
                  {emp.skills.length > 4 && <span className="badge" style={{ fontSize: 11 }}>+{emp.skills.length - 4}</span>}
                </div>
              )}

              <div className="emp-card-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/employees/${emp._id}`)}>👁 View</button>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(emp)}>✏️ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp._id, emp.name)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editEmp ? '✏️ Edit Employee' : '➕ Add Employee'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-control" value={form.name} onChange={e => f('name', e.target.value)} required placeholder="Jane Doe" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => f('email', e.target.value)} required placeholder="jane@company.com" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select className="form-control" value={form.department} onChange={e => f('department', e.target.value)}>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Position *</label>
                    <input className="form-control" value={form.position} onChange={e => f('position', e.target.value)} required placeholder="Software Engineer" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Skills (comma-separated)</label>
                  <input className="form-control" value={form.skills} onChange={e => f('skills', e.target.value)} placeholder="React, Node.js, Python" />
                </div>
                <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 13, color: '#94a3b8' }}>Performance Metrics (0-100)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {[['performanceScore', 'Performance'], ['productivity', 'Productivity'], ['teamwork', 'Teamwork'], ['communication', 'Communication'], ['leadership', 'Leadership']].map(([k, l]) => (
                    <div className="form-group" key={k}>
                      <label className="form-label">{l}: {form[k]}</label>
                      <input type="range" min="0" max="100" className="form-control" style={{ padding: '4px 0', background: 'none', border: 'none' }} value={form[k]} onChange={e => f(k, +e.target.value)} />
                    </div>
                  ))}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Experience (years)</label>
                    <input type="number" className="form-control" value={form.yearsOfExperience} onChange={e => f('yearsOfExperience', +e.target.value)} min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Salary ($)</label>
                    <input type="number" className="form-control" value={form.salary} onChange={e => f('salary', +e.target.value)} min="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={e => f('status', e.target.value)}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Saving...' : editEmp ? '💾 Update' : '✨ Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
