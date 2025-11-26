import React, { useEffect, useMemo, useState } from "react";
import { partCategoryAPI } from "../../services/adminAPI";

const unwrapPayload = (value, depth = 0) => {
  if (value == null || depth > 3) return value;
  if (Array.isArray(value)) return value;
  if (typeof value !== "object") return value;
  const keys = ["data", "Data", "payload", "Payload", "result", "Result"];
  for (const k of keys) {
    if (value[k] !== undefined) return unwrapPayload(value[k], depth + 1);
  }
  if (value.items !== undefined) return unwrapPayload(value.items, depth + 1);
  if (value.Items !== undefined) return unwrapPayload(value.Items, depth + 1);
  return value;
};

const defaultForm = {
  categoryId: null,
  categoryName: "",
  parentCategoryId: "",
  description: "",
  imageUrl: "",
  isActive: true,
};

const normalizeList = (res) => {
  const payload = unwrapPayload(res);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const normalizeDetail = (res) => unwrapPayload(res) ?? {};

const PartCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "all", searchTerm: "" });
  const [modalMode, setModalMode] = useState(null); // create | edit
  const [formData, setFormData] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status]);

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filters.status === "active") params.isActive = true;
      if (filters.status === "inactive") params.isActive = false;
      const res = await partCategoryAPI.getAll(params);
      const items = normalizeList(res);
      setCategories(items);
    } catch (err) {
      setError("Khong the tai danh muc phu tung.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const parentLookup = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => {
      const id = c.categoryId ?? c.CategoryId ?? c.id ?? c.Id;
      const name = c.categoryName ?? c.CategoryName ?? c.name;
      if (id) map.set(id, name);
    });
    return map;
  }, [categories]);

  const openCreate = () => {
    setModalMode("create");
    setFormData(defaultForm);
    setError("");
    setFeedback("");
  };

  const openEdit = async (category) => {
    const id = category?.categoryId ?? category?.CategoryId ?? category?.id;
    if (!id) return;
    setIsSubmitting(true);
    setError("");
    try {
      const res = await partCategoryAPI.getById(id);
      const payload = normalizeDetail(res);
      setFormData({
        categoryId: payload.categoryId ?? payload.CategoryId ?? id,
        categoryName: payload.categoryName ?? payload.CategoryName ?? "",
        parentCategoryId:
          payload.parentCategoryId ??
          payload.ParentCategoryId ??
          payload.parentId ??
          "",
        description: payload.description ?? payload.Description ?? "",
        imageUrl: payload.imageUrl ?? payload.ImageUrl ?? "",
        isActive:
          payload.isActive ??
          payload.IsActive ??
          payload.status === "active" ??
          true,
      });
      setModalMode("edit");
    } catch (err) {
      setError("Khong the tai chi tiet danh muc.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setFormData(defaultForm);
    setError("");
    setFeedback("");
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.categoryName.trim()) {
      setError("CategoryName la bat buoc.");
      return false;
    }
    if (formData.categoryName.length > 100) {
      setError("CategoryName khong duoc vuot 100 ky tu.");
      return false;
    }
    if (
      formData.description &&
      formData.description.trim().length > 500
    ) {
      setError("Description toi da 500 ky tu.");
      return false;
    }
    if (formData.imageUrl && formData.imageUrl.trim().length > 500) {
      setError("ImageUrl toi da 500 ky tu.");
      return false;
    }
    if (formData.parentCategoryId) {
      const n = Number(formData.parentCategoryId);
      if (!Number.isFinite(n) || n <= 0) {
        setError("ParentCategoryId phai > 0.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }
      const payload = {
        categoryId:
          formData.categoryId || (modalMode === "edit" ? formData.categoryId : undefined),
        categoryName: formData.categoryName.trim(),
        parentCategoryId: formData.parentCategoryId
          ? Number(formData.parentCategoryId)
          : null,
        description: formData.description?.trim() || "",
        imageUrl: formData.imageUrl?.trim() || "",
        isActive: !!formData.isActive,
      };
      if (modalMode === "create") {
        await partCategoryAPI.create(payload);
        setFeedback("Da tao danh muc phu tung.");
      } else if (modalMode === "edit" && formData.categoryId) {
        await partCategoryAPI.update(formData.categoryId, {
          ...payload,
          categoryId: formData.categoryId,
        });
        setFeedback("Da cap nhat danh muc.");
      }
      closeModal();
      fetchCategories();
    } catch (err) {
      setError(err?.response?.data?.message || "Khong the luu danh muc.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    const id = category?.categoryId ?? category?.CategoryId ?? category?.id;
    if (!id) return;
    if (!window.confirm("Xac nhan xoa (deactivate) danh muc nay?")) return;
    setIsSubmitting(true);
    setError("");
    try {
      await partCategoryAPI.delete(id);
      setFeedback("Da xoa (deactivate) danh muc.");
      fetchCategories();
    } catch (err) {
      setError(err?.response?.data?.message || "Khong the xoa danh muc.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!filters.searchTerm.trim()) return categories;
    const term = filters.searchTerm.toLowerCase();
    return categories.filter((c) =>
      String(c.categoryName ?? c.CategoryName ?? "")
        .toLowerCase()
        .includes(term)
    );
  }, [categories, filters.searchTerm]);

  return (
    <div className="page part-categories">
      <div className="page-head">
        <div>
          <h1>Part Categories</h1>
          <p>Quan ly danh muc phu tung cho Admin/Staff.</p>
        </div>
        <button className="btn primary" onClick={openCreate}>
          <i className="bi bi-plus-circle"></i> Them category
        </button>
      </div>

      <div className="panel">
        <div className="filter-row">
          <div className="filter-group">
            <label>Trang thai</label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
            >
              <option value="all">Tat ca</option>
              <option value="active">Dang hoat dong</option>
              <option value="inactive">Ngung hoat dong</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Tim nhanh</label>
            <input
              value={filters.searchTerm}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  searchTerm: e.target.value,
                }))
              }
              placeholder="Category name..."
            />
          </div>
          <div className="filter-group">
            <label>&nbsp;</label>
            <button type="button" className="btn" onClick={fetchCategories}>
              Lam moi
            </button>
          </div>
          {feedback ? <div className="text-success">{feedback}</div> : null}
          {error ? <div className="text-danger">{error}</div> : null}
        </div>

        <div className="table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Category</th>
                <th>Mo ta</th>
                <th>Image</th>
                <th>Trang thai</th>
                <th>Hanh dong</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="empty">
                    Dang tai...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty">
                    Khong co danh muc.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat, idx) => {
                  const id = cat.categoryId ?? cat.CategoryId ?? cat.id ?? idx;
                  const parentId =
                    cat.parentCategoryId ??
                    cat.ParentCategoryId ??
                    cat.parentId ??
                    null;
                  const parentName = parentId
                    ? parentLookup.get(parentId) || `#${parentId}`
                    : "-";
                  const isActive =
                    cat.isActive ??
                    cat.IsActive ??
                    String(cat.status || "").toLowerCase() === "active";
                  return (
                    <tr key={id}>
                      <td>{idx + 1}</td>
                      <td>{cat.categoryName ?? cat.CategoryName}</td>
                      <td className="muted-text">
                        {cat.description ?? cat.Description ?? "-"}
                      </td>
                      <td>
                        {cat.imageUrl || cat.ImageUrl ? (
                          <a
                            href={cat.imageUrl ?? cat.ImageUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Xem
                          </a>
                        ) : (
                          <span className="muted-text">-</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            isActive ? "badge-success" : "badge-muted"
                          }`}
                        >
                          {isActive ? "Dang hoat dong" : "Ngung"}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            className="btn secondary"
                            onClick={() => openEdit(cat)}
                            disabled={isSubmitting}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn danger"
                            onClick={() => handleDelete(cat)}
                            disabled={isSubmitting}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalMode ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>
                {modalMode === "create"
                  ? "Them category"
                  : "Chinh sua category"}
              </h3>
              <button className="btn-close" onClick={closeModal}>
                x
              </button>
            </div>
            {error ? <div className="alert warning">{error}</div> : null}
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <label>
                  Category name *
                  <input
                    name="categoryName"
                    value={formData.categoryName}
                    onChange={handleChange}
                    maxLength={100}
                    required
                  />
                </label>
                <label>
                  Parent category Id
                  <input
                    name="parentCategoryId"
                    type="number"
                    min="1"
                    value={formData.parentCategoryId ?? ""}
                    onChange={handleChange}
                    placeholder="De trong neu khong co"
                  />
                </label>
                <label>
                  Image URL
                  <input
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    maxLength={500}
                  />
                </label>
                <label>
                  Mo ta
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    maxLength={500}
                    rows={3}
                  />
                </label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={!!formData.isActive}
                    onChange={handleChange}
                  />
                  Dang hoat dong
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Huy
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Dang luu..." : "Luu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <style>{`
        .part-categories { display: flex; flex-direction: column; gap: 1rem; }
        .page-head { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
        .panel { background: #fff; border: 1px solid #e9ecef; border-radius: 12px; padding: 1rem; box-shadow: 0 8px 24px rgba(0,0,0,0.04); }
        .filter-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; align-items: end; }
        .filter-group { display: flex; flex-direction: column; gap: 6px; }
        .filter-group input, .filter-group select { padding: 10px; border: 1px solid #dee2e6; border-radius: 8px; }
        .table-wrapper { overflow-x: auto; margin-top: 0.75rem; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; border-bottom: 1px solid #f1f3f5; text-align: left; }
        th { background: #f8f9fa; font-weight: 600; }
        .muted-text { color: #6c757d; }
        .badge { padding: 6px 10px; border-radius: 999px; font-size: 12px; }
        .badge-success { background: #e6f4ea; color: #0f9d58; }
        .badge-muted { background: #f1f3f5; color: #6c757d; }
        .actions { display: flex; gap: 0.35rem; }
        .btn { padding: 10px 12px; border: 1px solid #dee2e6; background: #fff; border-radius: 8px; cursor: pointer; }
        .btn.primary { background: #000; color: #fff; border-color: #000; }
        .btn.secondary { background: #f8f9fa; }
        .btn.danger { background: #ffe8e8; color: #c0392b; border-color: #ffd6d6; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .text-success { color: #0f9d58; align-self: center; }
        .text-danger { color: #c0392b; align-self: center; }
        .empty { text-align: center; color: #6c757d; }
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: grid; place-items: center; z-index: 1000; padding: 1rem; }
        .modal-card { background: #fff; border-radius: 12px; width: min(720px, 100%); max-height: 90vh; overflow: auto; padding: 1rem 1.25rem; box-shadow: 0 12px 30px rgba(0,0,0,0.15); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; }
        .btn-close { background: transparent; border: none; font-size: 20px; cursor: pointer; }
        .modal-form { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; }
        .form-grid input, .form-grid textarea { padding: 10px; border: 1px solid #dee2e6; border-radius: 8px; }
        .checkbox { flex-direction: row; align-items: center; gap: 8px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
        .alert.warning { background: #fff4e5; border: 1px solid #fcd9a3; padding: 0.75rem 1rem; border-radius: 10px; color: #8a6d3b; }
        @media (max-width: 768px) { .page-head { flex-direction: column; align-items: flex-start; } }
      `}</style>
    </div>
  );
};

export default PartCategories;
