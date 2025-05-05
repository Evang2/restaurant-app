const express = require('express');
const router = express.Router();
const pool = require('../models/db'); // Assuming you're using a database connection pool

// Endpoint to get all restaurant data
router.get('/restaurants', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    // Assuming you have a 'restaurants' table
    const rows = await conn.query('SELECT * FROM restaurants');
    conn.release(); // Don't forget to release the connection after use
    res.json(rows); // Respond with the rows from the database
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

module.exports = router;
