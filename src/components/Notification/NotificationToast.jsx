import { useNotification } from '../../context/NotificationContext';
import './NotificationToast.css';

const NotificationToast = () => {
  const { notification, hideNotification } = useNotification();

  if (!notification) return null;

  return (
    <div className={`notification-toast notification-${notification.type}`} role="alert" aria-live="polite">
      <span>{notification.message}</span>
      <button
        type="button"
        className="notification-close"
        onClick={hideNotification}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
};

export default NotificationToast;
