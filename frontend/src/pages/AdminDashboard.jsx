import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { AppContext } from '../context/AppContext.jsx';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const [doctorSearch, setDoctorSearch] = useState('');
  const [specialityFilter, setSpecialityFilter] = useState('all');

  const { user, token } = useContext(AppContext);
  const navigate = useNavigate();

  // Auth guard: only admin allowed
  useEffect(() => {
    if (!token || !user || user.role !== 'admin') {
      toast.error('Admin access only. Please login as admin.');
      navigate('/admin-login');
    } else {
      fetchDoctors();
      fetchPatients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/api/admin/doctors', authConfig);
      setDoctors(res.data.doctors || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load doctors');
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/api/admin/patients', authConfig);
      setPatients(res.data.patients || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load patients');
    }
  };

  const handleRemoveDoctor = async (id) => {
    const confirm = window.confirm('Are you sure you want to remove this doctor?');
    if (!confirm) return;

    try {
      await api.delete(`/api/admin/doctor/${id}`, authConfig);
      toast.success('Doctor removed');
      fetchDoctors();
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove doctor');
    }
  };

  const handleRemovePatient = async (id) => {
    const confirm = window.confirm('Are you sure you want to remove this patient?');
    if (!confirm) return;

    try {
      await api.delete(`/api/admin/patient/${id}`, authConfig);
      toast.success('Patient removed');
      fetchPatients();
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove patient');
    }
  };

  // Unique speciality list for filter dropdown
  const specialities = useMemo(() => {
    const set = new Set();
    doctors.forEach((d) => d.speciality && set.add(d.speciality));
    return ['all', ...Array.from(set)];
  }, [doctors]);

  // Filtered doctors (by search + speciality)
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        doc.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        doc.speciality?.toLowerCase().includes(doctorSearch.toLowerCase());

      const matchesSpeciality =
        specialityFilter === 'all' || doc.speciality === specialityFilter;

      return matchesSearch && matchesSpeciality;
    });
  }, [doctors, doctorSearch, specialityFilter]);

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage doctors and patients from a single place.</p>
      </header>

      <div className="admin-grid">
        {/* DOCTORS CARD */}
        <section className="admin-card">
          <div className="card-header">
            <div>
              <h2>Doctors</h2>
              <span className="badge">{doctors.length} total</span>
            </div>

            <div className="filters">
              <input
                type="text"
                placeholder="Search by name or speciality..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
              />
              <select
                value={specialityFilter}
                onChange={(e) => setSpecialityFilter(e.target.value)}
              >
                {specialities.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp === 'all' ? 'All specialities' : sp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Speciality</th>
                  <th>Experience</th>
                  <th>Fees</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-cell">
                      No doctors found.
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doc, index) => (
                    <tr key={doc._id}>
                      <td>{index + 1}</td>
                      <td>{doc.name}</td>
                      <td>{doc.speciality}</td>
                      <td>{doc.experience} yrs</td>
                      <td>₹{doc.fees}</td>
                      <td>
                        <span
                          className={
                            doc.isAvailable ? 'status status-active' : 'status status-inactive'
                          }
                        >
                          {doc.isAvailable ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleRemoveDoctor(doc._id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* PATIENTS CARD */}
        <section className="admin-card">
          <div className="card-header">
            <div>
              <h2>Patients</h2>
              <span className="badge">{patients.length} total</span>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-cell">
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  patients.map((pat, index) => (
                    <tr key={pat._id}>
                      <td>{index + 1}</td>
                      <td>{pat.name}</td>
                      <td>{pat.email}</td>
                      <td>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleRemovePatient(pat._id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
