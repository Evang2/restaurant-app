// app.js
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require('./routes/restaurantRoutes'); // Adjust the path based on your file structure
const reservationRoutes = require('./routes/reservationRoutes');

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Use the auth routes for authentication
app.use("/api/auth", authRoutes);
app.use("/api", restaurantRoutes);
app.use("/api", reservationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
