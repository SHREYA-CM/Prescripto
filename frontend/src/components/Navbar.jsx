// src/components/Navbar.jsx
import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const { user, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/patient-login");
  };

  const firstName = user?.name?.split(" ")[0] || "User";

  return (
    <>
      <style>{`
        .navbar {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          box-shadow: 0px 2px 5px rgba(0,0,0,0.1);
          background: white;
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        .nav-logo {
          height: 40px;
        }
        .nav-links {
          display: flex;
          gap: 1.5rem;
        }
        .nav-links a {
          font-weight: bold;
          color: #333;
          text-decoration: none;
        }
        .login-btn {
          padding: 8px 15px;
          background: #007BFF;
          border: none;
          border-radius: 5px;
          color: white;
          font-weight: bold;
          cursor: pointer;
        }
        .dropdown-menu {
          position: absolute;
          top: 110%;
          right: 0;
          background: white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          border-radius: 6px;
          overflow: hidden;
        }
        .dropdown-menu a {
          display: block;
          padding: 10px;
          text-decoration: none;
          color: #333;
        }
        .user-area {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logout-btn {
          padding: 8px 14px;
          background: #d9534f;
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .hamburger {
          display: none;
          font-size: 26px;
          cursor: pointer;
        }
        .mobile-menu {
          display: none;
        }
        @media (max-width: 768px) {
          .nav-links,
          .user-area,
          .login-area {
            display: none;
          }
          .hamburger {
            display: block;
          }
          .mobile-menu {
            display: flex;
            flex-direction: column;
            background: white;
            width: 100%;
            padding: 1rem;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            animation: slideDown 0.3s ease;
          }
          .mobile-menu a {
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
            text-decoration: none;
            color: #333;
          }
          .mobile-logout {
            margin-top: 10px;
            background: #d9534f;
            padding: 10px;
            color: white;
            border: none;
            border-radius: 5px;
          }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="navbar">
        <NavLink to="/">
          <img src={assets.logo} alt="Prescripto" className="nav-logo" />
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/doctors">All Doctors</NavLink>
          <NavLink to="/about">About Us</NavLink>
          <NavLink to="/contact">Contact</NavLink>

          {user?.role === "patient" && (
            <NavLink to="/my-appointments">My Appointments</NavLink>
          )}
          {user?.role === "doctor" && (
            <NavLink to="/doctor">Doctor Dashboard</NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink to="/admin">Admin Dashboard</NavLink>
          )}
        </nav>

        {!user ? (
          <div className="login-area" style={{ position: "relative" }}>
            <button
              className="login-btn"
              onClick={() => setOpenMenu(!openMenu)}
            >
              Login ▼
            </button>

            {openMenu && (
              <div className="dropdown-menu">
                <NavLink to="/patient-login">Patient Login</NavLink>
                <NavLink to="/doctor-login">Doctor Login</NavLink>
                <NavLink to="/admin-login">Admin Login</NavLink>
                <NavLink to="/register" style={{ color: "green" }}>
                  Register
                </NavLink>
              </div>
            )}
          </div>
        ) : (
          <div className="user-area">
            <span>Welcome, {firstName}!</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}

        <div className="hamburger" onClick={() => setMobileNav(!mobileNav)}>
          ☰
        </div>
      </div>

      {mobileNav && (
        <div className="mobile-menu">
          <NavLink onClick={() => setMobileNav(false)} to="/">
            Home
          </NavLink>
          <NavLink onClick={() => setMobileNav(false)} to="/doctors">
            All Doctors
          </NavLink>
          <NavLink onClick={() => setMobileNav(false)} to="/about">
            About Us
          </NavLink>
          <NavLink onClick={() => setMobileNav(false)} to="/contact">
            Contact
          </NavLink>

          {user?.role === "patient" && (
            <NavLink
              onClick={() => setMobileNav(false)}
              to="/my-appointments"
            >
              My Appointments
            </NavLink>
          )}
          {user?.role === "doctor" && (
            <NavLink onClick={() => setMobileNav(false)} to="/doctor">
              Doctor Dashboard
            </NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink onClick={() => setMobileNav(false)} to="/admin">
              Admin Dashboard
            </NavLink>
          )}

          {!user ? (
            <>
              <NavLink to="/patient-login">Patient Login</NavLink>
              <NavLink to="/doctor-login">Doctor Login</NavLink>
              <NavLink to="/admin-login">Admin Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          ) : (
            <button className="mobile-logout" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;
