'use client';
import { createContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export const UserContext = createContext(null);

export const UserProvider = ({children}) => {

  const {data: session} = useSession();

  const [users, setUsers] = useState([]);

  const trackSession = session;

  useEffect(() => {
    if (trackSession) {
      fetchUsers();
    }
  }, [trackSession]);

  function getUsers() {
    if (trackSession) {
      fetchUsers()
    }
  }

  async function fetchUsers() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user.token}`
      }
    });

    if (response.ok) {
      const json = await response.json();
      setUsers(json);
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