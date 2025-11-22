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
import CustomerManagement from "./pages/admin/CustomerManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import FinancialReport from "./pages/admin/FinancialReport";
import StaffLayout from "./pages/staff/StaffLayout";
import StaffAppointments from "./pages/staff/Appointments";
import StaffWorkOrders from "./pages/staff/WorkOrders";
import StaffCheckIn from "./pages/staff/CheckIn";
import StaffSettings from "./pages/staff/Settings";
import TechnicianLayout from "./pages/technician/TechnicianLayout";
import TechnicianDashboard from "./pages/technician/Dashboard";
import TechnicianWorkOrders from "./pages/technician/MyWorkOrders";
import TechnicianChecklist from "./pages/technician/MaintenanceChecklist";
import TechnicianFlow from "./pages/technician/TechnicianFlow";
import TimeSlots from "./pages/admin/TimeSlots";
import CarBrands from "./pages/admin/CarBrands";

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
            path="/profile"
            element={
              <ProtectedRoute>
                <div>Profile - Protected Page</div>
              </ProtectedRoute>
            }
          />

          {/* Staff routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute requireRole="staff">
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StaffAppointments />} />
            <Route path="appointments" element={<StaffAppointments />} />
            <Route path="work-orders" element={<StaffWorkOrders />} />
            <Route path="check-in" element={<StaffCheckIn />} />
            <Route path="settings" element={<StaffSettings />} />
          </Route>

          {/* Staff routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute requireRole="staff">
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StaffAppointments />} />
            <Route path="appointments" element={<StaffAppointments />} />
            <Route path="work-orders" element={<StaffWorkOrders />} />
            <Route path="check-in" element={<StaffCheckIn />} />
            <Route path="settings" element={<StaffSettings />} />
          </Route>

          {/* Technician routes */}
          <Route
            path="/technician"
            element={
              <ProtectedRoute requireRole="technician">
                <TechnicianLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TechnicianDashboard />} />
            <Route path="work-orders" element={<TechnicianWorkOrders />} />
            <Route path="checklist" element={<TechnicianChecklist />} />
            <Route path="flow" element={<TechnicianFlow />} />
          </Route>

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
            <Route path="customers" element={<CustomerManagement />} />
            <Route
              path="schedule"
              element={
                <div className="placeholder">
                  Service Schedule - Coming Soon
                </div>
              }
            />
            <Route
              path="maintenance"
              element={
                <div className="placeholder">
                  Maintenance Progress - Coming Soon
                </div>
              }
            />
            <Route
              path="parts"
              element={
                <div className="placeholder">Parts Inventory - Coming Soon</div>
              }
            />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="finance" element={<FinancialReport />} />
            <Route path="time-slots" element={<TimeSlots />} />
            <Route path="brands" element={<CarBrands />} />
            <Route
              path="settings"
              element={
                <div className="placeholder">Settings - Coming Soon</div>
              }
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
