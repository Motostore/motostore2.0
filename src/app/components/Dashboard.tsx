// src/app/components/Dashboard.tsx (VERSIÓN COMPATIBLE CON TU LOGIN ACTUAL)
"use client";

import { useSession } from "next-auth/react"; // USAMOS LA LIBRERÍA ESTÁNDAR
import Link from 'next/link'; 
import { useMemo } from "react";

// Definimos los roles aquí para no depender de archivos externos si no existen
const ALLOWED_WALLET_ROLES = [
  'SUPERUSER', 'ADMIN', 'DISTRIBUTOR', 'RESELLER', 
  'TAQUILLA', 'SUBTAQUILLA', 'SUSTAQUILLA', 'CLIENT'
];

export default function Dashboard() {
  // 1. Usamos el hook oficial que ya sabemos que funciona
  const { data: session, status } = useSession();
  
  // 2. Calculamos permisos
  const role = (session?.user as any)?.role?.toUpperCase();
  
  const canView = useMemo(() => {
    return ALLOWED_WALLET_ROLES.includes(role || '');
  }, [role]);

  // 3. Estado de Carga
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <p className="text-xl font-bold text-slate-400 animate-pulse">Cargando Dashboard...</p>
      </div>
    );
  }
  
  // 4. No hay sesión (No logueado)
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] p-10">
        <h2 className="text-3xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
        <p className="text-slate-600">Por favor, inicia sesión para acceder a este panel.</p>
        <Link href="/login" className="mt-6 bg-[#E33127] text-white py-3 px-6 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  // 5. Usuario Autenticado
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Bienvenido, <span className="text-[#E33127]">{session.user?.name}</span></h1>
        <p className="text-slate-500">Gestión general de tu cuenta.</p>
      </div>
      
      {/* Información del Perfil */}
      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
            <div>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Tu Rol Actual</p>
                <p className="text-lg font-bold text-[#E33127]">{role || 'INVITADO'}</p>
            </div>
            <div>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Correo Registrado</p>
                <p className="text-lg font-medium text-slate-800">{session.user?.email}</p>
            </div>
        </div>
      </div>
      
      {/* Contenido de Billetera (Condicional) */}
      {canView ? (
        <div className="bg-green-50 border border-green-200 shadow-sm rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-green-800 mb-2">Panel de Billetera y Saldo</h2>
          <p className="text-green-700 mb-4">Tienes permisos completos para gestionar finanzas.</p>
          {/* Aquí podrías importar el <SummaryWidget /> que hicimos antes si quisieras */}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 shadow-sm rounded-2xl p-8 flex items-start gap-4">
          <div>
            <h2 className="text-xl font-bold text-yellow-800 mb-1">Acceso Limitado</h2>
            <p className="text-yellow-700">Tu rol ({role}) no tiene permisos para ver la sección financiera.</p>
          </div>
        </div>
      )}
      
    </div>
  );
}
