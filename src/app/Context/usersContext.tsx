'use client';

import { createContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";

// 💎 CORRECCIÓN 1: Inicializamos el contexto con 'any' para evitar quejas de TS
export const UserContext = createContext<any>(null);

// 💎 CORRECCIÓN 2: Definimos la interfaz para las props
interface UserProviderProps {
  children: ReactNode;
}

// Aplicamos la interfaz a las props
export const UserProvider = ({ children }: UserProviderProps) => {

  const { data: session } = useSession();

  // 💎 CORRECCIÓN 3: Tipamos el estado como array de objetos (any[])
  const [users, setUsers] = useState<any[]>([]);

  const trackSession = session;

  useEffect(() => {
    if (trackSession) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackSession]);

  function getUsers() {
    if (trackSession) {
      fetchUsers()
    }
  }

  async function fetchUsers() {
    // 💎 CORRECCIÓN 4: Protección extra para el token
    if (!session?.user?.token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`
        }
      });

      if (response.ok) {
        const json = await response.json();
        // Aseguramos que sea un array
        setUsers(Array.isArray(json) ? json : []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  return (
    <UserContext.Provider
      value={{
        users,
        setUsers,
        getUsers
      }}>
      {children}
    </UserContext.Provider>
  );
}