import React, { useEffect, useState, useContext, useMemo } from "react";
import api from "../../src/api/axios.js";
import { AppContext } from "../context/AppContext.jsx";
import toast, { Toaster } from "react-hot-toast";
import "./DoctorDashboard.css";

const DoctorDashboard = () => {
  const { user } = useContext(AppContext);

  const [appointments, setAppointments] = useState([]);
  const [loadingAppt, setLoadingAppt] = useState(true);
  const [filter, setFilter] = useState("upcoming");
  const [activeTab, setActiveTab] = useState("appointments");

  const [profileForm, setProfileForm] = useState({
    speciality: "",
    degree: "",
    experience: "",
    fees: "",
    about: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false); // ⭐ NEW

  /* -----------------------------------------------------------
     LOAD DOCTOR APPOINTMENTS (ONLY ONCE)
  -------------------------------------------------------------*/
  const loadAppointments = async () => {
    try {
      setLoadingAppt(true);

      const res = await api.get("/api/appointments/doctor");

      if (Array.isArray(res.data)) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error("Fetch doctor appointments error:", err);
      toast.error("Failed to load appointments.");
    } finally {
      setLoadingAppt(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const getPatient = (appt) => appt.user || {};
  const getStatus = (appt) => appt.status || "Pending";

  /* -----------------------------------------------------------
     ACCEPT APPOINTMENT
  -------------------------------------------------------------*/
  const handleAccept = async (id) => {
    try {
      await api.patch(`/api/appointments/${id}/status`, {
        status: "Confirmed",
      });

      toast.success("Appointment accepted");
      loadAppointments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept");
    }
  };

  /* -----------------------------------------------------------
     DECLINE APPOINTMENT
  -------------------------------------------------------------*/
  const handleDecline = async (id) => {
    try {
      await api.patch(`/api/appointments/${id}/status`, {
        status: "Cancelled",
      });

      toast.success("Appointment declined");
      loadAppointments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to decline");
    }
  };

  /* -----------------------------------------------------------
     FILTERING LOGIC
  -------------------------------------------------------------*/
  const filteredAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    let list = [...appointments];

    list.sort(
      (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
    );

    if (filter === "today") {
      list = list.filter((a) => a.appointmentDate === todayStr);
    }

    if (filter === "upcoming") {
      list = list.filter((a) => a.appointmentDate >= todayStr);
    }

    return list;
  }, [appointments, filter]);

  /* -----------------------------------------------------------
     LOAD DOCTOR PROFILE (ONLY ONCE)
  -------------------------------------------------------------*/
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);

        const res = await api.get("/api/doctor/profile");
        const doc = res.data?.doctor;

        setProfileForm({
          speciality: doc?.speciality || "",
          degree: doc?.degree || "",
          experience: doc?.experience || "",
          fees: doc?.fees || "",
          about: doc?.about || "",
        });
      } catch (err) {
        console.error("Profile load error:", err);
        toast.error("Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  /* -----------------------------------------------------------
     SAVE DOCTOR PROFILE  ⭐ NEW
  -------------------------------------------------------------*/
  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);

      // Adjust endpoint if your backend uses a different route
      await api.put("/api/doctor/profile", profileForm);

      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Profile update error:", err);
      const msg =
        err?.response?.data?.message || "Failed to update profile. Try again.";
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const displayName =
    user?.name?.toLowerCase().startsWith("dr") ? user.name : `Dr. ${user?.name}`;

  return (
    <div className="doctor-dashboard">
      <Toaster position="top-center" />

      <div className="doctor-header">
        <h2>Welcome, {displayName}</h2>
        <p>Here are your appointments and profile settings.</p>
      </div>

      <div className="doctor-tabs">
        <button
          className={`tab-btn ${activeTab === "appointments" ? "active" : ""}`}
          onClick={() => setActiveTab("appointments")}
        >
          Appointments
        </button>

        <button
          className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          My Profile
        </button>
      </div>

      {activeTab === "appointments" && (
        <>
          <div className="doctor-filters">
            <button
              className={`filter-btn ${filter === "today" ? "active" : ""}`}
              onClick={() => setFilter("today")}
            >
              Today
            </button>

            <button
              className={`filter-btn ${filter === "upcoming" ? "active" : ""}`}
              onClick={() => setFilter("upcoming")}
            >
              Upcoming
            </button>

            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
          </div>

          {loadingAppt ? (
            <p className="empty-text">Loading appointments…</p>
          ) : filteredAppointments.length === 0 ? (
            <p className="empty-text">No appointments found.</p>
          ) : (
            <div className="appointments-list">
              {filteredAppointments.map((appt) => {
                const patient = getPatient(appt);

                return (
                  <div key={appt._id} className="appointment-card">
                    <div>
                      <div className="patient-name">
                        Patient: {patient?.name}
                      </div>

                      <div className="info-item">
                        <b>Date:</b>{" "}
                        {new Date(appt.appointmentDate).toLocaleDateString()}
                      </div>

                      <div className="info-item">
                        <b>Time:</b> {appt.appointmentTime}
                      </div>

                      <div className="info-item">
                        <b>Status:</b> {getStatus(appt)}
                      </div>
                    </div>

                    <div className="actions">
                      {appt.status === "Pending" && (
                        <>
                          <button
                            className="action-btn complete-btn"
                            onClick={() => handleAccept(appt._id)}
                          >
                            Accept
                          </button>

                          <button
                            className="action-btn cancel-btn"
                            onClick={() => handleDecline(appt._id)}
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {appt.status === "Confirmed" && (
                        <span className="status-pill status-confirmed">
                          Confirmed
                        </span>
                      )}

                      {appt.status === "Cancelled" && (
                        <span className="status-pill status-cancelled">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === "profile" && (
        <div className="profile-section">
          <div className="profile-card">
            <h3>Edit Profile</h3>

            {loadingProfile ? (
              <p className="empty-text">Loading profile…</p>
            ) : (
              <div className="profile-form">
                <div className="form-row">
                  <label>Speciality</label>
                  <input
                    type="text"
                    value={profileForm.speciality}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        speciality: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-row">
                  <label>Degree</label>
                  <input
                    type="text"
                    value={profileForm.degree}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        degree: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-row inline">
                  <div>
                    <label>Experience (Years)</label>
                    <input
                      type="number"
                      value={profileForm.experience}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          experience: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label>Fees (₹)</label>
                    <input
                      type="number"
                      value={profileForm.fees}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          fees: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <label>About</label>
                  <textarea
                    rows="4"
                    value={profileForm.about}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        about: e.target.value,
                      })
                    }
                  />
                </div>

                <button
                  className="save-btn"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>
              </div>
            )}
          </div>

          <div className="profile-preview">
            <h3>Profile Preview</h3>
            <p>
              <b>Speciality:</b> {profileForm.speciality}
            </p>
            <p>
              <b>Degree:</b> {profileForm.degree}
            </p>
            <p>
              <b>Experience:</b> {profileForm.experience} years
            </p>
            <p>
              <b>Fees:</b> ₹{profileForm.fees}
            </p>

            <div className="preview-about">
              <h4>About:</h4>
              <p>{profileForm.about}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
