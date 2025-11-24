// src/pages/DoctorDashboard.jsx
import React, { useEffect, useState, useContext, useMemo } from "react";
import api from "../api/axios";
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
  const [savingProfile, setSavingProfile] = useState(false);

  // doctor status (pending / approved / rejected)
  const [doctorStatus, setDoctorStatus] = useState(user?.status || "pending");

  // form edit state + "profile already filled?" flag
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  /* -----------------------------------------------------------
     LOAD DOCTOR APPOINTMENTS (ONLY ONCE)
  -------------------------------------------------------------*/
  const loadAppointments = async () => {
    try {
      setLoadingAppt(true);

      const res = await api.get("/api/appointments/doctor");

      if (Array.isArray(res.data)) {
        setAppointments(res.data);
      } else if (Array.isArray(res.data?.appointments)) {
        setAppointments(res.data.appointments);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error("Fetch doctor appointments error:", err);
      toast.error("Failed to load appointments.");
      setAppointments([]);
    } finally {
      setLoadingAppt(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const getPatient = (appt) => appt.user || appt.patient || {};
  const getStatus = (appt) => appt.status || "Pending";

  /* -----------------------------------------------------------
     ACCEPT / DECLINE APPOINTMENT
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
      toast.error("Failed to accept appointment.");
    }
  };

  const handleDecline = async (id) => {
    try {
      await api.patch(`/api/appointments/${id}/status`, {
        status: "Cancelled",
      });

      toast.success("Appointment declined");
      loadAppointments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to decline appointment.");
    }
  };

  /* -----------------------------------------------------------
     FILTERING LOGIC
  -------------------------------------------------------------*/
  const filteredAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    let list = [...appointments];

    list.sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime()
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
     Helper: check if profile actually filled
  -------------------------------------------------------------*/
  const computeHasProfile = (doc) => {
    if (!doc) return false;
    return Boolean(
      doc.speciality ||
        doc.degree ||
        (typeof doc.experience === "number" && doc.experience > 0) ||
        (typeof doc.fees === "number" && doc.fees > 0) ||
        doc.about
    );
  };

  /* -----------------------------------------------------------
     LOAD DOCTOR PROFILE (ONLY ONCE)
  -------------------------------------------------------------*/
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);

        const res = await api.get("/api/doctor/profile");
        const doc = res.data?.doctor;

        if (doc) {
          setProfileForm({
            speciality: doc.speciality || "",
            degree: doc.degree || "",
            experience: doc.experience ?? "",
            fees: doc.fees ?? "",
            about: doc.about || "",
          });

          if (doc.status) setDoctorStatus(doc.status);
          const filled = computeHasProfile(doc);
          setHasProfile(filled);
          setIsEditing(!filled); // if first time, go to editing mode
        } else {
          // no profile -> blank + editing mode
          setProfileForm({
            speciality: "",
            degree: "",
            experience: "",
            fees: "",
            about: "",
          });
          setHasProfile(false);
          setIsEditing(true);
        }
      } catch (err) {
        console.error("Profile load error:", err);
        toast.error("Failed to load profile.");
        setIsEditing(true);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  /* -----------------------------------------------------------
     SAVE DOCTOR PROFILE
  -------------------------------------------------------------*/
  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);

      const payload = {
        speciality: profileForm.speciality,
        degree: profileForm.degree,
        experience: profileForm.experience
          ? Number(profileForm.experience)
          : 0,
        fees: profileForm.fees ? Number(profileForm.fees) : 0,
        about: profileForm.about,
      };

      const res = await api.put("/api/doctor/profile", payload);

      const updatedDoc = res.data?.doctor;
      if (updatedDoc) {
        setProfileForm({
          speciality: updatedDoc.speciality || "",
          degree: updatedDoc.degree || "",
          experience: updatedDoc.experience ?? "",
          fees: updatedDoc.fees ?? "",
          about: updatedDoc.about || "",
        });
        const filled = computeHasProfile(updatedDoc);
        setHasProfile(filled);
        setIsEditing(false); // after save, read-only mode
      } else {
        setHasProfile(computeHasProfile(payload));
        setIsEditing(false);
      }

      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(
        err.response?.data?.message || "Failed to update profile. Try again."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    // simplest: reload to revert unsaved changes
    window.location.reload();
  };

  const displayName =
    user?.name?.toLowerCase().startsWith("dr")
      ? user.name
      : `Dr. ${user?.name || ""}`;

  const doctorEmail = user?.email || "";

  const statusLabel =
    doctorStatus === "approved"
      ? "Approved"
      : doctorStatus === "rejected"
      ? "Rejected"
      : "Pending approval";

  return (
    <div className="doctor-dashboard">
      <Toaster position="top-center" />

      <div className="doctor-header">
        <h2>Welcome, {displayName}</h2>
        <p>Manage your appointments and update your profile details here.</p>

        <p className="doctor-status-line">
          <b>Status:</b>{" "}
          <span
            className={`status-pill ${
              doctorStatus === "approved"
                ? "status-approved"
                : doctorStatus === "rejected"
                ? "status-rejected"
                : "status-pending"
            }`}
          >
            {statusLabel}
          </span>
          {doctorStatus !== "approved" && (
            <span className="status-note">
              (Admin approval is required before you can start seeing patients.)
            </span>
          )}
        </p>
      </div>

      <div className="doctor-tabs">
        <button
          className={`tab-btn ${
            activeTab === "appointments" ? "active" : ""
          }`}
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

      {/* ------------------ APPOINTMENTS TAB ------------------ */}
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
                        Patient: {patient?.name || "Unknown"}
                      </div>
                      {patient?.email && (
                        <div className="patient-email">{patient.email}</div>
                      )}

                      <div className="info-item">
                        <b>Date:</b>{" "}
                        {appt.appointmentDate
                          ? new Date(
                              appt.appointmentDate
                            ).toLocaleDateString()
                          : "-"}
                      </div>

                      <div className="info-item">
                        <b>Time:</b> {appt.appointmentTime || "-"}
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

      {/* ------------------ PROFILE TAB ------------------ */}
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
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        speciality: e.target.value,
                      })
                    }
                    placeholder="e.g. Cardiologist, Dermatologist"
                  />
                </div>

                <div className="form-row">
                  <label>Degree</label>
                  <input
                    type="text"
                    value={profileForm.degree}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        degree: e.target.value,
                      })
                    }
                    placeholder="e.g. MBBS, MD"
                  />
                </div>

                <div className="form-row inline">
                  <div>
                    <label>Experience (Years)</label>
                    <input
                      type="number"
                      min="0"
                      value={profileForm.experience}
                      disabled={!isEditing}
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
                      min="0"
                      value={profileForm.fees}
                      disabled={!isEditing}
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
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        about: e.target.value,
                      })
                    }
                    placeholder="Short bio, clinic info, treatment approach, etc."
                  />
                </div>

                <div className="profile-actions">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        className="save-btn"
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                      >
                        {savingProfile ? "Saving..." : "Save Profile"}
                      </button>
                      {hasProfile && (
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={handleCancelEdit}
                          disabled={savingProfile}
                        >
                          Cancel
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="save-btn"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </button>
                      {hasProfile && (
                        <button
                          type="button"
                          className="saved-btn"
                          disabled={true}
                        >
                          ✓ Saved
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="profile-preview">
            <h3>Profile Preview</h3>
            <div className="preview-info">
              <p>
                <b>Name:</b> {displayName}
              </p>
              {doctorEmail && (
                <p>
                  <b>Email:</b> {doctorEmail}
                </p>
              )}
              <p>
                <b>Speciality:</b>{" "}
                {profileForm.speciality || "Not specified"}
              </p>
              <p>
                <b>Degree:</b> {profileForm.degree || "Not specified"}
              </p>
              <p>
                <b>Experience:</b>{" "}
                {profileForm.experience
                  ? `${profileForm.experience} years`
                  : "Not specified"}
              </p>
              <p>
                <b>Fees:</b>{" "}
                {profileForm.fees ? `₹${profileForm.fees}` : "Not specified"}
              </p>
            </div>

            <div className="preview-about">
              <h4>About</h4>
              <p>
                {profileForm.about ||
                  "This is where your introduction, clinic information and treatment style will appear."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
