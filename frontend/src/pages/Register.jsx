// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import api from '../api/axios';
import './AuthForm.css';
import { sendOtpEmail } from '../helpers/emailjsOtp'; // ✅ UPDATED IMPORT

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
  });

  // Doctor documents
  const [doctorDocs, setDoctorDocs] = useState({
    photo: null,
    idProof: null,
    degree: null,
  });

  const [emailStatus, setEmailStatus] = useState({
    checking: false,
    exists: null,
    message: '',
  });

  const [otpState, setOtpState] = useState({
    sending: false,
    sent: false,
    verifying: false,
    verified: false,
    message: '',
    code: '',
  });

  // ✅ store generated OTP locally (frontend)
  const [generatedOtp, setGeneratedOtp] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'email') {
      setEmailStatus({
        checking: false,
        exists: null,
        message: '',
      });
      setOtpState({
        sending: false,
        sent: false,
        verifying: false,
        verified: false,
        message: '',
        code: '',
      });
      setGeneratedOtp(''); // ✅ reset otp on email change
    }
  };

  const handleDocChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;
    setDoctorDocs((prev) => ({
      ...prev,
      [name]: file,
    }));
  };

  const handleEmailBlur = async () => {
    const email = formData.email.trim();

    if (!email) {
      setEmailStatus({
        checking: false,
        exists: false,
        message: 'Email is required.',
      });
      return;
    }

    if (!gmailRegex.test(email)) {
      setEmailStatus({
        checking: false,
        exists: false,
        message: 'Please enter a valid Gmail address.',
      });
      return;
    }

    try {
      setEmailStatus({ checking: true, exists: null, message: '' });

      const { data } = await api.post('/api/auth/verify-email', { email });

      if (data.exists) {
        setEmailStatus({
          checking: false,
          exists: true,
          message: 'Email exists and looks good!',
        });
      } else {
        setEmailStatus({
          checking: false,
          exists: false,
          message: data.message || 'Email does not exist.',
        });
      }
    } catch (error) {
      setEmailStatus({
        checking: false,
        exists: false,
        message:
          error.response?.data?.message ||
          'Error verifying email. Please try again.',
      });
    }
  };

  // 🔁 Send OTP via EmailJS (no backend)
  const handleSendOtp = async () => {
    const email = formData.email.trim();

    if (!email) {
      setOtpState((prev) => ({ ...prev, message: 'Enter email first.' }));
      return;
    }

    if (!gmailRegex.test(email)) {
      setOtpState((prev) => ({
        ...prev,
        message: 'Invalid Gmail address.',
      }));
      return;
    }

    if (!emailStatus.exists) {
      setOtpState((prev) => ({
        ...prev,
        message: 'Please wait until email validation completes.',
      }));
      return;
    }

    try {
      setOtpState((prev) => ({ ...prev, sending: true, message: '' }));

      // ✅ generate OTP in frontend
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);

      // ✅ send OTP via EmailJS
      await sendOtpEmail(email, otp);

      setOtpState((prev) => ({
        ...prev,
        sending: false,
        sent: true,
        message: 'OTP Sent!',
      }));

      toast.success('OTP sent to your Gmail.');
    } catch (error) {
      console.error(error);
      const msg = 'Failed to send OTP. Please try again.';
      setOtpState((prev) => ({ ...prev, sending: false, message: msg }));
      toast.error(msg);
    }
  };

  // 🔁 Verify OTP on frontend (no backend)
  const handleVerifyOtp = () => {
    const code = otpState.code.trim();

    if (!code) {
      setOtpState((prev) => ({
        ...prev,
        message: 'Please enter OTP.',
      }));
      return;
    }

    setOtpState((prev) => ({ ...prev, verifying: true, message: '' }));

    // simple local check
    if (code === generatedOtp) {
      setOtpState((prev) => ({
        ...prev,
        verifying: false,
        verified: true,
        message: 'OTP verified successfully!',
      }));
      toast.success('OTP verified!');
    } else {
      setOtpState((prev) => ({
        ...prev,
        verifying: false,
        verified: false,
        message: 'Invalid OTP.',
      }));
      toast.error('Invalid OTP.');
    }
  };

  const canRegister =
    formData.name.trim().length > 0 &&
    formData.password.trim().length >= 6 &&
    emailStatus.exists === true &&
    otpState.verified === true &&
    // Doctor → all 3 docs required
    (formData.role !== 'doctor' ||
      (doctorDocs.photo && doctorDocs.idProof && doctorDocs.degree));

  const sendOtpBtnClass =
    otpState.verified
      ? 'auth-btn-success'
      : otpState.sent
      ? 'auth-btn-success'
      : 'auth-btn-primary';

  const verifyBtnClass =
    otpState.verified ? 'auth-btn-success' : 'auth-btn-primary';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canRegister) {
      toast.error(
        'Complete all steps (including documents for doctor) and verify OTP first.'
      );
      return;
    }

    try {
      setSubmitting(true);

      let url = '/api/auth/register';
      let payload = formData;
      let config = {};

      if (formData.role === 'doctor') {
        url = '/api/auth/register-doctor';

        const fd = new FormData();
        fd.append('name', formData.name.trim());
        fd.append('email', formData.email.trim());
        fd.append('password', formData.password.trim());
        // backend automatically sets role = "doctor" in User model

        if (doctorDocs.photo) fd.append('photo', doctorDocs.photo);
        if (doctorDocs.idProof) fd.append('idProof', doctorDocs.idProof);
        if (doctorDocs.degree) fd.append('degree', doctorDocs.degree);

        payload = fd;
        config.headers = { 'Content-Type': 'multipart/form-data' };
      }

      const { data } = await api.post(url, payload, config);

      if (formData.role === 'doctor') {
        toast.success(
          data.message ||
            'Doctor registration submitted! Wait for admin approval.'
        );
        navigate('/doctor-login');
      } else {
        toast.success('Registered successfully! Login now.');
        navigate('/patient-login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const isDoctor = formData.role === 'doctor';

  return (
    <div className="auth-container">
      <Toaster position="top-center" />

      <form
        className="auth-form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <h2>Register as {formData.role.toUpperCase()}</h2>

        {/* NAME */}
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        {/* EMAIL */}
        <div className="form-group">
          <label>Email Address (Gmail)</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            onBlur={handleEmailBlur}
          />
          {emailStatus.checking && (
            <p className="auth-info-text">Checking email...</p>
          )}
          {emailStatus.message && (
            <p
              className="auth-info-text"
              style={{ color: emailStatus.exists ? 'green' : 'red' }}
            >
              {emailStatus.message}
            </p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="form-group">
          <label>Password (min 6 characters)</label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
          />

          {formData.password.trim().length > 0 &&
            formData.password.trim().length < 6 && (
              <p className="auth-info-text" style={{ color: 'red' }}>
                Password must be at least 6 characters.
              </p>
            )}
        </div>

        {/* OTP SECTION */}
        <div className="form-group">
          <label>Email Verification (OTP)</label>

          <div className="otp-row">
            <button
              type="button"
              className={sendOtpBtnClass}
              onClick={handleSendOtp}
              disabled={
                !formData.email.trim() ||
                !gmailRegex.test(formData.email.trim()) ||
                emailStatus.exists !== true ||
                emailStatus.checking ||
                otpState.sending ||
                otpState.verified
              }
            >
              {otpState.sending
                ? 'Sending OTP...'
                : otpState.verified
                ? 'Email Verified ✅'
                : 'Send OTP'}
            </button>
          </div>

          {otpState.sent && !otpState.verified && (
            <div className="otp-input-row">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otpState.code}
                onChange={(e) =>
                  setOtpState((prev) => ({ ...prev, code: e.target.value }))
                }
              />

              <button
                type="button"
                className={verifyBtnClass}
                onClick={handleVerifyOtp}
                disabled={otpState.verifying}
              >
                {otpState.verifying ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          )}

          {otpState.message && (
            <p
              className="auth-info-text"
              style={{ color: otpState.verified ? 'green' : 'red' }}
            >
              {otpState.message}
            </p>
          )}
        </div>

        {/* ROLE SELECT */}
        <div className="form-group">
          <label>Register as</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>

        {/* Doctor Documents Section */}
        {isDoctor && (
          <div className="form-group">
            <label>Doctor Verification Documents</label>
            <div className="doc-upload-group">
              <div className="file-field">
                <span>Profile Photo</span>
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleDocChange}
                  required={isDoctor}
                />
              </div>
              <div className="file-field">
                <span>ID Proof</span>
                <input
                  type="file"
                  name="idProof"
                  accept="image/*,application/pdf"
                  onChange={handleDocChange}
                  required={isDoctor}
                />
              </div>
              <div className="file-field">
                <span>Degree Certificate</span>
                <input
                  type="file"
                  name="degree"
                  accept="image/*,application/pdf"
                  onChange={handleDocChange}
                  required={isDoctor}
                />
              </div>
              <p className="auth-info-text">
                Your account will stay <b>Pending</b> until admin verifies these
                documents.
              </p>
            </div>
          </div>
        )}

        {/* SUBMIT */}
        <button type="submit" disabled={!canRegister || submitting}>
          {submitting ? 'Registering...' : 'Register'}
        </button>

        {/* LINK */}
        <p>
          Already have an account?{' '}
          {formData.role === 'doctor' ? (
            <Link to="/doctor-login">Login here</Link>
          ) : (
            <Link to="/patient-login">Login here</Link>
          )}
        </p>
      </form>
    </div>
  );
};

export default Register;
