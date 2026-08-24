import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Calendar, BookOpen, ShieldCheck, LogOut, LogIn, UserPlus } from 'lucide-react';

const Navigation = () => {
  const { member, token, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        {/* Brand Logo */}
        <Link to={token ? '/classes' : '/'} className="brand-logo">
          <div className="brand-icon">
            <Dumbbell size={20} />
          </div>
          <span>
            FIT<span className="accent">ZONE</span>
          </span>
        </Link>

        {/* Nav Links */}
        <ul className="nav-links">
          {!token ? (
            <>
              <li>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <LogIn size={16} />
                  <span>Login</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <UserPlus size={16} />
                  <span>Sign Up</span>
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink
                  to="/classes"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Calendar size={16} />
                  <span>Classes</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/my-bookings"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <BookOpen size={16} />
                  <span>My Bookings</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <ShieldCheck size={16} />
                  <span>Admin</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {/* User Status / Action */}
        {token && member && (
          <div className="nav-user">
            <div className="user-badge">
              <span>{member.name || member.email}</span>
              <span className={`user-role-tag ${role === 'Admin' ? 'admin' : ''}`}>
                {role || 'Member'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="btn-logout"
              title="Log out of FitZone"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
