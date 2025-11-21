import api from './apiWrapper';

/**
 * Technician Management Service
 * Based on actual API endpoints from backend
 */

// Get all technicians with filters
// API Parameters: ServiceCenterId, Department, SkillName, MinSkillLevel, IsActive, 
// SearchTerm, SortBy, SortDirection, PageNumber, PageSize
export const getTechnicians = async (params = {}) => {
    try {
        // Map frontend params to backend params
        const apiParams = {
            ServiceCenterId: params.serviceCenterId,
            Department: params.department,
            SkillName: params.skillName,
            MinSkillLevel: params.minSkillLevel,
            IsActive: params.isActive !== undefined ? params.isActive : true,
            SearchTerm: params.search || params.searchTerm,
            SortBy: params.sortBy || 'FullName',
            SortDirection: params.sortDirection || params.sortOrder || 'asc',
            PageNumber: params.page || params.pageNumber || 1,
            PageSize: params.limit || params.pageSize || 20
        };

        // Remove undefined values
        Object.keys(apiParams).forEach(key =>
            apiParams[key] === undefined && delete apiParams[key]
        );

        const response = await api.get('/technicians', { params: apiParams });

        // Handle response format from backend
        const data = response.data.data || response.data;

        // Return data in consistent format
        return {
            success: response.data.success !== undefined ? response.data.success : true,
            items: data.items || data || [],
            totalPages: data.totalPages,
            totalItems: data.totalItems,
            currentPage: data.currentPage || apiParams.PageNumber
        };
    } catch (error) {
        console.error('Error fetching technicians:', error);
        throw error;
    }
};

// Get available technicians (filter by IsActive and availability)
export const getAvailableTechnicians = async (params = {}) => {
    return getTechnicians({ ...params, isActive: true, isAvailable: true });
};

// Get technician by ID
export const getTechnicianById = async (id) => {
    try {
        const response = await api.get(`/technicians/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching technician ${id}:`, error);
        throw error;
    }
};

// Get technician schedule
export const getTechnicianSchedule = async (id, params = {}) => {
    try {
        const response = await api.get(`/technicians/${id}/schedule`, { params });
        return response.data;
    } catch (error) {
        console.error(`Error fetching schedule for technician ${id}:`, error);
        throw error;
    }
};

// Get technician skills
export const getTechnicianSkills = async (id) => {
    try {
        const response = await api.get(`/technicians/${id}/skills`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching skills for technician ${id}:`, error);
        throw error;
    }
};

// Get technician performance
export const getTechnicianPerformance = async (id, params = {}) => {
    try {
        const response = await api.get(`/technicians/${id}/performance`, { params });
        return response.data;
    } catch (error) {
        console.error(`Error fetching performance for technician ${id}:`, error);
        throw error;
    }
};

// Auto-assign best technician
export const autoAssignBestTechnician = async (workOrderData) => {
    try {
        const response = await api.post('/technicians/auto-assign/best', workOrderData);
        return response.data;
    } catch (error) {
        console.error('Error auto-assigning best technician:', error);
        throw error;
    }
};

// Get auto-assign candidates
export const getAutoAssignCandidates = async (workOrderData) => {
    try {
        const response = await api.post('/technicians/auto-assign/candidates', workOrderData);
        return response.data;
    } catch (error) {
        console.error('Error fetching auto-assign candidates:', error);
        throw error;
    }
};

// Get workload balance
export const getWorkloadBalance = async (serviceCenterId) => {
    try {
        const response = await api.get(`/technicians/workload-balance/${serviceCenterId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching workload balance for service center ${serviceCenterId}:`, error);
        throw error;
    }
};

// Add skill to technician
export const addTechnicianSkill = async (technicianId, skillData) => {
    try {
        const response = await api.post(`/technicians/${technicianId}/skills`, skillData);
        return response.data;
    } catch (error) {
        console.error(`Error adding skill to technician ${technicianId}:`, error);
        throw error;
    }
};

// Remove skill from technician
export const removeTechnicianSkill = async (technicianId, skillId) => {
    try {
        const response = await api.delete(`/technicians/${technicianId}/skills/${skillId}`);
        return response.data;
    } catch (error) {
        console.error(`Error removing skill from technician ${technicianId}:`, error);
        throw error;
    }
};

// Verify technician skill
export const verifyTechnicianSkill = async (technicianId, skillId, verificationData) => {
    try {
        const response = await api.post(`/technicians/${technicianId}/skills/${skillId}/verify`, verificationData);
        return response.data;
    } catch (error) {
        console.error(`Error verifying skill for technician ${technicianId}:`, error);
        throw error;
    }
};

// Technician Self-Service

// Get my schedule
export const getMySchedule = async (params = {}) => {
    try {
        const response = await api.get('/technicians/my-schedule', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching my schedule:', error);
        throw error;
    }
};

// Get my work orders
export const getMyWorkOrders = async (params = {}) => {
    try {
        const response = await api.get('/technicians/my-work-orders', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching my work orders:', error);
        throw error;
    }
};

// Get my performance
export const getMyPerformance = async (params = {}) => {
    try {
        const response = await api.get('/technicians/my-performance', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching my performance:', error);
        throw error;
    }
};

// Get my ratings
export const getMyRatings = async (params = {}) => {
    try {
        const response = await api.get('/technicians/my-ratings', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching my ratings:', error);
        throw error;
    }
};

// Request time off
export const requestTimeOff = async (timeOffData) => {
    try {
        const response = await api.post('/technicians/request-time-off', timeOffData);
        return response.data;
    } catch (error) {
        console.error('Error requesting time off:', error);
        throw error;
    }
};

// Attendance

// Check in
export const checkIn = async (checkInData) => {
    try {
        const response = await api.post('/technicians/attendance/check-in', checkInData);
        return response.data;
    } catch (error) {
        console.error('Error checking in:', error);
        throw error;
    }
};

// Check out
export const checkOut = async (checkOutData) => {
    try {
        const response = await api.post('/technicians/attendance/check-out', checkOutData);
        return response.data;
    } catch (error) {
        console.error('Error checking out:', error);
        throw error;
    }
};

// Get today's attendance
export const getTodayAttendance = async () => {
    try {
        const response = await api.get('/technicians/attendance/today');
        return response.data;
    } catch (error) {
        console.error('Error fetching today\'s attendance:', error);
        throw error;
    }
};

const technicianService = {
    getTechnicians,
    getAvailableTechnicians,
    getTechnicianById,
    getTechnicianSchedule,
    getTechnicianSkills,
    getTechnicianPerformance,
    autoAssignBestTechnician,
    getAutoAssignCandidates,
    getWorkloadBalance,
    addTechnicianSkill,
    removeTechnicianSkill,
    verifyTechnicianSkill,
    getMySchedule,
    getMyWorkOrders,
    getMyPerformance,
    getMyRatings,
    requestTimeOff,
    checkIn,
    checkOut,
    getTodayAttendance,
};

export default technicianService;

