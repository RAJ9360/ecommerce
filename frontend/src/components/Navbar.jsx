import React from 'react';
import { LogOut, Lock, Store, Shield, User } from 'lucide-react';

export default function Navbar({ user, onLogout, onChangePasswordClick }) {
  if (!user) return null;

  const renderRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return (
          <span className="badge badge-admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Shield size={12} /> Administrator
          </span>
        );
      case 'StoreOwner':
        return (
          <span className="badge badge-store" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Store size={12} /> Store Owner
          </span>
        );
      default:
        return (
          <span className="badge badge-user" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <User size={12} /> Customer
          </span>
        );
    }
  };

  return (
    <nav className="glass-container animate-fade-in" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center' }}>
          <Store size={20} color="white" />
        </div>
        <div>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Store<span className="text-gradient">Rate</span>
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</div>
          </div>
          {renderRoleBadge(user.role)}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', height: '36px' }}
            onClick={onChangePasswordClick}
          >
            <Lock size={14} /> Password
          </button>
          <button
            className="btn btn-danger"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', height: '36px' }}
            onClick={onLogout}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
