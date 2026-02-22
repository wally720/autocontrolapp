// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
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

const AdminDashboard = () => {
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
            alert("Error al cargar la lista de usuarios.");
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
    }, [vehicles, loadingVehicles]); // Intentionally omitting userCache to avoid infinite loop if user not found

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
            alert("Error al actualizar el estado del usuario.");
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
                alert("Usuario no encontrado.");
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
            alert(`Acceso concedido a ${email} para la placa ${plate}`);
        } catch (error) {
            console.error("Error al autorizar:", error);
            alert("Error al conceder acceso.");
        }
    };

    const handleRevokeAccess = async (plate, userId) => {
        if (!window.confirm("¿Seguro que quieres revocar el acceso a este usuario?")) return;

        try {
            // 1. Quitar del Vehículo
            await updateDoc(doc(firestore, 'vehicles', plate), {
                authorizedUsers: arrayRemove(userId)
            });

            // 2. Quitar del Perfil del Usuario
            await updateDoc(doc(firestore, 'users', userId), {
                vehicles: arrayRemove(plate)
            });
        } catch (error) {
            console.error("Error al revocar acceso:", error);
            alert("Error al revocar el acceso.");
        }
    };

    const getUserEmail = (uid) => {
        return userCache[uid] || "Cargando...";
    };

    if (loadingVehicles && activeTab === 'vehicles') return <div className="admin-status">Cargando vehículos...</div>;

    return (
        <div className="admin-container">
            <h1>Panel de Administración</h1>

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
            )}
        </div>
    );
};


export default AdminDashboard;
