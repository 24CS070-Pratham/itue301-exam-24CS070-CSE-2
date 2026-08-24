import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Dumbbell,
  Mail,
  Lock,
  AlertCircle,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
} from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.login(email.trim(), password);

      if (response.success && response.token) {
        // Store in context
        login(response.member, response.token, response.role);
        // Redirect to /classes
        navigate('/classes');
      } else {
        setError(response.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  // Preset demo account buttons for fast testing
  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div
            className="brand-logo"
            style={{ justifyContent: 'center', marginBottom: '0.75rem' }}
          >
            <div className="brand-icon">
              <Dumbbell size={22} />
            </div>
            <span>
              FIT<span className="accent">ZONE</span>
            </span>
          </div>
          <h1>Member Portal</h1>
          <p>Sign in to browse trainers and book classes</p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button type="button" className="auth-tab active">
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
          <Link to="/register" className="auth-tab">
            <UserPlus size={16} />
            <span>Sign Up</span>
          </Link>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email Address */}
          <div className="input-group">
            <label className="input-label" htmlFor="login-email">
              Email Address
            </label>
            <div className="input-with-icon-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="login-email"
                type="email"
                className="input-field input-field-with-icon"
                placeholder="e.g. member@fitzone.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label className="input-label" htmlFor="login-password">
              Password
            </label>
            <div className="input-with-icon-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="input-field input-field-with-icon"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                className="input-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? (
              <span>Logging in...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Prompt */}
        <div className="auth-footer">
          Don't have an account?
          <Link to="/register">Create one now</Link>
        </div>

        {/* Demo Quick-Fill Box for Testing */}
        <div className="demo-credentials-box">
          <strong style={{ color: 'var(--primary)' }}>⚡ Quick Demo Credentials:</strong>
          <div className="demo-btn-group">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fillDemoAccount('john@fitzone.com', 'password123')}
            >
              Member (John)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fillDemoAccount('admin@fitzone.com', 'admin123')}
            >
              Admin (Admin)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
