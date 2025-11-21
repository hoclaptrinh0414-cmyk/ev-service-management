// src/pages/admin/Dashboard.jsx - UI GIỐNG HTML MẪU
import React from 'react';

const Dashboard = () => {
  // Mock data giống HTML mẫu
  const customers = [
    { 
      id: 1,
      name: "Michael Brown", 
      vehicle: "EV Model X", 
      vin: "X7K9P2", 
      lastService: "Sep 20, 2025", 
      phone: "123-456-7890" 
    },
    { 
      id: 2,
      name: "Anna Marie", 
      vehicle: "EV Model Y", 
      vin: "Y3L8M4", 
      lastService: "Sep 15, 2025", 
      phone: "098-765-4321" 
    },
    { 
      id: 3,
      name: "David Lee", 
      vehicle: "EV Model S", 
      vin: "S4M7N9", 
      lastService: "Sep 10, 2025", 
      phone: "555-123-4567" 
    },
    { 
      id: 4,
      name: "Sarah Kim", 
      vehicle: "EV Model 3", 
      vin: "M3P8Q1", 
      lastService: "Sep 05, 2025", 
      phone: "777-888-9999" 
    },
    { 
      id: 5,
      name: "Tom Nguyen", 
      vehicle: "EV Model Z", 
      vin: "Z9K2L5", 
      lastService: "Aug 30, 2025", 
      phone: "444-555-6666" 
    }
  ];

  return (
    <>
      {/* Stats Cards */}
      <div className="main-content">
        <div className="card">
          <h3>Total Customers</h3>
          <div className="value">50</div>
          <div className="status">+5% This Week</div>
        </div>
        <div className="card">
          <h3>Active Vehicles</h3>
          <div className="value">45</div>
          <div className="status">2 Pending Maintenance</div>
        </div>
        <div className="card">
          <h3>Total Parts in Stock</h3>
          <div className="value">120</div>
          <div className="status">10 Low Stock</div>
        </div>
        <div className="card">
          <h3>Total Revenue</h3>
          <div className="value">$5,200</div>
          <div className="status negative">-3% This Month</div>
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card-container">
        <div className="table-card">
          <div className="table-header-row">
            <h3>Customer List</h3>
            <button className="add-button">
              <i className="bi bi-plus-circle"></i> Add New Customer
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Vehicle</th>
                  <th>VIN</th>
                  <th>Last Service</th>
                  <th>Phone</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.vehicle}</td>
                    <td>{customer.vin}</td>
                    <td>{customer.lastService}</td>
                    <td>{customer.phone}</td>
                    <td>
                      <div className="action-icons">
                        <a href="#" title="View" className="action-icon view-icon">
                          <i className="bi bi-eye"></i>
                        </a>
                        <a href="#" title="Edit" className="action-icon edit-icon">
                          <i className="bi bi-pencil"></i>
                        </a>
                        <a href="#" title="Delete" className="action-icon delete-icon">
                          <i className="bi bi-trash"></i>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;