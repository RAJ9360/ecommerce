const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { validateUser } = require('../utils/validate');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authenticateToken);
router.use(requireRole(['Admin']));

// @route   GET /api/admin/stats
// @desc    Get dashboard metrics (Total users, total stores, total ratings)
// @access  Admin
router.get('/stats', async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.query("SELECT COUNT(*) AS totalUsers FROM users WHERE role IN ('Admin', 'User')");
    const [[{ totalStores }]] = await db.query("SELECT COUNT(*) AS totalStores FROM users WHERE role = 'StoreOwner'");
    const [[{ totalRatings }]] = await db.query("SELECT COUNT(*) AS totalRatings FROM ratings");

    res.json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Server error fetching stats.' });
  }
});

// @route   POST /api/admin/users
// @desc    Add a new store, normal user, or admin user
// @access  Admin
router.post('/users', async (req, res) => {
  const { name, email, password, address, role } = req.body;

  if (!['Admin', 'User', 'StoreOwner'].includes(role)) {
    return res.status(400).json({ errors: { role: 'Invalid role specified.' } });
  }

  // Validate fields
  const { isValid, errors } = validateUser({ name, email, password, address });
  if (!isValid) {
    return res.status(400).json({ errors });
  }

  try {
    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ errors: { email: 'Email is already registered.' } });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, address.trim(), role]
    );

    res.status(201).json({
      message: `${role} added successfully.`,
      userId: result.insertId
    });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ message: 'Server error adding new user.' });
  }
});

// @route   GET /api/admin/users
// @desc    View list of normal and admin users (with filters and sorting)
// @access  Admin
router.get('/users', async (req, res) => {
  const { search, name, email, address, role, sortBy, sortOrder } = req.query;

  try {
    let query = "SELECT id, name, email, address, role, created_at FROM users WHERE role IN ('Admin', 'User')";
    const params = [];

    // Filter by specific fields
    if (role && ['Admin', 'User'].includes(role)) {
      query += " AND role = ?";
      params.push(role);
    }
    if (name) {
      query += " AND name LIKE ?";
      params.push(`%${name}%`);
    }
    if (email) {
      query += " AND email LIKE ?";
      params.push(`%${email}%`);
    }
    if (address) {
      query += " AND address LIKE ?";
      params.push(`%${address}%`);
    }

    // General search filter (Name, Email, Address, Role)
    if (search) {
      query += " AND (name LIKE ? OR email LIKE ? OR address LIKE ? OR role LIKE ?)";
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild, searchWild);
    }

    // Sorting
    const validSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    const activeSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';
    const activeSortOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';
    
    query += ` ORDER BY ${activeSortBy} ${activeSortOrder}`;

    const [users] = await db.query(query, params);
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: 'Server error fetching user listings.' });
  }
});

// @route   GET /api/admin/stores
// @desc    View list of stores (with rating, filters, and sorting)
// @access  Admin
router.get('/stores', async (req, res) => {
  const { search, name, email, address, sortBy, sortOrder } = req.query;

  try {
    let query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.address, 
        u.role,
        IFNULL(AVG(r.rating), 0) AS rating
      FROM users u
      LEFT JOIN ratings r ON u.id = r.store_id
      WHERE u.role = 'StoreOwner'
    `;
    const params = [];

    if (name) {
      query += " AND u.name LIKE ?";
      params.push(`%${name}%`);
    }
    if (email) {
      query += " AND u.email LIKE ?";
      params.push(`%${email}%`);
    }
    if (address) {
      query += " AND u.address LIKE ?";
      params.push(`%${address}%`);
    }

    // General search
    if (search) {
      query += " AND (u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)";
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild);
    }

    query += " GROUP BY u.id";

    // Sorting
    const validSortFields = ['name', 'email', 'address', 'rating'];
    const activeSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';
    const activeSortOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${activeSortBy} ${activeSortOrder}`;

    const [stores] = await db.query(query, params);
    res.json(stores);
  } catch (error) {
    console.error('Fetch stores error:', error);
    res.status(500).json({ message: 'Server error fetching store listings.' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    View details of a specific user (including average rating if StoreOwner)
// @access  Admin
router.get('/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const [users] = await db.query('SELECT id, name, email, address, role, created_at FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];

    if (user.role === 'StoreOwner') {
      const [[{ rating }]] = await db.query('SELECT IFNULL(AVG(rating), 0) AS rating FROM ratings WHERE store_id = ?', [userId]);
      const [ratingCount] = await db.query('SELECT COUNT(*) AS totalRatings FROM ratings WHERE store_id = ?', [userId]);
      user.rating = rating;
      user.totalRatings = ratingCount[0].totalRatings;

      // Get reviews detail as well
      const [ratingsList] = await db.query(`
        SELECT r.rating, r.created_at, u.name AS userName, u.email AS userEmail
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        WHERE r.store_id = ?
        ORDER BY r.created_at DESC
      `, [userId]);
      user.ratings = ratingsList;
    }

    res.json(user);
  } catch (error) {
    console.error('Fetch user details error:', error);
    res.status(500).json({ message: 'Server error fetching user details.' });
  }
});

module.exports = router;
