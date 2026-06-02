import React, { useState, useEffect } from 'react';
import { Store, Star, Search, ArrowUpDown, Edit, CheckSquare, X } from 'lucide-react';

export default function NormalUserDashboard({ token }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', sortBy: 'name', sortOrder: 'ASC' });
  const [error, setError] = useState('');

  // Rating Modal state
  const [activeStore, setActiveStore] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState('');

  const fetchStores = async () => {
    setLoading(true);
    setError('');
    try {
      const { search, sortBy, sortOrder } = filters;
      const url = new URL('http://localhost:5000/api/stores');
      if (search) url.searchParams.append('search', search);
      if (sortBy) url.searchParams.append('sortBy', sortBy);
      if (sortOrder) url.searchParams.append('sortOrder', sortOrder);

      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch stores.');
      }
      setStores(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [filters]);

  const triggerSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  // Submit/Modify Rating
  const handleOpenRatingModal = (store) => {
    setActiveStore(store);
    setSelectedRating(store.userRating || 0);
    setHoverRating(0);
    setRatingError('');
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (selectedRating < 1 || selectedRating > 5) {
      setRatingError('Please select a rating between 1 and 5.');
      return;
    }

    setSubmittingRating(true);
    setRatingError('');
    try {
      const res = await fetch(`http://localhost:5000/api/stores/${activeStore.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: selectedRating })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit rating.');
      }

      // Close modal and reload stores
      setActiveStore(null);
      fetchStores();
    } catch (err) {
      setRatingError(err.message);
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="animate-fade-in">
      
      {/* 1. Header & Search Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Explore Stores</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Browse, search, and submit your ratings for registered businesses</p>
        </div>

        {/* Filters */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search stores by Name or Address..."
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px', color: '#fca5a5', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* 2. Sort Bar */}
      <div className="glass-container animate-fade-in" style={{ padding: '0.75rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Sort by:</span>
        <button
          onClick={() => triggerSort('name')}
          style={{ background: 'none', border: 'none', color: filters.sortBy === 'name' ? 'var(--accent-primary)' : 'inherit', fontWeight: filters.sortBy === 'name' ? '700' : '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          Store Name {filters.sortBy === 'name' && <ArrowUpDown size={12} />}
        </button>
        <button
          onClick={() => triggerSort('address')}
          style={{ background: 'none', border: 'none', color: filters.sortBy === 'address' ? 'var(--accent-primary)' : 'inherit', fontWeight: filters.sortBy === 'address' ? '700' : '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          Address {filters.sortBy === 'address' && <ArrowUpDown size={12} />}
        </button>
        <button
          onClick={() => triggerSort('overallRating')}
          style={{ background: 'none', border: 'none', color: filters.sortBy === 'overallRating' ? 'var(--accent-primary)' : 'inherit', fontWeight: filters.sortBy === 'overallRating' ? '700' : '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          Overall Rating {filters.sortBy === 'overallRating' && <ArrowUpDown size={12} />}
        </button>
        <button
          onClick={() => triggerSort('userRating')}
          style={{ background: 'none', border: 'none', color: filters.sortBy === 'userRating' ? 'var(--accent-primary)' : 'inherit', fontWeight: filters.sortBy === 'userRating' ? '700' : '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          Your Rating {filters.sortBy === 'userRating' && <ArrowUpDown size={12} />}
        </button>
      </div>

      {/* 3. Stores Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>Loading store directory...</div>
      ) : stores.length === 0 ? (
        <div className="glass-container" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          No stores found matching your search.
        </div>
      ) : (
        <div className="stores-grid animate-fade-in">
          {stores.map((store) => (
            <div key={store.id} className="glass-container store-card" style={{ display: 'flex', flexDirection: 'column', transition: 'var(--transition)' }}>
              <div className="store-card-header">
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.25rem' }}>{store.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', gap: '0.25rem', alignItems: 'flex-start', minHeight: '40px' }}>
                  {store.address}
                </p>
              </div>

              <div className="store-card-body" style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '8px', padding: '1rem', margin: '0.5rem 0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Rating</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                    <Star size={16} className={store.overallRating > 0 ? "star active" : "star"} style={{ fill: store.overallRating > 0 ? 'var(--warning)' : 'none' }} />
                    <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>
                      {store.overallRating > 0 ? parseFloat(store.overallRating).toFixed(1) : 'No Ratings'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      ({store.totalRatings} ratings)
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Rating</div>
                  <div style={{ marginTop: '0.25rem' }}>
                    {store.userRating > 0 ? (
                      <span className="badge badge-store" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderColor: 'rgba(245, 158, 11, 0.3)', padding: '0.25rem 0.5rem', fontWeight: '700' }}>
                        {store.userRating} ★ Given
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Not Rated</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                className={`btn ${store.userRating > 0 ? 'btn-secondary' : 'btn-primary'}`}
                style={{ width: '100%', marginTop: 'auto' }}
                onClick={() => handleOpenRatingModal(store)}
              >
                {store.userRating > 0 ? (
                  <>
                    <Edit size={16} /> Modify Rating
                  </>
                ) : (
                  <>
                    <CheckSquare size={16} /> Submit Rating
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* RATE STORE MODAL */}
      {/* ======================================================== */}
      {activeStore && (
        <div className="modal-overlay" onClick={() => setActiveStore(null)}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-header">
              <h2>Submit Rating</h2>
              <button className="modal-close-btn" onClick={() => setActiveStore(null)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              How would you rate your experience with <strong style={{ color: 'var(--text-primary)' }}>{activeStore.name}</strong>?
            </p>

            {ratingError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.5rem', borderRadius: '6px', color: '#fca5a5', fontSize: '0.8rem', marginBottom: '1rem' }}>
                {ratingError}
              </div>
            )}

            <form onSubmit={handleRatingSubmit}>
              {/* Star selector */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = star <= (hoverRating || selectedRating);
                  return (
                    <Star
                      key={star}
                      size={36}
                      className={isActive ? 'star star-interactive active' : 'star star-interactive'}
                      style={{ fill: isActive ? 'var(--warning)' : 'none' }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setSelectedRating(star)}
                    />
                  );
                })}
              </div>

              {/* Text indicator */}
              <div style={{ minHeight: '24px', marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: '700', color: 'var(--warning)' }}>
                {selectedRating === 1 && '1 - Poor 😞'}
                {selectedRating === 2 && '2 - Fair 😐'}
                {selectedRating === 3 && '3 - Good 🙂'}
                {selectedRating === 4 && '4 - Very Good 😃'}
                {selectedRating === 5 && '5 - Excellent! 🤩'}
                {selectedRating === 0 && 'Select a Rating'}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setActiveStore(null)}
                  disabled={submittingRating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={submittingRating || selectedRating === 0}
                >
                  {submittingRating ? 'Saving...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
