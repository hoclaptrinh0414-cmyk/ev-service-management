import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { carBrandAPI } from "../../services/api";
import apiService from "../../services/api";
import "./CarBrands.css";

const fetchBrands = async (filters) => {
  const params = { page: filters.page, pageSize: filters.pageSize };
  if (filters.searchTerm) params.searchTerm = filters.searchTerm;
  if (filters.status) params.isActive = filters.status === "active";
  const res = await carBrandAPI.getAllBrands(params);
  if (res?.data) return res.data;
  if (res?.items) return res.items;
  return res || [];
};

const fetchStats = async () => {
  const res = await apiService.request("/car-brands/statistics");
  return res?.data || res || null;
};

const CarBrands = () => {
  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "",
    page: 1,
    pageSize: 10,
  });

  const brandsQuery = useQuery({
    queryKey: ["car-brands", filters],
    queryFn: () => fetchBrands(filters),
  });

  const statsQuery = useQuery({
    queryKey: ["car-brands-stats"],
    queryFn: fetchStats,
  });

  const brands = useMemo(() => {
    const data = brandsQuery.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  }, [brandsQuery.data]);

  const derivedStats = useMemo(() => {
    const s = statsQuery.data || {};
    const total = s.totalCount ?? brands.length;
    const active =
      s.activeCount ??
      brands.filter((b) =>
        b.isActive !== undefined ? b.isActive : String(b.status || "").toLowerCase() !== "inactive"
      ).length;
    const inactive =
      s.inactiveCount ??
      (total ? total - active : brands.filter((b) => b.isActive === false || String(b.status || "").toLowerCase() === "inactive").length);
    return { total, active, inactive };
  }, [statsQuery.data, brands]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  return (
    <div className="brands-page">
      <div className="page-head">
        <h1>Danh sách Hãng xe</h1>
        <p>Xem thống kê và danh sách các hãng xe trong hệ thống.</p>
      </div>

      <div className="panel">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Tổng số</span>
            <span className="stat-value">
              {statsQuery.isLoading ? "..." : derivedStats.total}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Đang hoạt động</span>
            <span className="stat-value">
              {statsQuery.isLoading ? "..." : derivedStats.active}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Ngừng hoạt động</span>
            <span className="stat-value">
              {statsQuery.isLoading ? "..." : derivedStats.inactive}
            </span>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="filter-row">
          <div className="filter-group">
            <label>Tìm kiếm</label>
            <input
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleChange}
              placeholder="Tên hãng..."
            />
          </div>
          <div className="filter-group">
            <label>Trạng thái</label>
            <select name="status" value={filters.status} onChange={handleChange}>
              <option value="">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng</option>
            </select>
          </div>
          <button
            type="button"
            className="btn"
            onClick={() => brandsQuery.refetch()}
          >
            Làm mới
          </button>
        </div>

        <div className="table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Hãng xe</th>
                <th>Quốc gia</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {brandsQuery.isLoading ? (
                <tr>
                  <td colSpan={4} className="empty">
                    Đang tải...
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                brands.map((brand, idx) => (
                  <tr key={brand.brandId || brand.id || idx}>
                    <td>{idx + 1}</td>
                    <td>{brand.brandName || brand.name}</td>
                    <td>{brand.country || "-"}</td>
                    <td>
                      <span
                        className={`badge ${
                          brand.isActive ? "badge-success" : "badge-muted"
                        }`}
                      >
                        {brand.isActive ? "Hoạt động" : "Ngừng"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CarBrands;
