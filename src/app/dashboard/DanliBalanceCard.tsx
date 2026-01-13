"use client";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // 1. Importamos la sesión

export default function DanliBalanceCard() {
  const { data: session } = useSession(); // 2. Sacamos los datos del usuario
  const [balance, setBalance] = useState("---");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si no hay usuario o token, no hacemos nada todavía
    if (!session?.user) return;

    // Obtenemos el token de la sesión
    // (A veces se llama accessToken, a veces token. Probamos ambos por seguridad)
    const token = (session.user as any).accessToken || (session.user as any).token;

    setLoading(true);

    // 3. Llamamos a la RUTA CORRECTA que conecta con Render
    // Usamos /api-proxy/ para que Next.js le pase el mensaje a Render
    fetch('/api-proxy/api/v1/danlipagos/balance', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // 4. ¡IMPORTANTÍSIMO! Enviamos el Token
      }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Error en la petición");
        return res.json();
      })
      .then(data => {
        // Render puede devolver { balance: 100 } o { data: { balance: 100 } }
        // Aseguramos capturar el dato correcto
        const valor = data.balance ?? data.data?.balance ?? data.saldo;
        
        if (valor !== undefined) {
          // Formateamos bonito el dinero (Ej: 1,250.00)
          const formateado = new Intl.NumberFormat('es-VE', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
          }).format(valor);
          setBalance(formateado);
        } else {
          setBalance("0.00");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error Danli:", err);
        setBalance("Offline");
        setLoading(false);
      });
  }, [session]); // Se ejecuta cuando cargue la sesión

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-blue-50 rounded-lg">
           <BanknotesIcon className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-sm font-bold text-gray-700">Saldo Danlipagos</h3>
      </div>
      <div className="truncate rounded-xl bg-gray-50 px-4 py-6 text-center">
        <span className={`text-2xl font-black ${loading ? 'text-gray-400' : 'text-emerald-600'}`}>
            {loading ? "..." : balance}
        </span>
        {!loading && balance !== "Offline" && (
            <span className="text-xs font-bold text-gray-400 ml-1">VES</span>
        )}
      </div>
    </div>
  );
}