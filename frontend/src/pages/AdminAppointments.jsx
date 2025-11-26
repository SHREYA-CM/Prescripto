// src/pages/AdminAppointments.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { AppContext } from "../context/AppContext.jsx";
import "./AdminAppointments.css";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const AdminAppointments = () => {
  const { user, token } = useContext(AppContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ---- Auth guard (admin only) ----
  useEffect(() => {
    if (!token || !user || user.role !== "admin") {
      toast.error("Admin access only");
      navigate("/admin-login");
    }
  }, [token, user, navigate]);

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
    }),
    [token]
  );

  // ---- Load all appointments ----
  const fetchAppointments = async () => {
    try {
      setLoading(true);

      // IMPORTANT: correct path + auth
      const res = await api.get("/api/admin/appointments", authConfig);

      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("LOAD APPOINTMENTS ERROR:", err);
      toast.error(
        err.response?.data?.message || "Failed to load appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ---- Update status ----
  const handleStatusChange = async (id, newStatus) => {
    if (!newStatus) return;
    try {
      await api.patch(
        `/api/admin/appointment/${id}/status`,
        { status: newStatus },
        authConfig
      );
      toast.success("Appointment status updated");
      fetchAppointments();
    } catch (err) {
      console.error("UPDATE STATUS ERROR:", err);
      toast.error(
        err.response?.data?.message || "Failed to update appointment status."
      );
    }
  };

  // ---- Filtered list ----
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((appt) =>
        statusFilter === "all"
          ? true
          : (appt.status || "pending").toLowerCase() === statusFilter
      )
      .filter((appt) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();

        const patientName = appt.userId?.name?.toLowerCase() || "";
        const patientEmail = appt.userId?.email?.toLowerCase() || "";
        const doctorName = appt.doctorId?.name?.toLowerCase() || "";
        const doctorSpec = appt.doctorId?.speciality?.toLowerCase() || "";

        return (
          patientName.includes(q) ||
          patientEmail.includes(q) ||
          doctorName.includes(q) ||
          doctorSpec.includes(q)
        );
      });
  }, [appointments, search, statusFilter]);

  return (
    <div className="appts-page">
      <div className="appts-header">
        <div>
          <h1>All Appointments</h1>
          <p>Monitor every booking and update status.</p>
          <Link to="/admin" className="back-link">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="appts-controls">
        <div className="control-left">
          <label className="field-label">
            Search by patient / doctor name or email
          </label>
          <input
            type="text"
            placeholder="e.g. Shreya, Dr. Arnav, patient@gmail.com"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="control-right">
          <label className="field-label">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="appts-empty">Loading appointments…</p>
      ) : filteredAppointments.length === 0 ? (
        <p className="appts-empty">No appointments found for current filters.</p>
      ) : (
        <div className="appts-list">
          {filteredAppointments.map((appt) => {
            const patient = appt.userId || {};
            const doctor = appt.doctorId || {};
            const status = (appt.status || "pending").toLowerCase();

            const dateLabel =
              appt.date ||
              (appt.createdAt
                ? new Date(appt.createdAt).toLocaleDateString()
                : "—");

            return (
              <div key={appt._id} className="appts-card">
                <div className="appts-main">
                  {/* Left: basic info */}
                  <div className="appts-info">
                    <div className="appts-title-row">
                      <h3>
                        {patient.name || "Unknown patient"}{" "}
                        <span className="appts-arrow">→</span>{" "}
                        {doctor.name || "Unknown doctor"}
                      </h3>
                      <span className={`status-pill status-${status}`}>
                        {status}
                      </span>
                    </div>

                    <p className="appts-meta">
                      <span>
                        <strong>Date:</strong> {dateLabel}
                      </span>
                      {appt.slot && (
                        <span>
                          <strong>Time:</strong> {appt.slot}
                        </span>
                      )}
                      {doctor.speciality && (
                        <span>
                          <strong>Speciality:</strong> {doctor.speciality}
                        </span>
                      )}
                    </p>

                    <p className="appts-meta">
                      <span>
                        <strong>Patient email:</strong> {patient.email || "—"}
                      </span>
                      {doctor.email && (
                        <span>
                          <strong>Doctor email:</strong> {doctor.email}
                        </span>
                      )}
                    </p>

                    {appt.reason && (
                      <p className="appts-notes">
                        <strong>Reason:</strong>{" "}
                        {appt.reason.length > 140
                          ? appt.reason.slice(0, 140) + "…"
                          : appt.reason}
                      </p>
                    )}
                  </div>

                  {/* Right: status + amount */}
                  <div className="appts-actions">
                    {typeof appt.amount === "number" && (
                      <div className="appts-amount">
                        ₹{appt.amount}
                        <span>Fees</span>
                      </div>
                    )}

                    <div className="appts-status-update">
                      <label className="field-label">Update status</label>
                      <select
                        value={status}
                        onChange={(e) =>
                          handleStatusChange(appt._id, e.target.value)
                        }
                      >
                        {statusOptions
                          .filter((o) => o.value !== "all")
                          .map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
