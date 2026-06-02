import React, { useState, useEffect } from 'react';
import { Users, Store, Star, Search, Plus, Eye, ArrowUpDown, ShieldAlert, Info, X } from 'lucide-react';
import { validateUser } from '../utils/validate';

export default function AdminDashboard({ token }) {
  // Stats
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Users Listing
  const [users, setUsers] = useState([]);
  const [userFilters, setUserFilters] = useState({ search: '', role: '', sortBy: 'name', sortOrder: 'ASC' });
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Stores Listing
  const [stores, setStores] = useState([]);
  const [storeFilters, setStoreFilters] = useState({ search: '', sortBy: 'name', sortOrder: 'ASC' });
  const [loadingStores, setLoadingStores] = useState(true);

  // Detail view Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Add User/Store modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ name: '', email: '', password: '', address: '', role: 'User' });
  const [addUserErrors, setAddUserErrors] = useState({});
  const [addUserGeneralError, setAddUserGeneralError] = useState('');
  const [addUserLoading, setAddUserLoading] = useState(false);

  // Fetch initial dashboard data
  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { search, role, sortBy, sortOrder } = userFilters;
      const url = new URL('http://localhost:5000/api/admin/users');
      if (search) url.searchParams.append('search', search);
      if (role) url.searchParams.append('role', role);
      if (sortBy) url.searchParams.append('sortBy', sortBy);
      if (sortOrder) url.searchParams.append('sortOrder', sortOrder);

      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchStores = async () => {
    setLoadingStores(true);
    try {
      const { search, sortBy, sortOrder } = storeFilters;
      const url = new URL('http://localhost:5000/api/admin/stores');
      if (search) url.searchParams.append('search', search);
      if (sortBy) url.searchParams.append('sortBy', sortBy);
      if (sortOrder) url.searchParams.append('sortOrder', sortOrder);

      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setStores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStores(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userFilters]);

  useEffect(() => {
    fetchStores();
  }, [storeFilters]);

  // Load specific user details
  const handleViewDetails = async (userId) => {
    setLoadingDetail(true);
    setUserDetail(null);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUserDetail(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle Sort triggers
  const triggerUserSort = (field) => {
    setUserFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  const triggerStoreSort = (field) => {
    setStoreFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  // Add User / Store Submit
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setAddUserGeneralError('');
    setAddUserErrors({});

    const { name, email, password, address, role } = addUserForm;
    const { isValid, errors } = validateUser({ name, email, password, address });
    
    if (!isValid) {
      setAddUserErrors(errors);
      return;
    }

    setAddUserLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, password, address, role })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setAddUserErrors(data.errors);
          throw new Error('Please fix the errors below.');
        } else {
          throw new Error(data.message || 'Failed to add user.');
        }
      }

      // Success
      setIsAddUserOpen(false);
      setAddUserForm({ name: '', email: '', password: '', address: '', role: 'User' });
      // Refresh lists
      fetchStats();
      if (role === 'StoreOwner') {
        fetchStores();
      } else {
        fetchUsers();
      }
    } catch (err) {
      setAddUserGeneralError(err.message);
    } finally {
      setAddUserLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      
      {/* 1. Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Admin Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage users, stores, and ratings platform</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => { setAddUserForm(f => ({ ...f, role: 'User' })); setIsAddUserOpen(true); }}>
            <Plus size={16} /> Add User
          </button>
          <button className="btn btn-secondary" onClick={() => { setAddUserForm(f => ({ ...f, role: 'StoreOwner' })); setIsAddUserOpen(true); }}>
            <Plus size={16} /> Add Store
          </button>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="dashboard-grid">
        <div className="glass-container stat-card">
          <div className="stat-info">
            <p>Total Users</p>
            {loadingStats ? <h3 className="text-gradient">...</h3> : <h3 className="text-gradient">{stats.totalUsers}</h3>}
          </div>
          <div className="stat-icon">
            <Users size={24} />
          </div>
        </div>

        <div className="glass-container stat-card">
          <div className="stat-info">
            <p>Registered Stores</p>
            {loadingStats ? <h3 className="text-gradient">...</h3> : <h3 className="text-gradient">{stats.totalStores}</h3>}
          </div>
          <div className="stat-icon">
            <Store size={24} />
          </div>
        </div>

        <div className="glass-container stat-card">
          <div className="stat-info">
            <p>Submitted Ratings</p>
            {loadingStats ? <h3 className="text-gradient">...</h3> : <h3 className="text-gradient">{stats.totalRatings}</h3>}
          </div>
          <div className="stat-icon">
            <Star size={24} />
          </div>
        </div>
      </div>

      {/* 3. listings Grid (Users & Stores) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
        
        {/* STORES LISTING */}
        <div className="glass-container" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Store size={20} className="text-gradient" /> Registered Stores</h3>
            
            {/* Search filter */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search name, email, address..."
                className="form-input"
                style={{ paddingLeft: '2.25rem', paddingRight: '0.75rem', height: '36px', fontSize: '0.85rem' }}
                value={storeFilters.search}
                onChange={(e) => setStoreFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => triggerStoreSort('name')}>
                    Store Name <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th className="sortable" onClick={() => triggerStoreSort('email')}>
                    Email <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th className="sortable" onClick={() => triggerStoreSort('address')}>
                    Address <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th className="sortable" onClick={() => triggerStoreSort('rating')}>
                    Overall Rating <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {loadingStores ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading stores...</td></tr>
                ) : stores.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No stores found.</td></tr>
                ) : (
                  stores.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '600' }}>{s.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.address}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Star size={14} className={s.rating > 0 ? "star active" : "star"} style={{ fill: s.rating > 0 ? 'var(--warning)' : 'none' }} />
                          <span style={{ fontWeight: '600' }}>{s.rating > 0 ? parseFloat(s.rating).toFixed(1) : 'No Ratings'}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => { setSelectedUser(s); handleViewDetails(s.id); }}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CUSTOMERS / ADMINS LISTING */}
        <div className="glass-container" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={20} className="text-gradient" /> System Users</h3>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%', maxWidth: '500px', justifyContent: 'flex-end' }}>
              {/* Role Filter */}
              <select
                className="form-input"
                style={{ width: '130px', height: '36px', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                value={userFilters.role}
                onChange={(e) => setUserFilters(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="">All Roles</option>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>

              {/* Search filter */}
              <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search name, email, address..."
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', paddingRight: '0.75rem', height: '36px', fontSize: '0.85rem' }}
                  value={userFilters.search}
                  onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => triggerUserSort('name')}>
                    Name <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th className="sortable" onClick={() => triggerUserSort('email')}>
                    Email <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th className="sortable" onClick={() => triggerUserSort('address')}>
                    Address <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th className="sortable" onClick={() => triggerUserSort('role')}>
                    Role <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading users...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No users found.</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: '600' }}>{u.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address}</td>
                      <td>
                        <span className={u.role === 'Admin' ? 'badge badge-admin' : 'badge badge-user'}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => { setSelectedUser(u); handleViewDetails(u.id); }}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* ADD USER / STORE MODAL */}
      {/* ======================================================== */}
      {isAddUserOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Add New {addUserForm.role === 'StoreOwner' ? 'Store' : 'User'}</h2>
              <button className="modal-close-btn" onClick={() => setIsAddUserOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {addUserGeneralError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem', borderRadius: '6px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={16} /> {addUserGeneralError}
              </div>
            )}

            <form onSubmit={handleAddUserSubmit}>
              {/* Conditional Role Select (Only for non-store creation) */}
              {addUserForm.role !== 'StoreOwner' && (
                <div className="form-group">
                  <label className="form-label">Account Role</label>
                  <select
                    className="form-input"
                    value={addUserForm.role}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="User">Normal User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              )}

              {/* Name (Min 20, Max 60) */}
              <div className="form-group">
                <label className="form-label">
                  {addUserForm.role === 'StoreOwner' ? 'Store Name' : 'Full Name'} (Min 20 characters)
                </label>
                <input
                  type="text"
                  className={`form-input ${addUserErrors.name ? 'input-error' : ''}`}
                  value={addUserForm.name}
                  onChange={(e) => setAddUserForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={addUserForm.role === 'StoreOwner' ? 'e.g. Imperial Culinary Arts Restaurant' : 'e.g. Jonathan Alexander Richardson'}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  {addUserErrors.name ? <span className="error-text">{addUserErrors.name}</span> : <span />}
                  <span style={{ fontSize: '0.75rem', color: addUserForm.name.trim().length < 20 || addUserForm.name.trim().length > 60 ? 'var(--warning)' : 'var(--success)' }}>
                    {addUserForm.name.trim().length}/60
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className={`form-input ${addUserErrors.email ? 'input-error' : ''}`}
                  value={addUserForm.email}
                  onChange={(e) => setAddUserForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="name@platform.com"
                  required
                />
                {addUserErrors.email && <span className="error-text">{addUserErrors.email}</span>}
              </div>

              {/* Address (Max 400) */}
              <div className="form-group">
                <label className="form-label">Address (Max 400 characters)</label>
                <textarea
                  className={`form-input ${addUserErrors.address ? 'input-error' : ''}`}
                  style={{ minHeight: '70px', resize: 'vertical', fontFamily: 'inherit' }}
                  value={addUserForm.address}
                  onChange={(e) => setAddUserForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Address details..."
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  {addUserErrors.address ? <span className="error-text">{addUserErrors.address}</span> : <span />}
                  <span style={{ fontSize: '0.75rem', color: addUserForm.address.trim().length > 400 ? 'var(--error)' : 'var(--text-muted)' }}>
                    {addUserForm.address.trim().length}/400
                  </span>
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label">Password (8-16 chars, 1 uppercase, 1 special)</label>
                <input
                  type="password"
                  className={`form-input ${addUserErrors.password ? 'input-error' : ''}`}
                  value={addUserForm.password}
                  onChange={(e) => setAddUserForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                />
                {addUserErrors.password && <span className="error-text">{addUserErrors.password}</span>}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setIsAddUserOpen(false)}
                  disabled={addUserLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={addUserLoading}
                >
                  {addUserLoading ? 'Creating...' : `Create ${addUserForm.role === 'StoreOwner' ? 'Store' : 'User'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DETAILS VIEW MODAL */}
      {/* ======================================================== */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="modal-close-btn" onClick={() => setSelectedUser(null)}>
                <X size={20} />
              </button>
            </div>

            {loadingDetail ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>Loading user records...</div>
            ) : !userDetail ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>Record could not be retrieved.</div>
            ) : (
              <div>
                <div className="glass-container" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.15)' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>{userDetail.name}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span className={userDetail.role === 'Admin' ? 'badge badge-admin' : userDetail.role === 'StoreOwner' ? 'badge badge-store' : 'badge badge-user'}>
                      {userDetail.role}
                    </span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '0.75rem 0' }} />
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Email:</strong> {userDetail.email}
                  </div>
                  <div style={{ fontSize: '0.9rem' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Address:</strong> {userDetail.address}
                  </div>
                </div>

                {/* Rating specific fields for Store Owners */}
                {userDetail.role === 'StoreOwner' && (
                  <div>
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Star size={16} className="text-gradient" /> Store Review Log ({userDetail.totalRatings} Ratings)
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '2rem', fontWeight: '800' }}>
                          {userDetail.rating > 0 ? parseFloat(userDetail.rating).toFixed(2) : '0.0'}
                        </span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}> / 5.00</span>
                      </div>
                      <div className="stars-display">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={20}
                            className={star <= Math.round(userDetail.rating) ? 'star active' : 'star'}
                            style={{ fill: star <= Math.round(userDetail.rating) ? 'var(--warning)' : 'none' }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="table-container" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                      <table className="modern-table" style={{ fontSize: '0.85rem' }}>
                        <thead>
                          <tr>
                            <th>User</th>
                            <th style={{ textAlign: 'center' }}>Rating</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userDetail.ratings?.length === 0 ? (
                            <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No ratings submitted.</td></tr>
                          ) : (
                            userDetail.ratings?.map((r, i) => (
                              <tr key={i}>
                                <td>
                                  <div style={{ fontWeight: '600' }}>{r.userName}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.userEmail}</div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <span className="badge badge-store" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                                    {r.rating} ★
                                  </span>
                                </td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                  {new Date(r.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
