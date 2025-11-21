import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Layout from '../components/Layout'; // Admin Layout ko import karen

const ManageAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sabhi appointments laane ka function
    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token'); // Admin ka token
            const res = await axios.get('/api/appointment/get-all-appointments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setAppointments(res.data.data);
            }
        } catch (error) {
            console.error("Appointments fetch karte samay error aaya:", error);
            toast.error("Could not fetch appointments.");
        } finally {
            setLoading(false);
        }
    };

    // Component load hote hi appointments fetch karen
    useEffect(() => {
        fetchAppointments();
    }, []);

    // Status update karne ka function
    const handleStatusUpdate = async (appointmentId, status) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/appointment/update-status', 
                { appointmentId, status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                toast.success(res.data.message);
                fetchAppointments(); // Update ke baad list ko refresh karen
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Status update failed.");
        }
    };

    if (loading) {
        return <Layout><h1>Loading Appointments...</h1></Layout>;
    }

    return (
        <Layout>
            <Toaster position="top-center" />
            <h1 style={{ marginBottom: '2rem' }}>Manage All Appointments</h1>
            <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Patient</th>
                            <th style={styles.th}>Doctor</th>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Time</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.length > 0 ? (
                            appointments.map(apt => (
                                <tr key={apt._id}>
                                    <td style={styles.td}>{apt.patientId?.name || 'N/A'}</td>
                                    <td style={styles.td}>Dr. {apt.doctorId?.name || 'N/A'}</td>
                                    <td style={styles.td}>{new Date(apt.date).toLocaleDateString()}</td>
                                    <td style={styles.td}>{apt.time}</td>
                                    <td style={styles.td}>
                                        <span style={{...styles.statusBadge, backgroundColor: getStatusColor(apt.status)}}>
                                            {apt.status}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {apt.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleStatusUpdate(apt._id, 'approved')} style={styles.approveButton}>Approve</button>
                                                <button onClick={() => handleStatusUpdate(apt._id, 'rejected')} style={styles.rejectButton}>Reject</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>No appointments found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

// Styles
const getStatusColor = (status) => {
    if (status === 'approved') return '#28a745';
    if (status === 'rejected') return '#dc3545';
    return '#ffc107';
};
const styles = {
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
    th: { backgroundColor: '#f2f2f2', padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', textTransform: 'uppercase', fontSize: '0.9rem' },
    td: { padding: '12px', borderBottom: '1px solid #ddd' },
    statusBadge: { padding: '5px 12px', borderRadius: '15px', color: 'white', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'capitalize' },
    approveButton: { padding: '6px 12px', border: 'none', borderRadius: '5px', backgroundColor: '#28a745', color: 'white', cursor: 'pointer', fontWeight: 'bold' },
    rejectButton: { padding: '6px 12px', border: 'none', borderRadius: '5px', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', fontWeight: 'bold' },
};

export default ManageAppointments;

