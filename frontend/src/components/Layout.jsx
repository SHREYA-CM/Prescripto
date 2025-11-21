import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaUserMd, FaCalendarCheck, FaSignOutAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Layout.css'; // 👈 1. Nayi CSS file ko import kiya gaya hai

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        toast.success("Logged out successfully!");
        navigate('/admin/login');
    };

    const adminMenu = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <FaTachometerAlt /> },
        { name: 'Appointments', path: '/admin/appointments', icon: <FaCalendarCheck /> },
        { name: 'Doctors List', path: '/admin/doctors', icon: <FaUserMd /> },
    ];

    return (
        // 2. Sabhi style attributes ko className se badal diya gaya hai
        <div className="layout-main">
            <div className="layout-container">
                <div className="sidebar">
                    <div className="logo">
                        <h3>Prescripto</h3>
                        <p>Admin Panel</p>
                    </div>
                    <div className="menu">
                        {adminMenu.map(menu => {
                            const isActive = location.pathname.startsWith(menu.path);
                            return (
                                <Link to={menu.path} key={menu.path} className={isActive ? 'menu-item-active' : 'menu-item'}>
                                    <span className="icon">{menu.icon}</span>
                                    <span>{menu.name}</span>
                                </Link>
                            );
                        })}
                        <div onClick={handleLogout} className="menu-item logout-link">
                             <span className="icon"><FaSignOutAlt /></span>
                             <span>Logout</span>
                        </div>
                    </div>
                </div>
                <div className="content">
                    <div className="body">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;

