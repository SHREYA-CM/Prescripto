// routes/medicalHistoryRoutes.js
const express = require('express');
const router = express.Router();

const {
  upsertHistoryForAppointment,
  getMyHistory,
  getHistoryForPatient,
  getAllHistories,
} = require('../controllers/medicalHistoryController');

const { protect, authorize } = require('../middleware/authMiddleware');

// -----------------------------------------------------
// 1) DOCTOR: Create/Update history for an appointment
//    POST /api/medical-history/appointment/:appointmentId
//    Only doctor (spec me admin ko create/update ki permission nahi di)
// -----------------------------------------------------
router.post(
  '/appointment/:appointmentId',
  protect,
  authorize('doctor'),
  upsertHistoryForAppointment
);

// -----------------------------------------------------
// 2) PATIENT: apni medical history
//    GET /api/medical-history/my
// -----------------------------------------------------
router.get('/my', protect, authorize('patient'), getMyHistory);

// -----------------------------------------------------
// 3) DOCTOR + ADMIN: particular patient ki history
//    GET /api/medical-history/patient/:patientId
// -----------------------------------------------------
router.get(
  '/patient/:patientId',
  protect,
  authorize('doctor', 'admin'),
  getHistoryForPatient
);

// -----------------------------------------------------
// 4) ADMIN: saari histories
//    GET /api/medical-history
// -----------------------------------------------------
router.get('/', protect, authorize('admin'), getAllHistories);

module.exports = router;
