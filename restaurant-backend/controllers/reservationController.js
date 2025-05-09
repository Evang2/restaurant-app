const pool = require("../models/db");

// Create a new reservation
exports.createReservation = async (req, res) => {
  const { restaurant_id, date, time, people_count } = req.body;
  const user_id = req.user ? req.user.user_id : null;

  console.log("User ID from token:", user_id);

  // Validate inputs
  if (!user_id || !restaurant_id || !date || !time || !people_count) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
  }

  // Validate time format (HH:MM or HH:MM:SS)
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  if (!timeRegex.test(time)) {
    return res.status(400).json({ error: "Invalid time format. Use HH:MM or HH:MM:SS" });
  }

  // Validate people_count
  if (!Number.isInteger(people_count) || people_count < 1) {
    return res.status(400).json({ error: "People count must be a positive integer" });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Check if restaurant exists
    const restaurantInfo = await conn.query(
      "SELECT * FROM restaurants WHERE restaurant_id = ?",
      [restaurant_id]
    );

    if (!restaurantInfo || restaurantInfo.length === 0) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Check if user already has a reservation at this restaurant for this time
    const userReservation = await conn.query(
      "SELECT * FROM reservations WHERE user_id = ? AND restaurant_id = ? AND date = ? AND time = ?",
      [user_id, restaurant_id, date, time]
    );

    if (userReservation && userReservation.length > 0) {
      return res.status(400).json({
        error: "You already have a reservation for this time slot.",
      });
    }

    // Normalize time to HH:MM:SS
    const normalizedTime = time.length === 5 ? `${time}:00` : time;

    await conn.query(
      "INSERT INTO reservations (user_id, restaurant_id, date, time, people_count) VALUES (?, ?, ?, ?, ?)",
      [user_id, restaurant_id, date, normalizedTime, people_count]
    );

    res.status(201).json({ message: "Reservation created successfully" });
  } catch (err) {
    console.error("Reservation insert error:", err);
    res.status(500).json({
      error: err.message || "Failed to create reservation",
    });
  } finally {
    if (conn) conn.release();
  }
};

// Get reservations for the logged-in user
exports.getUserReservations = async (req, res) => {
  const user_id = req.user.user_id;

  let conn;
  try {
    conn = await pool.getConnection();

    console.log("Fetching reservations for user:", user_id);

    const reservations = await conn.query(
      `SELECT r.name AS restaurant_name, 
              r.restaurant_id, 
              res.reservation_id, 
              DATE_FORMAT(res.date, '%Y-%m-%d') AS date, 
              TIME_FORMAT(res.time, '%H:%i:%s') AS time, 
              res.people_count
       FROM reservations res
       JOIN restaurants r ON res.restaurant_id = r.restaurant_id
       WHERE res.user_id = ?
       ORDER BY res.date, res.time`,
      [user_id]
    );

    console.log("Raw query result:", JSON.stringify(reservations, null, 2));
    console.log("Found reservations:", reservations.length);

    // Ensure response is always an array
    res.json(Array.isArray(reservations) ? reservations : []);
  } catch (err) {
    console.error("Error fetching reservations:", err);
    res.status(500).json({
      error: err.message || "Failed to retrieve reservations",
    });
  } finally {
    if (conn) conn.release();
  }
};

// Update a reservation
exports.updateReservation = async (req, res) => {
  const { reservation_id, date, time, people_count } = req.body;
  const user_id = req.user.user_id;

  // Validate inputs
  if (!reservation_id || !date || !time || !people_count) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
  }

  // Validate time format
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  if (!timeRegex.test(time)) {
    return res.status(400).json({ error: "Invalid time format. Use HH:MM or HH:MM:SS" });
  }

  // Validate people_count
  if (!Number.isInteger(people_count) || people_count < 1) {
    return res.status(400).json({ error: "People count must be a positive integer" });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Normalize time to HH:MM:SS
    const normalizedTime = time.length === 5 ? `${time}:00` : time;

    const result = await conn.query(
      `UPDATE reservations
       SET date = ?, time = ?, people_count = ?
       WHERE reservation_id = ? AND user_id = ?`,
      [date, normalizedTime, people_count, reservation_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reservation not found or unauthorized" });
    }

    res.json({ message: "Reservation updated successfully" });
  } catch (err) {
    console.error("Error updating reservation:", err);
    res.status(500).json({
      error: err.message || "Failed to update reservation",
    });
  } finally {
    if (conn) conn.release();
  }
};

// Delete a reservation
exports.deleteReservation = async (req, res) => {
  const { reservation_id } = req.params;
  const user_id = req.user.user_id;

  let conn;
  try {
    conn = await pool.getConnection();

    const result = await conn.query(
      "DELETE FROM reservations WHERE reservation_id = ? AND user_id = ?",
      [reservation_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reservation not found or unauthorized" });
    }

    res.json({ message: "Reservation deleted successfully" });
  } catch (err) {
    console.error("Error deleting reservation:", err);
    res.status(500).json({
      error: err.message || "Failed to delete reservation",
    });
  } finally {
    if (conn) conn.release();
  }
};