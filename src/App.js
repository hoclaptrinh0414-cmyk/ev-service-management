// src/App.js - UPDATED WITH REACT QUERY
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

// Import components
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./contexts/ToastContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ScheduleProvider } from "./contexts/ScheduleContext";

// Import pages
import Home from "./pages/Home";
import TrackReminder from "./pages/TrackReminder";
import Services from "./pages/Services";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ResetPasswordSuccess from "./pages/auth/ResetPasswordSuccess";
import EmailVerificationPage from "./pages/auth/EmailVerificationPage";
import ResendVerification from "./pages/auth/ResendVerification";
import CustomerDashboard from "./pages/customer/Dashboard";
import RegisterVehicle from "./pages/customer/RegisterVehicle";
import Profile from "./pages/customer/Profile";
import MyAppointments from "./pages/customer/MyAppointments";
import MySubscriptions from "./pages/customer/MySubscriptions";
import Packages from "./pages/customer/Packages";
import ScheduleServiceNew from "./pages/customer/ScheduleServiceNew";
import ProductIndividual from "./pages/customer/ProductIndividual";
import ProductCombo from "./pages/customer/ProductCombo";
import StaffLayout from "./pages/staff/StaffLayout";
import StaffAppointments from "./pages/staff/Appointments";
import StaffCheckIn from "./pages/staff/CheckIn";
import StaffWorkOrders from "./pages/staff/WorkOrders";
import StaffSettings from "./pages/staff/Settings";
import PaymentCallback from "./pages/payment/PaymentCallback";

// Import test components
import PasswordResetTest from "./components/PasswordResetTest";
import APIDebug from "./components/APIDebug";

// Admin components
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import VehicleManagement from "./pages/admin/VehicleManagement";
import CustomerManagement from "./pages/admin/CustomerManagement";
import ServiceSchedule from "./pages/admin/ServiceSchedule";
import MaintenanceProgress from "./pages/admin/MaintenanceProgress";
import PartsInventory from "./pages/admin/PartsInventory";
import StaffManagement from "./pages/admin/StaffManagement";

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <ScheduleProvider>
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
          <Route path="/reset-password-success" element={<ResetPasswordSuccess />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/resend-verification" element={<ResendVerification />} />

          {/* Test routes */}
          <Route path="/test-password-reset" element={<PasswordResetTest />} />
          <Route path="/api-debug" element={<APIDebug />} />

          {/* Protected routes - Customer */}
          <Route path="/services" element={<Services />} />

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
                <ScheduleServiceNew />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute>
                <MyAppointments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-subscriptions"
            element={
              <ProtectedRoute>
                <MySubscriptions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/packages"
            element={
              <ProtectedRoute>
                <Packages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/callback"
            element={
              <ProtectedRoute>
                <PaymentCallback />
              </ProtectedRoute>
            }
          />
          <Route path="/products/individual" element={<ProductIndividual />} />
          <Route path="/products/combo" element={<ProductCombo />} />
          <Route
            path="/staff"
            element={
              <ProtectedRoute requireRole={["staff", "admin"]}>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/staff/appointments" replace />} />
            <Route path="appointments" element={<StaffAppointments />} />
            <Route path="checkin" element={<StaffCheckIn />} />
            <Route path="work-orders" element={<StaffWorkOrders />} />
            <Route path="settings" element={<StaffSettings />} />
          </Route>

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireRole={["admin", "staff"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="vehicles" element={<VehicleManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="schedule" element={<ServiceSchedule />} />
            <Route path="maintenance" element={<MaintenanceProgress />} />
            <Route path="parts" element={<PartsInventory />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route
              path="finance"
              element={
                <div className="placeholder">
                  Financial Report - Coming Soon
                </div>
              }
            />
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
            </ScheduleProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
