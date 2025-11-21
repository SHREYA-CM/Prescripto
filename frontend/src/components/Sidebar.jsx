import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaTachometerAlt, FaCalendarCheck, FaUserMd, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';

// Note: We don't need AdminContext for a simple logout.
// The CSS classes are designed to match the new Admin.css file.

const Sidebar = () => {
    const navigate = useNavigate();

    // Corrected Logout Function
    const handleLogout = () => {
        // Clear all user data from storage
        localStorage.clear();
        toast.success("Logged out successfully!");
        // Navigate to the admin login page
        navigate('/admin/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-title">Prescripto</h2>
                <p className="sidebar-subtitle">Admin Panel</p>
            </div>
            
            <nav className="sidebar-nav">
                {/* ✅ FIXED: All paths now start with /admin */}
                <NavLink to="/admin" end className="nav-link">
                    <FaTachometerAlt className="nav-icon" />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/admin/appointments" className="nav-link">
                    <FaCalendarCheck className="nav-icon" />
                    <span>Appointments</span>
                </NavLink>
                <NavLink to="/admin/add-doctor" className="nav-link">
                    <FaUserPlus className="nav-icon" />
                    <span>Add Doctor</span>
                </NavLink>
                <NavLink to="/admin/doctors" className="nav-link">
                    <FaUserMd className="nav-icon" />
                    <span>Doctors List</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="nav-link logout-btn">
                    <FaSignOutAlt className="nav-icon" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

