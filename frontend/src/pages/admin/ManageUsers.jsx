import { useEffect, useState } from 'react';
import { apiRequest } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const ManageUsers = () => {
    const { user } = useAuth(); // the logged-in admin

    const [users, setUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadUsers = async (role) => {
        setLoading(true);
        try {
            let url = '/api/users';
            if (role) {
                url = url + '?role=' + role;
            }
            const data = await apiRequest(url);
            setUsers(data.users);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadUsers('');
    }, []);

    const handleFilterChange = (e) => {
        setRoleFilter(e.target.value);
        loadUsers(e.target.value);
    }

    const handleRoleChange = async (u, newRole) => {
        setError('');
        setSuccess('');
        try {
            await apiRequest('/api/users/' + u._id + '/role', 'PATCH', { role: newRole });
            setSuccess(u.name + ' is now a ' + newRole);
            loadUsers(roleFilter);
        } catch (err) {
            setError(err.message);
        }
    }

    const handleDelete = async (u) => {
        if (!window.confirm('Delete ' + u.name + '? This cannot be undone.')) {
            return;
        }
        setError('');
        setSuccess('');
        try {
            await apiRequest('/api/users/' + u._id, 'DELETE');
            setSuccess(u.name + ' deleted');
            loadUsers(roleFilter);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
                <h2>Users ({users.length})</h2>
                <select value={roleFilter} onChange={handleFilterChange} style={{ width: 'auto' }}>
                    <option value="">All roles</option>
                    <option value="student">Students</option>
                    <option value="teacher">Teachers</option>
                    <option value="admin">Admins</option>
                </select>
            </div>

            {error && <div className="error">{error}</div>}
            {success && <div className="success-msg">{success}</div>}

            {loading ? (
                <p>Loading users...</p>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => {
                                const isMe = u._id === user.id;
                                return (
                                    <tr key={u._id}>
                                        <td>{u.name} {isMe && <span className="muted">(you)</span>}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <select
                                                value={u.role}
                                                disabled={isMe}
                                                onChange={(e) => handleRoleChange(u, e.target.value)}
                                                style={{ width: 'auto' }}
                                            >
                                                <option value="student">student</option>
                                                <option value="teacher">teacher</option>
                                                <option value="admin">admin</option>
                                            </select>
                                        </td>
                                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button className="danger" disabled={isMe} onClick={() => handleDelete(u)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ManageUsers;