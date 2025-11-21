import React, { useState, useEffect } from 'react';
import workOrderService from '../../services/workOrderService';
import './WorkOrderManagement.css';

const WorkOrderManagement = () => {
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'details', 'timeline', 'assign'
    const [filters, setFilters] = useState({
        search: '',
        statusId: '',
        priority: '',
        dateFrom: '',
        dateTo: '',
        page: 1,
        limit: 20
    });
    const [stats, setStats] = useState({
        total: 0,
        created: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0
    });

    useEffect(() => {
        fetchWorkOrders();
    }, [filters]);

    const fetchWorkOrders = async () => {
        try {
            setLoading(true);
            const response = await workOrderService.getWorkOrders(filters);

            const orders = response.items || response.data?.items || response.data || response || [];
            setWorkOrders(orders);

            // Calculate stats
            calculateStats(orders);

            setError(null);
        } catch (err) {
            setError('Failed to load work orders');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (orders) => {
        const stats = {
            total: orders.length,
            created: orders.filter(o => o.statusName === 'Created').length,
            inProgress: orders.filter(o => o.statusName === 'In Progress' || o.statusName === 'InProgress').length,
            completed: orders.filter(o => o.statusName === 'Completed').length,
            cancelled: orders.filter(o => o.statusName === 'Cancelled').length
        };
        setStats(stats);
    };

    const handleViewDetails = async (workOrder) => {
        try {
            const details = await workOrderService.getWorkOrderById(workOrder.workOrderId);
            setSelectedWorkOrder(details.data || details);
            setModalType('details');
            setShowModal(true);
        } catch (err) {
            console.error('Error fetching work order details:', err);
        }
    };

    const handleViewTimeline = async (workOrder) => {
        try {
            const timeline = await workOrderService.getWorkOrderTimeline(workOrder.workOrderId);
            setSelectedWorkOrder({ ...workOrder, timeline: timeline.data || timeline });
            setModalType('timeline');
            setShowModal(true);
        } catch (err) {
            console.error('Error fetching timeline:', err);
        }
    };

    const handleStatusChange = async (workOrderId, newStatusId) => {
        try {
            await workOrderService.updateWorkOrderStatus(workOrderId, newStatusId);
            fetchWorkOrders(); // Refresh list
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        }
    };

    const handleStartWorkOrder = async (workOrderId) => {
        try {
            await workOrderService.startWorkOrder(workOrderId);
            fetchWorkOrders();
        } catch (err) {
            console.error('Error starting work order:', err);
            alert('Failed to start work order');
        }
    };

    const handleCompleteWorkOrder = async (workOrderId) => {
        try {
            await workOrderService.completeWorkOrder(workOrderId);
            fetchWorkOrders();
        } catch (err) {
            console.error('Error completing work order:', err);
            alert('Failed to complete work order');
        }
    };

    const getStatusClass = (statusName) => {
        const statusMap = {
            'Created': 'status-created',
            'Pending': 'status-pending',
            'In Progress': 'status-progress',
            'InProgress': 'status-progress',
            'Completed': 'status-completed',
            'Cancelled': 'status-cancelled',
            'On Hold': 'status-hold'
        };
        return statusMap[statusName] || 'status-default';
    };

    const getPriorityClass = (priority) => {
        const priorityMap = {
            'Low': 'priority-low',
            'Normal': 'priority-normal',
            'High': 'priority-high',
            'Urgent': 'priority-urgent'
        };
        return priorityMap[priority] || 'priority-normal';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    return (
        <div className="work-order-management">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">
                        <i className="bi bi-clipboard-check"></i>
                        Work Order Management
                    </h1>
                    <p className="page-subtitle">Manage and track all work orders</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={fetchWorkOrders}>
                        <i className="bi bi-arrow-clockwise"></i>
                        Refresh
                    </button>
                    <button className="btn btn-primary">
                        <i className="bi bi-plus-circle"></i>
                        New Work Order
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-cards">
                <div className="stat-card stat-total">
                    <div className="stat-icon">
                        <i className="bi bi-clipboard-data"></i>
                    </div>
                    <div className="stat-content">
                        <h3>{stats.total}</h3>
                        <p>Total Orders</p>
                    </div>
                </div>
                <div className="stat-card stat-created">
                    <div className="stat-icon">
                        <i className="bi bi-file-earmark-plus"></i>
                    </div>
                    <div className="stat-content">
                        <h3>{stats.created}</h3>
                        <p>Created</p>
                    </div>
                </div>
                <div className="stat-card stat-progress">
                    <div className="stat-icon">
                        <i className="bi bi-gear"></i>
                    </div>
                    <div className="stat-content">
                        <h3>{stats.inProgress}</h3>
                        <p>In Progress</p>
                    </div>
                </div>
                <div className="stat-card stat-completed">
                    <div className="stat-icon">
                        <i className="bi bi-check-circle"></i>
                    </div>
                    <div className="stat-content">
                        <h3>{stats.completed}</h3>
                        <p>Completed</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by code, customer, vehicle..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    />
                </div>
                <div className="filter-group">
                    <select
                        className="form-control"
                        value={filters.statusId}
                        onChange={(e) => setFilters({ ...filters, statusId: e.target.value, page: 1 })}
                    >
                        <option value="">All Status</option>
                        <option value="1">Created</option>
                        <option value="2">In Progress</option>
                        <option value="3">Completed</option>
                        <option value="4">Cancelled</option>
                    </select>
                </div>
                <div className="filter-group">
                    <select
                        className="form-control"
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
                    >
                        <option value="">All Priority</option>
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                    </select>
                </div>
                <div className="filter-group">
                    <input
                        type="date"
                        className="form-control"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, page: 1 })}
                        placeholder="From Date"
                    />
                </div>
                <div className="filter-group">
                    <input
                        type="date"
                        className="form-control"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, page: 1 })}
                        placeholder="To Date"
                    />
                </div>
            </div>

            {/* Work Orders Table */}
            <div className="work-orders-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading work orders...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <i className="bi bi-exclamation-triangle"></i>
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={fetchWorkOrders}>Retry</button>
                    </div>
                ) : workOrders.length === 0 ? (
                    <div className="empty-state">
                        <i className="bi bi-inbox"></i>
                        <p>No work orders found</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="work-orders-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Customer</th>
                                    <th>Vehicle</th>
                                    <th>Service Center</th>
                                    <th>Technician</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Progress</th>
                                    <th>Start Date</th>
                                    <th>Est. Completion</th>
                                    <th>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workOrders.map((order) => (
                                    <tr key={order.workOrderId}>
                                        <td>
                                            <span className="code-badge">{order.workOrderCode}</span>
                                        </td>
                                        <td>{order.customerName}</td>
                                        <td>
                                            <div className="vehicle-info">
                                                <strong>{order.vehiclePlate}</strong>
                                                <small>{order.vehicleModel}</small>
                                            </div>
                                        </td>
                                        <td>{order.serviceCenterName}</td>
                                        <td>{order.technicianName || 'Unassigned'}</td>
                                        <td>
                                            <span
                                                className={`status-badge ${getStatusClass(order.statusName)}`}
                                                style={{ backgroundColor: order.statusColor }}
                                            >
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
                                                <span className="progress-text">{order.progressPercentage}%</span>
                                            </div>
                                        </td>
                                        <td>{formatDate(order.startDate)}</td>
                                        <td>{formatDate(order.estimatedCompletionDate)}</td>
                                        <td className="amount">{formatCurrency(order.finalAmount)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => handleViewDetails(order)}
                                                    title="View Details"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => handleViewTimeline(order)}
                                                    title="View Timeline"
                                                >
                                                    <i className="bi bi-clock-history"></i>
                                                </button>
                                                {order.statusName === 'Created' && (
                                                    <button
                                                        className="btn-icon btn-success"
                                                        onClick={() => handleStartWorkOrder(order.workOrderId)}
                                                        title="Start Work Order"
                                                    >
                                                        <i className="bi bi-play-fill"></i>
                                                    </button>
                                                )}
                                                {order.statusName === 'InProgress' && (
                                                    <button
                                                        className="btn-icon btn-success"
                                                        onClick={() => handleCompleteWorkOrder(order.workOrderId)}
                                                        title="Complete Work Order"
                                                    >
                                                        <i className="bi bi-check-circle"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && selectedWorkOrder && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {modalType === 'details' && 'Work Order Details'}
                                {modalType === 'timeline' && 'Work Order Timeline'}
                            </h2>
                            <button className="btn-close" onClick={() => setShowModal(false)}>
                                <i className="bi bi-x"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            {modalType === 'details' && (
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Work Order Code:</label>
                                        <span className="code-badge">{selectedWorkOrder.workOrderCode}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Customer:</label>
                                        <span>{selectedWorkOrder.customerName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Vehicle:</label>
                                        <span>{selectedWorkOrder.vehiclePlate} - {selectedWorkOrder.vehicleModel}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Service Center:</label>
                                        <span>{selectedWorkOrder.serviceCenterName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Technician:</label>
                                        <span>{selectedWorkOrder.technicianName || 'Unassigned'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Status:</label>
                                        <span className={`status-badge ${getStatusClass(selectedWorkOrder.statusName)}`}>
                                            {selectedWorkOrder.statusName}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Priority:</label>
                                        <span className={`priority-badge ${getPriorityClass(selectedWorkOrder.priority)}`}>
                                            {selectedWorkOrder.priority}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Source Type:</label>
                                        <span>{selectedWorkOrder.sourceType}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Progress:</label>
                                        <span>{selectedWorkOrder.progressPercentage}%</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Start Date:</label>
                                        <span>{formatDate(selectedWorkOrder.startDate)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Est. Completion:</label>
                                        <span>{formatDate(selectedWorkOrder.estimatedCompletionDate)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Final Amount:</label>
                                        <span className="amount">{formatCurrency(selectedWorkOrder.finalAmount)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Requires Approval:</label>
                                        <span>{selectedWorkOrder.requiresApproval ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Quality Check Required:</label>
                                        <span>{selectedWorkOrder.qualityCheckRequired ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            )}

                            {modalType === 'timeline' && (
                                <div className="timeline-container">
                                    {selectedWorkOrder.timeline && selectedWorkOrder.timeline.length > 0 ? (
                                        <div className="timeline">
                                            {selectedWorkOrder.timeline.map((entry, index) => (
                                                <div key={index} className="timeline-item">
                                                    <div className="timeline-marker"></div>
                                                    <div className="timeline-content">
                                                        <h4>{entry.title}</h4>
                                                        <p>{entry.description}</p>
                                                        <small>{formatDate(entry.createdAt)}</small>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>No timeline entries available</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkOrderManagement;
