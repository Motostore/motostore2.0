import React, { useEffect, useState } from 'react';
import { getCurrentSession } from '@/app/lib/app-session';
import { Session } from 'next-auth';
import { normalizeRole } from '@/app/lib/roles';

type User = {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
};

export default function UserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8080/api/v1/users');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error en la respuesta del servidor: ${response.status} - ${errorText}`);
            }
            const data: { content: User[] } = await response.json();
            setUsers(data.content);
        } catch (error: any) {
            console.error('Error al obtener usuarios:', error);
            setError(error.message || 'Ocurrió un error inesperado al cargar los usuarios.');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="p-4 text-center">Cargando usuarios...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Lista de Usuarios</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">ID</th>
                            <th className="py-3 px-6 text-left">Nombre</th>
                            <th className="py-3 px-6 text-left">Nombre de Usuario</th>
                            <th className="py-3 px-6 text-left">Email</th>
                            <th className="py-3 px-6 text-left">Rol</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{user.id}</td>
                                <td className="py-3 px-6 text-left">{user.name}</td>
                                <td className="py-3 px-6 text-left">{user.username}</td>
                                <td className="py-3 px-6 text-left">{user.email}</td>
                                <td className="py-3 px-6 text-left">{normalizeRole(user.role)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}