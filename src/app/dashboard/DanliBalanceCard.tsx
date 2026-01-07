"use client";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export default function DanliBalanceCard() {
  const [balance, setBalance] = useState("---");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Llamamos a NUESTRO propio servidor (el puente), no al backend directo
    fetch('/api/proxy/danli')
      .then(res => res.json())
      .then(data => {
        if (data.balance) {
          setBalance(data.balance);
        } else {
          setBalance("Error");
        }
        setLoading(false);
      })
      .catch(() => {
        setBalance("Offline");
        setLoading(false);
      });
  }, []);

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
            {loading ? "Cargando..." : balance}
        </span>
        {!loading && balance !== "Error" && (
            <span className="text-xs font-bold text-gray-400 ml-1">VES</span>
        )}
      </div>
    </div>
  );
}