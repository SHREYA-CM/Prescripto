const express = require('express');
const router = express.Router();

const {
  bookAppointment,
  getMyBookings,
  getAllAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  payForAppointment
} = require('../controllers/appointmentController');

const { protect, authorize } = require('../middleware/authMiddleware');


// ---------------------------------------------
// 1) BOOK APPOINTMENT (Patient Only)
// ---------------------------------------------
router.post(
  '/',
  protect,
  authorize('patient'),
  bookAppointment
);


// ---------------------------------------------
// 2) MY BOOKINGS (Patient OR Doctor)
// ---------------------------------------------
router.get(
  '/mybookings',
  protect,
  authorize('patient', 'doctor'),
  getMyBookings
);


// ---------------------------------------------
// 3) ALL APPOINTMENTS (Admin Only)
// ---------------------------------------------
router.get(
  '/all',
  protect,
  authorize('admin'),
  getAllAppointments
);


// ---------------------------------------------
// 4) DOCTOR APPOINTMENTS (Doctor Only)
// ---------------------------------------------
router.get(
  '/doctor',
  protect,
  authorize('doctor'),
  getDoctorAppointments
);


// ---------------------------------------------
// 5) DOCTOR UPDATE STATUS (Accept / Decline)
// ---------------------------------------------
router.patch(
  '/:id/status',
  protect,
  authorize('doctor'),
  updateAppointmentStatus
);


// ---------------------------------------------
// 6) PATIENT CANCEL APPOINTMENT
// ---------------------------------------------
router.patch(
  '/:id/cancel',
  protect,
  authorize('patient'),
  cancelAppointment
);


// ---------------------------------------------
// 7) PATIENT PAY FOR APPOINTMENT (DUMMY PAYMENT)
// ---------------------------------------------
router.patch(
  '/:id/pay',
  protect,
  authorize('patient'),
  payForAppointment
);


module.exports = router;
