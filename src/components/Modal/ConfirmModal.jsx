import './ConfirmModal.css';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    const modalRef = useRef(null);
    const previousActiveElementRef = useRef(null);
    const onCancelRef = useRef(onCancel);
    const titleId = useId();
    const descriptionId = useId();
    onCancelRef.current = onCancel;

    useEffect(() => {
        if (!isOpen || typeof document === 'undefined') return undefined;

        previousActiveElementRef.current = document.activeElement;
        modalRef.current?.querySelector('.btn-cancel')?.focus();

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onCancelRef.current();
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            previousActiveElementRef.current?.focus?.();
            previousActiveElementRef.current = null;
        };
    }, [isOpen]);

    if (!isOpen || typeof document === 'undefined' || !document.body) return null;

    return createPortal(
        <div className="modal-overlay" onClick={(event) => {
            if (event.target === event.currentTarget) onCancel();
        }}>
            <div
                ref={modalRef}
                className="modal-content"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
            >
                <div className="modal-header">
                    <h2 id={titleId}>{title}</h2>
                </div>
                <div className="modal-body">
                    <p id={descriptionId}>{message}</p>
                </div>
                <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={onCancel}>Cancelar</button>
                    <button type="button" className="btn-confirm" onClick={onConfirm}>Confirmar</button>
                </div>
            </div>
        </div>
        , document.body
    );
};

export default ConfirmModal;
