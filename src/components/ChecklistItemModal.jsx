// src/components/ChecklistItemModal.jsx
import React, { useState, useEffect } from 'react';

/**
 * Modal for completing or skipping a checklist item.
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Function to call when closing the modal.
 * @param {function} props.onSubmit - Function to call when submitting the form.
 * @param {Object} props.item - The checklist item being actioned.
 * @param {string} props.mode - 'complete' or 'skip'.
 * @param {boolean} props.isLoading - Flag for loading state.
 */
export default function ChecklistItemModal({ isOpen, onClose, onSubmit, item, mode, isLoading }) {
  const [notes, setNotes] = useState('');
  const [photoUrls, setPhotoUrls] = useState('');
  const [skipReason, setSkipReason] = useState('');

  useEffect(() => {
    // Reset form when item or mode changes
    if (item) {
      setNotes(item.notes || '');
      setPhotoUrls(item.photoUrls?.join(', ') || '');
      setSkipReason('');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'complete') {
      const urls = photoUrls.split(',').map(url => url.trim()).filter(url => url);
      onSubmit({ notes, photoUrls: urls });
    } else if (mode === 'skip') {
      onSubmit({ skipReason });
    }
  };

  const isCompleteMode = mode === 'complete';
  const title = isCompleteMode ? `Complete: ${item.title}` : `Skip: ${item.title}`;

  return (
    <div className="modal-backdrop" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal" style={{ display: 'block' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">{title}</h5>
                <button type="button" className="btn-close" onClick={onClose} disabled={isLoading}></button>
              </div>
              <div className="modal-body">
                {isCompleteMode ? (
                  <>
                    <div className="mb-3">
                      <label htmlFor="notes" className="form-label">Notes</label>
                      <textarea
                        id="notes"
                        className="form-control"
                        rows="4"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any relevant notes here..."
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="photoUrls" className="form-label">Photo URLs</label>
                      <input
                        type="text"
                        id="photoUrls"
                        className="form-control"
                        value={photoUrls}
                        onChange={(e) => setPhotoUrls(e.target.value)}
                        placeholder="e.g., https://.../img1.jpg, https://.../img2.jpg"
                      />
                      <div className="form-text">
                        Provide comma-separated URLs for photos. A file uploader would be implemented here in a real scenario.
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mb-3">
                    <label htmlFor="skipReason" className="form-label">Reason for Skipping</label>
                    <textarea
                      id="skipReason"
                      className="form-control"
                      rows="4"
                      value={skipReason}
                      onChange={(e) => setSkipReason(e.target.value)}
                      placeholder="e.g., Customer declined optional service."
                      required
                    ></textarea>
                    <div className="form-text text-warning">
                      You are skipping an optional item. This action will be logged.
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    isCompleteMode ? 'Submit Completion' : 'Confirm Skip'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
