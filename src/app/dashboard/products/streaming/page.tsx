"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSession } from "next-auth/react";
import { fetchClientProfiles, createClientProfile } from "@/app/lib/streaming-profile";
import CreateAccountModal from "@/app/ui/streaming/create-modal";
import AdminView from "@/app/ui/streaming/admin-view";
import ClientView from "@/app/ui/streaming/client-view";

// Definimos el tipo de dato
type StreamingProfile = {
  id: number | string;
  provider?: string | null;
  category?: string | null;
  user?: string | null;
  key?: string | null;
  dueDate: string;
  status?: boolean;
  busy?: boolean;
  cost?: number;
  price?: number;
  type?: string;
};

function StreamingContent() {
  // 1. OBTENER DATOS REALES DE LA SESIÓN
  const { data: session, status } = useSession();
  
  const [items, setItems] = useState<StreamingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. DETERMINAR SI ES ADMIN REALMENTE
  // Verifica si el rol es ADMIN o SUPERUSER
  const userRole = session?.user?.role || "CLIENT"; 
  const isAdmin = userRole === "ADMIN" || userRole === "SUPERUSER";

  const loadData = useCallback(async () => {
    // Esperamos a que la sesión cargue
    if (status === "loading") return;
    
    // Si no tiene token, no cargamos nada
    if (!session?.user?.accessToken) {
        setLoading(false);
        return;
    }

    try {
      setLoading(true);
      const res = await fetchClientProfiles(); 
      setItems(res?.content ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => { loadData(); }, [loadData]);

  // 3. GUARDADO REAL EN BASE DE DATOS
  const handleSave = async (data: any) => {
    if (!session?.user?.accessToken) return alert("⚠️ Error de sesión: No se encontró el token. Recarga la página.");

    try {
      // Llamada al Backend
      const newProfile = await createClientProfile(data, session.user.accessToken);
      
      // Si todo sale bien, actualizamos la tabla visualmente
      setItems((prev) => [newProfile, ...prev]);
      alert("✅ ¡Cuenta guardada correctamente!");
      
    } catch (error: any) {
      console.error(error);
      
      // 🔥 CORRECCIÓN IMPORTANTE:
      // Ahora la alerta te dirá la verdad del error (404, 500, etc)
      alert(`❌ Error del Servidor: ${error.message}`);
    }
  };

  // Si está cargando la sesión, mostramos spinner
  if (status === "loading") return <div className="p-10 text-center">Verificando permisos...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Solo renderizamos el modal si es Admin */}
      {isAdmin && (
        <CreateAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
      )}
      
      {/* 4. SWITCH DE SEGURIDAD REAL */}
      {isAdmin ? (
        <AdminView items={items} loading={loading} loadData={loadData} onAdd={() => setIsModalOpen(true)} />
      ) : (
        <ClientView items={items} loading={loading} />
      )}
    </div>
  );
}

export default function StreamingPage() {
  return (
    <Suspense fallback={<div>Cargando sistema...</div>}>
      <StreamingContent />
    </Suspense>
  );
}