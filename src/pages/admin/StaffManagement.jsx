import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffAPI } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './StaffManagement.css';

const ROLE_OPTIONS = [
  { value: 2, label: 'Staff' },
  { value: 3, label: 'Technician' },
];

const StatusBadge = ({ value }) => {
  const map = {
    active: 'status-badge status-active',
    inactive: 'status-badge status-inactive',
  };
  const cls = map[(value || '').toLowerCase()] || 'status-badge';
  const label = (value || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';
  return <span className={cls}>{label}</span>;
};

const emptyForm = {
  username: '',
  password: '',
  fullName: '',
  email: '',
  roleId: 2,
  phoneNumber: '',
  hireDate: new Date().toISOString().split('T')[0],
  salary: 0,
  isActive: true,
};

const StaffModal = ({ open, mode, initial, onClose, onSubmit }) => {
  const [form, setForm] = useState(initial || emptyForm);

  React.useEffect(() => {
    setForm(initial || emptyForm);
  }, [initial, open]);

  if (!open) return null;
  const title = mode === 'edit' ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới';

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'roleId') {
      setForm(prev => ({ ...prev, [name]: Number(value) }));
      return;
    }
    if (name === 'isActive') {
      setForm(prev => ({ ...prev, [name]: value === 'true' }));
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) return;
    if (!form.email.trim()) return;
    if (mode === 'add' && !form.username.trim()) return;
    if (mode === 'add' && !form.password.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn-close" onClick={onClose} aria-label="Close"/>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="grid-2">
            <label className="form-field">
              <span>Username</span>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                disabled={mode === 'edit'}
              />
            </label>
            <label className="form-field">
              <span>Full name</span>
              <input name="fullName" value={form.fullName} onChange={handleChange} required />
            </label>
          </div>
          <div className="grid-2">
            <label className="form-field">
              <span>Email</span>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>
            {mode === 'add' && (
              <label className="form-field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </label>
            )}
          </div>
          <div className="grid-2">
            <label className="form-field">
              <span>Role</span>
              <select name="roleId" value={form.roleId} onChange={handleChange}>
                {ROLE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Phone</span>
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
            </label>
          </div>
          <div className="grid-2">
            <label className="form-field">
              <span>Hire Date</span>
              <input
                type="date"
                name="hireDate"
                value={form.hireDate}
                onChange={handleChange}
                required={mode === 'add'}
              />
            </label>
            <label className="form-field">
              <span>Salary</span>
              <input
                type="number"
                name="salary"
                value={form.salary}
                onChange={handleChange}
                min="0"
                step="1000"
                required={mode === 'add'}
              />
            </label>
          </div>
          <div className="grid-2">
            <label className="form-field">
              <span>Trạng thái</span>
              <select name="isActive" value={String(form.isActive)} onChange={handleChange}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
            <div />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SkeletonRows = ({ rows = 5 }) => (
  <tbody>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i} className="skeleton-row">
        <td colSpan={7}>
          <div className="skeleton-line" style={{ width: '100%' }} />
        </td>
      </tr>
    ))}
  </tbody>
);

const StaffManagement = () => {
  const { hasRole } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [fetchError, setFetchError] = useState(null);

  const isAdmin = hasRole('admin');

  // Filters & search
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const queryParams = useMemo(() => ({
    search: search || undefined,
    roleId: roleFilter ? Number(roleFilter) : undefined,
    isActive: statusFilter === '' ? undefined : statusFilter === 'active',
    page: 1,
    pageSize: 20,
  }), [search, roleFilter, statusFilter]);

  const staffQuery = useQuery({
    queryKey: ['staff', queryParams],
    queryFn: () => {
      console.log('[StaffManagement] Calling staffAPI.list with params:', queryParams);
      return staffAPI.list(queryParams);
    },
    retry: 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // React Query v5: Use useEffect instead of onSuccess/onError
  React.useEffect(() => {
    if (staffQuery.isSuccess && staffQuery.data) {
      setFetchError(null);
      console.log('[Staff] fetched successfully', {
        count: staffQuery.data?.items?.length ?? 0,
        data: staffQuery.data
      });
    }
  }, [staffQuery.isSuccess, staffQuery.data]);

  React.useEffect(() => {
    if (staffQuery.isError) {
      const err = staffQuery.error;
      setFetchError(err);
      toast.error('Không tải được danh sách nhân viên', err?.message || 'API error');
      console.error('[Staff] fetch error:', err);
    }
  }, [staffQuery.isError, staffQuery.error, toast]);

  const createMutation = useMutation({
    mutationFn: (data) => {
      console.log('[createMutation] Creating user:', data);
      return staffAPI.create(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      console.log('[updateMutation] Updating user:', id, data);
      return staffAPI.update(id, data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      console.log('[deleteMutation] Deleting user:', id);
      return staffAPI.remove(id);
    },
  });

  // Handle create mutation result
  React.useEffect(() => {
    if (createMutation.isSuccess) {
      toast.success('Thành công', 'Tạo tài khoản mới');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setModalOpen(false);
    }
    if (createMutation.isError) {
      toast.error('Lỗi', createMutation.error?.message || 'Create failed');
    }
  }, [createMutation.isSuccess, createMutation.isError, createMutation.error, toast, queryClient]);

  // Handle update mutation result
  React.useEffect(() => {
    if (updateMutation.isSuccess) {
      toast.success('Đã lưu', 'Cập nhật tài khoản');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setModalOpen(false);
    }
    if (updateMutation.isError) {
      toast.error('Lỗi', updateMutation.error?.message || 'Update failed');
    }
  }, [updateMutation.isSuccess, updateMutation.isError, updateMutation.error, toast, queryClient]);

  // Handle delete mutation result
  React.useEffect(() => {
    if (deleteMutation.isSuccess) {
      toast.success('Đã xóa', 'Tài khoản đã bị xóa');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    }
    if (deleteMutation.isError) {
      toast.error('Lỗi', deleteMutation.error?.message || 'Delete failed');
    }
  }, [deleteMutation.isSuccess, deleteMutation.isError, deleteMutation.error, toast, queryClient]);

  // Modal control
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editing, setEditing] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const openAdd = () => {
    setModalMode('add');
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = async (item) => {
    setModalMode('edit');
    setLoadingUser(true);

    try {
      // Gọi GET /api/users/{id} để lấy thông tin mới nhất
      const userId = item.userId || item.id;
      console.log(`Fetching user details for userId: ${userId}`);

      const userData = await staffAPI.getById(userId);

      console.log('Fetched user data:', userData);

      setEditing({
        id: userData.userId || userData.id,
        username: userData.username,
        fullName: userData.fullName || userData.name,
        email: userData.email,
        roleId: userData.roleId || 2,
        phoneNumber: userData.phoneNumber || '',
        hireDate: userData.hireDate ? userData.hireDate.split('T')[0] : new Date().toISOString().split('T')[0],
        salary: userData.salary || 0,
        isActive: userData.isActive !== false,
      });

      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoadingUser(false);
    }
  };

  const handleSave = (data) => {
    const payload = {
      ...data,
      roleId: Number(data.roleId || 0),
      isActive: data.isActive !== false,
    };
    if (modalMode === 'edit' && editing && editing.id) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const renderRole = (roleId, roleName) => {
    const normalized = (roleName || '').toLowerCase();
    if (roleId === 2 || normalized === 'staff') return 'Staff';
    if (roleId === 3 || normalized === 'technician') return 'Technician';
    if (roleId === 1 || normalized === 'admin') return 'Admin';
    return roleName || 'Unknown';
  };

  // Admin table view
  const renderAdminView = () => {
    const allItems = staffQuery.data?.items || [];

    // ✅ Lọc theo logic:
    // 1. Luôn loại bỏ Customer (roleId=4) và Admin (roleId=1)
    // 2. Lọc theo roleFilter (nếu có)
    // 3. Lọc theo statusFilter (nếu có)
    const items = allItems.filter(user => {
      const roleId = user.roleId;
      const isActive = user.isActive;

      // 1. Loại bỏ Customer và Admin
      if (roleId === 1 || roleId === 4) {
        return false;
      }

      // 2. Lọc theo role
      if (roleFilter) {
        if (roleId !== Number(roleFilter)) {
          return false;
        }
      } else {
        // Không có roleFilter: chỉ hiển thị Staff (2) và Technician (3)
        if (roleId !== 2 && roleId !== 3) {
          return false;
        }
      }

      // 3. Lọc theo status
      if (statusFilter === 'active') {
        return isActive === true;
      } else if (statusFilter === 'inactive') {
        return isActive === false;
      }

      // Không có statusFilter: hiển thị tất cả
      return true;
    });

    console.log('[StaffManagement] Filtered items:', {
      total: allItems.length,
      roleFilter: roleFilter || 'all',
      statusFilter: statusFilter || 'all',
      afterFilter: items.length,
      items: items.map(u => ({ id: u.userId, name: u.fullName, role: u.roleName, active: u.isActive }))
    });

    return (
      <div className="staff-page">
        {fetchError && (
          <div className="alert alert-warning" style={{ marginBottom: 12 }}>
            Không tải được danh sách. Kiểm tra API `/users` hoặc `/admin/users`. Chi tiết: {fetchError.message || 'unknown error'}
          </div>
        )}
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-input">
              <input
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select value={roleFilter} onChange={(e)=>setRoleFilter(e.target.value)}>
              <option value="">All roles</option>
              {ROLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="toolbar-right">
            <button className="btn btn-primary" onClick={openAdd}>Add Staff</button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            {staffQuery.isLoading ? (
              <SkeletonRows rows={6} />
            ) : (
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={6} className="empty">Không có nhân viên. Thử tạo mới hoặc kiểm tra API.</td></tr>
                ) : items.map((s) => (
                  <tr key={s.id}>
                    <td>{s.fullName || s.name}</td>
                    <td>{s.email}</td>
                    <td>{renderRole(s.roleId, s.roleName)}</td>
                    <td>{s.phoneNumber || '-'}</td>
                    <td><StatusBadge value={s.isActive ? 'active' : 'inactive'} /></td>
                    <td className="row-actions">
                      <button className="link" onClick={() => openEdit({ ...s, id: s.userId || s.id })}>Edit</button>
                      <button className="link danger" onClick={() => deleteMutation.mutate(s.userId || s.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        <StaffModal
          open={modalOpen}
          mode={modalMode}
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSave}
        />
      </div>
    );
  };

  // Only admin can access
  if (!isAdmin) {
    return (
      <div className="not-allowed">
        <h2>Access Denied</h2>
        <p>Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  return renderAdminView();
};

export default StaffManagement;
