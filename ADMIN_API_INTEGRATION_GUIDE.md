# 🔌 Admin API Integration Guide

## 📋 Mục Lục
1. [Dashboard](#1-dashboard)
2. [Work Order Management](#2-work-order-management)
3. [Technician Management](#3-technician-management)
4. [Financial Reports](#4-financial-reports)
5. [Customer Management](#5-customer-management)
6. [Vehicle Management](#6-vehicle-management)
7. [Service Schedule](#7-service-schedule)
8. [Parts Inventory](#8-parts-inventory)
9. [Staff Management](#9-staff-management)
10. [User Management](#10-user-management)
11. [Invoice & Payment](#11-invoice--payment)
12. [Notifications](#12-notifications)
13. [Chat Management](#13-chat-management)

---

## 1. Dashboard

### 📊 Overview Statistics

```javascript
import financialReportService from '../../services/financialReportService';
import workOrderService from '../../services/workOrderService';

// Component: Dashboard.jsx
const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Lấy dữ liệu song song
      const [todayReport, monthReport, workOrders] = await Promise.all([
        financialReportService.getTodayReport(),
        financialReportService.getThisMonthReport(),
        workOrderService.getWorkOrders({ limit: 10 })
      ]);

      setStats({
        todayRevenue: todayReport.totalRevenue,
        todayAppointments: todayReport.totalAppointments,
        monthRevenue: monthReport.totalRevenue,
        activeWorkOrders: workOrders.filter(w => w.status === 'InProgress').length,
        pendingWorkOrders: workOrders.filter(w => w.status === 'Pending').length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // UI rendering
  );
};
```

### 📈 Recent Activities

```javascript
// Lấy hoạt động gần đây
const fetchRecentActivities = async () => {
  try {
    const [recentOrders, recentPayments] = await Promise.all([
      workOrderService.getWorkOrders({ 
        limit: 5, 
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      }),
      financialReportService.getPaymentsReport({ 
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
    ]);

    setRecentActivities({
      orders: recentOrders,
      payments: recentPayments
    });
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 2. Work Order Management

### 📋 List Work Orders

```javascript
import workOrderService from '../../services/workOrderService';

const WorkOrderManagement = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 20
  });

  // Lấy danh sách work orders
  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const response = await workOrderService.getWorkOrders(filters);
      setWorkOrders(response.items || response);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching work orders:', error);
      toast.error('Failed to load work orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [filters]);
};
```

### 🔍 Get Work Order Details

```javascript
// Xem chi tiết work order
const handleViewDetails = async (workOrderId) => {
  try {
    const details = await workOrderService.getWorkOrderById(workOrderId);
    setSelectedWorkOrder(details);
    setShowModal(true);
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to load work order details');
  }
};

// Hoặc tìm theo code
const handleSearchByCode = async (code) => {
  try {
    const workOrder = await workOrderService.getWorkOrderByCode(code);
    setSelectedWorkOrder(workOrder);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### ✏️ Create Work Order

```javascript
// Tạo work order mới
const handleCreateWorkOrder = async (formData) => {
  try {
    const newWorkOrder = await workOrderService.createWorkOrder({
      appointmentId: formData.appointmentId,
      vehicleId: formData.vehicleId,
      customerId: formData.customerId,
      serviceCenterId: formData.serviceCenterId,
      description: formData.description,
      estimatedCompletionTime: formData.estimatedTime,
      services: formData.services, // Array of service IDs
      parts: formData.parts // Array of part IDs with quantities
    });

    toast.success('Work order created successfully');
    fetchWorkOrders(); // Refresh list
    setShowCreateModal(false);
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to create work order');
  }
};
```

### 🔄 Update Work Order Status

```javascript
// Cập nhật status
const handleStatusChange = async (workOrderId, newStatus) => {
  try {
    await workOrderService.updateWorkOrderStatus(workOrderId, newStatus);
    toast.success('Status updated successfully');
    fetchWorkOrders();
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to update status');
  }
};

// Bắt đầu work order
const handleStartWorkOrder = async (workOrderId) => {
  try {
    await workOrderService.startWorkOrder(workOrderId);
    toast.success('Work order started');
    fetchWorkOrders();
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to start work order');
  }
};

// Hoàn thành work order
const handleCompleteWorkOrder = async (workOrderId) => {
  try {
    await workOrderService.completeWorkOrder(workOrderId);
    toast.success('Work order completed');
    fetchWorkOrders();
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to complete work order');
  }
};
```

### 👨‍🔧 Assign Technician

```javascript
import technicianService from '../../services/technicianService';

// Gán technician
const handleAssignTechnician = async (workOrderId, technicianId) => {
  try {
    await workOrderService.assignTechnician(workOrderId, technicianId);
    toast.success('Technician assigned successfully');
    fetchWorkOrders();
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to assign technician');
  }
};

// Auto-assign best technician
const handleAutoAssign = async (workOrderId) => {
  try {
    const result = await technicianService.autoAssignBestTechnician({
      workOrderId: workOrderId
    });
    toast.success(`Assigned to ${result.technicianName}`);
    fetchWorkOrders();
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to auto-assign');
  }
};

// Lấy danh sách candidates
const fetchAssignmentCandidates = async (workOrderId) => {
  try {
    const candidates = await technicianService.getAutoAssignCandidates({
      workOrderId: workOrderId
    });
    setTechnicianCandidates(candidates);
    setShowAssignModal(true);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 📅 Timeline Management

```javascript
// Lấy timeline
const fetchTimeline = async (workOrderId) => {
  try {
    const timeline = await workOrderService.getWorkOrderTimeline(workOrderId);
    setTimeline(timeline);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Thêm timeline entry
const handleAddTimelineEntry = async (workOrderId, entryData) => {
  try {
    await workOrderService.addTimelineEntry(workOrderId, {
      title: entryData.title,
      description: entryData.description,
      type: entryData.type // 'status_change', 'note', 'part_added', etc.
    });
    toast.success('Timeline updated');
    fetchTimeline(workOrderId);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Thêm customer note
const handleAddCustomerNote = async (workOrderId, note) => {
  try {
    await workOrderService.addCustomerNote(workOrderId, note);
    toast.success('Note added');
    fetchTimeline(workOrderId);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Thêm internal note
const handleAddInternalNote = async (workOrderId, note) => {
  try {
    await workOrderService.addInternalNote(workOrderId, note);
    toast.success('Internal note added');
    fetchTimeline(workOrderId);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### ✅ Checklist Management

```javascript
// Lấy checklist
const fetchChecklist = async (workOrderId) => {
  try {
    const checklist = await workOrderService.getWorkOrderChecklist(workOrderId);
    setChecklist(checklist);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Apply checklist template
const handleApplyTemplate = async (workOrderId, templateId) => {
  try {
    await workOrderService.applyChecklistTemplate(workOrderId, templateId);
    toast.success('Checklist template applied');
    fetchChecklist(workOrderId);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 🎯 Quality Check

```javascript
// Thực hiện quality check
const handleQualityCheck = async (workOrderId, checkData) => {
  try {
    await workOrderService.performQualityCheck(workOrderId, {
      passedInspection: checkData.passed,
      inspectorId: checkData.inspectorId,
      notes: checkData.notes,
      checkedItems: checkData.items
    });
    toast.success('Quality check completed');
  } catch (error) {
    console.error('Error:', error);
  }
};

// Lấy quality check results
const fetchQualityCheck = async (workOrderId) => {
  try {
    const result = await workOrderService.getQualityCheck(workOrderId);
    setQualityCheckResult(result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### ⭐ Rating Management

```javascript
// Kiểm tra có thể rate không
const checkCanRate = async (workOrderId) => {
  try {
    const canRate = await workOrderService.canRate(workOrderId);
    setCanRate(canRate);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Thêm rating
const handleAddRating = async (workOrderId, ratingData) => {
  try {
    await workOrderService.addRating(workOrderId, {
      rating: ratingData.rating, // 1-5
      comment: ratingData.comment,
      serviceQuality: ratingData.serviceQuality,
      technicianRating: ratingData.technicianRating
    });
    toast.success('Rating submitted');
  } catch (error) {
    console.error('Error:', error);
  }
};

// Lấy rating
const fetchRating = async (workOrderId) => {
  try {
    const rating = await workOrderService.getRating(workOrderId);
    setRating(rating);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 3. Technician Management

### 👥 List Technicians

```javascript
import technicianService from '../../services/technicianService';

const TechnicianManagement = () => {
  const [technicians, setTechnicians] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    available: false,
    skillId: '',
    serviceCenterId: ''
  });

  // Lấy danh sách technicians
  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const data = filters.available 
        ? await technicianService.getAvailableTechnicians(filters)
        : await technicianService.getTechnicians(filters);
      
      setTechnicians(data.items || data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load technicians');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, [filters]);
};
```

### 🔍 Technician Details

```javascript
// Xem chi tiết technician
const handleViewDetails = async (technicianId) => {
  try {
    const details = await technicianService.getTechnicianById(technicianId);
    setSelectedTechnician(details);
    setShowModal(true);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 📅 Schedule Management

```javascript
// Xem lịch làm việc
const fetchTechnicianSchedule = async (technicianId, params = {}) => {
  try {
    const schedule = await technicianService.getTechnicianSchedule(technicianId, {
      dateFrom: params.dateFrom || new Date().toISOString().split('T')[0],
      dateTo: params.dateTo,
      ...params
    });
    setSchedule(schedule);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 🏆 Skills Management

```javascript
// Lấy skills
const fetchTechnicianSkills = async (technicianId) => {
  try {
    const skills = await technicianService.getTechnicianSkills(technicianId);
    setSkills(skills);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Thêm skill
const handleAddSkill = async (technicianId, skillData) => {
  try {
    await technicianService.addTechnicianSkill(technicianId, {
      skillId: skillData.skillId,
      level: skillData.level, // 'Beginner', 'Intermediate', 'Advanced', 'Expert'
      certificationDate: skillData.certificationDate,
      notes: skillData.notes
    });
    toast.success('Skill added successfully');
    fetchTechnicianSkills(technicianId);
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to add skill');
  }
};

// Xóa skill
const handleRemoveSkill = async (technicianId, skillId) => {
  try {
    await technicianService.removeTechnicianSkill(technicianId, skillId);
    toast.success('Skill removed');
    fetchTechnicianSkills(technicianId);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Verify skill
const handleVerifySkill = async (technicianId, skillId, verificationData) => {
  try {
    await technicianService.verifyTechnicianSkill(technicianId, skillId, {
      verified: true,
      verifiedBy: verificationData.verifiedBy,
      verificationDate: new Date().toISOString(),
      notes: verificationData.notes
    });
    toast.success('Skill verified');
    fetchTechnicianSkills(technicianId);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 📊 Performance Metrics

```javascript
// Lấy performance metrics
const fetchPerformance = async (technicianId, params = {}) => {
  try {
    const performance = await technicianService.getTechnicianPerformance(technicianId, {
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      ...params
    });
    setPerformance(performance);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### ⚖️ Workload Balance

```javascript
// Xem workload balance
const fetchWorkloadBalance = async (serviceCenterId) => {
  try {
    const balance = await technicianService.getWorkloadBalance(serviceCenterId);
    setWorkloadBalance(balance);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 🕐 Attendance Management

```javascript
// Check in
const handleCheckIn = async (checkInData) => {
  try {
    await technicianService.checkIn({
      technicianId: checkInData.technicianId,
      location: checkInData.location,
      notes: checkInData.notes
    });
    toast.success('Checked in successfully');
  } catch (error) {
    console.error('Error:', error);
  }
};

// Check out
const handleCheckOut = async (checkOutData) => {
  try {
    await technicianService.checkOut({
      technicianId: checkOutData.technicianId,
      notes: checkOutData.notes
    });
    toast.success('Checked out successfully');
  } catch (error) {
    console.error('Error:', error);
  }
};

// Lấy attendance hôm nay
const fetchTodayAttendance = async () => {
  try {
    const attendance = await technicianService.getTodayAttendance();
    setTodayAttendance(attendance);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 4. Financial Reports

### 💰 Revenue Reports

```javascript
import financialReportService from '../../services/financialReportService';

const FinancialReports = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  // Lấy revenue report
  const fetchRevenueReport = async () => {
    try {
      const report = await financialReportService.getRevenueReport({
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        serviceCenterId: selectedCenter,
        groupBy: 'day' // 'day', 'week', 'month'
      });
      setRevenueData(report);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Lấy revenue hôm nay
  const fetchTodayRevenue = async () => {
    try {
      const today = await financialReportService.getTodayRevenue();
      setTodayRevenue(today);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Lấy revenue tháng này
  const fetchMonthRevenue = async () => {
    try {
      const month = await financialReportService.getThisMonthRevenue();
      setMonthRevenue(month);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // So sánh revenue
  const fetchRevenueComparison = async () => {
    try {
      const comparison = await financialReportService.compareRevenue({
        period1Start: '2025-01-01',
        period1End: '2025-01-31',
        period2Start: '2025-02-01',
        period2End: '2025-02-28'
      });
      setComparison(comparison);
    } catch (error) {
      console.error('Error:', error);
    }
  };
};
```

### 💳 Payment Reports

```javascript
// Lấy payments report
const fetchPaymentsReport = async () => {
  try {
    const report = await financialReportService.getPaymentsReport({
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
      status: 'Completed', // 'Pending', 'Completed', 'Failed'
      method: '' // 'VNPay', 'Momo', 'Cash', 'BankTransfer'
    });
    setPaymentsData(report);
  } catch (error) {
    console.error('Error:', error);
  }
};

// So sánh payment gateways
const fetchGatewayComparison = async () => {
  try {
    const comparison = await financialReportService.getPaymentGatewayComparison({
      dateFrom: dateRange.from,
      dateTo: dateRange.to
    });
    setGatewayComparison(comparison);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Payments hôm nay
const fetchTodayPayments = async () => {
  try {
    const today = await financialReportService.getTodayPayments();
    setTodayPayments(today);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 📄 Invoice Reports

```javascript
// Lấy invoices report
const fetchInvoicesReport = async () => {
  try {
    const report = await financialReportService.getInvoicesReport({
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
      status: 'Outstanding' // 'Paid', 'Outstanding', 'Cancelled'
    });
    setInvoicesData(report);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Outstanding invoices
const fetchOutstandingInvoices = async () => {
  try {
    const outstanding = await financialReportService.getOutstandingInvoices();
    setOutstandingInvoices(outstanding);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Invoices tháng này
const fetchMonthInvoices = async () => {
  try {
    const month = await financialReportService.getThisMonthInvoices();
    setMonthInvoices(month);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Discount analysis
const fetchDiscountAnalysis = async () => {
  try {
    const analysis = await financialReportService.getDiscountAnalysis({
      dateFrom: dateRange.from,
      dateTo: dateRange.to
    });
    setDiscountAnalysis(analysis);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 📊 General Reports

```javascript
// Profit report
const fetchProfitReport = async () => {
  try {
    const profit = await financialReportService.getProfitReport({
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
      groupBy: 'month'
    });
    setProfitData(profit);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Popular services
const fetchPopularServices = async () => {
  try {
    const popular = await financialReportService.getPopularServicesReport({
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
      limit: 10
    });
    setPopularServices(popular);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Today's report
const fetchTodayReport = async () => {
  try {
    const today = await financialReportService.getTodayReport();
    setTodayReport(today);
  } catch (error) {
    console.error('Error:', error);
  }
};

// This month's report
const fetchMonthReport = async () => {
  try {
    const month = await financialReportService.getThisMonthReport();
    setMonthReport(month);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 5. Customer Management

### 👥 List Customers

```javascript
import { getCustomers, getCustomerById } from '../../services/staffService';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    customerTypeId: '',
    active: true,
    page: 1,
    limit: 20
  });

  // Lấy danh sách customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await getCustomers(filters);
      setCustomers(response.items || response);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [filters]);
};
```

### 🔍 Customer Details

```javascript
// Xem chi tiết customer
const handleViewCustomer = async (customerId) => {
  try {
    const customer = await getCustomerById(customerId);
    setSelectedCustomer(customer);
    setShowModal(true);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### ✏️ Update Customer

```javascript
import { updateCustomer } from '../../services/staffService';

// Cập nhật customer
const handleUpdateCustomer = async (customerId, customerData) => {
  try {
    await updateCustomer(customerId, {
      fullName: customerData.fullName,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      customerTypeId: customerData.customerTypeId,
      loyaltyPoints: customerData.loyaltyPoints
    });
    toast.success('Customer updated successfully');
    fetchCustomers();
    setShowEditModal(false);
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to update customer');
  }
};
```

### 🎁 Loyalty Points

```javascript
import { addLoyaltyPoints } from '../../services/staffService';

// Thêm loyalty points
const handleAddLoyaltyPoints = async (customerId, points, reason) => {
  try {
    await addLoyaltyPoints(customerId, {
      points: points,
      reason: reason,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    });
    toast.success('Loyalty points added');
    fetchCustomers();
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 6. Vehicle Management

### 🚗 List Vehicles

```javascript
import { getVehicles, getVehicleById } from '../../services/staffService';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    customerId: '',
    brandId: '',
    modelId: '',
    page: 1,
    limit: 20
  });

  // Lấy danh sách vehicles
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await getVehicles(filters);
      setVehicles(response.items || response);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [filters]);
};
```

### 📝 Vehicle Details

```javascript
// Xem chi tiết vehicle
const handleViewVehicle = async (vehicleId) => {
  try {
    const vehicle = await getVehicleById(vehicleId);
    setSelectedVehicle(vehicle);
    setShowModal(true);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 🔧 Update Mileage

```javascript
import { updateVehicleMileage } from '../../services/staffService';

// Cập nhật mileage
const handleUpdateMileage = async (vehicleId, mileage) => {
  try {
    await updateVehicleMileage(vehicleId, {
      currentMileage: mileage,
      recordedDate: new Date().toISOString()
    });
    toast.success('Mileage updated');
    fetchVehicles();
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 7. Service Schedule (Appointments)

### 📅 List Appointments

```javascript
import { 
  getAppointments, 
  getAppointmentById,
  confirmAppointment,
  cancelAppointment 
} from '../../services/staffService';

const ServiceSchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    serviceCenterId: '',
    date: new Date().toISOString().split('T')[0],
    page: 1,
    limit: 50
  });

  // Lấy appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAppointments(filters);
      setAppointments(response.items || response);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filters]);
};
```

### ✅ Confirm Appointment

```javascript
// Xác nhận appointment
const handleConfirm = async (appointmentId) => {
  try {
    await confirmAppointment(appointmentId);
    toast.success('Appointment confirmed');
    fetchAppointments();
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to confirm appointment');
  }
};
```

### ❌ Cancel Appointment

```javascript
// Hủy appointment
const handleCancel = async (appointmentId, reason) => {
  try {
    await cancelAppointment(appointmentId, {
      reason: reason,
      cancelledBy: 'Admin'
    });
    toast.success('Appointment cancelled');
    fetchAppointments();
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to cancel appointment');
  }
};
```

### 📊 Appointment Metrics

```javascript
import appointmentService from '../../services/appointmentService';

// Lấy metrics
const fetchAppointmentMetrics = async () => {
  try {
    const [paymentHealth, subscriptionUsage, degradation, cancellation] = await Promise.all([
      appointmentService.getPaymentHealthMetrics(),
      appointmentService.getSubscriptionUsageMetrics(),
      appointmentService.getDegradationMetrics(),
      appointmentService.getCancellationMetrics()
    ]);

    setMetrics({
      paymentHealth,
      subscriptionUsage,
      degradation,
      cancellation
    });
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 8. Parts Inventory

### 📦 List Inventory

```javascript
import inventoryService from '../../services/inventoryService';

const PartsInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filters, setFilters] = useState({
    serviceCenterId: '',
    search: '',
    lowStock: false,
    page: 1,
    limit: 50
  });

  // Lấy inventory
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventory(filters);
      setInventory(response.items || response);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [filters]);
};
```

### ⚠️ Low Stock Alerts

```javascript
// Lấy low stock alerts
const fetchLowStockAlerts = async () => {
  try {
    const alerts = await inventoryService.getLowStockAlerts({
      serviceCenterId: selectedCenter
    });
    setLowStockAlerts(alerts);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 💰 Total Inventory Value

```javascript
// Lấy total value
const fetchTotalValue = async () => {
  try {
    const value = await inventoryService.getTotalInventoryValue({
      serviceCenterId: selectedCenter
    });
    setTotalValue(value);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 🔒 Reserve/Release Inventory

```javascript
// Reserve inventory
const handleReserve = async (partId, quantity, workOrderId) => {
  try {
    await inventoryService.reserveInventory({
      partId: partId,
      quantity: quantity,
      workOrderId: workOrderId,
      serviceCenterId: selectedCenter
    });
    toast.success('Inventory reserved');
    fetchInventory();
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to reserve inventory');
  }
};

// Release inventory
const handleRelease = async (reservationId) => {
  try {
    await inventoryService.releaseInventory({
      reservationId: reservationId
    });
    toast.success('Inventory released');
    fetchInventory();
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 📊 Stock Transactions

```javascript
// Tạo stock transaction
const handleCreateTransaction = async (transactionData) => {
  try {
    await inventoryService.createStockTransaction({
      partId: transactionData.partId,
      serviceCenterId: transactionData.serviceCenterId,
      type: transactionData.type, // 'IN', 'OUT', 'ADJUSTMENT'
      quantity: transactionData.quantity,
      reason: transactionData.reason,
      referenceNumber: transactionData.referenceNumber
    });
    toast.success('Transaction created');
    fetchInventory();
  } catch (error) {
    console.error('Error:', error);
  }
};

// Lấy transactions
const fetchTransactions = async (partId) => {
  try {
    const transactions = await inventoryService.getRecentTransactionsForPart(partId, {
      limit: 20
    });
    setTransactions(transactions);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Movement summary
const fetchMovementSummary = async () => {
  try {
    const summary = await inventoryService.getMovementSummary({
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
      serviceCenterId: selectedCenter
    });
    setMovementSummary(summary);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 9. Staff Management

### 👥 List Staff

```javascript
import { getStaff, getStaffById } from '../../services/staffService';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    serviceCenterId: '',
    active: true
  });

  // Lấy danh sách staff
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await getStaff(filters);
      setStaff(response.items || response);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [filters]);
};
```

---

## 10. User Management

### 👤 List Users

```javascript
import userService from '../../services/userService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    active: true,
    page: 1,
    limit: 20
  });

  // Lấy users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers(filters);
      setUsers(response.items || response);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);
};
```

### ✏️ Update User

```javascript
// Cập nhật user
const handleUpdateUser = async (userId, userData) => {
  try {
    await userService.updateUser(userId, {
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role,
      isActive: userData.isActive
    });
    toast.success('User updated');
    fetchUsers();
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to update user');
  }
};
```

### 🗑️ Delete User

```javascript
// Xóa user
const handleDeleteUser = async (userId) => {
  if (!window.confirm('Are you sure you want to delete this user?')) return;
  
  try {
    await userService.deleteUser(userId);
    toast.success('User deleted');
    fetchUsers();
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to delete user');
  }
};
```

---

## 11. Invoice & Payment

### 📄 List Invoices

```javascript
import invoiceService from '../../services/invoiceService';

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    customerId: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 20
  });

  // Lấy invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getInvoices(filters);
      setInvoices(response.items || response);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filters]);
};
```

### ✏️ Create Invoice

```javascript
// Tạo invoice
const handleCreateInvoice = async (invoiceData) => {
  try {
    const newInvoice = await invoiceService.createInvoice({
      workOrderId: invoiceData.workOrderId,
      customerId: invoiceData.customerId,
      items: invoiceData.items, // Array of { description, quantity, unitPrice }
      discount: invoiceData.discount,
      tax: invoiceData.tax,
      notes: invoiceData.notes
    });
    toast.success('Invoice created');
    fetchInvoices();
    return newInvoice;
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to create invoice');
  }
};
```

### 📧 Send Invoice

```javascript
// Gửi invoice
const handleSendInvoice = async (invoiceId, email) => {
  try {
    await invoiceService.sendInvoice(invoiceId, {
      email: email,
      subject: 'Your Invoice',
      message: 'Please find your invoice attached.'
    });
    toast.success('Invoice sent');
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to send invoice');
  }
};
```

### 📥 Download Invoice PDF

```javascript
// Download PDF
const handleDownloadPDF = async (invoiceId) => {
  try {
    const pdfBlob = await invoiceService.getInvoicePdf(invoiceId);
    
    // Create download link
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoiceId}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to download PDF');
  }
};
```

### 💳 Create Payment

```javascript
// Tạo payment
const handleCreatePayment = async (paymentData) => {
  try {
    const payment = await invoiceService.createPayment({
      invoiceId: paymentData.invoiceId,
      amount: paymentData.amount,
      method: paymentData.method, // 'VNPay', 'Momo', 'Cash', 'BankTransfer'
      returnUrl: window.location.origin + '/admin/finance'
    });
    
    // Redirect to payment gateway if needed
    if (payment.paymentUrl) {
      window.location.href = payment.paymentUrl;
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to create payment');
  }
};
```

### 💰 Manual Payment

```javascript
// Ghi nhận payment thủ công
const handleManualPayment = async (paymentData) => {
  try {
    await invoiceService.createManualPayment({
      invoiceId: paymentData.invoiceId,
      amount: paymentData.amount,
      method: paymentData.method,
      transactionId: paymentData.transactionId,
      notes: paymentData.notes,
      paidAt: new Date().toISOString()
    });
    toast.success('Payment recorded');
    fetchInvoices();
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to record payment');
  }
};
```

---

## 12. Notifications

### 🔔 List Notifications

```javascript
import notificationService from '../../services/notificationService';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Lấy notifications
  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotifications({
        page: 1,
        limit: 20,
        unreadOnly: false
      });
      setNotifications(response.items || response);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Lấy unread count
  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);
};
```

### ✅ Mark as Read

```javascript
// Mark notification as read
const handleMarkAsRead = async (notificationId) => {
  try {
    await notificationService.markAsRead(notificationId);
    fetchNotifications();
    fetchUnreadCount();
  } catch (error) {
    console.error('Error:', error);
  }
};

// Mark all as read
const handleMarkAllAsRead = async () => {
  try {
    await notificationService.markAllAsRead();
    fetchNotifications();
    fetchUnreadCount();
    toast.success('All notifications marked as read');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 13. Chat Management

### 💬 List Chat Channels

```javascript
import chatService from '../../services/chatService';

const ChatManagement = () => {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);

  // Lấy channels
  const fetchChannels = async () => {
    try {
      const response = await chatService.getChatChannels({
        status: 'active',
        page: 1,
        limit: 50
      });
      setChannels(response.items || response);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);
};
```

### 📨 Send Message

```javascript
// Gửi message
const handleSendMessage = async (channelId, message) => {
  try {
    await chatService.sendMessage({
      channelId: channelId,
      message: message,
      senderId: currentUserId
    });
    fetchChatHistory(channelId);
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to send message');
  }
};
```

### 📜 Chat History

```javascript
// Lấy chat history
const fetchChatHistory = async (channelId) => {
  try {
    const history = await chatService.getChatHistory({
      channelId: channelId,
      limit: 50,
      before: null // For pagination
    });
    setMessages(history);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### ✅ Mark Channel as Read

```javascript
// Mark channel as read
const handleMarkChannelAsRead = async (channelId) => {
  try {
    await chatService.markChannelAsRead(channelId);
    fetchChannels();
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 🔒 Close Channel

```javascript
// Close channel
const handleCloseChannel = async (channelId) => {
  try {
    await chatService.closeChannel(channelId);
    toast.success('Channel closed');
    fetchChannels();
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to close channel');
  }
};
```

---

## 🎯 Best Practices

### 1. Error Handling

```javascript
const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const data = await someService.getData();
    setData(data);
  } catch (error) {
    console.error('Error:', error);
    setError(error.message || 'An error occurred');
    toast.error('Failed to load data');
  } finally {
    setLoading(false);
  }
};
```

### 2. Loading States

```javascript
{loading ? (
  <div className="loading-state">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
) : error ? (
  <div className="error-state">
    <i className="bi bi-exclamation-triangle"></i>
    <p>{error}</p>
    <button onClick={fetchData}>Retry</button>
  </div>
) : data.length === 0 ? (
  <div className="empty-state">
    <i className="bi bi-inbox"></i>
    <p>No data found</p>
  </div>
) : (
  // Render data
)}
```

### 3. Debounced Search

```javascript
import { useCallback } from 'react';
import debounce from 'lodash/debounce';

const debouncedSearch = useCallback(
  debounce((searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  }, 500),
  []
);

const handleSearchChange = (e) => {
  debouncedSearch(e.target.value);
};
```

### 4. Pagination

```javascript
const [pagination, setPagination] = useState({
  page: 1,
  limit: 20,
  totalPages: 1,
  totalItems: 0
});

const handlePageChange = (newPage) => {
  setPagination(prev => ({ ...prev, page: newPage }));
};

useEffect(() => {
  fetchData();
}, [pagination.page]);
```

### 5. Refresh Data

```javascript
const handleRefresh = () => {
  fetchData();
  toast.success('Data refreshed');
};

// Auto-refresh every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 30000);

  return () => clearInterval(interval);
}, []);
```

---

## 🔐 Authentication Headers

Tất cả API calls đã được cấu hình tự động thêm authentication headers trong `api.js`:

```javascript
// src/services/api.js
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

---

## 📝 Notes

1. **Error Handling:** Luôn wrap API calls trong try-catch
2. **Loading States:** Hiển thị loading indicator khi fetch data
3. **Toast Notifications:** Thông báo success/error cho user
4. **Refresh Data:** Refresh list sau khi create/update/delete
5. **Validation:** Validate input trước khi gửi API
6. **Pagination:** Implement pagination cho danh sách lớn
7. **Debounce:** Debounce search input để tránh quá nhiều API calls

---

**Last Updated:** 2025-11-21
**Version:** 1.0.0
