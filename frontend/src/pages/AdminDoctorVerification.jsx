// src/pages/AdminDoctorVerification.jsx
import React, { useEffect, useState, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { AppContext } from "../context/AppContext.jsx";
import "./AdminDoctorVerification.css";

const statusOptions = [
  { value: "pending", label: "Pending only" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

const AdminDoctorVerification = () => {
  const { user, token } = useContext(AppContext);
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  // ---- Auth guard (only admin) ----
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

  // ---- Load all doctors once ----
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/doctors", authConfig);
      setDoctors(res.data.doctors || []);
    } catch (err) {
      console.error("LOAD DOCTORS ERROR:", err);
      toast.error("Failed to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ---- Approve / Reject handlers ----
  const handleApprove = async (id) => {
    try {
      await api.patch(`/api/admin/doctor/${id}/approve`, {}, authConfig);
      toast.success("Doctor approved");
      fetchDoctors();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve doctor");
    }
  };

  const handleReject = async (id) => {
    const ok = window.confirm("Are you sure you want to reject this doctor?");
    if (!ok) return;

    try {
      await api.patch(`/api/admin/doctor/${id}/reject`, {}, authConfig);
      toast.success("Doctor rejected");
      fetchDoctors();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject doctor");
    }
  };

  // ---- Filtered list ----
  const filteredDoctors = useMemo(() => {
    return doctors
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
  }, [doctors, search, statusFilter]);

  return (
    <div className="verify-page">
      <div className="verify-header">
        <div>
          <h1>Doctor Verification</h1>
          <p>Review documents and approve or reject doctor registrations.</p>
          <Link to="/admin" className="back-link">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="verify-controls">
        <div className="control-left">
          <label className="field-label">Search by name, email or speciality</label>
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
        <p className="verify-empty">Loading doctors…</p>
      ) : filteredDoctors.length === 0 ? (
        <p className="verify-empty">No doctors found for current filters.</p>
      ) : (
        <div className="verify-list">
          {filteredDoctors.map((doc) => (
            <div key={doc._id} className="verify-card">
              <div className="verify-card-main">
                <div className="doc-basic">
                  <div className="doc-name-row">
                    <h3>{doc.name}</h3>
                    <span
                      className={`status-pill status-${(doc.status || "pending")
                        .toLowerCase()}`}
                    >
                      {doc.status || "pending"}
                    </span>
                  </div>
                  <p className="doc-email">{doc.email}</p>
                  <p className="doc-meta">
                    <span>{doc.speciality || "Speciality not set"}</span>
                    {typeof doc.experience === "number" && (
                      <> • {doc.experience} yrs exp</>
                    )}
                    {typeof doc.fees === "number" && <> • ₹{doc.fees} fees</>}
                  </p>
                  {doc.about && (
                    <p className="doc-about">
                      {doc.about.length > 140
                        ? doc.about.slice(0, 140) + "…"
                        : doc.about}
                    </p>
                  )}
                </div>

                <div className="doc-documents">
                  <span className="field-label">Documents</span>
                  <div className="doc-doc-buttons">
                    <a
                      href={doc.photoUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className={`btn btn-sm ${
                        doc.photoUrl ? "btn-outline" : "btn-disabled"
                      }`}
                    >
                      Photo
                    </a>
                    <a
                      href={doc.idProofUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className={`btn btn-sm ${
                        doc.idProofUrl ? "btn-outline" : "btn-disabled"
                      }`}
                    >
                      ID Proof
                    </a>
                    <a
                      href={doc.degreeUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className={`btn btn-sm ${
                        doc.degreeUrl ? "btn-outline" : "btn-disabled"
                      }`}
                    >
                      Degree
                    </a>
                  </div>
                  <div className="doc-actions">
                    <button
                      className="btn btn-approve"
                      disabled={doc.status === "approved"}
                      onClick={() => handleApprove(doc._id)}
                    >
                      {doc.status === "approved" ? "Approved" : "Approve"}
                    </button>
                    <button
                      className="btn btn-reject"
                      disabled={doc.status === "rejected"}
                      onClick={() => handleReject(doc._id)}
                    >
                      {doc.status === "rejected" ? "Rejected" : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDoctorVerification;
