// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { firestore } from '../config/firebase';
import { collection, query, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { FaUsers, FaCar, FaPlus, FaTrash } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users'); // 'users' o 'vehicles'
    const [newUserEmail, setNewUserEmail] = useState({}); // { plate: email }

    useEffect(() => {
        // Suscribirse a Usuarios
        const qUsers = query(collection(firestore, 'users'));
        const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
        });

        // Suscribirse a Vehículos
        const qVehicles = query(collection(firestore, 'vehicles'));
        const unsubscribeVehicles = onSnapshot(qVehicles, (snapshot) => {
            const vehiclesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setVehicles(vehiclesData);
            setLoading(false);
        });

        return () => {
            unsubscribeUsers();
            unsubscribeVehicles();
        };
    }, []);

    const handleUpdateStatus = async (userId, newStatus) => {
        try {
            await updateDoc(doc(firestore, 'users', userId), { status: newStatus });
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            alert("Error al actualizar el estado del usuario.");
        }
    };

    const handleAuthorizeUser = async (plate) => {
        const email = newUserEmail[plate]?.trim();
        if (!email) return;

        const targetUser = users.find(u => u.email === email);
        if (!targetUser) {
            alert("Usuario no encontrado.");
            return;
        }

        try {
            // 1. Actualizar Registro de Vehículo
            await updateDoc(doc(firestore, 'vehicles', plate), {
                authorizedUsers: arrayUnion(targetUser.id)
            });

            // 2. Actualizar Perfil de Usuario
            await updateDoc(doc(firestore, 'users', targetUser.id), {
                vehicles: arrayUnion(plate)
            });

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
        const user = users.find(u => u.id === uid);
        return user ? user.email : "Usuario desconocido";
    };

    if (loading) return <div className="admin-status">Cargando datos del sistema...</div>;

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
