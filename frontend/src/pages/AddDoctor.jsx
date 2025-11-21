import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { AppContext } from '../context/AppContext.jsx';
import './AdminDashboard.css';

const PAGE_SIZE = 8;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' | 'patients' | 'appointments' | 'analytics'

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [doctorSearch, setDoctorSearch] = useState('');
  const [specialityFilter, setSpecialityFilter] = useState('all');
  const [sortField, setSortField] = useState('name'); // experience | fees
  const [sortDir, setSortDir] = useState('asc');

  const [doctorPage, setDoctorPage] = useState(1);

  // add doctor form (simple)
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    speciality: '',
    degree: '',
    experience: 0,
    fees: 500,
    image: '',
  });

  const [analytics, setAnalytics] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
  });

  const { user, token } = useContext(AppContext);
  const navigate = useNavigate();

  // Auth guard: only admin
  useEffect(() => {
    if (!token || !user || user.role !== 'admin') {
      toast.error('Admin access only. Please login as admin.');
      navigate('/admin-login');
    } else {
      fetchDoctors();
      fetchPatients();
      fetchAppointments();
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  /* ---------- API CALLS ---------- */

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

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/api/admin/appointments', authConfig);
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load appointments');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/api/admin/analytics/summary', authConfig);
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------- ACTIONS ---------- */

  const handleToggleAvailability = async (id) => {
    try {
      await api.patch(`/api/admin/doctor/${id}/availability`, {}, authConfig);
      toast.success('Availability updated');
      fetchDoctors();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update availability');
    }
  };

  const handleDoctorStatus = async (id, status) => {
    try {
      await api.patch(
        `/api/admin/doctor/${id}/status`,
        { status },
        authConfig
      );
      toast.success(`Doctor ${status}`);
      fetchDoctors();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleRemoveDoctor = async (id) => {
    const confirm = window.confirm(
      'Are you sure you want to permanently remove this doctor?'
    );
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
    const confirm = window.confirm(
      'Are you sure you want to remove this patient?'
    );
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

  const handleAppointmentStatus = async (id, status) => {
    try {
      await api.patch(
        `/api/admin/appointment/${id}/status`,
        { status },
        authConfig
      );
      toast.success('Appointment updated');
      fetchAppointments();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update appointment');
    }
  };

  // Add doctor (simple form)
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/admin/doctors', newDoctor, authConfig);
      toast.success('Doctor added');
      setNewDoctor({
        name: '',
        speciality: '',
        degree: '',
        experience: 0,
        fees: 500,
        image: '',
      });
      fetchDoctors();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || 'Failed to add doctor'
      );
    }
  };

  // CSV download (doctors or patients)
  const downloadCSV = (type) => {
    let rows = [];
    if (type === 'doctors') {
      rows = [
        ['Name', 'Speciality', 'Experience', 'Fees', 'Available', 'Status'],
        ...doctors.map((d) => [
          d.name,
          d.speciality,
          d.experience,
          d.fees,
          d.isAvailable ? 'Yes' : 'No',
          d.status,
        ]),
      ];
    } else {
      rows = [
        ['Name', 'Email'],
        ...patients.map((p) => [p.name, p.email]),
      ];
    }

    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- FILTER / SORT / PAGINATION ---------- */

  const specialities = useMemo(() => {
    const set = new Set();
    doctors.forEach((d) => d.speciality && set.add(d.speciality));
    return ['all', ...Array.from(set)];
  }, [doctors]);

  const filteredSortedDoctors = useMemo(() => {
    let list = [...doctors];

    // search
    list = list.filter((doc) => {
      const q = doctorSearch.toLowerCase();
      return (
        doc.name?.toLowerCase().includes(q) ||
        doc.speciality?.toLowerCase().includes(q)
      );
    });

    // filter by speciality
    if (specialityFilter !== 'all') {
      list = list.filter((doc) => doc.speciality === specialityFilter);
    }

    // sort
    list.sort((a, b) => {
      let x = a[sortField];
      let y = b[sortField];

      if (typeof x === 'string') x = x.toLowerCase();
      if (typeof y === 'string') y = y.toLowerCase();

      if (x < y) return sortDir === 'asc' ? -1 : 1;
      if (x > y) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [doctors, doctorSearch, specialityFilter, sortField, sortDir]);

  const totalDoctorPages = Math.max(
    1,
    Math.ceil(filteredSortedDoctors.length / PAGE_SIZE)
  );

  const pagedDoctors = useMemo(() => {
    const start = (doctorPage - 1) * PAGE_SIZE;
    return filteredSortedDoctors.slice(start, start + PAGE_SIZE);
  }, [filteredSortedDoctors, doctorPage]);

  const handleSortClick = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  /* ---------- RENDER ---------- */

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage doctors, patients, appointments & analytics.</p>
      </header>

      {/* TABS */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          Doctors
        </button>
        <button
          className={`tab-btn ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          Patients
        </button>
        <button
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {/* CONTENT */}
      {activeTab === 'doctors' && (
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
                onChange={(e) => {
                  setDoctorSearch(e.target.value);
                  setDoctorPage(1);
                }}
              />
              <select
                value={specialityFilter}
                onChange={(e) => {
                  setSpecialityFilter(e.target.value);
                  setDoctorPage(1);
                }}
              >
                {specialities.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp === 'all' ? 'All specialities' : sp}
                  </option>
                ))}
              </select>
              <button
                className="btn"
                onClick={() => downloadCSV('doctors')}
              >
                Download CSV
              </button>
            </div>
          </div>

          {/* Add doctor form (simple inline) */}
          <form className="add-doctor" onSubmit={handleAddDoctor}>
            <input
              placeholder="Name"
              value={newDoctor.name}
              onChange={(e) =>
                setNewDoctor({ ...newDoctor, name: e.target.value })
              }
              required
            />
            <input
              placeholder="Speciality"
              value={newDoctor.speciality}
              onChange={(e) =>
                setNewDoctor({ ...newDoctor, speciality: e.target.value })
              }
              required
            />
            <input
              placeholder="Degree"
              value={newDoctor.degree}
              onChange={(e) =>
                setNewDoctor({ ...newDoctor, degree: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Experience (years)"
              value={newDoctor.experience}
              onChange={(e) =>
                setNewDoctor({
                  ...newDoctor,
                  experience: Number(e.target.value),
                })
              }
            />
            <input
              type="number"
              placeholder="Fees"
              value={newDoctor.fees}
              onChange={(e) =>
                setNewDoctor({
                  ...newDoctor,
                  fees: Number(e.target.value),
                })
              }
            />
            <input
              placeholder="Image URL"
              value={newDoctor.image}
              onChange={(e) =>
                setNewDoctor({ ...newDoctor, image: e.target.value })
              }
              required
            />
            <button type="submit" className="btn btn-primary">
              Add Doctor
            </button>
          </form>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th onClick={() => handleSortClick('name')}>
                    Name {sortField === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th>Speciality</th>
                  <th onClick={() => handleSortClick('experience')}>
                    Experience
                    {sortField === 'experience' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSortClick('fees')}>
                    Fees {sortField === 'fees' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th>Status</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedDoctors.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-cell">
                      No doctors found.
                    </td>
                  </tr>
                ) : (
                  pagedDoctors.map((doc, index) => (
                    <tr key={doc._id}>
                      <td>{(doctorPage - 1) * PAGE_SIZE + index + 1}</td>
                      <td>{doc.name}</td>
                      <td>{doc.speciality}</td>
                      <td>{doc.experience} yrs</td>
                      <td>₹{doc.fees}</td>
                      <td>
                        <span
                          className={`status ${
                            doc.status === 'approved'
                              ? 'status-active'
                              : doc.status === 'pending'
                              ? 'status-warning'
                              : 'status-inactive'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-chip"
                          onClick={() => handleToggleAvailability(doc._id)}
                        >
                          {doc.isAvailable ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td className="actions-cell">
                        <Link
                          to={`/admin/doctor/${doc._id}`}
                          className="link-small"
                        >
                          View
                        </Link>
                        {doc.status !== 'approved' && (
                          <button
                            className="btn btn-small"
                            onClick={() =>
                              handleDoctorStatus(doc._id, 'approved')
                            }
                          >
                            Approve
                          </button>
                        )}
                        {doc.status !== 'rejected' && (
                          <button
                            className="btn btn-small"
                            onClick={() =>
                              handleDoctorStatus(doc._id, 'rejected')
                            }
                          >
                            Reject
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleRemoveDoctor(doc._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              disabled={doctorPage === 1}
              onClick={() => setDoctorPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span>
              Page {doctorPage} of {totalDoctorPages}
            </span>
            <button
              disabled={doctorPage === totalDoctorPages}
              onClick={() =>
                setDoctorPage((p) =>
                  Math.min(totalDoctorPages, p + 1)
                )
              }
            >
              Next
            </button>
          </div>
        </section>
      )}

      {activeTab === 'patients' && (
        <section className="admin-card">
          <div className="card-header">
            <div>
              <h2>Patients</h2>
              <span className="badge">{patients.length} total</span>
            </div>
            <button
              className="btn"
              onClick={() => downloadCSV('patients')}
            >
              Download CSV
            </button>
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
                          className="btn btn-danger btn-small"
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
      )}

      {activeTab === 'appointments' && (
        <section className="admin-card">
          <div className="card-header">
            <div>
              <h2>Appointments</h2>
              <span className="badge">
                {appointments.length} total
              </span>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Doctor</th>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  appointments.map((appt, index) => (
                    <tr key={appt._id}>
                      <td>{index + 1}</td>
                      <td>
                        {appt.doctorId?.name} (
                        {appt.doctorId?.speciality})
                      </td>
                      <td>{appt.userId?.name}</td>
                      <td>
                        {new Date(
                          appt.slotDate
                        ).toLocaleDateString()}{' '}
                        {appt.slotTime}
                      </td>
                      <td>{appt.status}</td>
                      <td>
                        {appt.status !== 'cancelled' && (
                          <button
                            className="btn btn-small"
                            onClick={() =>
                              handleAppointmentStatus(
                                appt._id,
                                'cancelled'
                              )
                            }
                          >
                            Cancel
                          </button>
                        )}
                        {appt.status !== 'completed' && (
                          <button
                            className="btn btn-small"
                            onClick={() =>
                              handleAppointmentStatus(
                                appt._id,
                                'completed'
                              )
                            }
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'analytics' && (
        <section className="admin-card">
          <div className="card-header">
            <div>
              <h2>Analytics</h2>
            </div>
          </div>

          <div className="analytics-grid">
            <div className="stat-card">
              <h3>Total Doctors</h3>
              <p>{analytics.totalDoctors}</p>
            </div>
            <div className="stat-card">
              <h3>Total Patients</h3>
              <p>{analytics.totalPatients}</p>
            </div>
            <div className="stat-card">
              <h3>Total Appointments</h3>
              <p>{analytics.totalAppointments}</p>
            </div>
          </div>

          {/* Future: yahan chart library use karke monthly chart bana sakti ho */}
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;
