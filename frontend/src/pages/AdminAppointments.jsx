// src/pages/AdminAppointments.jsx
import React, { useEffect, useState, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { AppContext } from "../context/AppContext.jsx";
import "./AdminList.css";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
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

  // Auth guard
  useEffect(() => {
    if (!token || !user || user.role !== "admin") {
      toast.error("Admin access only");
      navigate("/admin-login");
    }
  }, [user, token, navigate]);

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
    }),
    [token]
  );

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/appointments", authConfig);
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(
        `/api/admin/appointment/${id}/status`,
        { status },
        authConfig
      );
      toast.success("Appointment updated");
      loadAppointments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update appointment");
    }
  };

  const filteredAppointments = appointments
    .filter((a) =>
      statusFilter === "all" ? true : (a.status || "pending") === statusFilter
    )
    .filter((a) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        a.doctorId?.name?.toLowerCase().includes(q) ||
        a.userId?.name?.toLowerCase().includes(q) ||
        a.userId?.email?.toLowerCase().includes(q)
      );
    });

  return (
    <div className="admin-list-page">
      <div className="admin-list-header">
        <div>
          <h1>All Appointments</h1>
          <p>Monitor every booking and update status.</p>
          <Link to="/admin" className="back-link">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="admin-list-controls">
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
        <p className="admin-list-empty">Loading appointments…</p>
      ) : filteredAppointments.length === 0 ? (
        <p className="admin-list-empty">
          No appointments found for current filters.
        </p>
      ) : (
        <div className="admin-list">
          {filteredAppointments.map((appt) => (
            <div key={appt._id} className="admin-list-card">
              <div className="card-main">
                <div className="card-left">
                  <div className="card-title-row">
                    <h3>
                      {appt.userId?.name || "Unknown patient"} →{" "}
                      {appt.doctorId?.name || "Unknown doctor"}
                    </h3>
                    <span
                      className={`status-badge status-${(appt.status || "pending").toLowerCase()}`}
                    >
                      {appt.status || "pending"}
                    </span>
                  </div>

                  <p className="card-email">
                    Patient: {appt.userId?.email || "N/A"}
                  </p>
                  <p className="card-meta">
                    <span>
                      Date:{" "}
                      {appt.date
                        ? new Date(appt.date).toLocaleDateString()
                        : "N/A"}
                    </span>
                    {appt.slot && <> • Slot: {appt.slot}</>}
                  </p>
                  {appt.symptoms && (
                    <p className="card-about">
                      Symptoms:{" "}
                      {appt.symptoms.length > 140
                        ? appt.symptoms.slice(0, 140) + "…"
                        : appt.symptoms}
                    </p>
                  )}
                </div>

                <div className="card-right">
                  <label className="field-label">Update status</label>
                  <select
                    value={appt.status || "pending"}
                    onChange={(e) =>
                      handleStatusChange(appt._id, e.target.value)
                    }
                  >
                    {statusOptions
                      .filter((s) => s.value !== "all")
                      .map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
