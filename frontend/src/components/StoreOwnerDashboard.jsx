import React, { useState, useEffect } from 'react';
import { Star, Users, Search, ArrowUpDown, ShieldCheck } from 'lucide-react';

export default function StoreOwnerDashboard({ token }) {
  const [data, setData] = useState({ averageRating: '0.00', totalRatings: 0, ratings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', sortBy: 'ratingDate', sortOrder: 'DESC' });

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const { search, sortBy, sortOrder } = filters;
      const url = new URL('http://localhost:5000/api/store-owner/dashboard');
      if (search) url.searchParams.append('search', search);
      if (sortBy) url.searchParams.append('sortBy', sortBy);
      if (sortOrder) url.searchParams.append('sortOrder', sortOrder);

      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || 'Failed to fetch dashboard data.');
      }
      setData(resData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const triggerSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'DESC' ? 'ASC' : 'DESC'
    }));
  };

  return (
    <div className="animate-fade-in">
      
      {/* 1. Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Store Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Monitor your ratings, customer logs, and average reputation scoring</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px', color: '#fca5a5', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* 2. Stats Summary cards */}
      <div className="dashboard-grid">
        <div className="glass-container stat-card" style={{ background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
          <div className="stat-info">
            <p>Average Rating Score</p>
            <h3 className="text-gradient" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              {loading ? '...' : data.averageRating}
              <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>/ 5.00</span>
            </h3>
          </div>
          <div className="stat-icon" style={{ color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)' }}>
            <Star size={24} style={{ fill: 'var(--warning)' }} />
          </div>
        </div>

        <div className="glass-container stat-card">
          <div className="stat-info">
            <p>Total Customers Rated</p>
            <h3 className="text-gradient">{loading ? '...' : data.totalRatings}</h3>
          </div>
          <div className="stat-icon">
            <Users size={24} />
          </div>
        </div>

        <div className="glass-container stat-card">
          <div className="stat-info">
            <p>Reputation Standing</p>
            <h3 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.75rem' }}>
              {loading ? '...' : (parseFloat(data.averageRating) >= 4.0 ? 'EXCELLENT' : parseFloat(data.averageRating) >= 3.0 ? 'GOOD' : 'ATTENTION REQ.')}
            </h3>
          </div>
          <div className="stat-icon" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)' }}>
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* 3. Ratings Table */}
      <div className="glass-container" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={20} className="text-gradient" /> Customer Rating Logs
            </h3>
          </div>

          {/* Search Filter */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search user name, email, address..."
              className="form-input"
              style={{ paddingLeft: '2.25rem', paddingRight: '0.75rem', height: '36px', fontSize: '0.85rem' }}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => triggerSort('userName')}>
                  Customer Name <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                </th>
                <th className="sortable" onClick={() => triggerSort('userEmail')}>
                  Email <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                </th>
                <th className="sortable" onClick={() => triggerSort('userAddress')}>
                  Address <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                </th>
                <th className="sortable" onClick={() => triggerSort('rating')} style={{ textAlign: 'center' }}>
                  Submitted Rating <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                </th>
                <th className="sortable" onClick={() => triggerSort('ratingDate')}>
                  Date Submitted <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading customer logs...</td></tr>
              ) : data.ratings.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No ratings log available.</td></tr>
              ) : (
                data.ratings.map((log, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: '600' }}>{log.userName}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{log.userEmail}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.userAddress}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-store" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderColor: 'rgba(245, 158, 11, 0.3)', fontWeight: '700' }}>
                        {log.rating} ★
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(log.ratingDate).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
