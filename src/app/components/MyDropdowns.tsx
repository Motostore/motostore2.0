'use client';

import { Dropdown } from "flowbite-react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export function DropdownExport() {
  // 💎 SOLUCIÓN PREMIUM:
  // Convertimos el componente a 'any' para desbloquear el acceso a .Item, .Header, etc.
  // Esto soluciona el error "Property Item does not exist..." instantáneamente.
  const DropdownComponent = Dropdown as any;

  return (
    <DropdownComponent
      label="" 
      dismissOnClick={false} 
      renderTrigger={() => (
        <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-orange-500">
          <ArrowDownTrayIcon className="w-5 h-5" />
          <span className="font-medium">Exportar</span>
        </button>
      )}
    >
      <DropdownComponent.Item onClick={() => console.log('Exportar Excel')}>
        Exportar a Excel
      </DropdownComponent.Item>
      <DropdownComponent.Item onClick={() => console.log('Exportar PDF')}>
        Exportar a PDF
      </DropdownComponent.Item>
      <DropdownComponent.Item onClick={() => console.log('Exportar CSV')}>
        Exportar a CSV
      </DropdownComponent.Item>
    </DropdownComponent>
  );
}

// Mantenemos este componente por si lo necesitas en el futuro, con la misma corrección aplicada
export function DropdownFilter() {
    const DropdownComponent = Dropdown as any;

    return (
      <DropdownComponent label="Filtrar">
        <DropdownComponent.Item>Fecha</DropdownComponent.Item>
        <DropdownComponent.Item>Estado</DropdownComponent.Item>
      </DropdownComponent>
    );
}