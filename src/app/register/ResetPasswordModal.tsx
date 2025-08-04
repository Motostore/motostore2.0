'use client';
import React from 'react';

// Define las props para el componente del modal
interface ResetPasswordModalProps {
  onClose: () => void;
}

export default function ResetPasswordModal({ onClose }: ResetPasswordModalProps) {
  // Manejador del evento de envío del formulario
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el correo de recuperación
    console.log('Formulario de recuperación enviado.');
    onClose(); // Cierra el modal después de enviar
  };

  return (
    // Contenedor principal del modal: ocupa toda la pantalla y tiene un fondo semi-transparente
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      {/* Contenedor del formulario del modal: la "ventana" pequeña */}
      <div className="relative bg-white rounded-lg p-8 shadow-lg max-w-sm w-full mx-4">
        {/* Botón para cerrar el modal */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          aria-label="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-bold text-center text-gray-900 mb-4">Recuperar Contraseña</h3>
        <p className="text-center text-gray-600 text-sm mb-6">Introduce tu email para restablecer tu contraseña.</p>

        {/* Reemplazado <form> por <div> para evitar el error de anidación */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Dirección de correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Dirección de correo electrónico"
            />
          </div>
          <button
            type="submit"
            className="w-full justify-center rounded-lg bg-gradient-to-r from-orange-500 to-orange-300 hover:from-orange-300 hover:to-orange-500 text-white px-3 py-2 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            Restablecer Contraseña
          </button>
          <div className="text-sm text-center mt-4">
             <a href="#" onClick={onClose} className="font-medium text-orange-600 hover:text-orange-500">
                Volver al inicio de sesión
             </a>
          </div>
        </form>
      </div>
    </div>
  );
}