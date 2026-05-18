import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'hr' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = tab === 'login'
        ? await loginUser({ email: form.email, password: form.password })
        : await registerUser(form);
      login(res.data, res.data.token);
      toast.success(`Welcome, ${res.data.name}!`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-circle">⚡</div>
          <h1>PerfAI</h1>
          <p>AI-Powered Employee Performance Analytics</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>
            Sign In
          </button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>
            Register
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="name" className="form-control" placeholder="John Doe" value={form.name} onChange={handleChange} required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" className="form-control" placeholder="you@company.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" placeholder="••••••••" value={form.password} onChange={handleChange} required />
          </div>
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Role</label>
              <select name="role" className="form-control" value={form.role} onChange={handleChange}>
                <option value="hr">HR Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? '⏳ Please wait...' : tab === 'login' ? '🚀 Sign In' : '✨ Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
