// src/App.js - COPY TOÀN BỘ FILE NÀY - ĐÃ THÊM APIDebug
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

// Import components
import ProtectedRoute from "./components/ProtectedRoute";

// Import pages
import Home from "./pages/Home";
import TrackReminder from "./pages/TrackReminder";
import ScheduleService from "./pages/ScheduleService";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import EmailVerificationPage from "./pages/auth/EmailVerificationPage";
import ResendVerification from "./pages/auth/ResendVerification";
import CustomerDashboard from "./pages/customer/Dashboard";
import RegisterVehicle from "./pages/customer/RegisterVehicle";

// Import test components
import PasswordResetTest from "./components/PasswordResetTest";
import APIDebug from "./components/APIDebug";

// Admin components
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import VehicleManagement from "./pages/admin/VehicleManagement";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
          
          {/* Test routes */}
          <Route path="/test-password-reset" element={<PasswordResetTest />} />
          <Route path="/api-debug" element={<APIDebug />} />
          
          {/* Protected routes - Customer */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/register-vehicle"
            element={
              <ProtectedRoute>
                <RegisterVehicle />
              </ProtectedRoute>
            }
          />

          <Route
            path="/track-reminder"
            element={
              <ProtectedRoute>
                <TrackReminder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/schedule-service"
            element={
              <ProtectedRoute>
                <ScheduleService />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div>Profile - Protected Page</div>
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="vehicles" element={<VehicleManagement />} />
            <Route 
              path="customers" 
              element={<div className="placeholder">Customer Management - Coming Soon</div>} 
            />
            <Route 
              path="schedule" 
              element={<div className="placeholder">Service Schedule - Coming Soon</div>} 
            />
            <Route 
              path="maintenance" 
              element={<div className="placeholder">Maintenance Progress - Coming Soon</div>} 
            />
            <Route 
              path="parts" 
              element={<div className="placeholder">Parts Inventory - Coming Soon</div>} 
            />
            <Route 
              path="staff" 
              element={<div className="placeholder">Staff Management - Coming Soon</div>} 
            />
            <Route 
              path="finance" 
              element={<div className="placeholder">Financial Report - Coming Soon</div>} 
            />
            <Route 
              path="settings" 
              element={<div className="placeholder">Settings - Coming Soon</div>} 
            />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;