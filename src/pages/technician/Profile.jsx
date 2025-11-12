// src/pages/technician/Profile.jsx - Technician Profile Page
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import api from '../../services/api';

// API Functions
const profileAPI = {
  getProfile: async () => {
    const response = await api.request('/api/auth/profile', { method: 'GET' });
    console.log('📥 Raw API Response:', response);
    // API returns: { success: true, message: "...", data: { userId, fullName, ... } }
    return response;
  },
  
  updateProfile: async (data) => {
    const response = await api.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  },
  
  changePassword: async (data) => {
    const response = await api.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }
};

export default function Profile() {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch profile data
  const { data: profileResponse, isLoading, isError, error } = useQuery({
    queryKey: ['technicianProfile'],
    queryFn: profileAPI.getProfile,
  });

  // Extract profile from response - handle different response structures
  // Response format: { success: true, message: "...", data: { userId, fullName, ... } }
  const profile = profileResponse?.data || profileResponse;

  console.log('🔍 Profile State:', { 
    profileResponse, 
    profile, 
    hasData: !!profile,
    fullName: profile?.fullName,
    email: profile?.email 
  });

  // Update formData when profile loads
  React.useEffect(() => {
    if (profile) {
      console.log('✅ Updating formData with profile:', profile);
      setFormData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: profileAPI.updateProfile,
    onSuccess: (response) => {
      console.log('✅ Profile update success:', response);
      queryClient.invalidateQueries(['technicianProfile']);
      refreshUser?.();
      toast.success(response?.message || '✅ Profile updated successfully!');
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('❌ Profile update error:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update profile');
    }
  });

  // Change password mutation
  const passwordMutation = useMutation({
    mutationFn: profileAPI.changePassword,
    onSuccess: (response) => {
      console.log('✅ Password change success:', response);
      toast.success(response?.message || '✅ Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error) => {
      console.error('❌ Password change error:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to change password');
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    updateMutation.mutate(formData);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    passwordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <i className="bi bi-exclamation-circle text-6xl text-red-600 mb-4"></i>
          <p className="text-gray-800 font-semibold text-lg">Failed to load profile</p>
          <p className="text-sm text-red-500 mt-2">{error?.message || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  console.log('🔍 Profile Debug:', { profileResponse, profile, formData });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">My Profile</h1>
          <p className="text-gray-600">Manage your account information and settings</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                  {profile?.fullName?.charAt(0)?.toUpperCase() || 'T'}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mt-4">
                  {profile?.fullName || 'Technician'}
                </h2>
                <p className="text-gray-600 mt-1">@{profile?.username || 'username'}</p>
                
                {/* Status Badge */}
                <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  profile?.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    profile?.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}></div>
                  {profile?.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm flex items-center gap-2">
                    <i className="bi bi-shield-check text-orange-600"></i>
                    Role
                  </span>
                  <span className="font-semibold text-gray-900">{profile?.roleName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm flex items-center gap-2">
                    <i className="bi bi-building text-orange-600"></i>
                    Department
                  </span>
                  <span className="font-semibold text-gray-900">{profile?.department || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm flex items-center gap-2">
                    <i className="bi bi-calendar-check text-orange-600"></i>
                    Hire Date
                  </span>
                  <span className="font-semibold text-gray-900">
                    {profile?.hireDate ? new Date(profile.hireDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm flex items-center gap-2">
                    <i className="bi bi-person-badge text-orange-600"></i>
                    Employee ID
                  </span>
                  <span className="font-semibold text-gray-900">{profile?.employeeCode || 'N/A'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  <i className="bi bi-key"></i>
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <i className="bi bi-person-circle text-orange-600"></i>
                  Personal Information
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <i className="bi bi-pencil"></i>
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {updateMutation.isPending ? (
                        <>
                          <i className="bi bi-arrow-clockwise animate-spin"></i>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {profile?.fullName || 'Not set'}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 flex items-center gap-2">
                      {profile?.email || 'Not set'}
                      {profile?.emailVerified && (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                          <i className="bi bi-check-circle-fill"></i>
                          Verified
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {profile?.phoneNumber || 'Not set'}
                    </div>
                  )}
                </div>

                {/* Username (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed">
                    {profile?.username || 'Not set'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <i className="bi bi-shield-lock text-orange-600"></i>
                Account Status
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <i className={`bi ${profile?.isActive ? 'bi-check-circle-fill text-green-500' : 'bi-x-circle-fill text-red-500'}`}></i>
                    <span className="text-sm font-medium text-gray-600">Account Status</span>
                  </div>
                  <p className={`font-bold ${profile?.isActive ? 'text-green-700' : 'text-red-700'}`}>
                    {profile?.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <i className={`bi ${profile?.isLocked ? 'bi-lock-fill text-red-500' : 'bi-unlock-fill text-green-500'}`}></i>
                    <span className="text-sm font-medium text-gray-600">Lock Status</span>
                  </div>
                  <p className={`font-bold ${profile?.isLocked ? 'text-red-700' : 'text-green-700'}`}>
                    {profile?.isLocked ? 'Locked' : 'Unlocked'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="bi bi-calendar-plus text-blue-500"></i>
                    <span className="text-sm font-medium text-gray-600">Member Since</span>
                  </div>
                  <p className="font-bold text-gray-900">
                    {profile?.createdDate ? new Date(profile.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="bi bi-clock-history text-purple-500"></i>
                    <span className="text-sm font-medium text-gray-600">Last Login</span>
                  </div>
                  <p className="font-bold text-gray-900">
                    {profile?.lastLoginDate ? new Date(profile.lastLoginDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <i className="bi bi-key text-orange-600"></i>
                Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="bi bi-x-lg text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter new password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              {passwordData.newPassword && passwordData.confirmPassword && 
               passwordData.newPassword !== passwordData.confirmPassword && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  Passwords do not match
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {passwordMutation.isPending ? (
                    <>
                      <i className="bi bi-arrow-clockwise animate-spin"></i>
                      Changing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg"></i>
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
