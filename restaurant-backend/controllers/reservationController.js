const pool = require("../models/db");

// Create a new reservation
exports.createReservation = async (req, res) => {
  const { restaurant_id, date, time, people_count } = req.body;
  const user_id = req.user ? req.user.user_id : null;

  console.log("User ID from token:", user_id);

  if (!user_id || !restaurant_id || !date || !time || !people_count) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const conn = await pool.getConnection();

    // Check if restaurant exists
    const [restaurantInfo] = await conn.query(
      "SELECT * FROM restaurants WHERE restaurant_id = ?",
      [restaurant_id]
    );

    if (!restaurantInfo || restaurantInfo.length === 0) {
      conn.release();
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Check if user already has a reservation at this restaurant for this time
    const [userReservation] = await conn.query(
      "SELECT * FROM reservations WHERE user_id = ? AND restaurant_id = ? AND date = ? AND time = ?",
      [user_id, restaurant_id, date, time]
    );

    if (userReservation && userReservation.length > 0) {
      conn.release();
      return res.status(400).json({
        error: "You already have a reservation for this time slot.",
      });
    }

    await conn.query(
      "INSERT INTO reservations (user_id, restaurant_id, date, time, people_count) VALUES (?, ?, ?, ?, ?)",
      [user_id, restaurant_id, date, time, people_count]
    );

    conn.release();
    res.status(201).json({ message: "Reservation created successfully" });
  } catch (err) {
    console.error("Reservation insert error:", err);
    res.status(500).json({
      error: err.message || "Failed to create reservation",
    });
  }
};

// Get reservations for the logged-in user
exports.getUserReservations = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const conn = await pool.getConnection();
    const [reservations] = await conn.query(
      `SELECT r.name AS restaurant_name, res.reservation_id, res.date, res.time, res.people_count
       FROM reservations res
       JOIN restaurants r ON res.restaurant_id = r.restaurant_id
       WHERE res.user_id = ?
       ORDER BY res.date, res.time`,
      [user_id]
    );
    conn.release();
    res.json(reservations);
  } catch (err) {
    res.status(500).json({
      error: err.message || "Failed to retrieve reservations",
    });
  }
};

// Update a reservation
exports.updateReservation = async (req, res) => {
  const { reservation_id, date, time, people_count } = req.body;
  const user_id = req.user.user_id;

  if (!reservation_id || !date || !time || !people_count) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      `UPDATE reservations
       SET date = ?, time = ?, people_count = ?
       WHERE reservation_id = ? AND user_id = ?`,
      [date, time, people_count, reservation_id, user_id]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reservation not found or unauthorized" });
    }

    res.json({ message: "Reservation updated successfully" });
  } catch (err) {
    res.status(500).json({
      error: err.message || "Failed to update reservation",
    });
  }
};

// Delete a reservation
exports.deleteReservation = async (req, res) => {
  const { reservation_id } = req.params;
  const user_id = req.user.user_id;

  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      "DELETE FROM reservations WHERE reservation_id = ? AND user_id = ?",
      [reservation_id, user_id]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reservation not found or unauthorized" });
    }

    res.json({ message: "Reservation deleted successfully" });
  } catch (err) {
    res.status(500).json({
      error: err.message || "Failed to delete reservation",
    });
  }
};