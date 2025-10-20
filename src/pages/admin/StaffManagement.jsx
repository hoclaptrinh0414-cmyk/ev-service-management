import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './StaffManagement.css';

const StatusBadge = ({ value }) => {
  const map = {
    active: 'status-badge status-active',
    inactive: 'status-badge status-inactive',
    on_duty: 'status-badge status-on-duty',
    off_duty: 'status-badge status-off-duty',
  };
  const cls = map[(value || '').toLowerCase()] || 'status-badge';
  const label = (value || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';
  return <span className={cls}>{label}</span>;
};

const emptyForm = {
  fullName: '',
  email: '',
  role: 'staff',
  phoneNumber: '',
  status: 'active',
};

const StaffModal = ({ open, mode, initial, onClose, onSubmit }) => {
  const [form, setForm] = useState(initial || emptyForm);

  React.useEffect(() => {
    setForm(initial || emptyForm);
  }, [initial, open]);

  if (!open) return null;
  const title = mode === 'edit' ? 'Edit Staff' : 'Add Staff';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) return;
    if (!form.email.trim()) return;
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
              <span>Full name</span>
              <input name="fullName" value={form.fullName} onChange={handleChange} required />
            </label>
            <label className="form-field">
              <span>Email</span>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>
          </div>
          <div className="grid-2">
            <label className="form-field">
              <span>Role</span>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="staff">Tech</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="form-field">
              <span>Phone</span>
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
            </label>
          </div>
          <div className="grid-2">
            <label className="form-field">
              <span>Status</span>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_duty">On Duty</option>
                <option value="off_duty">Off Duty</option>
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
  const { user, hasRole } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const isAdmin = hasRole('admin');
  const isTech = hasRole('staff');

  // Filters & search
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const queryParams = useMemo(() => ({
    search: search || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
    page: 1,
    pageSize: 20,
  }), [search, roleFilter, statusFilter]);

  const staffQuery = useQuery({
    queryKey: ['staff', queryParams],
    queryFn: () => staffAPI.list(queryParams),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (data) => staffAPI.create(data),
    onSuccess: () => {
      toast.success('Success', 'Staff created');
      queryClient.invalidateQueries(['staff']);
      setModalOpen(false);
    },
    onError: (err) => toast.error('Error', err.message || 'Create failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => staffAPI.update(id, data),
    onSuccess: () => {
      toast.success('Success', 'Staff updated');
      queryClient.invalidateQueries(['staff']);
      setModalOpen(false);
    },
    onError: (err) => toast.error('Error', err.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => staffAPI.remove(id),
    onSuccess: () => {
      toast.success('Deleted', 'Staff removed');
      queryClient.invalidateQueries(['staff']);
    },
    onError: (err) => toast.error('Error', err.message || 'Delete failed'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => staffAPI.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Updated', 'Status updated');
      queryClient.invalidateQueries(['staff']);
    },
    onError: (err) => toast.error('Error', err.message || 'Status update failed'),
  });

  // Modal control
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editing, setEditing] = useState(null);

  const openAdd = () => { setModalMode('add'); setEditing(null); setModalOpen(true); };
  const openEdit = (item) => { setModalMode('edit'); setEditing({
    id: item.id,
    fullName: item.fullName || item.name,
    email: item.email,
    role: (item.role || 'staff').toLowerCase(),
    phoneNumber: item.phoneNumber || '',
    status: (item.status || 'active').toLowerCase(),
  }); setModalOpen(true); };

  const handleSave = (data) => {
    if (modalMode === 'edit' && editing && editing.id) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Admin table view
  const renderAdminView = () => {
    const items = staffQuery.data?.items || staffQuery.data?.data || staffQuery.data || [];
    return (
      <div className="staff-page">
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
              <option value="admin">Admin</option>
              <option value="staff">Tech</option>
            </select>
            <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_duty">On Duty</option>
              <option value="off_duty">Off Duty</option>
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
                <th>Tasks</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            {staffQuery.isLoading ? (
              <SkeletonRows rows={6} />
            ) : (
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={6} className="empty">No staff found</td></tr>
                ) : items.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="user-cell">
                        <img src={s.avatarUrl || `https://i.pravatar.cc/64?u=${encodeURIComponent(s.email||s.id)}`} alt="avatar" />
                        <div>
                          <div className="name">{s.fullName || s.name}</div>
                          <div className="muted">#{s.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{s.email}</td>
                    <td>{(s.role || 'staff').replace(/\b\w/g, c=>c.toUpperCase())}</td>
                    <td>{s.openTasks ?? s.tasks ?? 0}</td>
                    <td><StatusBadge value={s.status} /></td>
                    <td className="row-actions">
                      <button className="link" onClick={() => openEdit({ ...s, id: s.id })}>Edit</button>
                      <button className="link danger" onClick={() => deleteMutation.mutate(s.id)}>Delete</button>
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

  // Tech self card
  const renderTechView = () => {
    const me = (staffQuery.data?.items || []).find(x => x.email === user?.email) || staffQuery.data?.me || {};
    const status = me.status || 'active';
    return (
      <div className="tech-card">
        <div className="header">
          <img src={me.avatarUrl || `https://i.pravatar.cc/80?u=${encodeURIComponent(user?.email||'me')}`} alt="avatar" />
          <div>
            <h3>{me.fullName || user?.fullName || user?.username}</h3>
            <div className="muted">{user?.email}</div>
            <div className="muted">Role: Tech</div>
          </div>
        </div>
        <div className="meta">
          <div><strong>Open Tasks:</strong> {me.openTasks ?? me.tasks ?? 0}</div>
          <div><strong>Status:</strong> <StatusBadge value={status} /></div>
        </div>
        <div className="actions">
          <label>
            Update status:
            <select
              defaultValue={status}
              onChange={(e) => statusMutation.mutate({ id: me.id || user?.id, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_duty">On Duty</option>
              <option value="off_duty">Off Duty</option>
            </select>
          </label>
        </div>
      </div>
    );
  };

  // If customer somehow navigates here, show not allowed
  const isCustomer = !isAdmin && !isTech;
  if (isCustomer) {
    return (
      <div className="not-allowed">
        <h2>Access Denied</h2>
        <p>Customers cannot access Staff Management.</p>
      </div>
    );
  }

  return isAdmin ? renderAdminView() : renderTechView();
};

export default StaffManagement;

