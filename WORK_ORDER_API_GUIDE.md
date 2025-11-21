# 📋 Work Order Management - API Integration Guide

## 🎯 Overview

This guide covers the complete API integration for Work Order Management in the EV Service Management system.

---

## 📡 API Endpoint

**Base URL:** `https://unprepared-kade-nonpossibly.ngrok-free.dev`

**Endpoint:** `GET /api/work-orders`

---

## 🔧 Request Parameters

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `WorkOrderCode` | string | Filter by work order code | "WO202511142393" |
| `CustomerId` | integer | Filter by customer ID | 1 |
| `VehicleId` | integer | Filter by vehicle ID | 1 |
| `ServiceCenterId` | integer | Filter by service center ID | 1 |
| `TechnicianId` | integer | Filter by technician ID | 2057 |
| `StatusId` | integer | Filter by status ID | 1 |
| `Priority` | string | Filter by priority | "Normal", "High", "Urgent" |
| `StartDateFrom` | datetime | Start date range from | "2025-11-01T00:00:00" |
| `StartDateTo` | datetime | Start date range to | "2025-11-30T23:59:59" |
| `CompletedDateFrom` | datetime | Completed date from | "2025-11-01T00:00:00" |
| `CompletedDateTo` | datetime | Completed date to | "2025-11-30T23:59:59" |
| `RequiresApproval` | boolean | Filter by approval requirement | true/false |
| `QualityCheckRequired` | boolean | Filter by quality check | true/false |
| `SearchTerm` | string | Search term | "Tesla" |
| `PageNumber` | integer | Page number | 1 |
| `PageSize` | integer | Items per page | 20 |
| `SortBy` | string | Sort field | "CreatedDate" |
| `SortDirection` | string | Sort direction | "asc", "desc" |

---

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "workOrderId": 1026,
        "workOrderCode": "WO202511142393",
        "customerName": "Phạm Nhật Nghĩa",
        "vehiclePlate": "MAIN-TEST-001",
        "vehicleModel": "Model 3",
        "serviceCenterName": "EV Service Center - Quận 1 (Updated)",
        "statusId": 1,
        "statusName": "Created",
        "statusColor": "#FFA500",
        "priority": "Normal",
        "sourceType": "Scheduled",
        "startDate": "2025-11-14T21:10:54.5549695",
        "estimatedCompletionDate": "2025-11-15T00:40:54.5550424",
        "createdDate": "2025-11-14T21:10:54.5552913",
        "technicianName": null,
        "progressPercentage": 0,
        "finalAmount": 0,
        "requiresApproval": false,
        "qualityCheckRequired": true
      }
    ],
    "totalPages": 1,
    "totalItems": 1,
    "currentPage": 1
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `workOrderId` | integer | Unique work order ID |
| `workOrderCode` | string | Work order code (e.g., "WO202511142393") |
| `customerName` | string | Customer full name |
| `vehiclePlate` | string | Vehicle license plate |
| `vehicleModel` | string | Vehicle model name |
| `serviceCenterName` | string | Service center name |
| `statusId` | integer | Status ID (1=Created, 2=InProgress, 3=Completed, 4=Cancelled) |
| `statusName` | string | Status name |
| `statusColor` | string | Status color hex code |
| `priority` | string | Priority level (Low, Normal, High, Urgent) |
| `sourceType` | string | Source type (Scheduled, Walk-in, Emergency) |
| `startDate` | datetime | Work order start date |
| `estimatedCompletionDate` | datetime | Estimated completion date |
| `createdDate` | datetime | Creation date |
| `technicianName` | string/null | Assigned technician name |
| `progressPercentage` | integer | Progress percentage (0-100) |
| `finalAmount` | decimal | Final amount |
| `requiresApproval` | boolean | Requires approval flag |
| `qualityCheckRequired` | boolean | Quality check required flag |

---

## 💻 Frontend Implementation

### 1. Service Layer (`workOrderService.js`)

```javascript
import api from './api';

export const getWorkOrders = async (params = {}) => {
  try {
    // Map frontend params to backend params
    const apiParams = {
      WorkOrderCode: params.workOrderCode || params.code,
      CustomerId: params.customerId,
      VehicleId: params.vehicleId,
      ServiceCenterId: params.serviceCenterId,
      TechnicianId: params.technicianId,
      StatusId: params.statusId || params.status,
      Priority: params.priority,
      StartDateFrom: params.startDateFrom || params.dateFrom,
      StartDateTo: params.startDateTo || params.dateTo,
      CompletedDateFrom: params.completedDateFrom,
      CompletedDateTo: params.completedDateTo,
      RequiresApproval: params.requiresApproval,
      QualityCheckRequired: params.qualityCheckRequired,
      SearchTerm: params.search || params.searchTerm,
      PageNumber: params.page || params.pageNumber || 1,
      PageSize: params.limit || params.pageSize || 20,
      SortBy: params.sortBy || 'CreatedDate',
      SortDirection: params.sortDirection || params.sortOrder || 'desc'
    };

    // Remove undefined values
    Object.keys(apiParams).forEach(key => 
      apiParams[key] === undefined && delete apiParams[key]
    );

    const response = await api.get('/api/work-orders', { params: apiParams });
    
    const data = response.data.data || response.data;
    
    return {
      success: response.data.success !== undefined ? response.data.success : true,
      items: data.items || data || [],
      totalPages: data.totalPages,
      totalItems: data.totalItems,
      currentPage: data.currentPage || apiParams.PageNumber
    };
  } catch (error) {
    console.error('Error fetching work orders:', error);
    throw error;
  }
};

export const getWorkOrderById = async (id) => {
  try {
    const response = await api.get(`/api/work-orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching work order ${id}:`, error);
    throw error;
  }
};

export const createWorkOrder = async (workOrderData) => {
  try {
    const response = await api.post('/api/work-orders', workOrderData);
    return response.data;
  } catch (error) {
    console.error('Error creating work order:', error);
    throw error;
  }
};

export const updateWorkOrder = async (id, workOrderData) => {
  try {
    const response = await api.put(`/api/work-orders/${id}`, workOrderData);
    return response.data;
  } catch (error) {
    console.error(`Error updating work order ${id}:`, error);
    throw error;
  }
};

export const deleteWorkOrder = async (id) => {
  try {
    const response = await api.delete(`/api/work-orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting work order ${id}:`, error);
    throw error;
  }
};
```

---

### 2. React Component Usage

```javascript
import React, { useState, useEffect } from 'react';
import workOrderService from '../../services/workOrderService';

const WorkOrderManagement = () => {
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        statusId: '',
        priority: '',
        page: 1,
        limit: 20
    });

    useEffect(() => {
        fetchWorkOrders();
    }, [filters]);

    const fetchWorkOrders = async () => {
        try {
            setLoading(true);
            const response = await workOrderService.getWorkOrders(filters);
            
            const orders = response.items || response.data?.items || response.data || [];
            setWorkOrders(orders);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Your UI here */}
        </div>
    );
};
```

---

## 🎨 UI Components

### Status Badge

```jsx
const getStatusClass = (statusName) => {
    const statusMap = {
        'Created': 'status-created',
        'In Progress': 'status-progress',
        'Completed': 'status-completed',
        'Cancelled': 'status-cancelled'
    };
    return statusMap[statusName] || 'status-default';
};

<span 
    className={`status-badge ${getStatusClass(order.statusName)}`}
    style={{ backgroundColor: order.statusColor }}
>
    {order.statusName}
</span>
```

### Priority Badge

```jsx
const getPriorityClass = (priority) => {
    const priorityMap = {
        'Low': 'priority-low',
        'Normal': 'priority-normal',
        'High': 'priority-high',
        'Urgent': 'priority-urgent'
    };
    return priorityMap[priority] || 'priority-normal';
};

<span className={`priority-badge ${getPriorityClass(order.priority)}`}>
    {order.priority}
</span>
```

### Progress Bar

```jsx
<div className="progress-bar-container">
    <div 
        className="progress-bar-fill" 
        style={{ width: `${order.progressPercentage}%` }}
    ></div>
    <span className="progress-text">{order.progressPercentage}%</span>
</div>
```

---

## 🔄 CRUD Operations

### Create Work Order

```javascript
const handleCreateWorkOrder = async (formData) => {
    try {
        const newWorkOrder = await workOrderService.createWorkOrder({
            customerId: formData.customerId,
            vehicleId: formData.vehicleId,
            serviceCenterId: formData.serviceCenterId,
            priority: formData.priority,
            description: formData.description,
            estimatedCompletionDate: formData.estimatedDate
        });
        
        // Refresh list
        fetchWorkOrders();
        
        // Show success message
        alert('Work order created successfully!');
    } catch (error) {
        console.error('Error creating work order:', error);
        alert('Failed to create work order');
    }
};
```

### Update Work Order

```javascript
const handleUpdateWorkOrder = async (id, updates) => {
    try {
        await workOrderService.updateWorkOrder(id, updates);
        fetchWorkOrders();
        alert('Work order updated successfully!');
    } catch (error) {
        console.error('Error updating work order:', error);
        alert('Failed to update work order');
    }
};
```

### Delete Work Order

```javascript
const handleDeleteWorkOrder = async (id) => {
    if (!confirm('Are you sure you want to delete this work order?')) {
        return;
    }
    
    try {
        await workOrderService.deleteWorkOrder(id);
        fetchWorkOrders();
        alert('Work order deleted successfully!');
    } catch (error) {
        console.error('Error deleting work order:', error);
        alert('Failed to delete work order');
    }
};
```

---

## 🎯 Filtering Examples

### Filter by Status

```javascript
setFilters({ ...filters, statusId: 1, page: 1 }); // Created
setFilters({ ...filters, statusId: 2, page: 1 }); // In Progress
setFilters({ ...filters, statusId: 3, page: 1 }); // Completed
```

### Filter by Priority

```javascript
setFilters({ ...filters, priority: 'High', page: 1 });
setFilters({ ...filters, priority: 'Urgent', page: 1 });
```

### Filter by Date Range

```javascript
setFilters({ 
    ...filters, 
    dateFrom: '2025-11-01', 
    dateTo: '2025-11-30',
    page: 1 
});
```

### Search

```javascript
setFilters({ ...filters, search: 'Tesla', page: 1 });
```

---

## 📱 Responsive Table

```jsx
<div className="table-responsive">
    <table className="work-orders-table">
        <thead>
            <tr>
                <th>Code</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Progress</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {workOrders.map((order) => (
                <tr key={order.workOrderId}>
                    <td>
                        <span className="code-badge">
                            {order.workOrderCode}
                        </span>
                    </td>
                    <td>{order.customerName}</td>
                    <td>
                        <div className="vehicle-info">
                            <strong>{order.vehiclePlate}</strong>
                            <small>{order.vehicleModel}</small>
                        </div>
                    </td>
                    <td>
                        <span className={`status-badge ${getStatusClass(order.statusName)}`}>
                            {order.statusName}
                        </span>
                    </td>
                    <td>
                        <span className={`priority-badge ${getPriorityClass(order.priority)}`}>
                            {order.priority}
                        </span>
                    </td>
                    <td>
                        <div className="progress-bar-container">
                            <div 
                                className="progress-bar-fill" 
                                style={{ width: `${order.progressPercentage}%` }}
                            ></div>
                            <span className="progress-text">
                                {order.progressPercentage}%
                            </span>
                        </div>
                    </td>
                    <td>
                        <button onClick={() => handleViewDetails(order)}>
                            <i className="bi bi-eye"></i>
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>
```

---

## 🎨 CSS Styling

```css
.status-badge {
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    color: white;
}

.status-created { background: #FFA500; }
.status-progress { background: #3b82f6; }
.status-completed { background: #10b981; }
.status-cancelled { background: #ef4444; }

.priority-badge {
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
}

.priority-low { background: #dbeafe; color: #1e40af; }
.priority-normal { background: #d1fae5; color: #065f46; }
.priority-high { background: #fed7aa; color: #92400e; }
.priority-urgent { background: #fecaca; color: #991b1b; }

.progress-bar-container {
    width: 100px;
    height: 24px;
    background: #e2e8f0;
    border-radius: 12px;
    position: relative;
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transition: width 0.3s ease;
}

.progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.75rem;
    font-weight: 600;
}
```

---

## 🧪 Testing

### Test Cases

1. **Load All Work Orders**
   - Expected: List displays with all fields
   - Check: API call with default params

2. **Filter by Status**
   - Expected: Only orders with selected status show
   - Check: `StatusId` parameter sent

3. **Search**
   - Expected: Filtered results
   - Check: `SearchTerm` parameter sent

4. **View Details**
   - Expected: Modal opens with full details
   - Check: `GET /api/work-orders/{id}` called

5. **Create Work Order**
   - Expected: New order created
   - Check: `POST /api/work-orders` called

---

## ✅ Checklist

- [x] Service layer created
- [x] API parameters mapped correctly
- [x] Response handling implemented
- [x] UI components created
- [x] Filters working
- [x] CRUD operations implemented
- [x] Error handling added
- [x] Loading states added
- [x] Responsive design
- [x] Documentation complete

---

**Status:** ✅ Ready for Testing  
**Last Updated:** 2025-11-21
