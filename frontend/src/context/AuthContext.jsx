import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [member, setMember] = useState(() => {
    try {
      const stored = localStorage.getItem('fitzone_member');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('fitzone_token') || null;
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem('fitzone_role') || 'Member';
  });

  // Sync to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('fitzone_token', token);
    } else {
      localStorage.removeItem('fitzone_token');
    }
  }, [token]);

  useEffect(() => {
    if (member) {
      localStorage.setItem('fitzone_member', JSON.stringify(member));
    } else {
      localStorage.removeItem('fitzone_member');
    }
  }, [member]);

  useEffect(() => {
    if (role) {
      localStorage.setItem('fitzone_role', role);
    } else {
      localStorage.removeItem('fitzone_role');
    }
  }, [role]);

  const login = (memberData, authToken, userRole = 'Member') => {
    setMember(memberData);
    setToken(authToken);
    setRole(userRole || memberData?.role || 'Member');
  };

  const logout = () => {
    setMember(null);
    setToken(null);
    setRole('Member');
    localStorage.removeItem('fitzone_member');
    localStorage.removeItem('fitzone_token');
    localStorage.removeItem('fitzone_role');
  };

  return (
    <AuthContext.Provider
      value={{
        member,
        token,
        role,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
