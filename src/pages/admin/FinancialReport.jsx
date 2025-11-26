import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financialReportsAPI, reportsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './FinancialReport.css';

// Utility function to format currency
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Utility function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

// Summary Card Component
const SummaryCard = ({ title, value, icon, trend, isLoading }) => {
  if (isLoading) {
    return (
      <div className="summary-card">
        <div className="skeleton-line" style={{ width: '60%', height: '16px' }} />
        <div className="skeleton-line" style={{ width: '80%', height: '24px', marginTop: '8px' }} />
      </div>
    );
  }

  return (
    <div className="summary-card">
      <div className="card-header">
        <span className="card-icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      <div className="card-value">{value}</div>
      {trend && <div className={`card-trend ${trend > 0 ? 'positive' : 'negative'}`}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </div>}
    </div>
  );
};

// Tab Navigation Component
const TabNav = ({ tabs, activeTab, onTabChange }) => (
  <div className="tab-nav">
    {tabs.map(tab => (
      <button
        key={tab.id}
        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
        onClick={() => onTabChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

// Date Range Picker Component
const DateRangePicker = ({ startDate, endDate, onStartChange, onEndChange }) => (
  <div className="date-range-picker">
    <div className="date-field-inline">
      <span>From</span>
      <input type="date" value={startDate} onChange={(e) => onStartChange(e.target.value)} />
    </div>
    <div className="date-field-inline">
      <span>To</span>
      <input type="date" value={endDate} onChange={(e) => onEndChange(e.target.value)} />
    </div>
  </div>
);

// Revenue Tab Component
const RevenueTab = () => {
  const toast = useToast();
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [groupBy, setGroupBy] = useState('Daily');

  const { data: todayData, isLoading: loadingToday, error: todayError } = useQuery({
    queryKey: ['revenue-today'],
    queryFn: () => financialReportsAPI.getRevenueToday(),
  });

  const { data: monthData, isLoading: loadingMonth, error: monthError } = useQuery({
    queryKey: ['revenue-this-month'],
    queryFn: () => financialReportsAPI.getRevenueThisMonth(),
  });

  const { data: revenueData, isLoading: loadingRevenue, error } = useQuery({
    queryKey: ['revenue', startDate, endDate, groupBy],
    queryFn: () => financialReportsAPI.getRevenue({ startDate, endDate, groupBy }),
  });

  useEffect(() => {
    console.log('[RevenueTab] todayData:', todayData);
    console.log('[RevenueTab] monthData:', monthData);
    console.log('[RevenueTab] revenueData:', revenueData);
  }, [todayData, monthData, revenueData]);

  useEffect(() => {
    if (error) {
      console.error('[RevenueTab] revenue error:', error);
      toast.error('Lỗi', error?.message || 'Không tải được báo cáo doanh thu');
    }
    if (todayError) {
      console.error('[RevenueTab] today error:', todayError);
    }
    if (monthError) {
      console.error('[RevenueTab] month error:', monthError);
    }
  }, [error, todayError, monthError, toast]);

  return (
    <div className="report-tab">
      <div className="filter-section">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />
        <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="group-by-select">
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      <div className="summary-grid">
        <SummaryCard
          title="Doanh thu hôm nay"
          value={formatCurrency(todayData?.totalRevenue)}
          icon="💰"
          isLoading={loadingToday}
        />
        <SummaryCard
          title="Doanh thu tháng này"
          value={formatCurrency(monthData?.totalRevenue)}
          icon="📊"
          isLoading={loadingMonth}
        />
        <SummaryCard
          title="Số lượng đơn hàng"
          value={revenueData?.totalTransactions || revenueData?.paymentCount || 0}
          icon="🛒"
          isLoading={loadingRevenue}
        />
        <SummaryCard
          title="Giá trị trung bình"
          value={formatCurrency(revenueData?.averageTransactionValue || revenueData?.averagePaymentAmount)}
          icon="💳"
          isLoading={loadingRevenue}
        />
      </div>

      {loadingRevenue ? (
        <div className="loading-state">Đang tải dữ liệu...</div>
      ) : revenueData ? (
        <div className="data-section">
          {revenueData.periodBreakdown && revenueData.periodBreakdown.length > 0 && (
            <>
              <h3>Chi tiết doanh thu theo {groupBy === 'Daily' ? 'ngày' : groupBy === 'Weekly' ? 'tuần' : 'tháng'}</h3>
              <div className="table-wrapper">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Kỳ</th>
                      <th>Doanh thu</th>
                      <th>Số đơn</th>
                      <th>Trung bình</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.periodBreakdown.map((item, idx) => (
                      <tr key={idx}>
                        <td>{formatDate(item.periodStart || item.date)}</td>
                        <td>{formatCurrency(item.revenue || item.totalRevenue)}</td>
                        <td>{item.transactionCount || item.paymentCount || 0}</td>
                        <td>{formatCurrency(item.averageValue || item.averageAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {revenueData.paymentMethodBreakdown && revenueData.paymentMethodBreakdown.length > 0 && (
            <div className="breakdown-section">
              <h3>Phân tích theo phương thức thanh toán</h3>
              <div className="table-wrapper">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Phương thức</th>
                      <th>Doanh thu</th>
                      <th>Số giao dịch</th>
                      <th>% Tổng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.paymentMethodBreakdown.map((method, idx) => {
                      const percent = method.percentage ?? method.percentageOfTotal;
                      return (
                        <tr key={idx}>
                          <td>{method.paymentMethod || method.method || 'Unknown'}</td>
                          <td>{formatCurrency(method.revenue || method.totalAmount)}</td>
                          <td>{method.count || method.transactionCount || 0}</td>
                          <td>{percent !== undefined ? percent.toFixed(1) : '0.0'}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">Không có dữ liệu</div>
      )}
    </div>
  );
};

// Payment Tab Component
const PaymentTab = () => {
  const toast = useToast();
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: todayData, isLoading: loadingToday, error: todayError } = useQuery({
    queryKey: ['payments-today'],
    queryFn: () => financialReportsAPI.getPaymentsToday(),
  });

  const { data: paymentsData, isLoading, error } = useQuery({
    queryKey: ['payments', startDate, endDate],
    queryFn: () => financialReportsAPI.getPayments({ startDate, endDate }),
  });

  useEffect(() => {
    console.log('[PaymentTab] todayData:', todayData);
    console.log('[PaymentTab] paymentsData:', paymentsData);
  }, [todayData, paymentsData]);

  useEffect(() => {
    if (error) {
      console.error('[PaymentTab] Error:', error);
      toast.error('Lỗi', error?.message || 'Không tải được báo cáo thanh toán');
    }
    if (todayError) {
      console.error('[PaymentTab] Today Error:', todayError);
    }
  }, [error, todayError, toast]);

  return (
    <div className="report-tab">
      <div className="filter-section">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />
      </div>

      <div className="summary-grid">
        <SummaryCard
          title="Thanh toán hôm nay"
          value={formatCurrency(todayData?.totalAmount)}
          icon="💳"
          isLoading={loadingToday}
        />
        <SummaryCard
          title="Tổng thanh toán"
          value={formatCurrency(paymentsData?.totalAmount)}
          icon="💰"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Thành công"
          value={paymentsData?.successfulPayments || 0}
          icon="✅"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Thất bại"
          value={paymentsData?.failedPayments || 0}
          icon="❌"
          isLoading={isLoading}
        />
      </div>

      {isLoading ? (
        <div className="loading-state">Đang tải dữ liệu...</div>
      ) : paymentsData && (paymentsData.gatewayMetrics || (paymentsData.failureAnalysis && paymentsData.failureAnalysis.length > 0)) ? (
        <div className="data-section">
          <div className="section-grid">
            {paymentsData.gatewayMetrics && paymentsData.gatewayMetrics.length > 0 && (
              <div className="data-card">
                <h3>Thống kê theo cổng thanh toán</h3>
                <div className="table-wrapper">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Cổng</th>
                        <th>Doanh thu</th>
                        <th>Số giao dịch</th>
                        <th>Tỷ lệ thành công</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentsData.gatewayMetrics.map((gateway, idx) => (
                        <tr key={idx}>
                          <td>{gateway.gateway || 'Unknown'}</td>
                          <td>{formatCurrency(gateway.totalAmount)}</td>
                          <td>{gateway.transactionCount}</td>
                          <td>{gateway.successRate?.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {paymentsData.failureAnalysis && paymentsData.failureAnalysis.length > 0 && (
              <div className="data-card">
                <h3>Phân tích lỗi thanh toán</h3>
                <div className="table-wrapper">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Lý do</th>
                        <th>Số lần</th>
                        <th>Tỷ lệ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentsData.failureAnalysis.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.reason || 'Unknown'}</td>
                          <td>{item.count}</td>
                          <td>{item.percentage?.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

// Invoice Tab Component
const InvoiceTab = () => {
  const toast = useToast();
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');
  const [includeAnalysis, setIncludeAnalysis] = useState(false);

  const { data: monthData, isLoading: loadingMonth, error: monthError } = useQuery({
    queryKey: ['invoices-this-month'],
    queryFn: () => financialReportsAPI.getInvoicesThisMonth(),
  });

  const { data: outstandingData, isLoading: loadingOutstanding, error: outstandingError } = useQuery({
    queryKey: ['invoices-outstanding'],
    queryFn: () => financialReportsAPI.getOutstandingInvoices(),
  });

  const { data: invoicesData, isLoading, error } = useQuery({
    queryKey: ['invoices', startDate, endDate, statusFilter, includeAnalysis],
    queryFn: () => financialReportsAPI.getInvoices({
      startDate,
      endDate,
      status: statusFilter || undefined,
      includeAgingAnalysis: includeAnalysis,
      includeDiscountAnalysis: includeAnalysis,
      includeTaxSummary: includeAnalysis,
    }),
  });

  useEffect(() => {
    console.log('[InvoiceTab] monthData:', monthData);
    console.log('[InvoiceTab] outstandingData:', outstandingData);
    console.log('[InvoiceTab] invoicesData:', invoicesData);
  }, [monthData, outstandingData, invoicesData]);

  useEffect(() => {
    if (error) {
      console.error('[InvoiceTab] Error:', error);
      toast.error('Lỗi', error?.message || 'Không tải được báo cáo hóa đơn');
    }
    if (monthError) {
      console.error('[InvoiceTab] Month Error:', monthError);
    }
    if (outstandingError) {
      console.error('[InvoiceTab] Outstanding Error:', outstandingError);
    }
  }, [error, monthError, outstandingError, toast]);

  return (
    <div className="report-tab">
      <div className="filter-section">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Pending">Chờ thanh toán</option>
          <option value="Paid">Đã thanh toán</option>
          <option value="PartiallyPaid">Thanh toán một phần</option>
          <option value="Overdue">Quá hạn</option>
        </select>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={includeAnalysis}
            onChange={(e) => setIncludeAnalysis(e.target.checked)}
          />
          <span>Phân tích chi tiết</span>
        </label>
      </div>

      <div className="summary-grid">
        <SummaryCard
          title="Hóa đơn tháng này"
          value={monthData?.totalInvoices || 0}
          icon="📄"
          isLoading={loadingMonth}
        />
        <SummaryCard
          title="Tổng giá trị"
          value={formatCurrency(monthData?.totalAmount)}
          icon="💰"
          isLoading={loadingMonth}
        />
        <SummaryCard
          title="Chưa thanh toán"
          value={outstandingData?.totalOutstanding || 0}
          icon="⏳"
          isLoading={loadingOutstanding}
        />
        <SummaryCard
          title="Giá trị chưa thu"
          value={formatCurrency(outstandingData?.totalAmount)}
          icon="💸"
          isLoading={loadingOutstanding}
        />
      </div>

      {isLoading ? (
        <div className="loading-state">Đang tải dữ liệu...</div>
      ) : invoicesData ? (
        <div className="data-section">
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Tổng hóa đơn:</span>
              <span className="stat-value">{invoicesData.totalInvoices || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tổng giá trị:</span>
              <span className="stat-value">{formatCurrency(invoicesData.totalAmount)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Đã thanh toán:</span>
              <span className="stat-value">{invoicesData.paidInvoices || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Chưa thanh toán:</span>
              <span className="stat-value">{invoicesData.unpaidInvoices || 0}</span>
            </div>
          </div>

          {/* Status Distribution */}
          {invoicesData.statusDistribution && invoicesData.statusDistribution.length > 0 && (
            <div className="breakdown-section">
              <h3>Phân bố theo trạng thái</h3>
              <div className="table-wrapper">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Trạng thái</th>
                      <th>Số lượng</th>
                      <th>Tổng giá trị</th>
                      <th>Tỷ lệ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicesData.statusDistribution.map((status, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`status-badge status-${status.status?.toLowerCase()}`}>
                            {status.status}
                          </span>
                        </td>
                        <td>{status.count || 0}</td>
                        <td>{formatCurrency(status.totalAmount)}</td>
                        <td>{status.percentage?.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Discount Analysis */}
          {invoicesData.discountAnalysis && (
            <div className="breakdown-section">
              <h3>Phân tích giảm giá</h3>
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-label">Tổng giảm giá:</span>
                  <span className="stat-value">{formatCurrency(invoicesData.discountAnalysis.totalDiscount)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Số lượng áp dụng:</span>
                  <span className="stat-value">{invoicesData.discountAnalysis.invoicesWithDiscount || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Tỷ lệ:</span>
                  <span className="stat-value">{invoicesData.discountAnalysis.discountRate?.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Aging Analysis */}
          {invoicesData.agingAnalysis && invoicesData.agingAnalysis.length > 0 && (
            <div className="breakdown-section">
              <h3>Phân tích độ tuổi công nợ</h3>
              <div className="table-wrapper">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Khoảng thời gian</th>
                      <th>Số lượng</th>
                      <th>Tổng giá trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicesData.agingAnalysis.map((aging, idx) => (
                      <tr key={idx}>
                        <td>{aging.agingBucket}</td>
                        <td>{aging.count || 0}</td>
                        <td>{formatCurrency(aging.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tax Summary */}
          {invoicesData.taxSummary && (
            <div className="breakdown-section">
              <h3>Tổng hợp thuế</h3>
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-label">Tổng thuế:</span>
                  <span className="stat-value">{formatCurrency(invoicesData.taxSummary.totalTax)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Số hóa đơn có thuế:</span>
                  <span className="stat-value">{invoicesData.taxSummary.invoicesWithTax || 0}</span>
                </div>
                {invoicesData.taxSummary.averageTaxRate && (
                  <div className="stat-item">
                    <span className="stat-label">Thuế suất TB:</span>
                    <span className="stat-value">{invoicesData.taxSummary.averageTaxRate.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">Không có dữ liệu</div>
      )}
    </div>
  );
};

// Profit Tab Component
const ProfitTab = () => {
  const toast = useToast();
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: profitData, isLoading, error } = useQuery({
    queryKey: ['profit', startDate, endDate],
    queryFn: () => reportsAPI.getProfit({ from: startDate, to: endDate, includeBreakdown: true }),
    retry: 1,
  });

  useEffect(() => {
    console.log('[ProfitTab] profitData:', profitData);
    console.log('[ProfitTab] isLoading:', isLoading);
    console.log('[ProfitTab] error:', error);
  }, [profitData, isLoading, error]);

  useEffect(() => {
    if (error) {
      console.error('[ProfitTab] Error:', error);
      toast.error('Lỗi', error?.message || 'Không tải được báo cáo lợi nhuận. BE có thể chưa implement API này.');
    }
  }, [error, toast]);

  return (
    <div className="report-tab">
      <div className="filter-section">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />
      </div>

      <div className="summary-grid">
        <SummaryCard
          title="Tổng doanh thu"
          value={formatCurrency(profitData?.totalRevenue)}
          icon="💰"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Tổng chi phí"
          value={formatCurrency(profitData?.totalCost)}
          icon="💸"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Lợi nhuận"
          value={formatCurrency(profitData?.profit)}
          icon="📈"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Tỷ suất lợi nhuận"
          value={profitData?.profitMargin ? `${profitData.profitMargin.toFixed(1)}%` : 'N/A'}
          icon="📊"
          isLoading={isLoading}
        />
      </div>

      {isLoading ? (
        <div className="loading-state">Đang tải dữ liệu...</div>
      ) : profitData && profitData.breakdown && profitData.breakdown.length > 0 ? (
        <div className="data-section">
          <div className="breakdown-section">
            <h3>Chi tiết lợi nhuận</h3>
            <div className="table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Danh mục</th>
                    <th>Doanh thu</th>
                    <th>Chi phí</th>
                    <th>Lợi nhuận</th>
                    <th>Tỷ suất</th>
                  </tr>
                </thead>
                <tbody>
                  {profitData.breakdown.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.category || 'Unknown'}</td>
                      <td>{formatCurrency(item.revenue)}</td>
                      <td>{formatCurrency(item.cost)}</td>
                      <td>{formatCurrency(item.profit)}</td>
                      <td>{item.margin?.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

// Popular Services Tab Component
const PopularServicesTab = () => {
  const toast = useToast();
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const topN = 10;

  const { data: servicesData, isLoading, error } = useQuery({
    queryKey: ['popular-services', startDate, endDate, topN],
    queryFn: () => reportsAPI.getPopularServices({ from: startDate, to: endDate, topN }),
    retry: 1,
  });

  const popularServices = useMemo(() => {
    const list =
      servicesData?.mostUsedServices ||
      servicesData?.highestRevenueServices ||
      servicesData?.services ||
      servicesData?.items ||
      [];
    return Array.isArray(list) ? list.slice(0, topN) : [];
  }, [servicesData, topN]);

  useEffect(() => {
    console.log('[PopularServicesTab] servicesData:', servicesData);
    console.log('[PopularServicesTab] servicesData type:', typeof servicesData);
    console.log('[PopularServicesTab] servicesData is array?', Array.isArray(servicesData));
    console.log('[PopularServicesTab] servicesData.services:', servicesData?.services);
    console.log('[PopularServicesTab] servicesData.items:', servicesData?.items);
    console.log('[PopularServicesTab] isLoading:', isLoading);
    console.log('[PopularServicesTab] error:', error);
  }, [servicesData, isLoading, error]);

  useEffect(() => {
    if (error) {
      console.error('[PopularServicesTab] Error:', error);
      toast.error('Lỗi', error?.message || 'Không tải được báo cáo dịch vụ. BE có thể chưa implement API này.');
    }
  }, [error, toast]);

  return (
    <div className="report-tab">
      <div className="filter-section">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />
      </div>

      {isLoading ? (
        <div className="loading-state">Đang tải dữ liệu...</div>
      ) : (
        <>
          {/* Popular services - single table */}
          <div className="data-section">
            <h3>Top {topN} dịch vụ phổ biến</h3>
            <div className="table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Hạng</th>
                    <th>Dịch vụ</th>
                    <th>Danh mục</th>
                    <th>Số lần sử dụng</th>
                    <th>Doanh thu</th>
                    <th>Trung bình/lần</th>
                    <th>% Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {popularServices.length > 0 ? (
                    popularServices.map((service, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{service.serviceName || 'Unknown'}</td>
                        <td>{service.categoryName || '-'}</td>
                        <td>{service.usageCount || 0}</td>
                        <td>{formatCurrency(service.totalRevenue)}</td>
                        <td>{formatCurrency(service.averagePrice)}</td>
                        <td>{service.percentageOfTotal?.toFixed(1)}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="empty">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Main Component
const FinancialReport = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('revenue');

  const isAdmin = hasRole('admin');

  const tabs = [
    { id: 'revenue', label: 'Doanh thu' },
    { id: 'payment', label: 'Thanh toán' },
    { id: 'invoice', label: 'Hóa đơn' },
    { id: 'profit', label: 'Lợi nhuận' },
    { id: 'services', label: 'Dịch vụ phổ biến' },
  ];

  if (!isAdmin) {
    return (
      <div className="not-allowed">
        <h2>Access Denied</h2>
        <p>Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'revenue':
        return <RevenueTab />;
      case 'payment':
        return <PaymentTab />;
      case 'invoice':
        return <InvoiceTab />;
      case 'profit':
        return <ProfitTab />;
      case 'services':
        return <PopularServicesTab />;
      default:
        return <RevenueTab />;
    }
  };

  return (
    <div className="financial-report-page">
      <div className="page-header">
        <h1>Báo cáo Tài chính</h1>
        <p>Tổng hợp và phân tích dữ liệu tài chính của hệ thống</p>
      </div>

      <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {renderActiveTab()}
    </div>
  );
};

export default FinancialReport;
