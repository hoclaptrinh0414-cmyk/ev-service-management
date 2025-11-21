import React, { useState, useEffect } from 'react';
import technicianService from '../../services/technicianService';
import './TechnicianManagement.css';

const TechnicianManagement = () => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'details', 'schedule', 'performance', 'skills'
    const [technicianData, setTechnicianData] = useState(null);
    const [workloadBalance, setWorkloadBalance] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        available: false,
    });

    useEffect(() => {
        fetchTechnicians();
    }, [filters]);

    const fetchTechnicians = async () => {
        try {
            setLoading(true);
            const response = filters.available
                ? await technicianService.getAvailableTechnicians(filters)
                : await technicianService.getTechnicians(filters);

            // Handle response - API returns { success, items, totalPages, etc }
            const techList = response.items || response.data?.items || response.data || response || [];
            setTechnicians(techList);
            setError(null);
        } catch (err) {
            setError('Failed to load technicians');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (technician) => {
        try {
            const techId = technician.userId || technician.id;
            const details = await technicianService.getTechnicianById(techId);
            setSelectedTechnician(details);
            setTechnicianData(details);
            setModalType('details');
            setShowModal(true);
        } catch (err) {
            console.error('Error fetching technician details:', err);
        }
    };

    const handleViewSchedule = async (technician) => {
        try {
            const techId = technician.userId || technician.id;
            const schedule = await technicianService.getTechnicianSchedule(techId);
            setSelectedTechnician(technician);
            setTechnicianData(schedule);
            setModalType('schedule');
            setShowModal(true);
        } catch (err) {
            console.error('Error fetching schedule:', err);
        }
    };

    const handleViewPerformance = async (technician) => {
        try {
            const techId = technician.userId || technician.id;
            const performance = await technicianService.getTechnicianPerformance(techId);
            setSelectedTechnician(technician);
            setTechnicianData(performance);
            setModalType('performance');
            setShowModal(true);
        } catch (err) {
            console.error('Error fetching performance:', err);
        }
    };

    const handleViewSkills = async (technician) => {
        try {
            const techId = technician.userId || technician.id;
            const skills = await technicianService.getTechnicianSkills(techId);
            setSelectedTechnician(technician);
            setTechnicianData(skills);
            setModalType('skills');
            setShowModal(true);
        } catch (err) {
            console.error('Error fetching skills:', err);
        }
    };

    const handleViewWorkload = async () => {
        try {
            // Assuming service center ID 1 for demo
            const balance = await technicianService.getWorkloadBalance(1);
            setWorkloadBalance(balance);
            setModalType('workload');
            setShowModal(true);
        } catch (err) {
            console.error('Error fetching workload balance:', err);
        }
    };

    const getStatusClass = (status) => {
        const statusMap = {
            'Available': 'status-available',
            'Busy': 'status-busy',
            'Offline': 'status-offline',
            'OnBreak': 'status-break',
        };
        return statusMap[status] || 'status-offline';
    };

    const getSkillLevelBadge = (level) => {
        const levels = {
            'Beginner': 'skill-beginner',
            'Intermediate': 'skill-intermediate',
            'Advanced': 'skill-advanced',
            'Expert': 'skill-expert',
        };
        return levels[level] || 'skill-beginner';
    };

    return (
        <div className="technician-management">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">
                        <i className="bi bi-people-fill"></i>
                        Technician Management
                    </h1>
                    <p className="page-subtitle">Manage technicians, skills, and performance</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={handleViewWorkload}>
                        <i className="bi bi-bar-chart"></i>
                        Workload Balance
                    </button>
                    <button className="btn btn-primary">
                        <i className="bi bi-plus-circle"></i>
                        Add Technician
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name, email, or specialization..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>
                <div className="filter-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={filters.available}
                            onChange={(e) => setFilters({ ...filters, available: e.target.checked })}
                        />
                        <span>Show Available Only</span>
                    </label>
                </div>
            </div>

            {/* Technicians Grid */}
            <div className="technicians-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading technicians...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <i className="bi bi-exclamation-triangle"></i>
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={fetchTechnicians}>Retry</button>
                    </div>
                ) : technicians.length === 0 ? (
                    <div className="empty-state">
                        <i className="bi bi-inbox"></i>
                        <p>No technicians found</p>
                    </div>
                ) : (
                    <div className="technicians-grid">
                        {technicians.map((tech) => (
                            <div key={tech.userId || tech.id} className="technician-card">
                                <div className="technician-header">
                                    <div className="technician-avatar">
                                        <img
                                            src={tech.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(tech.fullName || tech.name)}&background=667eea&color=fff`}
                                            alt={tech.fullName || tech.name}
                                        />
                                        <span className={`status-indicator ${getStatusClass(tech.isAvailable ? 'Available' : 'Busy')}`}></span>
                                    </div>
                                    <div className="technician-info">
                                        <h3>{tech.fullName || tech.name}</h3>
                                        <p className="technician-role">{tech.department || 'General Technician'}</p>
                                        {tech.employeeCode && <p className="employee-code">{tech.employeeCode}</p>}
                                    </div>
                                </div>

                                <div className="technician-stats">
                                    <div className="stat-item">
                                        <i className="bi bi-clipboard-check"></i>
                                        <div>
                                            <span className="stat-value">{tech.completedJobs || tech.currentWorkload || 0}</span>
                                            <span className="stat-label">Workload</span>
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <i className="bi bi-star-fill"></i>
                                        <div>
                                            <span className="stat-value">{tech.averageRating?.toFixed(1) || '5.0'}</span>
                                            <span className="stat-label">Rating</span>
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <i className="bi bi-tools"></i>
                                        <div>
                                            <span className="stat-value">{tech.topSkills ? tech.topSkills.split(',').length : 0}</span>
                                            <span className="stat-label">Skills</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="technician-actions">
                                    <button
                                        className="btn-action"
                                        onClick={() => handleViewDetails(tech)}
                                        title="View Details"
                                    >
                                        <i className="bi bi-eye"></i>
                                    </button>
                                    <button
                                        className="btn-action"
                                        onClick={() => handleViewSchedule(tech)}
                                        title="View Schedule"
                                    >
                                        <i className="bi bi-calendar"></i>
                                    </button>
                                    <button
                                        className="btn-action"
                                        onClick={() => handleViewPerformance(tech)}
                                        title="View Performance"
                                    >
                                        <i className="bi bi-graph-up"></i>
                                    </button>
                                    <button
                                        className="btn-action"
                                        onClick={() => handleViewSkills(tech)}
                                        title="Manage Skills"
                                    >
                                        <i className="bi bi-award"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {modalType === 'details' && 'Technician Details'}
                                {modalType === 'schedule' && 'Schedule'}
                                {modalType === 'performance' && 'Performance Metrics'}
                                {modalType === 'skills' && 'Skills & Certifications'}
                                {modalType === 'workload' && 'Workload Balance'}
                            </h2>
                            <button className="btn-close" onClick={() => setShowModal(false)}>
                                <i className="bi bi-x"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            {modalType === 'details' && technicianData && (
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Name:</label>
                                        <span>{technicianData.name || technicianData.fullName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Email:</label>
                                        <span>{technicianData.email}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Phone:</label>
                                        <span>{technicianData.phone || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Specialization:</label>
                                        <span>{technicianData.specialization || 'General'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Status:</label>
                                        <span className={`status-badge ${getStatusClass(technicianData.status)}`}>
                                            {technicianData.status || 'Available'}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Experience:</label>
                                        <span>{technicianData.yearsOfExperience || 0} years</span>
                                    </div>
                                </div>
                            )}

                            {modalType === 'skills' && technicianData && (
                                <div className="skills-list">
                                    {Array.isArray(technicianData) && technicianData.length > 0 ? (
                                        technicianData.map((skill, index) => (
                                            <div key={index} className="skill-item">
                                                <div className="skill-info">
                                                    <h4>{skill.skillName || skill.name}</h4>
                                                    <span className={`skill-badge ${getSkillLevelBadge(skill.level)}`}>
                                                        {skill.level || 'Intermediate'}
                                                    </span>
                                                </div>
                                                {skill.verified && (
                                                    <i className="bi bi-patch-check-fill verified-icon"></i>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p>No skills recorded</p>
                                    )}
                                </div>
                            )}

                            {modalType === 'performance' && technicianData && (
                                <div className="performance-metrics">
                                    <div className="metric-card">
                                        <i className="bi bi-clipboard-check"></i>
                                        <h3>{technicianData.completedJobs || 0}</h3>
                                        <p>Completed Jobs</p>
                                    </div>
                                    <div className="metric-card">
                                        <i className="bi bi-star-fill"></i>
                                        <h3>{technicianData.averageRating || '5.0'}</h3>
                                        <p>Average Rating</p>
                                    </div>
                                    <div className="metric-card">
                                        <i className="bi bi-clock"></i>
                                        <h3>{technicianData.averageCompletionTime || '2.5'}h</h3>
                                        <p>Avg Completion</p>
                                    </div>
                                    <div className="metric-card">
                                        <i className="bi bi-check-circle"></i>
                                        <h3>{technicianData.qualityScore || '98'}%</h3>
                                        <p>Quality Score</p>
                                    </div>
                                </div>
                            )}

                            {modalType === 'workload' && (
                                <div className="workload-list">
                                    {workloadBalance.length > 0 ? (
                                        workloadBalance.map((item, index) => (
                                            <div key={index} className="workload-item">
                                                <span>{item.technicianName}</span>
                                                <div className="workload-bar">
                                                    <div
                                                        className="workload-fill"
                                                        style={{ width: `${item.workloadPercentage}%` }}
                                                    ></div>
                                                </div>
                                                <span>{item.activeJobs} jobs</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No workload data available</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TechnicianManagement;
