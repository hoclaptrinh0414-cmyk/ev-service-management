import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Spinner, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  partAPI,
  partCategoryAPI,
  inventoryAPI,
  handleApiError,
} from "../../services/adminAPI";

const unwrap = (value, depth = 0) => {
  if (value == null || depth > 3) return value;
  if (Array.isArray(value)) return value;
  if (typeof value !== "object") return value;
  const keys = ["data", "Data", "payload", "Payload", "result", "Result"];
  for (const k of keys) {
    if (value[k] !== undefined) return unwrap(value[k], depth + 1);
  }
  if (value.items !== undefined) return unwrap(value.items, depth + 1);
  if (value.Items !== undefined) return unwrap(value.Items, depth + 1);
  return value;
};

const DEFAULT_FORM = {
  partId: null,
  partCode: "",
  partName: "",
  categoryId: "",
  brandId: "",
  unit: "",
  costPrice: "",
  sellingPrice: "",
  reorderLevel: "",
  minStock: "",
  maxStock: "",
  partCondition: "New",
  isConsumable: false,
  isActive: true,
  imageUrl: "",
  notes: "",
};

const PartManagement = () => {
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [inventorySummary, setInventorySummary] = useState(null);
  const [lowStockSummary, setLowStockSummary] = useState(null);
  const [inventoryMap, setInventoryMap] = useState({});
  const [filters, setFilters] = useState({
    searchTerm: "",
    categoryId: "",
    brandId: "",
    status: "all",
    serviceCenterId: "",
    page: 1,
    pageSize: 20,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalPages: 1,
    totalCount: 0,
  });

  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    fetchParts();
    fetchInventoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (filters.serviceCenterId) {
      fetchInventoryForParts();
    } else {
      setInventoryMap({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.serviceCenterId, parts]);

  const loadDropdowns = async () => {
    try {
      const [catsRes, brandsRes] = await Promise.all([
        partCategoryAPI.getAll({ isActive: true }),
        partAPI.getBrands(),
      ]);
      setCategories(unwrap(catsRes) || []);
      setBrands(unwrap(brandsRes) || []);
    } catch (err) {
      console.warn("Could not load dropdowns", err);
    }
  };

  const fetchParts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page: filters.page,
        pageSize: filters.pageSize,
        searchTerm: filters.searchTerm || undefined,
        categoryId: filters.categoryId || undefined,
        brandId: filters.brandId || undefined,
        sortBy: "PartName",
        sortOrder: "asc",
      };
      if (filters.status === "active") params.isActive = true;
      if (filters.status === "inactive") params.isActive = false;
      const res = await partAPI.getAll(params);
      const payload = unwrap(res) || {};
      const items = Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload)
        ? payload
        : [];
      setParts(items);
      setPagination({
        page: payload.page ?? filters.page,
        pageSize: payload.pageSize ?? filters.pageSize,
        totalPages: payload.totalPages ?? 1,
        totalCount: payload.totalCount ?? items.length,
      });
    } catch (err) {
      setError(handleApiError(err));
      setParts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryData = async () => {
    if (!filters.serviceCenterId) {
      setInventoryAlerts([]);
      setLowStockSummary(null);
      setInventorySummary(null);
      return;
    }
    try {
      const params = { serviceCenterId: filters.serviceCenterId, page: 1, pageSize: 100 };
      const [alertsRes, totalRes] = await Promise.all([
        inventoryAPI.getLowStockAlerts(params),
        inventoryAPI.getTotalValue(params),
      ]);
      const alertsPayload = unwrap(alertsRes) || {};
      const alertItems = Array.isArray(alertsPayload.items)
        ? alertsPayload.items
        : Array.isArray(alertsPayload)
        ? alertsPayload
        : [];
      const summary =
        alertsPayload.summary ||
        alertsPayload.Summary ||
        alertsPayload.totals ||
        null;
      setInventoryAlerts(alertItems);
      setLowStockSummary(summary);
      const totalPayload = unwrap(totalRes) || null;
      setInventorySummary(totalPayload);
    } catch (err) {
      console.warn("Could not load inventory summary/alerts", err);
      setInventoryAlerts([]);
      setLowStockSummary(null);
    }
  };

  const fetchInventoryForParts = async () => {
    if (!filters.serviceCenterId) return;
    try {
      const res = await inventoryAPI.getAll({
        serviceCenterId: filters.serviceCenterId,
        page: 1,
        pageSize: 100,
        sortBy: "partCode",
        sortDirection: "asc",
      });
      const payload = unwrap(res) || {};
      const items = Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload)
        ? payload
        : [];
      const map = {};
      items.forEach((it) => {
        const key = it.partId ?? it.PartId ?? it.id;
        if (!key) return;
        map[key] = {
          currentStock: it.currentStock ?? it.CurrentStock ?? it.quantity,
          availableStock:
            it.availableStock ?? it.AvailableStock ?? it.availableQuantity,
          stockStatus: it.stockStatus ?? it.StockStatus ?? "",
        };
      });
      setInventoryMap(map);
    } catch (err) {
      console.warn("Could not load inventory per part", err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (nextPage) => {
    if (nextPage >= 1 && nextPage <= pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: nextPage }));
    }
  };

  const handleOpenModal = (part = null) => {
    if (part) {
      setEditingPart(part);
      setFormData({
        partId: part.partId ?? part.id ?? null,
        partCode: part.partCode ?? "",
        partName: part.partName ?? "",
        categoryId: part.categoryId ?? "",
        brandId: part.brandId ?? "",
        unit: part.unit ?? "",
        costPrice: part.costPrice ?? "",
        sellingPrice: part.sellingPrice ?? "",
        reorderLevel: part.reorderLevel ?? "",
        minStock: part.minStock ?? "",
        maxStock: part.maxStock ?? "",
        partCondition: part.partCondition ?? "New",
        isConsumable: !!part.isConsumable,
        isActive: part.isActive ?? true,
        imageUrl: part.imageUrl ?? "",
        notes: part.notes ?? "",
      });
    } else {
      setEditingPart(null);
      setFormData(DEFAULT_FORM);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPart(null);
    setFormData(DEFAULT_FORM);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.partCode.trim() || !formData.partName.trim()) {
      toast.error("PartCode va PartName khong duoc de trong");
      return false;
    }
    const catId = Number(formData.categoryId);
    if (!Number.isFinite(catId) || catId <= 0) {
      toast.error("CategoryId phai > 0");
      return false;
    }
    const numericFields = [
      ["costPrice", formData.costPrice],
      ["sellingPrice", formData.sellingPrice],
      ["reorderLevel", formData.reorderLevel],
      ["minStock", formData.minStock],
      ["maxStock", formData.maxStock],
    ];
    for (const [key, val] of numericFields) {
      if (val === "" || val === null || val === undefined) continue;
      const n = Number(val);
      if (!Number.isFinite(n) || n < 0) {
        toast.error(`${key} phai >= 0`);
        return false;
      }
    }
    const minS = Number(formData.minStock);
    const maxS = Number(formData.maxStock);
    if (Number.isFinite(minS) && Number.isFinite(maxS) && maxS < minS) {
      toast.error("MaxStock phai >= MinStock");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload = {
        partId: formData.partId ?? undefined,
        partCode: formData.partCode.trim(),
        partName: formData.partName.trim(),
        categoryId: Number(formData.categoryId),
        brandId: formData.brandId ? Number(formData.brandId) : null,
        unit: formData.unit || null,
        costPrice:
          formData.costPrice === "" ? null : Number(formData.costPrice),
        sellingPrice:
          formData.sellingPrice === "" ? null : Number(formData.sellingPrice),
        reorderLevel:
          formData.reorderLevel === "" ? null : Number(formData.reorderLevel),
        minStock: formData.minStock === "" ? null : Number(formData.minStock),
        maxStock: formData.maxStock === "" ? null : Number(formData.maxStock),
        partCondition: formData.partCondition || null,
        isConsumable: !!formData.isConsumable,
        isActive: !!formData.isActive,
        imageUrl: formData.imageUrl?.trim() || null,
        notes: formData.notes?.trim() || "",
      };
      if (editingPart) {
        await partAPI.update(formData.partId, payload);
        toast.success("Cap nhat phu tung thanh cong");
      } else {
        await partAPI.create(payload);
        toast.success("Tao phu tung thanh cong");
      }
      handleCloseModal();
      fetchParts();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Xac nhan xoa (deactivate) phu tung?")) return;
    try {
      await partAPI.delete(id);
      toast.success("Da xoa phu tung");
      fetchParts();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  const categoryName = (id) => {
    const found = categories.find(
      (c) => (c.categoryId ?? c.id ?? c.CategoryId) === Number(id)
    );
    return found?.categoryName ?? found?.CategoryName ?? "-";
  };

  const brandName = (id) => {
    const found = brands.find(
      (b) => (b.brandId ?? b.id ?? b.BrandId) === Number(id)
    );
    return found?.brandName ?? found?.BrandName ?? "-";
  };

  const formatCurrency = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Quan ly Phu tung</h2>
          <p className="text-muted mb-0">
            CRUD phu tung, danh muc, thuong hieu, gia va ton kho.
          </p>
        </div>
        <Button
          variant="primary"
          className="rounded-pill px-4"
          onClick={() => handleOpenModal()}
        >
          <i className="bi bi-plus-lg me-2"></i> Them phu tung
        </Button>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Tong gia tri ton</div>
              <div className="fs-5 fw-bold">
                {inventorySummary?.totalValue
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: inventorySummary?.currency || "VND",
                    }).format(inventorySummary.totalValue)
                  : "Nhap Service Center ID"}
              </div>
              {inventorySummary?.serviceCenterId ? (
                <div className="small text-muted">
                  Center ID: {inventorySummary.serviceCenterId}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Canh bao ton thap</div>
              <div className="fs-5 fw-bold">
                {lowStockSummary
                  ? (lowStockSummary.critical ||
                      lowStockSummary.high ||
                      lowStockSummary.medium ||
                      lowStockSummary.low ||
                      0)
                  : inventoryAlerts.length}
              </div>
              {lowStockSummary ? (
                <div className="small text-muted">
                  C:{lowStockSummary.critical ?? 0} / H:
                  {lowStockSummary.high ?? 0} / M:
                  {lowStockSummary.medium ?? 0} / L:
                  {lowStockSummary.low ?? 0}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small">Canh bao ton thap</div>
                  <div className="fs-5 fw-bold">
                    {filters.serviceCenterId
                      ? lowStockSummary
                        ? (lowStockSummary.critical ||
                            lowStockSummary.high ||
                            lowStockSummary.medium ||
                            lowStockSummary.low ||
                            0)
                        : inventoryAlerts.length
                      : "-"}
                  </div>
                  {lowStockSummary ? (
                    <div className="small text-muted">
                      C:{lowStockSummary.critical ?? 0} / H:
                      {lowStockSummary.high ?? 0} / M:
                      {lowStockSummary.medium ?? 0} / L:
                      {lowStockSummary.low ?? 0}
                    </div>
                  ) : null}
                </div>
                <div className="text-muted small">
                  Center ID: {filters.serviceCenterId || "Tat ca"}
                </div>
              </div>
              {filters.serviceCenterId && inventoryAlerts.length ? (
                <div className="mt-3" style={{ maxHeight: "220px", overflow: "auto" }}>
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Part</th>
                        <th>Stock</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryAlerts.map((a, idx) => (
                        <tr key={a.partId ?? idx}>
                          <td>{a.partName ?? a.PartName ?? a.partCode}</td>
                          <td>
                            {a.currentStock ?? a.CurrentStock ?? "-"} /{" "}
                            {a.reorderLevel ?? a.ReorderLevel ?? "-"}
                          </td>
                          <td>
                            <Badge bg="warning" text="dark">
                              {a.stockStatus ?? a.StockStatus ?? "LOW"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-muted small mt-2">
                  Khong co canh bao ton thap.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4 rounded-4">
        <div className="card-body p-3">
          <div className="row g-3">
            <div className="col-md-3">
              <Form.Group>
                <Form.Label>Tim kiem</Form.Label>
                <Form.Control
                  name="searchTerm"
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                  placeholder="Ten, ma phu tung..."
                />
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group>
                <Form.Label>Danh muc</Form.Label>
                <Form.Select
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                >
                  <option value="">Tat ca</option>
                  {categories.map((c) => (
                    <option
                      key={c.categoryId ?? c.id ?? c.CategoryId}
                      value={c.categoryId ?? c.id ?? c.CategoryId}
                    >
                      {c.categoryName ?? c.CategoryName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group>
                <Form.Label>Brand</Form.Label>
                <Form.Select
                  name="brandId"
                  value={filters.brandId}
                  onChange={handleFilterChange}
                >
                  <option value="">Tat ca</option>
                  {brands.map((b) => (
                    <option key={b.brandId ?? b.id ?? b.BrandId} value={b.brandId ?? b.id ?? b.BrandId}>
                      {b.brandName ?? b.BrandName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group>
                <Form.Label>Trang thai</Form.Label>
                <Form.Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="all">Tat ca</option>
                  <option value="active">Dang hoat dong</option>
                  <option value="inactive">Ngung</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group>
                <Form.Label>Service Center ID (ton kho)</Form.Label>
                <Form.Control
                  name="serviceCenterId"
                  value={filters.serviceCenterId}
                  onChange={handleFilterChange}
                  placeholder="VD: 1"
                />
              </Form.Group>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Ma</th>
                <th>Phu tung</th>
                <th>Danh muc</th>
                <th>Brand</th>
                <th>Gia von</th>
                <th>Gia ban</th>
                <th>Ton hien tai</th>
                <th>Ton kha dung</th>
                <th>Ton toi thieu / toi da</th>
                <th>Trang thai</th>
                <th className="pe-4 text-end">Hanh dong</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <Spinner animation="border" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" className="text-center text-danger py-4">
                    {error}
                  </td>
                </tr>
              ) : parts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-4">
                    Khong co phu tung.
                  </td>
                </tr>
              ) : (
                parts.map((part) => {
                  const isActive = part.isActive ?? true;
                  return (
                    <tr key={part.partId ?? part.id}>
                      <td className="ps-4 fw-semibold text-primary">
                        {part.partCode}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {part.imageUrl ? (
                            <img
                              src={part.imageUrl}
                              alt=""
                              className="rounded me-2"
                              style={{
                                width: "42px",
                                height: "42px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              className="rounded me-2 bg-light d-flex align-items-center justify-content-center text-secondary"
                              style={{ width: "42px", height: "42px" }}
                            >
                              <i className="bi bi-gear-fill" />
                            </div>
                          )}
                          <div>
                            <div className="fw-bold text-dark">
                              {part.partName}
                            </div>
                            {part.notes ? (
                              <small className="text-muted d-block text-truncate">
                                {part.notes}
                              </small>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg="light" text="dark">
                          {categoryName(part.categoryId)}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="light" text="dark">
                          {brandName(part.brandId)}
                        </Badge>
                      </td>
                      <td>{formatCurrency(part.costPrice)}</td>
                      <td>{formatCurrency(part.sellingPrice)}</td>
                      <td>
                        {inventoryMap[part.partId ?? part.id]?.currentStock ??
                          "-"}
                      </td>
                      <td>
                        {inventoryMap[part.partId ?? part.id]?.availableStock ??
                          "-"}
                      </td>
                      <td>
                        {part.minStock ?? "-"} / {part.maxStock ?? "-"}
                      </td>
                      <td>
                        {isActive ? (
                          <span className="badge bg-success-subtle text-success rounded-pill px-3">
                            Dang hoat dong
                          </span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3">
                            Ngung
                          </span>
                        )}
                        {inventoryMap[part.partId ?? part.id]?.stockStatus ? (
                          <div className="small text-muted">
                            Stock: {inventoryMap[part.partId ?? part.id]?.stockStatus}
                          </div>
                        ) : null}
                      </td>
                      <td className="pe-4 text-end">
                        <Button
                          variant="link"
                          className="text-primary p-1"
                          onClick={() => handleOpenModal(part)}
                          title="Chinh sua"
                        >
                          <i className="bi bi-pencil-square" />
                        </Button>
                        <Button
                          variant="link"
                          className="text-danger p-1"
                          onClick={() => handleDelete(part.partId ?? part.id)}
                          title="Xoa"
                        >
                          <i className="bi bi-trash" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 ? (
          <div className="card-footer bg-white border-0 py-3 d-flex justify-content-center">
            <nav>
              <ul className="pagination mb-0">
                <li className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link border-0 rounded-circle mx-1"
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    <i className="bi bi-chevron-left" />
                  </button>
                </li>
                {Array.from({ length: pagination.totalPages }).map((_, idx) => (
                  <li
                    key={idx + 1}
                    className={`page-item ${
                      pagination.page === idx + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link border-0 rounded-circle mx-1"
                      onClick={() => handlePageChange(idx + 1)}
                    >
                      {idx + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    pagination.page === pagination.totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link border-0 rounded-circle mx-1"
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    <i className="bi bi-chevron-right" />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        ) : null}
      </div>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            {editingPart ? "Cap nhat phu tung" : "Them phu tung moi"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-4">
          <Form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>
                    Part Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    name="partName"
                    value={formData.partName}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>
                    Part Code <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    name="partCode"
                    value={formData.partCode}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Chon danh muc</option>
                    {categories.map((c) => (
                      <option
                        key={c.categoryId ?? c.id ?? c.CategoryId}
                        value={c.categoryId ?? c.id ?? c.CategoryId}
                      >
                        {c.categoryName ?? c.CategoryName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Brand</Form.Label>
                  <Form.Select
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleFormChange}
                  >
                    <option value="">Khong chon</option>
                    {brands.map((b) => (
                      <option key={b.brandId ?? b.id ?? b.BrandId} value={b.brandId ?? b.id ?? b.BrandId}>
                        {b.brandName ?? b.BrandName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Unit</Form.Label>
                  <Form.Control
                    name="unit"
                    value={formData.unit}
                    onChange={handleFormChange}
                    placeholder="Cai, Bo, Cap..."
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Part Condition</Form.Label>
                  <Form.Select
                    name="partCondition"
                    value={formData.partCondition}
                    onChange={handleFormChange}
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    <option value="Refurbished">Refurbished</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Gia von</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Gia ban</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Reorder level</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="reorderLevel"
                    value={formData.reorderLevel}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Ton toi thieu</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="minStock"
                    value={formData.minStock}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Ton toi da</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="maxStock"
                    value={formData.maxStock}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Tieu hao (Consumable)"
                    name="isConsumable"
                    checked={formData.isConsumable}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleFormChange}
                    placeholder="https://..."
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Check
                  type="switch"
                  id="isActive-switch"
                  label="Dang kinh doanh (Active)"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="light" onClick={handleCloseModal} className="px-4">
                Huy
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="px-4"
                disabled={submitting}
              >
                {submitting ? <Spinner size="sm" animation="border" /> : "Luu"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PartManagement;
