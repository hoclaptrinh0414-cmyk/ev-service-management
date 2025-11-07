// src/pages/technician/APITester.jsx
import React, { useState } from 'react';
import technicianService from '../../services/technicianService';

/**
 * Trang test tất cả Technician APIs
 * Gọi các endpoints từ endpoints.md
 */
const APITester = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('attendance');

  // Reset state khi test API mới
  const resetState = () => {
    setResult(null);
    setError(null);
  };

  // Generic API call handler
  const callAPI = async (apiFunction, ...args) => {
    resetState();
    setLoading(true);
    try {
      const response = await apiFunction(...args);
      setResult(response);
      console.log('API Response:', response);
    } catch (err) {
      setError(err.message || 'API call failed');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============ ATTENDANCE APIs ============
  const testGetTodayShift = () => {
    callAPI(technicianService.getTodayShift);
  };

  const testCheckIn = () => {
    const data = {
      serviceCenterId: 1,
      shiftType: 'FullDay',
      notes: 'Test check-in from API Tester'
    };
    callAPI(technicianService.checkIn, data);
  };

  const testCheckOut = () => {
    const data = {
      notes: 'Test check-out from API Tester',
      earlyCheckoutReason: null
    };
    callAPI(technicianService.checkOut, data);
  };

  const testGetMyShifts = () => {
    const params = {
      Page: 1,
      PageSize: 10,
      FromDate: '2025-11-01',
      ToDate: '2025-11-30'
    };
    callAPI(technicianService.getMyShifts, params);
  };

  // ============ SELF-SERVICE APIs ============
  const testGetMySchedule = () => {
    const params = {
      startDate: '2025-11-01',
      endDate: '2025-11-30'
    };
    callAPI(technicianService.getMySchedule, params);
  };

  const testGetMyWorkOrders = () => {
    const params = {
      statusId: null,
      startDate: '2025-11-01',
      endDate: '2025-11-30'
    };
    callAPI(technicianService.getMyWorkOrders, params);
  };

  const testGetMyPerformance = () => {
    const params = {
      periodStart: '2025-11-01T00:00:00',
      periodEnd: '2025-11-30T23:59:59'
    };
    callAPI(technicianService.getMyPerformance, params);
  };

  const testGetMyRatings = () => {
    const params = {
      minRating: 3,
      startDate: '2025-11-01',
      endDate: '2025-11-30'
    };
    callAPI(technicianService.getMyRatings, params);
  };

  const testRequestTimeOff = () => {
    const data = {
      technicianId: 2105,
      startDate: '2025-11-15',
      endDate: '2025-11-20',
      reason: 'Test time-off request',
      timeOffType: 'Annual Leave',
      notes: 'Testing API from UI'
    };
    callAPI(technicianService.requestTimeOff, data);
  };

  // ============ TECHNICIAN MANAGEMENT APIs ============
  const testGetAllTechnicians = () => {
    const params = {
      PageNumber: 1,
      PageSize: 10,
      IsActive: true
    };
    callAPI(technicianService.getAllTechnicians, params);
  };

  const testGetTechnicianSchedule = () => {
    const technicianId = 2105;
    const params = {
      startDate: '2025-11-01',
      endDate: '2025-11-30'
    };
    callAPI(technicianService.getTechnicianSchedule, technicianId, params);
  };

  const testGetTechnicianSkills = () => {
    const technicianId = 2105;
    callAPI(technicianService.getTechnicianSkills, technicianId);
  };

  const testAddTechnicianSkill = () => {
    const technicianId = 2105;
    const data = {
      skillName: 'EV Battery Diagnostics',
      skillLevel: 'Advanced',
      certificationDate: '2025-11-07',
      expiryDate: '2027-11-07',
      certifyingBody: 'EV Technical Institute',
      certificationNumber: 'EVTI-2025-001',
      notes: 'Test skill added via API'
    };
    callAPI(technicianService.addTechnicianSkill, technicianId, data);
  };

  const testGetTechnicianPerformance = () => {
    const technicianId = 2105;
    const params = {
      periodStart: '2025-11-01T00:00:00',
      periodEnd: '2025-11-30T23:59:59'
    };
    callAPI(technicianService.getTechnicianPerformance, technicianId, params);
  };

  // ============ VEHICLE HEALTH APIs ============
  const testCreateVehicleHealthReport = () => {
    const data = {
      vehicleId: 1,
      workOrderId: 1,
      batteryHealth: 95,
      motorEfficiency: 92,
      brakeWear: 15,
      tireWear: 20,
      overallCondition: 90,
      diagnosticCodes: 'P0A80, P1A00',
      recommendations: 'Battery in excellent condition. Minor brake pad wear detected.',
      nextCheckDue: '2025-12-07'
    };
    callAPI(technicianService.createVehicleHealthReport, data);
  };

  // Render buttons cho từng section
  const renderAttendanceButtons = () => (
    <div className="row g-2">
      <div className="col-md-6">
        <button className="btn btn-primary w-100" onClick={testGetTodayShift}>
          <i className="bi bi-calendar-check me-2"></i>
          GET Today Shift
        </button>
      </div>
      <div className="col-md-6">
        <button className="btn btn-success w-100" onClick={testCheckIn}>
          <i className="bi bi-box-arrow-in-right me-2"></i>
          POST Check-in
        </button>
      </div>
      <div className="col-md-6">
        <button className="btn btn-warning w-100" onClick={testCheckOut}>
          <i className="bi bi-box-arrow-left me-2"></i>
          POST Check-out
        </button>
      </div>
      <div className="col-md-6">
        <button className="btn btn-info w-100" onClick={testGetMyShifts}>
          <i className="bi bi-list-ul me-2"></i>
          GET My Shifts (with filters)
        </button>
      </div>
    </div>
  );

  const renderSelfServiceButtons = () => (
    <div className="row g-2">
      <div className="col-md-6">
        <button className="btn btn-primary w-100" onClick={testGetMySchedule}>
          <i className="bi bi-calendar3 me-2"></i>
          GET My Schedule
        </button>
      </div>
      <div className="col-md-6">
        <button className="btn btn-primary w-100" onClick={testGetMyWorkOrders}>
          <i className="bi bi-clipboard-check me-2"></i>
          GET My Work Orders
        </button>
      </div>
      <div className="col-md-6">
        <button className="btn btn-primary w-100" onClick={testGetMyPerformance}>
          <i className="bi bi-graph-up me-2"></i>
          GET My Performance
        </button>
      </div>
      <div className="col-md-6">
        <button className="btn btn-primary w-100" onClick={testGetMyRatings}>
          <i className="bi bi-star me-2"></i>
          GET My Ratings
        </button>
      </div>
      <div className="col-md-12">
        <button className="btn btn-success w-100" onClick={testRequestTimeOff}>
          <i className="bi bi-calendar-x me-2"></i>
          POST Request Time-off
        </button>
      </div>
    </div>
  );

  const renderManagementButtons = () => (
    <div className="row g-2">
      <div className="col-md-6">
        <button className="btn btn-primary w-100" onClick={testGetAllTechnicians}>
          <i className="bi bi-people me-2"></i>
          GET All Technicians
        </button>
      </div>
      <div className="col-md-6">
        <button className="btn btn-primary w-100" onClick={testGetTechnicianSchedule}>
          <i className="bi bi-calendar2-week me-2"></i>
          GET Technician Schedule (ID: 2105)
        </button>
      </div>
      <div className="col-md-6">
        <button className="btn btn-primary w-100" onClick={testGetTechnicianSkills}>
          <i className="bi bi-award me-2"></i>
          GET Technician Skills (ID: 2105)
        </button>
      </div>
      <div className="col-md-6">
        <button className="btn btn-success w-100" onClick={testAddTechnicianSkill}>
          <i className="bi bi-plus-circle me-2"></i>
          POST Add Skill (ID: 2105)
        </button>
      </div>
      <div className="col-md-12">
        <button className="btn btn-primary w-100" onClick={testGetTechnicianPerformance}>
          <i className="bi bi-graph-up-arrow me-2"></i>
          GET Technician Performance (ID: 2105)
        </button>
      </div>
    </div>
  );

  const renderVehicleHealthButtons = () => (
    <div className="row g-2">
      <div className="col-md-12">
        <button className="btn btn-success w-100" onClick={testCreateVehicleHealthReport}>
          <i className="bi bi-file-medical me-2"></i>
          POST Create Vehicle Health Report
        </button>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="bi bi-code-slash me-2"></i>
              Technician API Tester
            </h2>
            <span className="badge bg-info">
              Based on endpoints.md
            </span>
          </div>

          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeSection === 'attendance' ? 'active' : ''}`}
                onClick={() => setActiveSection('attendance')}
              >
                <i className="bi bi-clock me-1"></i>
                Attendance
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeSection === 'self-service' ? 'active' : ''}`}
                onClick={() => setActiveSection('self-service')}
              >
                <i className="bi bi-person-workspace me-1"></i>
                Self-Service
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeSection === 'management' ? 'active' : ''}`}
                onClick={() => setActiveSection('management')}
              >
                <i className="bi bi-people me-1"></i>
                Technician Management
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeSection === 'vehicle-health' ? 'active' : ''}`}
                onClick={() => setActiveSection('vehicle-health')}
              >
                <i className="bi bi-heart-pulse me-1"></i>
                Vehicle Health
              </button>
            </li>
          </ul>

          <div className="row">
            {/* Left Panel - API Buttons */}
            <div className="col-md-5">
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-play-circle me-2"></i>
                    API Test Buttons
                  </h5>
                </div>
                <div className="card-body">
                  {activeSection === 'attendance' && renderAttendanceButtons()}
                  {activeSection === 'self-service' && renderSelfServiceButtons()}
                  {activeSection === 'management' && renderManagementButtons()}
                  {activeSection === 'vehicle-health' && renderVehicleHealthButtons()}
                </div>
              </div>

              {/* Instructions */}
              <div className="card shadow-sm mt-3">
                <div className="card-header bg-secondary text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Instructions
                  </h6>
                </div>
                <div className="card-body">
                  <small>
                    <ul className="mb-0">
                      <li>Click any button to test the corresponding API</li>
                      <li>Results will appear in the right panel</li>
                      <li>Check browser console for detailed logs</li>
                      <li>Login as: <code>techtest001 / Tech@123</code></li>
                    </ul>
                  </small>
                </div>
              </div>
            </div>

            {/* Right Panel - Results */}
            <div className="col-md-7">
              <div className="card shadow-sm">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-terminal me-2"></i>
                    API Response
                  </h5>
                </div>
                <div className="card-body" style={{ minHeight: '500px', maxHeight: '600px', overflowY: 'auto' }}>
                  {loading && (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3 text-muted">Calling API...</p>
                    </div>
                  )}

                  {error && (
                    <div className="alert alert-danger">
                      <h6 className="alert-heading">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Error
                      </h6>
                      <pre className="mb-0">{error}</pre>
                    </div>
                  )}

                  {result && !loading && (
                    <div className="alert alert-success">
                      <h6 className="alert-heading">
                        <i className="bi bi-check-circle me-2"></i>
                        Success Response
                      </h6>
                      <pre className="mb-0" style={{ 
                        background: '#f8f9fa', 
                        padding: '15px', 
                        borderRadius: '5px',
                        fontSize: '12px',
                        maxHeight: '400px',
                        overflowY: 'auto'
                      }}>
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  )}

                  {!loading && !result && !error && (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-arrow-left-circle" style={{ fontSize: '3rem' }}></i>
                      <p className="mt-3">Click a button on the left to test an API</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APITester;
