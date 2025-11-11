"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function RBACDebugPage() {
  const { data, status } = useSession();
  const role = String(data?.user?.role ?? "").toUpperCase();

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>RBAC Debug</h1>

      <p><b>Estado sesión:</b> {status}</p>
      <pre style={{ background: "#111", color: "#0f0", padding: 12, borderRadius: 8 }}>
        {JSON.stringify(
          { user: data?.user, accessToken: (data as any)?.accessToken ?? null },
          null,
          2
        )}
      </pre>

      {status !== "authenticated" ? (
        <button onClick={() => signIn()} style={{ padding: 10 }}>Iniciar sesión</button>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          <div><b>ROL NORMALIZADO:</b> {role || "(vacío)"}</div>
          <a href="/dashboard" style={{ color: "#0a7" }}>/dashboard</a>
          <a href="/dashboard/admin" style={{ color: "#0a7" }}>/dashboard/admin</a>
          <a href="/dashboard/super" style={{ color: "#0a7" }}>/dashboard/super</a>
          <button onClick={() => signOut()} style={{ padding: 10, marginTop: 8 }}>Cerrar sesión</button>
        </div>
      )}
    </div>
  );
}
