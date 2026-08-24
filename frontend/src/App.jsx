import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';

// Eagerly loaded member pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClassesPage from './pages/ClassesPage';
import MyBookingsPage from './pages/MyBookingsPage';

// Lazy-loaded Admin Panel as per PRD requirement
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navigation />
          <main className="main-content">
            <Routes>
              {/* Public Routes: Login & Register */}
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Route: Classes Booking */}
              <Route
                path="/classes"
                element={
                  <ProtectedRoute>
                    <ClassesPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Route: My Bookings */}
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Lazy-Loaded Admin Route wrapped in Suspense */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<Loading message="Loading Admin Panel..." />}>
                      <AdminPanel />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
