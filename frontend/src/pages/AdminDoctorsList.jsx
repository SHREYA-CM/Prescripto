// src/pages/AdminDoctorsList.jsx
import React, { useEffect, useState, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { AppContext } from "../context/AppContext.jsx";
import "./AdminList.css";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const AdminDoctorsList = () => {
  const { user, token } = useContext(AppContext);
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
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

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/doctors", authConfig);
      setDoctors(res.data.doctors || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleToggleAvailability = async (id) => {
    try {
      await api.patch(`/api/admin/doctor/${id}/availability`, {}, authConfig);
      toast.success("Availability updated");
      loadDoctors();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update availability");
    }
  };

  const filteredDoctors = doctors
    .filter((d) =>
      statusFilter === "all" ? true : (d.status || "pending") === statusFilter
    )
    .filter((d) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        d.name?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.speciality?.toLowerCase().includes(q)
      );
    });

  return (
    <div className="admin-list-page">
      <div className="admin-list-header">
        <div>
          <h1>All Doctors</h1>
          <p>View and manage every registered doctor.</p>
          <Link to="/admin" className="back-link">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="admin-list-controls">
        <div className="control-left">
          <label className="field-label">
            Search by name, email or speciality
          </label>
          <input
            type="text"
            placeholder="e.g. Shreya, cardiology, shreya@gmail.com"
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
        <p className="admin-list-empty">Loading doctors…</p>
      ) : filteredDoctors.length === 0 ? (
        <p className="admin-list-empty">No doctors found for current filters.</p>
      ) : (
        <div className="admin-list">
          {filteredDoctors.map((doc) => (
            <div key={doc._id} className="admin-list-card">
              <div className="card-main">
                <div className="card-left">
                  <div className="card-title-row">
                    <h3>{doc.name}</h3>
                    <span
                      className={`status-badge status-${(doc.status || "pending").toLowerCase()}`}
                    >
                      {doc.status || "pending"}
                    </span>
                    {doc.isAvailable && (
                      <span className="tag tag-green">Available</span>
                    )}
                    {!doc.isAvailable && (
                      <span className="tag tag-gray">Not available</span>
                    )}
                  </div>
                  <p className="card-email">{doc.email}</p>
                  <p className="card-meta">
                    <span>{doc.speciality || "Speciality not set"}</span>
                    {typeof doc.experience === "number" && (
                      <> • {doc.experience} yrs exp</>
                    )}
                    {typeof doc.fees === "number" && <> • ₹{doc.fees} fees</>}
                  </p>
                  {doc.about && (
                    <p className="card-about">
                      {doc.about.length > 140
                        ? doc.about.slice(0, 140) + "…"
                        : doc.about}
                    </p>
                  )}
                </div>

                <div className="card-right">
                  <button
                    className="btn btn-outline"
                    onClick={() => handleToggleAvailability(doc._id)}
                  >
                    Toggle Availability
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDoctorsList;
