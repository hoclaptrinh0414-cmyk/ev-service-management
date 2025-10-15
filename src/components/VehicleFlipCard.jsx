import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import FancyButton from './FancyButton';

const VehicleFlipCard = ({ vehicle, onDelete }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    setDeleting(true);
    try {
      if (onDelete) {
        await onDelete(vehicle.id);
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancelDelete = (e) => {
    e.preventDefault();
    setShowConfirm(false);
  };

  const handleCardClick = (e) => {
    // Chỉ navigate khi không click vào nút
    if (!e.target.closest('button') && !e.target.closest('a')) {
      navigate(`/vehicle/${vehicle.id}`);
    }
  };

  return (
    <StyledWrapper>
      <div className="card" onClick={handleCardClick}>
        {/* Mặt trước - hiển thị khi chưa hover */}
        <div className="card-front">
          <div className="car-icon">
            <i className="bi bi-car-front-fill"></i>
          </div>
          <p className="title">{vehicle.model}</p>
          <p className="hover-text">Click để xem chi tiết</p>
        </div>

        {/* Thông tin - hiển thị khi hover */}
        <div className="card-content">
          {!showConfirm ? (
            <>
              <h3 className="model-name">{vehicle.model}</h3>
              <div className="vehicle-info">
                <p><strong>VIN:</strong> {vehicle.vin}</p>
                <p><strong>Năm:</strong> {vehicle.year}</p>
                <p><strong>Bảo dưỡng tiếp theo:</strong></p>
                <p className="next-service">{vehicle.nextService}</p>
              </div>
              <Link to="/schedule-service" style={{ textDecoration: 'none', width: '100%' }}>
                <button className="schedule-button">
                  <i className="bi bi-calendar-check"></i> Đặt lịch bảo dưỡng
                </button>
              </Link>
              <button
                onClick={handleDeleteClick}
                className="delete-button"
              >
                <i className="bi bi-trash3"></i> Xóa xe
              </button>
            </>
          ) : (
            <div className="confirm-delete">
              <i className="bi bi-exclamation-triangle" style={{ fontSize: '3rem', color: '#dc3545', marginBottom: '1rem' }}></i>
              <h4 style={{ marginBottom: '1rem' }}>Xác nhận xóa xe?</h4>
              <p style={{ marginBottom: '1.5rem', color: '#666' }}>Bạn có chắc muốn xóa xe này? Hành động này không thể hoàn tác.</p>
              <div className="confirm-buttons">
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="btn-confirm-yes"
                >
                  {deleting ? 'Đang xóa...' : 'Xóa'}
                </button>
                <button
                  onClick={handleCancelDelete}
                  disabled={deleting}
                  className="btn-confirm-no"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    position: relative;
    width: 100%;
    height: 320px;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 15px;
    border: 2px solid #000;
    cursor: pointer;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
  }

  .card::before,
  .card::after {
    position: absolute;
    content: "";
    width: 20%;
    height: 20%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e0e0e0;
    transition: all 0.5s ease;
    z-index: 1;
    pointer-events: none;
  }

  .card::before {
    top: 0;
    right: 0;
    border-radius: 0 15px 0 100%;
  }

  .card::after {
    bottom: 0;
    left: 0;
    border-radius: 0 100% 0 15px;
  }

  .card:hover::before,
  .card:hover::after {
    width: 100%;
    height: 100%;
    border-radius: 15px;
  }

  .card-front {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    z-index: 2;
    transition: opacity 0.4s ease 0.4s;
  }

  .card:hover .card-front {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s ease 0.1s;
  }

  .card-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    opacity: 0;
    z-index: 3;
    transition: opacity 0.3s ease 0.3s;
    pointer-events: none;
  }

  .card:hover .card-content {
    opacity: 1;
    pointer-events: auto;
  }

  .car-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    color: #000;
  }

  .title {
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
    margin: 0.5rem 0;
    color: #000;
  }

  .hover-text {
    font-size: 0.9rem;
    color: #666;
    margin-top: 0.5rem;
    font-weight: 300;
  }

  .model-name {
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #000;
  }

  .vehicle-info {
    text-align: center;
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .vehicle-info p {
    margin: 0.5rem 0;
    font-size: 0.95rem;
    color: #333;
  }

  .vehicle-info strong {
    color: #000;
    font-weight: 600;
  }

  .next-service {
    color: #d4a574 !important;
    font-weight: 600;
  }

  .schedule-button {
    background-color: #fff;
    border: 2px solid #000;
    border-radius: 0;
    box-sizing: border-box;
    color: #000;
    cursor: pointer;
    display: inline-block;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    font-weight: 700;
    letter-spacing: 0.05em;
    margin: 0;
    margin-top: 1rem;
    outline: none;
    overflow: visible;
    padding: 0.7em 1.5em;
    position: relative;
    text-align: center;
    text-decoration: none;
    text-transform: none;
    transition: all 0.3s ease-in-out;
    user-select: none;
    font-size: 13px;
    width: auto;
  }

  .schedule-button:hover {
    background-color: #000;
    color: #fff;
    box-shadow: 4px 4px 0 #333;
    transform: translate(-4px, -4px);
  }

  .delete-button {
    background-color: #fff;
    border: 2px solid #dc3545;
    border-radius: 0;
    box-sizing: border-box;
    color: #dc3545;
    cursor: pointer;
    display: inline-block;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    font-weight: 700;
    letter-spacing: 0.05em;
    margin: 0;
    margin-top: 0.5rem;
    outline: none;
    overflow: visible;
    padding: 0.7em 1.5em;
    position: relative;
    text-align: center;
    text-decoration: none;
    text-transform: none;
    transition: all 0.3s ease-in-out;
    user-select: none;
    font-size: 13px;
    width: 28%;
  }

  .delete-button:hover {
    background-color: #dc3545;
    color: #fff;
    box-shadow: 4px 4px 0 #8b0000;
    transform: translate(-4px, -4px);
  }

  .delete-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .confirm-delete {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .confirm-buttons {
    display: flex;
    gap: 0.5rem;
    width: 100%;
  }

  .btn-confirm-yes,
  .btn-confirm-no {
    background-color: #fff;
    border: 2px solid #000;
    border-radius: 0;
    box-sizing: border-box;
    cursor: pointer;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    font-weight: 700;
    letter-spacing: 0.05em;
    outline: none;
    padding: 0.7em 1.5em;
    text-align: center;
    transition: all 0.3s ease-in-out;
    user-select: none;
    font-size: 13px;
    flex: 1;
  }

  .btn-confirm-yes {
    border-color: #dc3545;
    color: #dc3545;
  }

  .btn-confirm-yes:hover:not(:disabled) {
    background-color: #dc3545;
    color: #fff;
    transform: translate(-2px, -2px);
    box-shadow: 2px 2px 0 #8b0000;
  }

  .btn-confirm-no {
    color: #000;
  }

  .btn-confirm-no:hover:not(:disabled) {
    background-color: #000;
    color: #fff;
    transform: translate(-2px, -2px);
    box-shadow: 2px 2px 0 #333;
  }

  .btn-confirm-yes:disabled,
  .btn-confirm-no:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default VehicleFlipCard;
