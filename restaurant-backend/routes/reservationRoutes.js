const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const verifyToken = require('../middleware/authmiddleware');

router.post('/reservations', verifyToken, reservationController.createReservation);
router.get('/user/reservations', verifyToken, reservationController.getUserReservations);
router.put('/reservations', verifyToken, reservationController.updateReservation);
router.delete('/reservations/:reservation_id', verifyToken, reservationController.deleteReservation);

module.exports = router;
