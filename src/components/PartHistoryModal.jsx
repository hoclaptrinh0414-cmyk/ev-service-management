import React from 'react';
import Modal from 'react-modal';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '2rem'
    },
};

Modal.setAppElement('#root');

const PartHistoryModal = ({ isOpen, onRequestClose, part }) => {
    if (!part) return null;

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles} contentLabel="Part History">
            <h2>History for {part.name}</h2>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {part.history && part.history.length > 0 ? (
                        part.history.map((entry, index) => (
                            <tr key={index}>
                                <td>{new Date(entry.date).toLocaleString()}</td>
                                <td>
                                    <span className={`badge bg-${entry.type === 'in' ? 'success' : 'warning'}`}>
                                        {entry.type === 'in' ? 'Stock In' : 'Stock Out'}
                                    </span>
                                </td>
                                <td>{entry.quantity}</td>
                                <td>{entry.notes}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center">No history found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="mt-4 d-flex justify-content-end">
                <button type="button" className="btn btn-secondary" onClick={onRequestClose}>Close</button>
            </div>
        </Modal>
    );
};

export default PartHistoryModal;
