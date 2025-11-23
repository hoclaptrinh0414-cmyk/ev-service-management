// src/pages/staff/TechnicianCandidatesModal.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as staffService from '../../services/staffService';

export default function TechnicianCandidatesModal({
  show,
  onClose,
  onSelect,
  workOrder,
  serviceCenterId
}) {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [topN, setTopN] = useState(5);

  useEffect(() => {
    if (show && workOrder) {
      loadCandidates();
    }
  }, [show, workOrder, topN]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const assignData = {
        serviceCenterId: serviceCenterId || workOrder.serviceCenterId,
        workDate: new Date().toISOString().split('T')[0],
        requiredSkills: workOrder.requiredSkills || [],
        estimatedDurationMinutes: workOrder.estimatedDurationMinutes || 60,
        startTime: new Date().toTimeString().split(' ')[0],
      };

      const response = await staffService.getTechnicianCandidates(assignData, topN);
      const candidateList = response?.data?.candidates || response?.candidates || response?.data || [];
      setCandidates(Array.isArray(candidateList) ? candidateList : []);
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast.error('Không thể tải danh sách kỹ thuật viên gợi ý');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (technician) => {
    onSelect(technician);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-stars me-2"></i>
              Kỹ thuật viên được gợi ý (Top {topN})
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Top N selector */}
            <div className="mb-3">
              <label className="form-label">Số lượng gợi ý</label>
              <select
                className="form-select"
                style={{ width: '150px' }}
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value))}
              >
                <option value="3">Top 3</option>
                <option value="5">Top 5</option>
                <option value="10">Top 10</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
                <p className="mt-2">Đang tìm kỹ thuật viên phù hợp...</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Không tìm thấy kỹ thuật viên phù hợp
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tên</th>
                      <th>Điểm</th>
                      <th>Kỹ năng</th>
                      <th>Đánh giá</th>
                      <th>Công việc hiện tại</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate, index) => {
                      const tech = candidate.technician || candidate;
                      const score = candidate.score || candidate.matchScore || 0;
                      const reason = candidate.reason || candidate.matchReason || '';

                      return (
                        <tr key={tech.technicianId || tech.id}>
                          <td>
                            <span className={`badge ${index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : 'bg-light text-dark'}`}>
                              {index + 1}
                            </span>
                          </td>
                          <td>
                            <div>
                              <strong>{tech.fullName || tech.name}</strong>
                              {index === 0 && (
                                <i className="bi bi-star-fill text-warning ms-2" title="Gợi ý tốt nhất"></i>
                              )}
                            </div>
                            <small className="text-muted">{tech.email}</small>
                          </td>
                          <td>
                            <span className="badge bg-primary">{score.toFixed(1)}</span>
                          </td>
                          <td>
                            <div style={{ maxWidth: '150px' }}>
                              {tech.skills && tech.skills.length > 0 ? (
                                tech.skills.slice(0, 2).map((skill, i) => (
                                  <span key={i} className="badge bg-info text-dark me-1 mb-1" style={{ fontSize: '0.75rem' }}>
                                    {skill.skillName || skill}
                                  </span>
                                ))
                              ) : (
                                <small className="text-muted">N/A</small>
                              )}
                            </div>
                          </td>
                          <td>
                            <div>
                              <i className="bi bi-star-fill text-warning"></i>{' '}
                              {tech.averageRating || tech.rating || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <small className="text-muted">
                              {tech.currentWorkload || 0} công việc
                            </small>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleSelect(tech)}
                            >
                              <i className="bi bi-check-lg me-1"></i>
                              Chọn
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Reason/Note */}
                {candidates[0]?.reason && (
                  <div className="alert alert-info mt-3">
                    <strong>
                      <i className="bi bi-info-circle me-2"></i>
                      Lý do gợi ý:
                    </strong>
                    <p className="mb-0 mt-2">{candidates[0].reason}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
