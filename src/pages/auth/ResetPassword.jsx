// src/pages/auth/ResetPassword.jsx - Complete Version
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { accountRecoveryService, handleApiError } from "../../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // Validate token on component mount
  useEffect(() => {
    if (!token || !email) {
      setError("Link đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu link mới.");
      setValidating(false);
      return;
    }

    validateToken();
  }, [token, email]);

  const validateToken = async () => {
    console.log("🔍 Validating reset token for:", email);
    
    try {
      const response = await accountRecoveryService.validateResetToken(token, email);
      console.log("✅ Token validation response:", response);

      if (response.success) {
        setIsValidToken(true);
        setError("");
        console.log("✅ Token is valid, showing reset form");
      } else {
        setError(response.message || "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
        setIsValidToken(false);
        console.log("❌ Token validation failed:", response.message);
      }
    } catch (error) {
      console.error("❌ Token validation error:", error);

      if (error.response?.data?.errorCode === "INVALID_TOKEN") {
        setError("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.");
      } else {
        setError(handleApiError(error));
      }
      setIsValidToken(false);
    } finally {
      setValidating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear errors when user starts typing
    if (error) setError("");
    if (success) setSuccess("");

    // Check password strength
    if (name === "newPassword") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length === 0) {
      setPasswordStrength("");
      return;
    }

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 1;
    // Contains number
    if (/\d/.test(password)) strength += 1;
    // Contains letter
    if (/[a-zA-Z]/.test(password)) strength += 1;
    // Contains special character
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;

    switch (strength) {
      case 0:
      case 1:
        setPasswordStrength("weak");
        break;
      case 2:
        setPasswordStrength("fair");
        break;
      case 3:
        setPasswordStrength("good");
        break;
      case 4:
        setPasswordStrength("strong");
        break;
      default:
        setPasswordStrength("");
    }
  };

  const validateForm = () => {
    if (!formData.newPassword) {
      setError("Vui lòng nhập mật khẩu mới");
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!isValidToken) return;

    setLoading(true);
    setError("");

    try {
      console.log("🔄 Submitting password reset...");
      
      const resetData = {
        token,
        email,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      };

      const response = await accountRecoveryService.resetPassword(resetData);
      console.log("✅ Reset password response:", response);

      if (response.success) {
        setSuccess("🎉 Mật khẩu đã được đặt lại thành công! Bạn sẽ được chuyển đến trang đăng nhập.");
        
        // Clear form
        setFormData({
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordStrength("");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(response.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("❌ Reset password error:", error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case "weak": return "#dc3545";
      case "fair": return "#fd7e14";
      case "good": return "#198754";
      case "strong": return "#20c997";
      default: return "#6c757d";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case "weak": return "Yếu";
      case "fair": return "Trung bình";
      case "good": return "Tốt";
      case "strong": return "Mạnh";
      default: return "";
    }
  };

  const getPasswordStrengthWidth = () => {
    switch (passwordStrength) {
      case "weak": return 25;
      case "fair": return 50;
      case "good": return 75;
      case "strong": return 100;
      default: return 0;
    }
  };

  // Loading state
  if (validating) {
    return (
      <div className="container-fluid d-flex align-items-center justify-content-center h-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="mb-2">Đang xác thực link...</h4>
          <p className="text-muted">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container-fluid p-0 h-100">
        <div className="card">
          <div className="row g-0 h-100">
            <div className="col-md-8 d-none d-md-block left-col h-auto">
              <img
                className="img-fluid"
                src="https://tsportline.com/cdn/shop/files/black-tesla-model-s-21-inch-aftermarket-wheels-tss-gloss-black-rear-1920-2_1600x.png?v=1680200206"
                alt="Tesla Model S"
              />
            </div>
            <div className="col col-md-4 d-flex align-items-center justify-content-center">
              <div className="card-body text-center" style={{ maxWidth: "450px", width: "100%" }}>
                
                {/* Header */}
                <div className="mb-4">
                  <i
                    className={`bi ${
                      isValidToken
                        ? "bi-shield-lock-fill text-success"
                        : "bi-shield-x-fill text-danger"
                    }`}
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h3 className="mt-3 mb-2" style={{
                    fontFamily: "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
                  }}>
                    {isValidToken ? "Đặt lại mật khẩu" : "Link không hợp lệ"}
                  </h3>
                  {isValidToken ? (
                    <p className="text-muted">
                      Nhập mật khẩu mới cho tài khoản: <strong>{email}</strong>
                    </p>
                  ) : (
                    <p className="text-muted">
                      Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn
                    </p>
                  )}
                </div>

                {/* Alerts */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {success}
                  </div>
                )}

                {/* Content */}
                {isValidToken && !success ? (
                  // Reset Password Form
                  <form onSubmit={handleSubmit}>
                    {/* New Password */}
                    <div className="input-group mb-2">
                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        name="newPassword"
                        placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        minLength="6"
                        maxLength="50"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.newPassword && (
                      <div className="mb-3">
                        <div className="progress" style={{ height: "4px" }}>
                          <div
                            className="progress-bar"
                            style={{
                              width: `${getPasswordStrengthWidth()}%`,
                              backgroundColor: getPasswordStrengthColor(),
                            }}
                          ></div>
                        </div>
                        <small style={{ color: getPasswordStrengthColor() }}>
                          Độ mạnh: {getPasswordStrengthText()}
                        </small>
                      </div>
                    )}

                    {/* Confirm Password */}
                    <div className="input-group mb-3">
                      <span className="input-group-text">
                        <i className="bi bi-lock-fill"></i>
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control"
                        name="confirmPassword"
                        placeholder="Xác nhận mật khẩu mới"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        maxLength="50"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                      >
                        <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>

                    <button type="submit" className="btn reset-btn w-100 mb-3" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Đang đặt lại mật khẩu...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Đặt lại mật khẩu
                        </>
                      )}
                    </button>
                  </form>
                ) : !isValidToken ? (
                  // Invalid Token State
                  <div className="d-grid gap-2">
                    <Link to="/forgot-password" className="btn btn-primary">
                      <i className="bi bi-envelope me-2"></i>
                      Yêu cầu link mới
                    </Link>
                  </div>
                ) : (
                  // Success State
                  <div className="text-center">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "4rem" }}></i>
                    <p className="mt-3 mb-4">
                      Bạn sẽ được chuyển đến trang đăng nhập trong giây lát...
                    </p>
                    <Link to="/login" className="btn btn-success">
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Đăng nhập ngay
                    </Link>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 pt-3 border-top">
                  <div className="row text-center">
                    <div className="col">
                      <Link to="/login" className="text-decoration-none text-muted small">
                        <i className="bi bi-box-arrow-in-right me-1"></i>
                        Đăng nhập
                      </Link>
                    </div>
                    <div className="col">
                      <Link to="/register" className="text-decoration-none text-muted small">
                        <i className="bi bi-person-plus me-1"></i>
                        Đăng ký
                      </Link>
                    </div>
                    <div className="col">
                      <a href="mailto:nghiapnse181815@fpt.edu.vn" className="text-decoration-none text-muted small">
                        <i className="bi bi-envelope me-1"></i>
                        Hỗ trợ
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

  <style>{`
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        .container, .card, .row {
          height: 100%;
          width: 100%;
        }
        .card {
          border-radius: 0;
          box-shadow: none;
          border: none;
        }
        .reset-btn {
          background-color: #28a745;
          color: white;
          transition: all 0.3s ease;
          border: none;
          font-weight: 500;
        }
        .reset-btn:hover:not(:disabled) {
          background-color: #218838;
          color: white;
          transform: scale(1.02);
        }
        .reset-btn:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
          opacity: 0.65;
        }
        .left-col img {
          width: 100%;
          height: 100vh;
          object-fit: cover;
        }
        .input-group-text {
          background-color: #f8f9fa;
          border-right: none;
        }
        .form-control {
          border-left: none;
        }
        .form-control:focus {
          border-color: #ced4da;
          box-shadow: none;
        }
        .form-control:disabled {
          background-color: #e9ecef;
        }
        .alert {
          text-align: left;
          font-size: 0.9rem;
        }
        .progress {
          border-radius: 2px;
        }
        .progress-bar {
          transition: width 0.3s ease, background-color 0.3s ease;
        }
        @media (max-width: 768px) {
          .row .col-md-4, .row .col-md-8 {
            width: 100%;
            height: auto;
          }
          .left-col img {
            height: auto;
          }
          body {
            overflow-y: auto;
          }
        }
      `}</style>
    </>
  );
};

export default ResetPassword;