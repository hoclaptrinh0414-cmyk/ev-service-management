import React, { useState, useEffect } from 'react';
import financialReportService from '../../services/financialReportService';
import './FinancialReports.css';

const FinancialReports = () => {
    const [loading, setLoading] = useState(true);
    const [todayData, setTodayData] = useState(null);
    const [monthData, setMonthData] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [paymentData, setPaymentData] = useState([]);
    const [outstandingInvoices, setOutstandingInvoices] = useState([]);
    const [popularServices, setPopularServices] = useState([]);
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchAllData();
    }, [dateRange]);

    const fetchAllData = async () => {
        try {
            setLoading(true);

            // Fetch today's revenue first
            try {
                const todayRevenue = await financialReportService.getTodayRevenue();
                setTodayData(todayRevenue.data || todayRevenue);
            } catch (err) {
                console.error('Error fetching today revenue:', err);
                setTodayData({});
            }

            // Fetch this month's revenue
            try {
                const monthRevenue = await financialReportService.getThisMonthRevenue();
                setMonthData(monthRevenue.data || monthRevenue);
            } catch (err) {
                console.error('Error fetching month revenue:', err);
                setMonthData({});
            }

            // Fetch revenue report with date range
            try {
                const revenueReport = await financialReportService.getRevenueReport({
                    dateFrom: dateRange.from,
                    dateTo: dateRange.to,
                    groupBy: 'Daily'
                });
                const revenueItems = revenueReport.data?.items || revenueReport.data || revenueReport.items || [];
                setRevenueData(Array.isArray(revenueItems) ? revenueItems : []);
            } catch (err) {
                console.error('Error fetching revenue report:', err);
                setRevenueData([]);
            }

            // Fetch payment gateway comparison
            try {
                const gatewayComparison = await financialReportService.getPaymentGatewayComparison({
                    dateFrom: dateRange.from,
                    dateTo: dateRange.to
                });
                const paymentItems = gatewayComparison.data?.items || gatewayComparison.data || gatewayComparison.items || [];
                setPaymentData(Array.isArray(paymentItems) ? paymentItems : []);
            } catch (err) {
                console.error('Error fetching payment gateway comparison:', err);
                setPaymentData([]);
            }

            // Fetch outstanding invoices (using Overdue status)
            try {
                const invoicesReport = await financialReportService.getInvoicesReport({
                    status: 'Overdue',
                    dateFrom: dateRange.from,
                    dateTo: dateRange.to
                });
                const invoiceItems = invoicesReport.data?.items || invoicesReport.data || invoicesReport.items || [];
                setOutstandingInvoices(Array.isArray(invoiceItems) ? invoiceItems : []);
            } catch (err) {
                console.error('Error fetching invoices report:', err);
                setOutstandingInvoices([]);
            }

            // Fetch popular services (handle 404 gracefully)
            try {
                const servicesReport = await financialReportService.getPopularServicesReport({
                    dateFrom: dateRange.from,
                    dateTo: dateRange.to,
                    limit: 10
                });
                const serviceItems = servicesReport.data?.items || servicesReport.data || servicesReport.items || [];
                setPopularServices(Array.isArray(serviceItems) ? serviceItems : []);
            } catch (err) {
                console.error('Error fetching popular services report:', err);
                setPopularServices([]);
            }

        } catch (error) {
            console.error('Error fetching financial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const calculatePercentageChange = (current, previous) => {
        if (!previous) return 0;
        return (((current - previous) / previous) * 100).toFixed(1);
    };

    return (
        <div className="financial-reports">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">
                        <i className="bi bi-graph-up-arrow"></i>
                        Financial Reports
                    </h1>
                    <p className="page-subtitle">Revenue, payments, and financial analytics</p>
                </div>
                <div className="date-range-selector">
                    <input
                        type="date"
                        className="form-control"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    />
                    <span>to</span>
                    <input
                        type="date"
                        className="form-control"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading financial data...</p>
                </div>
            ) : (
                <>
                    {/* Today's Summary */}
                    <div className="summary-cards">
                        <div className="summary-card card-revenue">
                            <div className="card-icon">
                                <i className="bi bi-cash-stack"></i>
                            </div>
                            <div className="card-content">
                                <h3>{formatCurrency(todayData?.totalRevenue || 0)}</h3>
                                <p>Today's Revenue</p>
                                <span className="trend-indicator positive">
                                    <i className="bi bi-arrow-up"></i>
                                    {calculatePercentageChange(todayData?.totalRevenue, monthData?.averageDailyRevenue)}%
                                </span>
                            </div>
                        </div>

                        <div className="summary-card card-payments">
                            <div className="card-icon">
                                <i className="bi bi-credit-card"></i>
                            </div>
                            <div className="card-content">
                                <h3>{todayData?.totalPayments || 0}</h3>
                                <p>Payments Today</p>
                                <span className="trend-indicator positive">
                                    <i className="bi bi-arrow-up"></i>
                                    {calculatePercentageChange(todayData?.totalPayments, monthData?.averageDailyPayments)}%
                                </span>
                            </div>
                        </div>

                        <div className="summary-card card-invoices">
                            <div className="card-icon">
                                <i className="bi bi-file-earmark-text"></i>
                            </div>
                            <div className="card-content">
                                <h3>{Array.isArray(outstandingInvoices) ? outstandingInvoices.length : 0}</h3>
                                <p>Outstanding Invoices</p>
                                <span className="amount-small">
                                    {formatCurrency(Array.isArray(outstandingInvoices) ? outstandingInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0) : 0)}
                                </span>
                            </div>
                        </div>

                        <div className="summary-card card-profit">
                            <div className="card-icon">
                                <i className="bi bi-graph-up"></i>
                            </div>
                            <div className="card-content">
                                <h3>{formatCurrency(monthData?.totalProfit || 0)}</h3>
                                <p>This Month's Profit</p>
                                <span className="trend-indicator positive">
                                    <i className="bi bi-arrow-up"></i>
                                    {monthData?.profitMargin || 0}% margin
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tabs-container">
                        <div className="tabs">
                            <button
                                className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                <i className="bi bi-pie-chart"></i>
                                Overview
                            </button>
                            <button
                                className={`tab ${activeTab === 'revenue' ? 'active' : ''}`}
                                onClick={() => setActiveTab('revenue')}
                            >
                                <i className="bi bi-cash-stack"></i>
                                Revenue
                            </button>
                            <button
                                className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
                                onClick={() => setActiveTab('payments')}
                            >
                                <i className="bi bi-credit-card"></i>
                                Payments
                            </button>
                            <button
                                className={`tab ${activeTab === 'invoices' ? 'active' : ''}`}
                                onClick={() => setActiveTab('invoices')}
                            >
                                <i className="bi bi-file-earmark-text"></i>
                                Invoices
                            </button>
                            <button
                                className={`tab ${activeTab === 'services' ? 'active' : ''}`}
                                onClick={() => setActiveTab('services')}
                            >
                                <i className="bi bi-tools"></i>
                                Services
                            </button>
                        </div>

                        <div className="tab-content">
                            {activeTab === 'overview' && (
                                <div className="overview-grid">
                                    <div className="chart-card">
                                        <h3>Monthly Revenue Trend</h3>
                                        <div className="chart-placeholder">
                                            <i className="bi bi-bar-chart-line"></i>
                                            <p>Revenue chart will be displayed here</p>
                                            <p className="chart-data">Total: {formatCurrency(monthData?.totalRevenue || 0)}</p>
                                        </div>
                                    </div>

                                    <div className="chart-card">
                                        <h3>Payment Methods Distribution</h3>
                                        <div className="chart-placeholder">
                                            <i className="bi bi-pie-chart"></i>
                                            <p>Payment distribution chart</p>
                                        </div>
                                    </div>

                                    <div className="stats-list">
                                        <h3>Key Metrics</h3>
                                        <div className="metric-item">
                                            <span>Average Order Value</span>
                                            <strong>{formatCurrency(monthData?.averageOrderValue || 0)}</strong>
                                        </div>
                                        <div className="metric-item">
                                            <span>Total Transactions</span>
                                            <strong>{monthData?.totalTransactions || 0}</strong>
                                        </div>
                                        <div className="metric-item">
                                            <span>Conversion Rate</span>
                                            <strong>{monthData?.conversionRate || 0}%</strong>
                                        </div>
                                        <div className="metric-item">
                                            <span>Customer Retention</span>
                                            <strong>{monthData?.retentionRate || 0}%</strong>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'revenue' && (
                                <div className="data-table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Service Center</th>
                                                <th>Revenue</th>
                                                <th>Transactions</th>
                                                <th>Avg Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {revenueData.length > 0 ? (
                                                revenueData.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{formatDate(item.date)}</td>
                                                        <td>{item.serviceCenterName || 'All Centers'}</td>
                                                        <td className="amount">{formatCurrency(item.revenue)}</td>
                                                        <td>{item.transactionCount || 0}</td>
                                                        <td>{formatCurrency(item.averageValue || 0)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="empty-row">No revenue data available</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'payments' && (
                                <div className="data-table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Payment Code</th>
                                                <th>Customer</th>
                                                <th>Method</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paymentData.length > 0 ? (
                                                paymentData.map((payment, index) => (
                                                    <tr key={index}>
                                                        <td><span className="code-badge">{payment.code || payment.paymentCode}</span></td>
                                                        <td>{payment.customerName || 'N/A'}</td>
                                                        <td>{payment.method || payment.paymentMethod}</td>
                                                        <td className="amount">{formatCurrency(payment.amount)}</td>
                                                        <td>
                                                            <span className={`badge badge-${payment.status?.toLowerCase()}`}>
                                                                {payment.status}
                                                            </span>
                                                        </td>
                                                        <td>{formatDate(payment.createdAt)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="empty-row">No payment data available</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'invoices' && (
                                <div className="data-table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Invoice Code</th>
                                                <th>Customer</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Due Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {outstandingInvoices.length > 0 ? (
                                                outstandingInvoices.map((invoice, index) => (
                                                    <tr key={index}>
                                                        <td><span className="code-badge">{invoice.code || invoice.invoiceCode}</span></td>
                                                        <td>{invoice.customerName || 'N/A'}</td>
                                                        <td className="amount">{formatCurrency(invoice.amount)}</td>
                                                        <td>
                                                            <span className="badge badge-warning">Outstanding</span>
                                                        </td>
                                                        <td>{formatDate(invoice.dueDate)}</td>
                                                        <td>
                                                            <button className="btn-icon" title="View Details">
                                                                <i className="bi bi-eye"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="empty-row">No outstanding invoices</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'services' && (
                                <div className="services-grid">
                                    {popularServices.length > 0 ? (
                                        popularServices.map((service, index) => (
                                            <div key={index} className="service-card">
                                                <div className="service-rank">#{index + 1}</div>
                                                <h4>{service.serviceName || service.name}</h4>
                                                <div className="service-stats">
                                                    <div className="service-stat">
                                                        <i className="bi bi-clipboard-check"></i>
                                                        <span>{service.bookingCount || 0} bookings</span>
                                                    </div>
                                                    <div className="service-stat">
                                                        <i className="bi bi-cash"></i>
                                                        <span>{formatCurrency(service.revenue || 0)}</span>
                                                    </div>
                                                </div>
                                                <div className="service-progress">
                                                    <div
                                                        className="progress-bar"
                                                        style={{ width: `${(service.bookingCount / (popularServices[0]?.bookingCount || 1)) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <i className="bi bi-inbox"></i>
                                            <p>No service data available</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FinancialReports;
