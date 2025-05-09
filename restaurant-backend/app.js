const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const reservationRoutes = require("./routes/reservationRoutes");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/reservations", reservationRoutes);

// Handle 404 errors
app.use((req, res, next) => {
  console.log(`404: Route not found for ${req.method} ${req.url}`);
  res.status(404).send(`Cannot ${req.method} ${req.url}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
