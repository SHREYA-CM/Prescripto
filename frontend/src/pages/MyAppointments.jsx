import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";

const MyAppointments = () => {
    const { user, token } = useContext(AppContext);

    const [userAppointments, setUserAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserBookings = async () => {
        if (!user || !token) return;

        try {
            const response = await axios.get("/api/appointments/mybookings", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUserAppointments(response.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to load appointments.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || !token) return;

        fetchUserBookings();
        const interval = setInterval(fetchUserBookings, 2000);
        return () => clearInterval(interval);

    }, [user, token]);

    // CANCEL APPOINTMENT
    const handleCancel = async (id, status) => {
        if (status === "Cancelled" || status === "Paid") {
            alert("Cannot cancel this appointment.");
            return;
        }

        if (!window.confirm("Do you want to cancel this appointment?")) return;

        try {
            await axios.patch(
                `/api/appointments/${id}/cancel`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchUserBookings();
            alert("Appointment cancelled successfully!");
        } catch (err) {
            alert("Failed to cancel appointment");
        }
    };

    // PAY NOW
    const handlePayment = async (id, status) => {
        if (status === "Pending") return alert("Doctor has not confirmed yet.");
        if (status === "Cancelled") return alert("Can't pay for a cancelled appointment.");
        if (status === "Paid") return alert("Already Paid.");

        if (!window.confirm("Proceed with payment?")) return;

        try {
            await axios.patch(
                `/api/appointments/${id}/pay`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchUserBookings();
            alert("Payment successful!");
        } catch (err) {
            alert("Payment failed.");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Pending": return "text-yellow-600";
            case "Confirmed": return "text-green-600";
            case "Cancelled": return "text-red-600";
            case "Paid": return "text-blue-600";
            default: return "text-gray-600";
        }
    };

    if (loading) return <div className="p-6 text-center text-blue-600">Loading appointments...</div>;
    if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

    return (
        <div className="p-4 md:p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Appointments</h2>

            {userAppointments.length === 0 ? (
                <p className="text-gray-600 text-center">No appointments booked yet.</p>
            ) : (
                <div className="space-y-6">
                    {userAppointments.map((appt) => (
                        <div
                            key={appt._id}
                            className="bg-white shadow-md rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6"
                        >
                            {/* Doctor Image */}
                            <img
                                src={appt.doctor?.image}
                                alt={appt.doctor?.name}
                                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-blue-100"
                            />

                            {/* Appointment Details */}
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                                    {appt.doctor?.name}
                                </h3>

                                <p className="text-blue-600 font-medium">
                                    {appt.doctor?.speciality}
                                </p>

                                <p className="mt-2 text-gray-700">
                                    <b>Date:</b>{" "}
                                    {new Date(appt.appointmentDate).toLocaleDateString()}
                                </p>

                                <p className="text-gray-700">
                                    <b>Time:</b> {appt.appointmentTime}
                                </p>

                                <p className="mt-2">
                                    <b>Status:</b>{" "}
                                    <span className={`font-semibold ${getStatusColor(appt.status)}`}>
                                        {appt.status}
                                    </span>
                                </p>

                                {/* PAID INFO */}
                                {appt.status === "Paid" && appt.paidAt && (
                                    <div className="bg-blue-50 border border-blue-200 p-3 mt-3 rounded-lg text-sm">
                                        <p><b>Txn ID:</b> {appt.transactionId}</p>
                                        <p>
                                            <b>Paid On:</b> {new Date(appt.paidAt).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col gap-3 w-full md:w-auto">

                                {/* Pay Button */}
                                {appt.status !== "Paid" ? (
                                    <button
                                        onClick={() => handlePayment(appt._id, appt.status)}
                                        disabled={appt.status !== "Confirmed"}
                                        className={`px-5 py-2 rounded-lg text-white ${
                                            appt.status === "Confirmed"
                                                ? "bg-green-500 hover:bg-green-600"
                                                : "bg-gray-400 cursor-not-allowed"
                                        }`}
                                    >
                                        Pay Now
                                    </button>
                                ) : (
                                    <span className="px-5 py-2 bg-blue-500 text-white rounded-lg font-bold text-center">
                                        Paid
                                    </span>
                                )}

                                {/* Cancel Button */}
                                <button
                                    onClick={() => handleCancel(appt._id, appt.status)}
                                    disabled={appt.status === "Cancelled" || appt.status === "Paid"}
                                    className={`px-5 py-2 rounded-lg text-white ${
                                        appt.status === "Cancelled" || appt.status === "Paid"
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-red-500 hover:bg-red-600"
                                    }`}
                                >
                                    Cancel Appointment
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyAppointments;
