// src/pages/AdminPatients.jsx
import React, { useEffect, useState, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { AppContext } from "../context/AppContext.jsx";
import "./AdminDoctorVerification.css"; // same styling reuse kar sakti ho

const AdminPatients = () => {
  const { user, token } = useContext(AppContext);
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

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

  // ---- Load all patients ----
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/patients", authConfig);
      setPatients(res.data.patients || []);
    } catch (err) {
      console.error("LOAD PATIENTS ERROR:", err);
      toast.error("Failed to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ---- Delete patient ----
  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Are you sure you want to delete this patient account?"
    );
    if (!ok) return;

    try {
      await api.delete(`/api/admin/patient/${id}`, authConfig);
      toast.success("Patient removed");
      fetchPatients();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove patient");
    }
  };

  // ---- Filtered list (search by name / email) ----
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q)
      );
    });
  }, [patients, search]);

  return (
    <div className="verify-page">
      <div className="verify-header">
        <div>
          <h1>Registered Patients</h1>
          <p>View and manage all registered patient accounts.</p>
          <Link to="/admin" className="back-link">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="verify-controls">
        <div className="control-left" style={{ flex: 1 }}>
          <label className="field-label">Search by name or email</label>
          <input
            type="text"
            placeholder="e.g. Shreya, shreya@gmail.com"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="verify-empty">Loading patients…</p>
      ) : filteredPatients.length === 0 ? (
        <p className="verify-empty">No patients found.</p>
      ) : (
        <div className="verify-list">
          {filteredPatients.map((p) => (
            <div key={p._id} className="verify-card">
              <div className="verify-card-main">
                <div className="doc-basic">
                  <div className="doc-name-row">
                    <h3>{p.name || "Unnamed Patient"}</h3>
                    <span className="status-pill status-approved">
                      patient
                    </span>
                  </div>
                  <p className="doc-email">{p.email}</p>
                  {p.createdAt && (
                    <p className="doc-meta">
                      Joined: {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="doc-documents">
                  <span className="field-label">Actions</span>
                  <div className="doc-actions">
                    <button
                      className="btn btn-reject"
                      onClick={() => handleDelete(p._id)}
                    >
                      Delete Patient
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

export default AdminPatients;
