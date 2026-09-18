import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  KeyRound,
  CalendarPlus,
  Shield,
  Mail,
  Phone,
  Check,
  AlertCircle,
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { API_ENDPOINTS } from '../../constants/endpoints';
import { APP_CONSTANTS } from '../../constants/appConstants';

export const AdminEmployeesScreen = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLeavesModalOpen, setIsLeavesModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Form states - identical to Flutter UserForm
  const initialFormData = {
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNo: '',
    genderId: '1',
    username: '',
    dob: '',
    password: '',
    address: '',
    roleId: APP_CONSTANTS.ROLES.USER,
    countryCode: '+91',
  };

  const [formData, setFormData] = useState(initialFormData);

  const [newPassword, setNewPassword] = useState('');
  const [leaveAlloc, setLeaveAlloc] = useState({
    casualLeaves: 12,
    sickLeaves: 10,
    paidLeaves: 15,
  });

  // Auto-dismiss notice after 4 seconds
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await apiService.get(API_ENDPOINTS.ADMIN_USER_LIST);
      setEmployees(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setNotice({ type: 'error', message: 'Failed to load employee list.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const cleanEmail = formData.email.trim().toLowerCase();
      const payload = {
        firstName: formData.firstName.trim(),
        middleName: formData.middleName?.trim() || '',
        lastName: formData.lastName.trim(),
        email: cleanEmail,
        phoneNo: formData.phoneNo?.trim() || '',
        phone: formData.phoneNo?.trim() || '',
        genderId: formData.genderId || '1',
        username: formData.username?.trim() || cleanEmail.split('@')[0],
        dob: formData.dob || '',
        password: formData.password,
        address: formData.address?.trim() || '',
        roleId: String(formData.roleId || APP_CONSTANTS.ROLES.USER),
        countryCode: formData.countryCode || '+91',
      };
      await apiService.post(API_ENDPOINTS.ADMIN_CREATE_USER, payload);
      setNotice({ type: 'success', message: 'Employee registered successfully!' });
      setIsAddModalOpen(false);
      setFormData(initialFormData);
      await fetchEmployees();
    } catch (err) {
      console.error('Create user failed:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to create employee.';
      setFormError(msg);
      setNotice({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      const key = selectedEmp.key || selectedEmp._key || selectedEmp._id || selectedEmp.id;
      const cleanEmail = formData.email.trim().toLowerCase();
      const payload = {
        firstName: formData.firstName.trim(),
        middleName: formData.middleName?.trim() || '',
        lastName: formData.lastName.trim(),
        email: cleanEmail,
        phoneNo: formData.phoneNo?.trim() || '',
        phone: formData.phoneNo?.trim() || '',
        genderId: formData.genderId || '1',
        username: formData.username?.trim() || cleanEmail.split('@')[0],
        dob: formData.dob || '',
        address: formData.address?.trim() || '',
        roleId: String(formData.roleId || APP_CONSTANTS.ROLES.USER),
        countryCode: formData.countryCode || '+91',
      };
      if (formData.password?.trim()) {
        payload.password = formData.password.trim();
      }
      await apiService.patch(`${API_ENDPOINTS.ADMIN_UPDATE_USER}${key}`, payload);
      setNotice({ type: 'success', message: 'Employee updated successfully!' });
      setIsEditModalOpen(false);
      setSelectedEmp(null);
      await fetchEmployees();
    } catch (err) {
      console.error('Update user failed:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update employee.';
      setFormError(msg);
      setNotice({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (emp) => {
    const key = emp.key || emp._id || emp.id;
    if (!window.confirm(`Are you sure you want to remove ${emp.firstName || 'this employee'}?`)) return;

    try {
      await apiService.delete(`${API_ENDPOINTS.ADMIN_DELETE_USER}${key}`);
      setNotice({ type: 'success', message: 'Employee removed successfully.' });
      await fetchEmployees();
    } catch (err) {
      console.error('Delete employee failed:', err);
      setNotice({ type: 'error', message: err.message || 'Failed to delete employee.' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!selectedEmp || !newPassword) return;
    try {
      const key = selectedEmp.key || selectedEmp._id || selectedEmp.id;
      await apiService.post(API_ENDPOINTS.ADMIN_CHANGE_USER_PASSWORD, {
        userKey: key,
        newPassword: newPassword,
      });
      setNotice({ type: 'success', message: 'Employee password reset successfully!' });
      setIsPasswordModalOpen(false);
      setNewPassword('');
    } catch (err) {
      console.error('Change password failed:', err);
      setNotice({ type: 'error', message: err.message || 'Failed to reset password.' });
    }
  };

  const handleAllocateLeaves = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    try {
      const key = selectedEmp.key || selectedEmp._id || selectedEmp.id;
      await apiService.post(API_ENDPOINTS.ADMIN_ADD_LEAVES, {
        userKey: key,
        ...leaveAlloc,
      });
      setNotice({ type: 'success', message: 'Leave balance allocated successfully!' });
      setIsLeavesModalOpen(false);
    } catch (err) {
      console.error('Allocate leaves failed:', err);
      setNotice({ type: 'error', message: err.message || 'Failed to allocate leaves.' });
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const name = `${emp.firstName || ''} ${emp.lastName || ''} ${emp.email || ''}`.toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || String(emp.roleId) === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Floating Notification (Always Visible Over Modals) */}
      {notice && (
        <div
          style={{
            position: 'fixed',
            top: '1.25rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999999,
            minWidth: '320px',
            maxWidth: '92%',
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            backgroundColor: notice.type === 'success' ? '#059669' : '#dc2626',
            color: '#ffffff',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.92rem',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {notice.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
            <span>{notice.message}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#ffffff', fontSize: '1.1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Employee Directory</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage staff members, roles, credentials, and leave allocations.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setFormError(null);
            setFormData(initialFormData);
            setIsAddModalOpen(true);
          }}
        >
          <UserPlus size={18} />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.6rem' }}
              placeholder="Search by name, email, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <select
              className="form-control form-select"
              style={{ minWidth: '150px' }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value={APP_CONSTANTS.ROLES.USER}>Employees</option>
              <option value={APP_CONSTANTS.ROLES.ADMIN}>Administrators</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="glass-card">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading employee directory...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No employees matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const isAdmin = String(emp.roleId) === APP_CONSTANTS.ROLES.ADMIN;
                  return (
                    <tr key={emp.key || emp._id || emp.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              backgroundColor: isAdmin ? 'var(--secondary)' : 'var(--primary)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                            }}
                          >
                            {emp.firstName ? emp.firstName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {emp.firstName} {emp.middleName ? `${emp.middleName} ` : ''}{emp.lastName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {emp.email} {emp.username ? `(@${emp.username})` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${isAdmin ? 'badge-wfh' : 'badge-info'}`}>
                          {isAdmin ? 'Admin' : 'Employee'}
                        </span>
                      </td>
                      <td>{emp.phoneNo || emp.phone || '--'}</td>
                      <td>
                        {emp.genderId === '2' ? 'Female' : emp.genderId === '3' ? 'Other' : 'Male'}
                      </td>
                      <td>
                        {emp.joinedDate
                          ? new Date(emp.joinedDate).toLocaleDateString()
                          : emp.createdDate
                          ? new Date(emp.createdDate).toLocaleDateString()
                          : emp.createdAt
                          ? new Date(emp.createdAt).toLocaleDateString()
                          : 'Recent'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          {/* Allocate Leaves */}
                          <button
                            className="btn-icon"
                            onClick={() => {
                              setSelectedEmp(emp);
                              setIsLeavesModalOpen(true);
                            }}
                            title="Allocate Leaves"
                          >
                            <CalendarPlus size={16} color="var(--primary)" />
                          </button>

                          {/* Reset Password */}
                          <button
                            className="btn-icon"
                            onClick={() => {
                              setSelectedEmp(emp);
                              setIsPasswordModalOpen(true);
                            }}
                            title="Reset Password"
                          >
                            <KeyRound size={16} color="var(--accent)" />
                          </button>

                          {/* Edit */}
                          <button
                            className="btn-icon"
                            onClick={() => {
                              setSelectedEmp(emp);
                              setFormError(null);
                              setFormData({
                                firstName: emp.firstName || '',
                                middleName: emp.middleName || '',
                                lastName: emp.lastName || '',
                                email: emp.email || '',
                                phoneNo: emp.phoneNo || emp.phone || '',
                                password: '',
                                roleId: emp.roleId ? String(emp.roleId) : APP_CONSTANTS.ROLES.USER,
                                countryCode: emp.countryCode || '+91',
                                address: typeof emp.address === 'string' ? emp.address : '',
                                genderId: emp.genderId ? String(emp.genderId) : '1',
                                username: emp.username || '',
                                dob: emp.dob ? String(emp.dob).substring(0, 10) : '',
                              });
                              setIsEditModalOpen(true);
                            }}
                            title="Edit Employee"
                          >
                            <Edit2 size={16} />
                          </button>

                          {/* Delete */}
                          <button
                            className="btn-icon"
                            onClick={() => handleDeleteEmployee(emp)}
                            title="Delete Employee"
                          >
                            <Trash2 size={16} color="var(--error)" />
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

      {/* Add Employee Modal (Exact Match to Flutter Form) */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <UserPlus size={20} color="var(--primary)" />
                <h3>Add New Employee</h3>
              </div>
              <button className="btn-icon" onClick={() => setIsAddModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmployee}>
              <div className="modal-body">
                {formError && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      marginBottom: '1rem',
                      borderRadius: 'var(--radius-sm, 6px)',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid var(--error, #ef4444)',
                      color: '#f87171',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Middle Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Optional"
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone No</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="10-digit phone number"
                    value={formData.phoneNo}
                    onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-control form-select"
                    value={formData.genderId}
                    onChange={(e) => setFormData({ ...formData, genderId: e.target.value })}
                  >
                    <option value="1">Male</option>
                    <option value="2">Female</option>
                    <option value="3">Other</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Username (optional)"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Min 4 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Enter residential address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-control form-select"
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  >
                    <option value={APP_CONSTANTS.ROLES.USER}>Employee</option>
                    <option value={APP_CONSTANTS.ROLES.ADMIN}>Admin</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal (Exact Match to Flutter Form) */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Edit2 size={20} color="var(--primary)" />
                <h3>Edit Employee Details</h3>
              </div>
              <button className="btn-icon" onClick={() => setIsEditModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee}>
              <div className="modal-body">
                {formError && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      marginBottom: '1rem',
                      borderRadius: 'var(--radius-sm, 6px)',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid var(--error, #ef4444)',
                      color: '#f87171',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Middle Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone No</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phoneNo}
                    onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-control form-select"
                    value={formData.genderId}
                    onChange={(e) => setFormData({ ...formData, genderId: e.target.value })}
                  >
                    <option value="1">Male</option>
                    <option value="2">Female</option>
                    <option value="3">Other</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password (Optional)</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Leave blank to keep unchanged"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-control form-select"
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  >
                    <option value={APP_CONSTANTS.ROLES.USER}>Employee</option>
                    <option value={APP_CONSTANTS.ROLES.ADMIN}>Admin</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isPasswordModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <KeyRound size={20} color="var(--accent)" />
                <h3>Reset Password for {selectedEmp?.firstName}</h3>
              </div>
              <button className="btn-icon" onClick={() => setIsPasswordModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsPasswordModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Set Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Leaves Modal */}
      {isLeavesModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLeavesModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CalendarPlus size={20} color="var(--primary)" />
                <h3>Allocate Leaves: {selectedEmp?.firstName}</h3>
              </div>
              <button className="btn-icon" onClick={() => setIsLeavesModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAllocateLeaves}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Casual Leaves</label>
                  <input
                    type="number"
                    className="form-control"
                    value={leaveAlloc.casualLeaves}
                    onChange={(e) => setLeaveAlloc({ ...leaveAlloc, casualLeaves: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sick Leaves</label>
                  <input
                    type="number"
                    className="form-control"
                    value={leaveAlloc.sickLeaves}
                    onChange={(e) => setLeaveAlloc({ ...leaveAlloc, sickLeaves: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Paid / Earned Leaves</label>
                  <input
                    type="number"
                    className="form-control"
                    value={leaveAlloc.paidLeaves}
                    onChange={(e) => setLeaveAlloc({ ...leaveAlloc, paidLeaves: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsLeavesModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Allocate Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
