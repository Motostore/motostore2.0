"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { ArrowPathIcon, XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function RBACDebugPage() {
  const { data, status } = useSession();
  const role = String(data?.user?.role ?? "").toUpperCase();
  const isAuthenticated = status === "authenticated";

  // Estilos de color basados en el estado
  const statusColor = {
    authenticated: "text-emerald-600 border-emerald-300 bg-emerald-50",
    unauthenticated: "text-red-600 border-red-300 bg-red-50",
    loading: "text-slate-600 border-slate-300 bg-slate-50",
  }[status] || "text-slate-600 border-slate-300 bg-slate-50";

  return (
    <div className="max-w-xl mx-auto p-8 my-12 bg-white rounded-3xl shadow-2xl shadow-slate-300/50 border border-slate-100 font-sans">
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
        🐞 RBAC Debugger
      </h1>
      <p className="text-sm text-slate-500 mb-6 border-b pb-4">
        Herramienta de diagnóstico para verificar la sesión, el rol y los tokens.
      </p>

      {/* Estado de la Sesión */}
      <div className={`p-4 rounded-xl border font-bold text-sm flex items-center gap-3 ${statusColor} mb-6`}>
        {status === "loading" && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
        {status === "authenticated" && <CheckCircleIcon className="w-5 h-5" />}
        {status === "unauthenticated" && <XCircleIcon className="w-5 h-5" />}
        Estado de sesión: <span className="uppercase">{status}</span>
      </div>

      {/* Datos Crudos de la Sesión */}
      <h3 className="text-lg font-bold text-slate-700 mb-2">Datos de Sesión:</h3>
      <pre className="bg-slate-900 text-green-400 p-4 rounded-xl overflow-x-auto text-xs whitespace-pre-wrap shadow-inner">
        {JSON.stringify(
          { 
            user: data?.user, 
            accessToken: (data as any)?.accessToken ?? null 
          },
          null,
          2
        )}
      </pre>

      {/* Acciones */}
      <div className="mt-8 border-t border-slate-100 pt-6 space-y-3">
        {isAuthenticated ? (
          <>
            <div className="text-sm font-bold text-slate-700">
                ROL NORMALIZADO: <code className="bg-red-100 text-[#E33127] px-2 py-0.5 rounded uppercase">{role || "(vacío)"}</code>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4">
                <a href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">/dashboard</a>
                <a href="/dashboard/admin" className="text-sm font-medium text-blue-600 hover:underline">/dashboard/admin</a>
                <a href="/dashboard/super" className="text-sm font-medium text-blue-600 hover:underline">/dashboard/super</a>
            </div>

            <button 
                onClick={() => signOut()} 
                className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors mt-4 shadow-md"
            >
                Cerrar sesión
            </button>
          </>
        ) : (
          <button 
            onClick={() => signIn()} 
            className="w-full py-3 bg-[#E33127] text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
          >
            Iniciar sesión
          </button>
        )}
      </div>
    </div>
  );
}