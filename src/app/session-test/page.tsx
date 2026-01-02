'use client';

import { useSession, signOut } from "next-auth/react";

export default function SessionTestPage() {
  const { data: session, status } = useSession();
  return (
    <main style={{ padding: 24 }}>
      <h1>Session Test</h1>
      <p>status: {status}</p>
      <pre style={{ background: "#111", color: "#0f0", padding: 12 }}>
        {JSON.stringify(session, null, 2)}
      </pre>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        style={{ marginTop: 12, padding: 8, border: "1px solid #ccc" }}
      >
        Cerrar sesión
      </button>
    </main>
  );
}
