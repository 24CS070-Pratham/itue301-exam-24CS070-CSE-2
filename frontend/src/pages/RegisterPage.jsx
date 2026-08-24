import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Dumbbell,
  User,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const MEMBERSHIP_PLANS = [
  { id: 'basic', name: 'Basic', tag: 'Standard', desc: 'Gym Floor Access' },
  { id: 'premium', name: 'Premium', tag: 'Popular', desc: 'All Classes + Gym' },
  { id: 'platinum', name: 'Platinum', tag: 'VIP Pass', desc: 'Unlimited & Spa' },
];

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [membershipType, setMembershipType] = useState('basic');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        membershipType,
        role: 'Member',
      });

      if (response.success && response.token) {
        // Auto-login newly registered user
        login(response.member, response.token, response.role || 'Member');
        navigate('/classes');
      } else {
        setError(response.message || 'Registration failed. Please check details.');
      }
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <h1>Create an Account</h1>
          <p>Join FitZone to access world-class trainers and classes</p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <Link to="/" className="auth-tab">
            <LogIn size={16} />
            <span>Sign In</span>
          </Link>
          <button type="button" className="auth-tab active">
            <UserPlus size={16} />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="input-group">
            <label className="input-label" htmlFor="register-name">
              Full Name *
            </label>
            <div className="input-with-icon-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="register-name"
                type="text"
                className="input-field input-field-with-icon"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="input-group">
            <label className="input-label" htmlFor="register-email">
              Email Address *
            </label>
            <div className="input-with-icon-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="register-email"
                type="email"
                className="input-field input-field-with-icon"
                placeholder="e.g. alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label className="input-label" htmlFor="register-password">
              Password * (Min. 6 characters)
            </label>
            <div className="input-with-icon-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className="input-field input-field-with-icon"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
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

          {/* Phone Number (Optional) */}
          <div className="input-group">
            <label className="input-label" htmlFor="register-phone">
              Phone Number <span style={{ color: 'var(--text-dim)' }}>(Optional)</span>
            </label>
            <div className="input-with-icon-wrapper">
              <Phone size={18} className="input-icon" />
              <input
                id="register-phone"
                type="tel"
                className="input-field input-field-with-icon"
                placeholder="e.g. +1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Membership Tier Selector */}
          <div className="input-group">
            <label className="input-label">
              Choose Membership Tier
            </label>
            <div className="tier-selector">
              {MEMBERSHIP_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`tier-option ${membershipType === plan.id ? 'selected' : ''}`}
                  onClick={() => setMembershipType(plan.id)}
                >
                  <span className="tier-name">{plan.name}</span>
                  <span className="tier-badge">{plan.tag}</span>
                  {membershipType === plan.id && (
                    <CheckCircle2 size={14} color="var(--primary)" style={{ marginTop: '0.15rem' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={loading}
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Sign Up & Start Training</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="auth-footer">
          Already have an account?
          <Link to="/">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
