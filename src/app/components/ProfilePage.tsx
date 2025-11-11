'use client';

import { useContext } from 'react';
import { useSession } from 'next-auth/react';
import { ProfileContext } from '@/app/Context/profileContext';

export default function ProfilePage() {
  const ctx = useContext(ProfileContext);
  // Evita crashear si no hay provider (ctx === null)
  const option = ctx?.option;

  const { data: session } = useSession();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Perfil</h1>
      <pre className="text-sm bg-gray-100 p-3 rounded">
        {JSON.stringify({ user: session?.user, option }, null, 2)}
      </pre>
    </div>
  );
}

