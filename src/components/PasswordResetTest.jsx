// src/components/PasswordResetTest.jsx - Component để test
// Tạo file này để test các API calls

import React, { useState } from 'react';
import { authAPI, accountRecoveryService, handleApiError } from '../services/api';

const PasswordResetTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, success, message, data = null) => {
    const result = {
      test,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
    console.log(`${success ? '✅' : '❌'} ${test}:`, message, data);
  };

  const testForgotPassword = async () => {
    setLoading(true);
    const testEmail = "test@example.com"; // Thay bằng email test
    
    try {
      const response = await authAPI.forgotPassword(testEmail);
      addResult("Forgot Password", true, "API call successful", response);
    } catch (error) {
      addResult("Forgot Password", false, handleApiError(error), error);
    } finally {
      setLoading(false);
    }
  };

  const testValidateToken = async () => {
    setLoading(true);
    const testToken = "test-token";
    const testEmail = "test@example.com";
    
    try {
      const response = await accountRecoveryService.validateResetToken(testToken, testEmail);
      addResult("Validate Token", true, "Token validation successful", response);
    } catch (error) {
      addResult("Validate Token", false, handleApiError(error), error);
    } finally {
      setLoading(false);
    }
  };

  const testResetPassword = async () => {
    setLoading(true);
    const testData = {
      token: "test-token",
      email: "test@example.com",
      newPassword: "newPassword123",
      confirmPassword: "newPassword123"
    };
    
    try {
      const response = await accountRecoveryService.resetPassword(testData);
      addResult("Reset Password", true, "Password reset successful", response);
    } catch (error) {
      addResult("Reset Password", false, handleApiError(error), error);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header">
              <h4>🧪 Password Reset API Test</h4>
              <p className="mb-0 text-muted">Test các API endpoint cho password reset</p>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2 mb-4">
                <button 
                  className="btn btn-primary" 
                  onClick={testForgotPassword}
                  disabled={loading}
                >
                  {loading ? "Testing..." : "Test Forgot Password API"}
                </button>
                
                <button 
                  className="btn btn-warning" 
                  onClick={testValidateToken}
                  disabled={loading}
                >
                  {loading ? "Testing..." : "Test Validate Token API"}
                </button>
                
                <button 
                  className="btn btn-success" 
                  onClick={testResetPassword}
                  disabled={loading}
                >
                  {loading ? "Testing..." : "Test Reset Password API"}
                </button>
                
                <button 
                  className="btn btn-secondary" 
                  onClick={clearResults}
                >
                  Clear Results
                </button>
              </div>

              {/* Results */}
              <div className="test-results">
                <h5>Test Results:</h5>
                {testResults.length === 0 ? (
                  <p className="text-muted">No tests run yet.</p>
                ) : (
                  <div className="list-group">
                    {testResults.map((result, index) => (
                      <div 
                        key={index}
                        className={`list-group-item ${result.success ? 'list-group-item-success' : 'list-group-item-danger'}`}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">
                              {result.success ? '✅' : '❌'} {result.test}
                            </h6>
                            <p className="mb-1">{result.message}</p>
                            {result.data && (
                              <small className="text-muted">
                                Data: {JSON.stringify(result.data, null, 2)}
                              </small>
                            )}
                          </div>
                          <small className="text-muted">{result.timestamp}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* API Info */}
          <div className="card mt-4">
            <div className="card-header">
              <h5>🔧 API Configuration</h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li><strong>API Base URL:</strong> {process.env.REACT_APP_API_URL || "Not set"}</li>
                <li><strong>App URL:</strong> {process.env.REACT_APP_APP_URL || "Not set"}</li>
                <li><strong>Environment:</strong> {process.env.NODE_ENV}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetTest;