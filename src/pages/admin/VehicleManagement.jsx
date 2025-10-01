import React, { useState, useEffect } from 'react';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      // ============================================
      // THAY ĐỔI URL API Ở ĐÂY KHI SẴN SÀNG
      // ============================================
      // const token = localStorage.getItem('token');
      // const response = await fetch('YOUR_API_URL/api/customer-vehicles', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // const result = await response.json();
      // setVehicles(result.data.items);

      // Mock data - XÓA PHẦN NÀY KHI DÙNG API THẬT
      const mockData = [
        {
          vehicleId: 9,
          customerName: "Nguyễn Văn An",
          fullModelName: "Tesla Model 3",
          licensePlate: "29A-99999",
          nextMaintenanceDate: "2025-04-01",
          mileage: 15000,
          batteryHealthPercent: 100.00,
          maintenanceStatus: "Cần bảo dưỡng"
        },
        {
          vehicleId: 8,
          customerName: "Trần Thị Bình",
          fullModelName: "Tesla Model Y",
          licensePlate: "30B-88888",
          nextMaintenanceDate: "2025-05-15",
          mileage: 8500,
          batteryHealthPercent: 95.50,
          maintenanceStatus: "Bình thường"
        },
        {
          vehicleId: 7,
          customerName: "Lê Văn Cường",
          fullModelName: "VinFast VF8",
          licensePlate: "51C-77777",
          nextMaintenanceDate: "2025-03-20",
          mileage: 22000,
          batteryHealthPercent: 88.00,
          maintenanceStatus: "Cần bảo dưỡng"
        }
      ];
      
      setTimeout(() => {
        setVehicles(mockData);
        setLoading(false);
      }, 500);

    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="vehicle-management">
      <div className="section-header">
        <h2>Vehicle Management</h2>
        <button className="btn-add">+ Add New Vehicle</button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Vehicle Model</th>
              <th>License Plate</th>
              <th>Next Maintenance</th>
              <th>Mileage</th>
              <th>Battery Health</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.vehicleId}>
                <td>{vehicle.customerName}</td>
                <td><strong>{vehicle.fullModelName}</strong></td>
                <td><span className="license-plate">{vehicle.licensePlate}</span></td>
                <td>{formatDate(vehicle.nextMaintenanceDate)}</td>
                <td>{vehicle.mileage.toLocaleString()} km</td>
                <td>
                  <div className="battery-bar">
                    <div 
                      className="battery-fill" 
                      style={{width: `${vehicle.batteryHealthPercent}%`}}
                    ></div>
                    <span>{vehicle.batteryHealthPercent}%</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${vehicle.maintenanceStatus === "Cần bảo dưỡng" ? "warning" : "normal"}`}>
                    {vehicle.maintenanceStatus}
                  </span>
                </td>
                <td>
                  <button className="btn-view">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleManagement;