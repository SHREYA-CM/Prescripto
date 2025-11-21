import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token');

                // ✅ Correct backend route
                const res = await axios.get(
                    '/api/appointment/mybookings',
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                setBookings(res.data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const handleCancelBooking = async (appointmentId) => {
        try {
            const token = localStorage.getItem('token');

            const res = await axios.post(
                '/api/appointment/cancel-appointment',
                { appointmentId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                toast.success(res.data.message);

                setBookings(prev =>
                    prev.map(b =>
                        b._id === appointmentId ? { ...b, status: 'rejected' } : b
                    )
                );
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error("Cancel error:", error);
            toast.error(error.response?.data?.message || "Cancellation failed.");
        }
    };

    if (loading) {
        return <div style={styles.container}><h1>Loading Your Bookings...</h1></div>;
    }

    return (
        <div style={styles.page}>
            <Toaster position="top-center" />
            <header style={styles.header}>
                <Link to="/" style={styles.backLink}>&larr; Back to Dashboard</Link>
            </header>

            <main style={styles.container}>
                <h1 style={styles.title}>My Appointments</h1>

                <div style={styles.bookingList}>
                    {bookings.length > 0 ? (
                        bookings.map(booking => (
                            <div key={booking._id} style={styles.bookingCard}>
                                <div style={styles.cardHeader}>
                                    <h3 style={styles.doctorName}>
                                        Dr. {booking.doctor?.name}
                                    </h3>
                                    <span
                                        style={{
                                            ...styles.statusBadge,
                                            backgroundColor: getStatusColor(booking.status),
                                        }}
                                    >
                                        {booking.status}
                                    </span>
                                </div>

                                <p><strong>Speciality:</strong> {booking.doctor?.speciality}</p>
                                <p><strong>Date:</strong> {new Date(booking.appointmentDate).toLocaleDateString()}</p>
                                <p><strong>Time:</strong> {booking.appointmentTime}</p>

                                {booking.status === 'Pending' && (
                                    <button
                                        onClick={() => handleCancelBooking(booking._id)}
                                        style={styles.cancelButton}
                                    >
                                        Cancel Appointment
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center' }}>You have no appointments booked yet.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

const getStatusColor = (status) => {
    if (status === 'Approved') return '#28a745';
    if (status === 'Rejected' || status === 'rejected') return '#dc3545';
    return '#ffc107';
};

const styles = {
    page: { fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' },
    header: { padding: '1rem 2rem', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    backLink: { textDecoration: 'none', color: '#007bff', fontWeight: 'bold' },
    container: { maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' },
    title: { textAlign: 'center', marginBottom: '2rem' },
    bookingList: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    bookingCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    doctorName: { margin: 0, color: '#0056b3' },
    statusBadge: { padding: '0.4rem 0.8rem', borderRadius: '15px', color: 'white', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'capitalize' },
    cancelButton: { width: '100%', padding: '0.75rem', marginTop: '1rem', border: 'none', borderRadius: '5px', backgroundColor: '#dc3545', color: 'white', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' },
};

export default MyBookings;
