import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './Dashboard.css';

const CustomerDashboard = () => {
       const { user, logout } = useAuth();
       const [vehicles, setVehicles] = useState([]);
       const [upcomingServices, setUpcomingServices] = useState([]);

       useEffect(() => {
              // Tạm thời dùng dữ liệu giả
              setVehicles([
                     {
                            id: 1,
                            model: 'Tesla Model 3',
                            vin: 'ABC123456789',
                            year: 2023,
                            nextService: '2024-10-15'
                     },
                     {
                            id: 2,
                            model: 'VinFast VF8',
                            vin: 'XYZ987654321',
                            year: 2024,
                            nextService: '2024-11-20'
                     }
              ]);

              setUpcomingServices([
                     {
                            id: 1,
                            type: 'Bảo dưỡng định kỳ',
                            date: '2024-10-15',
                            status: 'Đã đặt lịch'
                     }
              ]);
       }, []);

       return (
              <div className="dashboard-container">
                     <header className="dashboard-header">
                            <h1>Chào mừng, {user?.name || 'Khách hàng'}!</h1>
                            <button onClick={logout} className="logout-btn">
                                   Đăng xuất
                            </button>
                     </header>

                     <div className="dashboard-content">
                            <section className="dashboard-section">
                                   <h2>Xe của bạn</h2>
                                   <div className="vehicles-grid">
                                          {vehicles.map(vehicle => (
                                                 <div key={vehicle.id} className="vehicle-card">
                                                        <h3>{vehicle.model}</h3>
                                                        <p>VIN: {vehicle.vin}</p>
                                                        <p>Năm: {vehicle.year}</p>
                                                        <p>Bảo dưỡng tiếp theo: {vehicle.nextService}</p>
                                                        <button className="btn-primary">
                                                               Đặt lịch bảo dưỡng
                                                        </button>
                                                 </div>
                                          ))}
                                   </div>
                            </section>

                            <section className="dashboard-section">
                                   <h2>Lịch dịch vụ sắp tới</h2>
                                   <div className="services-list">
                                          {upcomingServices.map(service => (
                                                 <div key={service.id} className="service-item">
                                                        <div className="service-info">
                                                               <h4>{service.type}</h4>
                                                               <p>Ngày: {service.date}</p>
                                                               <span className="status">{service.status}</span>
                                                        </div>
                                                        <button className="btn-outline">
                                                               Xem chi tiết
                                                        </button>
                                                 </div>
                                          ))}
                                   </div>
                            </section>
                     </div>
              </div>
       );
};

export default CustomerDashboard;