const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// Endpoint to get all restaurant data
router.get('/', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM restaurants');
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching restaurants:', err);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Endpoint to get a single restaurant by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM restaurants WHERE restaurant_id = ?', [id]);
    conn.release();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching restaurant:', err);
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

module.exports = router;