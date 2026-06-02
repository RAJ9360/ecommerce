import React, { useState } from 'react';
import { User, Mail, MapPin, Lock, UserPlus, AlertCircle, ArrowLeft, Check } from 'lucide-react';

export default function Register({ onRegisterSuccess, onNavigateToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const specialCharRegex = /[\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\.\>\/\?\\\|]/;
  const uppercaseRegex = /[A-Z]/;

  const validate = () => {
    const newErrors = {};

    // Name: Min 20, Max 60 characters
    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Name is required.';
    } else if (trimmedName.length < 20 || trimmedName.length > 60) {
      newErrors.name = `Name must be between 20 and 60 characters. Current length: ${trimmedName.length}`;
    }

    // Email: standard validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Address: Max 400 characters
    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      newErrors.address = 'Address is required.';
    } else if (trimmedAddress.length > 400) {
      newErrors.address = `Address cannot exceed 400 characters. Current: ${trimmedAddress.length}`;
    }

    // Password: 8-16 characters, 1 uppercase, 1 special character
    if (!password) {
      newErrors.password = 'Password is required.';
    } else {
      if (password.length < 8 || password.length > 16) {
        newErrors.password = 'Password must be between 8 and 16 characters.';
      } else if (!uppercaseRegex.test(password)) {
        newErrors.password = 'Password must include at least one uppercase letter.';
      } else if (!specialCharRegex.test(password)) {
        newErrors.password = 'Password must include at least one special character.';
      }
    }

    // Confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          address: address.trim(),
          password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
          throw new Error('Please resolve the errors below.');
        } else {
          throw new Error(data.message || 'Registration failed.');
        }
      }

      onRegisterSuccess();
    } catch (err) {
      setGeneralError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Real-time password check flags
  const valLength = password.length >= 8 && password.length <= 16;
  const valUpper = uppercaseRegex.test(password);
  const valSpecial = specialCharRegex.test(password);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', padding: '2rem 1rem' }}>
      <div className="glass-container animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
        
        <button
          onClick={onNavigateToLogin}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} /> Back to Login
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            Create Your Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Register as a normal user to view and rate local stores
          </p>
        </div>

        {generalError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem', borderRadius: '6px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Name Field (Strict Min 20, Max 60) */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              Full Name <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Min 20 characters)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="register-name"
                type="text"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Johnathan Alexander Smith"
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
              {errors.name ? (
                <span className="error-text">{errors.name}</span>
              ) : <span />}
              <span style={{ fontSize: '0.75rem', color: name.trim().length < 20 || name.trim().length > 60 ? 'var(--warning)' : 'var(--success)' }}>
                {name.trim().length}/60
              </span>
            </div>
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="register-email"
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.smith@gmail.com"
                required
              />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Address Field (Max 400) */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-address">Address <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Max 400 characters)</span></label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <textarea
                id="register-address"
                className={`form-input ${errors.address ? 'input-error' : ''}`}
                style={{ paddingLeft: '2.5rem', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Boulevard Road, Apt 4B, Los Angeles, CA 90012"
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
              {errors.address ? (
                <span className="error-text">{errors.address}</span>
              ) : <span />}
              <span style={{ fontSize: '0.75rem', color: address.trim().length > 400 ? 'var(--error)' : 'var(--text-muted)' }}>
                {address.trim().length}/400
              </span>
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="register-password"
                type="password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}

            {/* Criteria checklist */}
            <div style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem' }}>
              <div style={{ color: valLength ? '#34d399' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {valLength ? <Check size={12} /> : '•'} Password length (8-16 characters)
              </div>
              <div style={{ color: valUpper ? '#34d399' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {valUpper ? <Check size={12} /> : '•'} At least 1 uppercase letter
              </div>
              <div style={{ color: valSpecial ? '#34d399' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {valSpecial ? <Check size={12} /> : '•'} At least 1 special character
              </div>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" htmlFor="register-confirm">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="register-confirm"
                type="password"
                className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.875rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus size={18} /> Sign Up
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
