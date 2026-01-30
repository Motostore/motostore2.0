"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast"; 
import { fetchClientProfiles, createClientProfile } from "@/app/lib/streaming-profile";
import CreateAccountModal from "@/app/ui/streaming/create-modal";
import AdminView from "@/app/ui/streaming/admin-view";
import ClientView from "@/app/ui/streaming/client-view";

export type StreamingProfile = {
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
  clientDueDate?: string;
  providerDueDate?: string;
};

function StreamingContent() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<StreamingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔥 MODO ADMIN FORZADO: ACTIVADO (TRUE)
  // Esto te garantiza ver el Almacén y el botón "Cargar al Almacén"
  const FORCE_ADMIN = true; 

  const userRole = session?.user?.role || "CLIENT"; 
  const isAdmin = FORCE_ADMIN || ["SUPERUSER", "ADMIN", "RESELLER"].includes(userRole);

  const loadData = useCallback(async () => {
    if (status === "loading") return;
    
    // Si no hay sesión, no cargamos (a menos que estemos probando)
    if (!session?.user?.accessToken) {
        // setLoading(false); // Descomentar en producción
        // return;
    }

    try {
      setLoading(true);
      const res = await fetchClientProfiles(); 
      const dataList = Array.isArray(res) ? res : (res?.content ?? []);
      setItems(dataList);
    } catch (e) {
      console.error("Error cargando streaming:", e);
      toast.error("Error al cargar las cuentas.");
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async (data: any) => {
    if (!session?.user?.accessToken) {
        toast.error("⚠️ Sesión expirada. Recarga la página.");
        return;
    }

    const toastId = toast.loading("Guardando cuenta...");

    try {
      const newProfile = await createClientProfile(data, session.user.accessToken);
      setItems((prev) => [newProfile, ...prev]);
      toast.success("¡Cuenta creada correctamente!", { id: toastId });
      setIsModalOpen(false);
      
    } catch (error: any) {
      console.error(error);
      const msg = error.message || "Error desconocido";
      toast.error(`Error: ${msg}`, { id: toastId });
    }
  };

  if (status === "loading") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E33127]"></div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-fadeIn">
      <Toaster position="top-right" />

      {isAdmin && (
        <CreateAccountModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleSave} 
        />
      )}
      
      {isAdmin ? (
        <AdminView 
            items={items} 
            loading={loading} 
            loadData={loadData} 
            onAdd={() => setIsModalOpen(true)} 
        />
      ) : (
        <ClientView 
            items={items} 
            loading={loading} 
        />
      )}
    </div>
  );
}

export default function StreamingPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Cargando sistema...</div>}>
      <StreamingContent />
    </Suspense>
  );
}
