import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{title}</h2>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
                    <button className="btn-confirm" onClick={onConfirm}>Confirmar</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
