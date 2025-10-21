import React from 'react';
import Modal from 'react-modal';

// Basic styling for the modal
const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'auto'
    },
};

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');

const MaintenanceJobModal = ({ isOpen, onRequestClose, job }) => {
    if (!job) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={customStyles}
            contentLabel="Maintenance Job Details"
        >
            <h2>Job Details for {job.vehiclePlate}</h2>
            <p><strong>Customer:</strong> {job.customerName}</p>
            <p><strong>Technician:</strong> {job.technician}</p>
            <p><strong>Service:</strong> {job.service}</p>
            <hr />
            <h4>Internal Notes</h4>
            <textarea style={{ width: '100%', minHeight: '100px' }}></textarea>
            <hr />
            <h4>Activity Log</h4>
            <ul>
                {job.history && job.history.map((entry, index) => (
                    <li key={index}>{entry}</li>
                ))}
            </ul>
            <button onClick={onRequestClose}>Close</button>
        </Modal>
    );
};

export default MaintenanceJobModal;
