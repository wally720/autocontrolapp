// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { firestore } from '../config/firebase';
import {
    collection,
    query,
    where,
    limit,
    startAfter,
    getDocs,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    onSnapshot,
    documentId
} from 'firebase/firestore';
import { FaUsers, FaCar, FaPlus, FaTrash } from 'react-icons/fa';
import './AdminDashboard.css';
import ConfirmModal from '../components/Modal/ConfirmModal';
import { useNotification } from '../context/NotificationContext';

const AdminDashboard = () => {
    const { showNotification } = useNotification();
    // Estado para Usuarios (Paginado y Filtrado)
    const [users, setUsers] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [filterStatus, setFilterStatus] = useState('pending'); // 'pending', 'approved', 'blocked', 'all'
    const [hasMoreUsers, setHasMoreUsers] = useState(true);

    // Estado para Vehículos y Caché de Usuarios
    const [vehicles, setVehicles] = useState([]);
    const [userCache, setUserCache] = useState({}); // { uid: email }
    const [loadingVehicles, setLoadingVehicles] = useState(true);

    // UI State
    const [activeTab, setActiveTab] = useState('users'); // 'users' o 'vehicles'
    const [newUserEmail, setNewUserEmail] = useState({}); // { plate: email }
    const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
    const [pendingRevoke, setPendingRevoke] = useState(null); // { plate, userId }

    // Constantes
    const USERS_PER_PAGE = 20;

    // 1. Efecto para Cargar Usuarios (Filtrado y Paginado)
    const fetchUsers = async (loadMore = false) => {
        setLoadingUsers(true);
        try {
            let q = collection(firestore, 'users');

            // Aplicar filtros
            const constraints = [];
            if (filterStatus !== 'all') {
                constraints.push(where('status', '==', filterStatus));
            }

            // Ordenamiento (opcional, por defecto es ID, pero idealmente por fecha si existiera)
            // constraints.push(orderBy('createdAt', 'desc'));

            // Paginación
            if (loadMore && lastVisible) {
                constraints.push(startAfter(lastVisible));
            }

            // Límite
            constraints.push(limit(USERS_PER_PAGE));

            const finalQuery = query(q, ...constraints);
            const snapshot = await getDocs(finalQuery);

            const newUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (loadMore) {
                setUsers(prev => [...prev, ...newUsers]);
            } else {
                setUsers(newUsers);
            }

            setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            setHasMoreUsers(snapshot.docs.length === USERS_PER_PAGE);

            // Actualizar caché con los usuarios cargados
            const newCache = {};
            newUsers.forEach(u => {
                newCache[u.id] = u.email;
            });
            setUserCache(prev => ({ ...prev, ...newCache }));

        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            showNotification('Error al cargar la lista de usuarios.', 'error');
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        setUsers([]);
        setLastVisible(null);
        setHasMoreUsers(true);
        fetchUsers(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus]);

    // 2. Efecto para Suscribirse a Vehículos
    useEffect(() => {
        const qVehicles = query(collection(firestore, 'vehicles'));
        const unsubscribe = onSnapshot(qVehicles, (snapshot) => {
            const vehiclesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setVehicles(vehiclesData);
            setLoadingVehicles(false);
        });

        return () => unsubscribe();
    }, []);

    // 3. Efecto para Cargar Usuarios de Vehículos (Bajo Demanda)
    useEffect(() => {
        const loadMissingUsers = async () => {
            if (loadingVehicles) return;

            const neededIds = new Set();
            vehicles.forEach(v => {
                if (v.ownerId && !userCache[v.ownerId]) neededIds.add(v.ownerId);
                if (v.authorizedUsers) {
                    v.authorizedUsers.forEach(uid => {
                        if (!userCache[uid]) neededIds.add(uid);
                    });
                }
            });

            if (neededIds.size === 0) return;

            const idsArray = Array.from(neededIds);
            // Firestore 'in' limitation: max 30 items (sometimes 10 depending on query type, safe limit 10)
            const CHUNK_SIZE = 10;
            const newCache = {};

            for (let i = 0; i < idsArray.length; i += CHUNK_SIZE) {
                const chunk = idsArray.slice(i, i + CHUNK_SIZE);
                try {
                    const q = query(collection(firestore, 'users'), where(documentId(), 'in', chunk));
                    const snapshot = await getDocs(q);
                    snapshot.forEach(doc => {
                        newCache[doc.id] = doc.data().email;
                    });
                } catch (error) {
                    console.error("Error cargando usuarios de vehículos:", error);
                }
            }

            if (Object.keys(newCache).length > 0) {
                setUserCache(prev => ({ ...prev, ...newCache }));
            }
        };

        loadMissingUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Se omite userCache para evitar ciclos al resolver usuarios faltantes.
    }, [vehicles, loadingVehicles]);

    const handleUpdateStatus = async (userId, newStatus) => {
        try {
            await updateDoc(doc(firestore, 'users', userId), { status: newStatus });

            // Actualizar estado local
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, status: newStatus } : u
            ));

            // Si estamos filtrando y el estado cambió, podríamos quitarlo de la lista
            // pero para UX a veces es mejor dejarlo y que el usuario vea el cambio
            if (filterStatus !== 'all' && filterStatus !== newStatus) {
                 setUsers(prev => prev.filter(u => u.id !== userId));
            }

        } catch (error) {
            console.error("Error al actualizar estado:", error);
            showNotification('Error al actualizar el estado del usuario.', 'error');
        }
    };

    const handleAuthorizeUser = async (plate) => {
        const email = newUserEmail[plate]?.trim();
        if (!email) return;

        try {
            // Búsqueda Directa en Firestore (Segura y Eficiente)
            const q = query(collection(firestore, 'users'), where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                showNotification('Usuario no encontrado.', 'error');
                return;
            }

            const targetUserDoc = querySnapshot.docs[0];
            const targetUser = { id: targetUserDoc.id, ...targetUserDoc.data() };

            // 1. Actualizar Registro de Vehículo
            await updateDoc(doc(firestore, 'vehicles', plate), {
                authorizedUsers: arrayUnion(targetUser.id)
            });

            // 2. Actualizar Perfil de Usuario
            await updateDoc(doc(firestore, 'users', targetUser.id), {
                vehicles: arrayUnion(plate)
            });

            // Actualizar caché local para que se refleje inmediatamente
            setUserCache(prev => ({ ...prev, [targetUser.id]: targetUser.email }));

            setNewUserEmail(prev => ({ ...prev, [plate]: '' }));
            showNotification(`Acceso concedido a ${email} para la placa ${plate}.`, 'success');
        } catch (error) {
            console.error("Error al autorizar:", error);
            showNotification('Error al conceder acceso.', 'error');
        }
    };

    const handleRevokeAccess = (plate, userId) => {
        setPendingRevoke({ plate, userId });
        setIsRevokeModalOpen(true);
    };

    const confirmRevokeAccess = async () => {
        if (!pendingRevoke) return;
        const { plate, userId } = pendingRevoke;

        try {
            // 1. Quitar del Vehículo
            await updateDoc(doc(firestore, 'vehicles', plate), {
                authorizedUsers: arrayRemove(userId)
            });

            // 2. Quitar del Perfil del Usuario
            await updateDoc(doc(firestore, 'users', userId), {
                vehicles: arrayRemove(plate)
            });
            setIsRevokeModalOpen(false);
            setPendingRevoke(null);
            showNotification('Acceso revocado correctamente.', 'success');
        } catch (error) {
            console.error("Error al revocar acceso:", error);
            showNotification('Error al revocar el acceso.', 'error');
        }
    };

    const cancelRevokeAccess = () => {
        setIsRevokeModalOpen(false);
        setPendingRevoke(null);
    };

    const getUserEmail = (uid) => {
        return userCache[uid] || "Cargando...";
    };

    if (loadingVehicles && activeTab === 'vehicles') return <div className="admin-status">Cargando vehículos...</div>;

    return (
        <div className="admin-container">
            <header className="admin-hero">
                <p className="admin-kicker">Consola de control</p>
                <h1>Panel de Administración</h1>
                <p>Supervisá accesos, estados de usuarios y permisos vehiculares desde una superficie segura.</p>
            </header>

            <ConfirmModal
                isOpen={isRevokeModalOpen}
                title="Revocar acceso"
                message="¿Seguro que quieres revocar el acceso a este usuario?"
                onConfirm={confirmRevokeAccess}
                onCancel={cancelRevokeAccess}
            />

            <div className="admin-tabs">
                <button
                    className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <FaUsers /> Usuarios
                </button>
                <button
                    className={`tab-btn ${activeTab === 'vehicles' ? 'active' : ''}`}
                    onClick={() => setActiveTab('vehicles')}
                >
                    <FaCar /> Vehículos
                </button>
            </div>

            {activeTab === 'users' ? (
                <div className="tab-content transition-in">
                    <div className="filters-bar">
                        <label>Estado: </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="status-filter"
                        >
                            <option value="pending">Pendientes</option>
                            <option value="approved">Aprobados</option>
                            <option value="blocked">Bloqueados</option>
                            <option value="all">Todos</option>
                        </select>
                    </div>

                    <div className="admin-table-shell">
                        <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Estado</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`status-badge status-${user.status}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>{user.role}</td>
                                    <td>
                                        <div className="action-btns">
                                            {user.status !== 'approved' && (
                                                <button className="admin-btn approve" onClick={() => handleUpdateStatus(user.id, 'approved')}>Aprobar</button>
                                            )}
                                            {user.status !== 'blocked' && (
                                                <button className="admin-btn block" onClick={() => handleUpdateStatus(user.id, 'blocked')}>Bloquear</button>
                                            )}
                                            {user.status !== 'pending' && user.status !== 'blocked' && (
                                                <button className="admin-btn pending" onClick={() => handleUpdateStatus(user.id, 'pending')}>Pendiente</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>

                    {users.length === 0 && !loadingUsers && (
                        <div className="no-data">No se encontraron usuarios con este estado.</div>
                    )}

                    {loadingUsers && <div className="loading-indicator">Cargando usuarios...</div>}

                    {hasMoreUsers && !loadingUsers && (
                        <button className="load-more-btn" onClick={() => fetchUsers(true)}>
                            Cargar más usuarios
                        </button>
                    )}
                </div>
            ) : (
                <div className="tab-content transition-in">
                    <div className="admin-table-shell">
                        <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Placa</th>
                                <th>Propietario</th>
                                <th>Usuarios Autorizados</th>
                                <th>Añadir Acceso</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map(v => (
                                <tr key={v.id}>
                                    <td className="plate-cell">{v.id}</td>
                                    <td>{getUserEmail(v.ownerId)}</td>
                                    <td>
                                        <div className="authorized-list">
                                            {v.authorizedUsers?.map(uid => (
                                                <div key={uid} className="authorized-tag">
                                                    <span>{getUserEmail(uid)}</span>
                                                    {uid !== v.ownerId && (
                                                        <button onClick={() => handleRevokeAccess(v.id, uid)} className="revoke-btn" title="Revocar acceso">
                                                            <FaTrash size={10} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="add-access-form">
                                            <input
                                                type="email"
                                                placeholder="Email de usuario"
                                                value={newUserEmail[v.id] || ''}
                                                onChange={(e) => setNewUserEmail(prev => ({ ...prev, [v.id]: e.target.value }))}
                                            />
                                            <button onClick={() => handleAuthorizeUser(v.id)} className="add-btn">
                                                <FaPlus />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};


export default AdminDashboard;
