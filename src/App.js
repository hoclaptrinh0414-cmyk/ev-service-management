// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

// Import components
import ProtectedRoute from "./components/ProtectedRoute";
import ChatWidget from "./components/ChatWidget";

// Import pages
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ResetPasswordSuccess from "./pages/auth/ResetPasswordSuccess";
import EmailVerificationPage from "./pages/auth/EmailVerificationPage";
import ResendVerification from "./pages/auth/ResendVerification";
import CustomerDashboard from "./pages/customer/Dashboard";
import RegisterVehicle from "./pages/customer/RegisterVehicle";
import CustomerProfile from "./pages/customer/Profile";
import MyAppointments from "./pages/customer/MyAppointments";
import ScheduleServiceNew from "./pages/customer/ScheduleServiceNew";
import Packages from "./pages/customer/Packages";
import ProductCombo from "./pages/customer/ProductCombo";
import ProductIndividual from "./pages/customer/ProductIndividual";
import MySubscriptions from "./pages/customer/MySubscriptions";
import Records from "./pages/customer/Records";
import TrackingHistory from "./pages/customer/TrackingHistory";
import VehicleDetail from "./pages/customer/VehicleDetail";
import TrackReminder from "./pages/TrackReminder";
import PaymentCallback from "./pages/payment/PaymentCallback";

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
// import TechnicianDashboard from "./pages/technician/Dashboard"; // Removed - not used
import TechnicianWorkOrders from "./pages/technician/MyWorkOrders";
import TechnicianChecklist from "./pages/technician/MaintenanceChecklist";
import TechnicianFlow from "./pages/technician/TechnicianFlow";
import TechnicianSettings from "./pages/technician/Settings";
import TimeSlots from "./pages/admin/TimeSlots";
import CarBrands from "./pages/admin/CarBrands";
import ServiceSchedule from "./pages/admin/ServiceSchedule";
import PartManagement from "./pages/admin/PartManagement";

// Chat visibility helper
import { useLocation } from "react-router-dom";

const ChatWrapper = () => {
  const location = useLocation();
  const path = location.pathname || "";
  const authPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/resend-verification"];
  const hideChat =
    authPaths.includes(path) ||
    path.startsWith("/staff") ||
    path.startsWith("/technician");
  if (hideChat) return null;
  return <ChatWidget />;
};

function App() {

  return (
    <Router>
      <div className="App">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/reset-password-success"
            element={<ResetPasswordSuccess />}
          />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/resend-verification" element={<ResendVerification />} />

          {/* Test routes */}
          <Route path="/test-password-reset" element={<PasswordResetTest />} />
          <Route path="/api-debug" element={<APIDebug />} />

          {/* Public routes */}
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/payment/result" element={<PaymentCallback />} />

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
                <CustomerProfile />
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
            path="/my-appointments"
            element={
              <ProtectedRoute>
                <MyAppointments />
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
            path="/packages"
            element={
              <ProtectedRoute>
                <Packages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products/combo"
            element={
              <ProtectedRoute>
                <ProductCombo />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products/individual"
            element={
              <ProtectedRoute>
                <ProductIndividual />
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <MySubscriptions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/records"
            element={
              <ProtectedRoute>
                <Records />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tracking"
            element={
              <ProtectedRoute>
                <TrackingHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vehicle/:id"
            element={
              <ProtectedRoute>
                <VehicleDetail />
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

          {/* Technician routes */}
          <Route
            path="/technician"
            element={
              <ProtectedRoute requireRole="technician">
                <TechnicianLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<Navigate to="/technician/flow" replace />}
            />
            {/* <Route path="dashboard" element={<TechnicianDashboard />} /> */}
            <Route path="work-orders" element={<TechnicianWorkOrders />} />
            <Route
              path="maintenance/:workOrderId"
              element={<TechnicianChecklist />}
            />
            <Route path="flow" element={<TechnicianFlow />} />
            <Route path="settings" element={<TechnicianSettings />} />
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
            <Route path="schedule" element={<ServiceSchedule />} />
            <Route
              path="maintenance"
              element={
                <div className="placeholder">
                  Maintenance Progress - Coming Soon
                </div>
              }
            />
            <Route path="parts" element={<PartManagement />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="finance" element={<FinancialReport />} />
            <Route path="time-slots" element={<TimeSlots />} />
            <Route path="brands" element={<CarBrands />} />
            <Route
              path="settings"
              element={<div className="placeholder">Settings - Coming Soon</div>}
            />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ChatWrapper />
      </div>
    </Router>
  );
}

export default App;
