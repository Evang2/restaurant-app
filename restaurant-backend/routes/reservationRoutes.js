const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const verifyToken = require('../middleware/authmiddleware');

router.post('/', verifyToken, reservationController.createReservation);
router.get('/user/reservations', verifyToken, reservationController.getUserReservations);
router.put('/update', verifyToken, (req, res, next) => {
  console.log('PUT /api/reservations/update hit');
  reservationController.updateReservation(req, res, next);
});
router.delete('/:reservation_id', verifyToken, reservationController.deleteReservation);

module.exports = router;