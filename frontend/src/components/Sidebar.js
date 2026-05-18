import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/employees', icon: '👥', label: 'Employees' },
  { path: '/rankings', icon: '🏆', label: 'Rankings' },
  { path: '/ai-analysis', icon: '🤖', label: 'AI Analysis' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">⚡</div>
        <div>
          <h1>PerfAI</h1>
          <span>Performance Analytics</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Main Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="nav-section-title" style={{ marginTop: 16 }}>Account</div>
        <button className="nav-item" onClick={handleLogout}>
          <span className="icon">🚪</span>
          Logout
        </button>
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
        <div className="user-info">
          <p>{user?.name}</p>
          <span>{user?.role?.toUpperCase()}</span>
        </div>
      </div>
    </aside>
  );
}
