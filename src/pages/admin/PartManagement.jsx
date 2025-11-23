import React, { useState, useEffect } from 'react';
import { partAPI, handleApiError } from '../../services/adminAPI';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';

const PartManagement = () => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingPart, setEditingPart] = useState(null);
    const [formData, setFormData] = useState({
        partName: '',
        partCode: '',
        description: '',
        unitPrice: '',
        unit: 'Cái',
        category: '',
        isActive: true,
        imageUrl: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchParts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm]);

    const fetchParts = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page: currentPage,
                pageSize: pageSize,
                searchTerm: searchTerm
            };
            const response = await partAPI.getAll(params);

            // Handle different response structures
            const data = response?.data?.items || response?.data || response?.items || [];
            const total = response?.data?.totalPages || response?.totalPages || 1;

            setParts(Array.isArray(data) ? data : []);
            setTotalPages(total);
        } catch (err) {
            console.error('Error fetching parts:', err);
            setError(handleApiError(err));
            // Fallback/Mock data if API fails completely (optional, but good for demo)
            if (process.env.NODE_ENV === 'development' && parts.length === 0) {
                // setParts(MOCK_PARTS); // Uncomment if you have mock data
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleOpenModal = (part = null) => {
        if (part) {
            setEditingPart(part);
            setFormData({
                partName: part.partName || '',
                partCode: part.partCode || '',
                description: part.description || '',
                unitPrice: part.unitPrice || '',
                unit: part.unit || 'Cái',
                category: part.category || '',
                isActive: part.isActive ?? true,
                imageUrl: part.imageUrl || ''
            });
        } else {
            setEditingPart(null);
            setFormData({
                partName: '',
                partCode: '',
                description: '',
                unitPrice: '',
                unit: 'Cái',
                category: '',
                isActive: true,
                imageUrl: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPart(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingPart) {
                await partAPI.update(editingPart.partId || editingPart.id, formData);
                toast.success('Cập nhật phụ tùng thành công');
            } else {
                await partAPI.create(formData);
                toast.success('Thêm phụ tùng mới thành công');
            }
            handleCloseModal();
            fetchParts();
        } catch (err) {
            console.error('Error saving part:', err);
            toast.error(handleApiError(err));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phụ tùng này?')) {
            try {
                await partAPI.delete(id);
                toast.success('Xóa phụ tùng thành công');
                fetchParts();
            } catch (err) {
                console.error('Error deleting part:', err);
                toast.error(handleApiError(err));
            }
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Quản lý Phụ tùng</h2>
                    <p className="text-muted mb-0">Danh sách và thông tin chi tiết các loại phụ tùng</p>
                </div>
                <Button variant="primary" className="rounded-pill px-4" onClick={() => handleOpenModal()}>
                    <i className="bi bi-plus-lg me-2"></i> Thêm Phụ tùng
                </Button>
            </div>

            {/* Search & Filter */}
            <div className="card border-0 shadow-sm mb-4 rounded-4">
                <div className="card-body p-3">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-light border-start-0 rounded-end-pill"
                                    placeholder="Tìm kiếm theo tên, mã phụ tùng..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>
                        </div>
                        {/* Add more filters here if needed */}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 text-secondary text-uppercase small fw-bold border-0">Mã PT</th>
                                <th className="py-3 text-secondary text-uppercase small fw-bold border-0">Tên Phụ tùng</th>
                                <th className="py-3 text-secondary text-uppercase small fw-bold border-0">Danh mục</th>
                                <th className="py-3 text-secondary text-uppercase small fw-bold border-0">Đơn giá</th>
                                <th className="py-3 text-secondary text-uppercase small fw-bold border-0">Đơn vị</th>
                                <th className="py-3 text-secondary text-uppercase small fw-bold border-0">Trạng thái</th>
                                <th className="pe-4 py-3 text-end text-secondary text-uppercase small fw-bold border-0">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-danger">
                                        <i className="bi bi-exclamation-circle fs-1 d-block mb-2"></i>
                                        {error}
                                    </td>
                                </tr>
                            ) : parts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        <i className="bi bi-box-seam fs-1 d-block mb-2"></i>
                                        Không tìm thấy phụ tùng nào.
                                    </td>
                                </tr>
                            ) : (
                                parts.map((part) => (
                                    <tr key={part.partId || part.id}>
                                        <td className="ps-4 fw-medium text-primary">#{part.partCode}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                {part.imageUrl ? (
                                                    <img src={part.imageUrl} alt="" className="rounded me-2" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                                ) : (
                                                    <div className="rounded me-2 bg-light d-flex align-items-center justify-content-center text-secondary" style={{ width: '40px', height: '40px' }}>
                                                        <i className="bi bi-gear-fill"></i>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="fw-bold text-dark">{part.partName}</div>
                                                    {part.description && <small className="text-muted d-block text-truncate" style={{ maxWidth: '200px' }}>{part.description}</small>}
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-light text-dark border">{part.category || 'Chung'}</span></td>
                                        <td className="fw-bold text-success">{formatCurrency(part.unitPrice)}</td>
                                        <td>{part.unit}</td>
                                        <td>
                                            {part.isActive ? (
                                                <span className="badge bg-success-subtle text-success rounded-pill px-3">Hoạt động</span>
                                            ) : (
                                                <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3">Ngưng</span>
                                            )}
                                        </td>
                                        <td className="pe-4 text-end">
                                            <Button variant="link" className="text-primary p-1" onClick={() => handleOpenModal(part)} title="Chỉnh sửa">
                                                <i className="bi bi-pencil-square"></i>
                                            </Button>
                                            <Button variant="link" className="text-danger p-1" onClick={() => handleDelete(part.partId || part.id)} title="Xóa">
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="card-footer bg-white border-0 py-3 d-flex justify-content-center">
                        <nav>
                            <ul className="pagination mb-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 rounded-circle mx-1" onClick={() => handlePageChange(currentPage - 1)}>
                                        <i className="bi bi-chevron-left"></i>
                                    </button>
                                </li>
                                {[...Array(totalPages)].map((_, i) => (
                                    <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                        <button className="page-link border-0 rounded-circle mx-1" onClick={() => handlePageChange(i + 1)}>
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 rounded-circle mx-1" onClick={() => handlePageChange(currentPage + 1)}>
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal} centered size="lg" backdrop="static">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">{editingPart ? 'Cập nhật Phụ tùng' : 'Thêm Phụ tùng mới'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-4">
                    <Form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Tên phụ tùng <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="partName"
                                        value={formData.partName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ví dụ: Lốp xe Michelin..."
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Mã phụ tùng <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="partCode"
                                        value={formData.partCode}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ví dụ: PT-001"
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-12">
                                <Form.Group className="mb-3">
                                    <Form.Label>Mô tả</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Mô tả chi tiết về phụ tùng..."
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>Đơn giá (VND) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="unitPrice"
                                        value={formData.unitPrice}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>Đơn vị tính</Form.Label>
                                    <Form.Select name="unit" value={formData.unit} onChange={handleChange}>
                                        <option value="Cái">Cái</option>
                                        <option value="Bộ">Bộ</option>
                                        <option value="Cặp">Cặp</option>
                                        <option value="Lít">Lít</option>
                                        <option value="Hộp">Hộp</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>Danh mục</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: Động cơ, Lốp..."
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-12">
                                <Form.Group className="mb-3">
                                    <Form.Label>Hình ảnh URL</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-12">
                                <Form.Check
                                    type="switch"
                                    id="isActive-switch"
                                    label="Đang kinh doanh (Active)"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button variant="light" onClick={handleCloseModal} className="px-4">Hủy</Button>
                            <Button variant="primary" type="submit" className="px-4" disabled={submitting}>
                                {submitting ? <Spinner size="sm" animation="border" /> : 'Lưu thông tin'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default PartManagement;
