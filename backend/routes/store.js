const express = require('express');
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes here
router.use(authenticateToken);

// ==========================================
// NORMAL USER ROUTES
// ==========================================

// @route   GET /api/stores
// @desc    Get all registered stores with average rating & current user's submitted rating
// @access  Normal User (also accessible by Admin for viewing)
router.get('/stores', requireRole(['User', 'Admin']), async (req, res) => {
  const { name, address, search, sortBy, sortOrder } = req.query;
  const currentUserId = req.user.id;

  try {
    let query = `
      SELECT 
        u.id, 
        u.name, 
        u.email,
        u.address, 
        IFNULL(AVG(r_all.rating), 0) AS overallRating,
        COUNT(r_all.id) AS totalRatings,
        IFNULL(r_user.rating, 0) AS userRating
      FROM users u
      LEFT JOIN ratings r_all ON u.id = r_all.store_id
      LEFT JOIN ratings r_user ON u.id = r_user.store_id AND r_user.user_id = ?
      WHERE u.role = 'StoreOwner'
    `;
    const params = [currentUserId];

    if (name) {
      query += " AND u.name LIKE ?";
      params.push(`%${name}%`);
    }
    if (address) {
      query += " AND u.address LIKE ?";
      params.push(`%${address}%`);
    }
    if (search) {
      query += " AND (u.name LIKE ? OR u.address LIKE ?)";
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild);
    }

    query += " GROUP BY u.id";

    // Sorting
    const validSortFields = ['name', 'address', 'overallRating', 'userRating'];
    const activeSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';
    const activeSortOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    // To sort by calculated alias in GROUP BY:
    if (activeSortBy === 'overallRating') {
      query += ` ORDER BY overallRating ${activeSortOrder}`;
    } else if (activeSortBy === 'userRating') {
      query += ` ORDER BY userRating ${activeSortOrder}`;
    } else {
      query += ` ORDER BY u.${activeSortBy} ${activeSortOrder}`;
    }

    const [stores] = await db.query(query, params);
    res.json(stores);
  } catch (error) {
    console.error('Fetch stores error:', error);
    res.status(500).json({ message: 'Server error fetching stores.' });
  }
});

// @route   POST /api/stores/:id/rate
// @desc    Submit or modify rating for a store (1-5)
// @access  Normal User
router.post('/stores/:id/rate', requireRole(['User']), async (req, res) => {
  const storeId = req.params.id;
  const currentUserId = req.user.id;
  const { rating } = req.body;

  // Validate rating value
  const ratingVal = parseInt(rating, 10);
  if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
  }

  try {
    // Verify target user is actually a StoreOwner
    const [stores] = await db.query("SELECT id FROM users WHERE id = ? AND role = 'StoreOwner'", [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found or invalid user.' });
    }

    // Insert or update rating
    const query = `
      INSERT INTO ratings (user_id, store_id, rating)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE rating = VALUES(rating), updated_at = CURRENT_TIMESTAMP
    `;
    await db.query(query, [currentUserId, storeId, ratingVal]);

    res.json({ message: 'Rating submitted successfully.' });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Server error submitting rating.' });
  }
});


// ==========================================
// STORE OWNER ROUTES
// ==========================================

// @route   GET /api/store-owner/dashboard
// @desc    Get average rating & list of users who submitted ratings
// @access  Store Owner
router.get('/store-owner/dashboard', requireRole(['StoreOwner']), async (req, res) => {
  const storeId = req.user.id;
  const { sortBy, sortOrder, search } = req.query;

  try {
    // 1. Get average rating and count
    const [[{ averageRating, totalRatings }]] = await db.query(
      'SELECT IFNULL(AVG(rating), 0) AS averageRating, COUNT(*) AS totalRatings FROM ratings WHERE store_id = ?',
      [storeId]
    );

    // 2. Get list of users who rated with filters and sorting
    let usersQuery = `
      SELECT 
        r.rating, 
        r.updated_at AS ratingDate, 
        u.name AS userName, 
        u.email AS userEmail, 
        u.address AS userAddress
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
    `;
    const params = [storeId];

    if (search) {
      usersQuery += " AND (u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)";
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild);
    }

    // Sorting
    const validSortFields = ['userName', 'userEmail', 'userAddress', 'rating', 'ratingDate'];
    const activeSortBy = validSortFields.includes(sortBy) ? sortBy : 'ratingDate';
    const activeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC'; // Default to DESC (newest ratings first)

    if (activeSortBy === 'userName') {
      usersQuery += ` ORDER BY u.name ${activeSortOrder}`;
    } else if (activeSortBy === 'userEmail') {
      usersQuery += ` ORDER BY u.email ${activeSortOrder}`;
    } else if (activeSortBy === 'userAddress') {
      usersQuery += ` ORDER BY u.address ${activeSortOrder}`;
    } else if (activeSortBy === 'rating') {
      usersQuery += ` ORDER BY r.rating ${activeSortOrder}`;
    } else {
      usersQuery += ` ORDER BY r.updated_at ${activeSortOrder}`;
    }

    const [ratingUsers] = await db.query(usersQuery, params);

    res.json({
      averageRating: parseFloat(averageRating).toFixed(2),
      totalRatings,
      ratings: ratingUsers
    });
  } catch (error) {
    console.error('Store owner dashboard error:', error);
    res.status(500).json({ message: 'Server error loading dashboard data.' });
  }
});

module.exports = router;
