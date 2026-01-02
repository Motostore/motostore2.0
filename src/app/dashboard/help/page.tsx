'use client';

import { LifebuoyIcon, BookOpenIcon, ChatBubbleLeftRightIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* ENCABEZADO */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
                <LifebuoyIcon className="w-8 h-8 text-[#E33127]" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Centro de <span className="text-[#E33127]">Ayuda</span>
                </h1>
                <p className="text-slate-500 font-medium text-sm">
                    Soporte, guías y asistencia técnica.
                </p>
            </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 gap-6">
        
        {/* TARJETA DE INFORMACIÓN PRINCIPAL */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <BookOpenIcon className="w-6 h-6 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-800">Bienvenido a la Plataforma</h2>
            </div>
            
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4">
                <p>
                    Bienvenido al sistema de gestión de <strong>Moto Store</strong>. Esta plataforma está diseñada para facilitar tus operaciones diarias como distribuidor, permitiéndote administrar tu red de usuarios, gestionar tu saldo y realizar compras de manera eficiente y segura.
                </p>
                <p>
                    <strong>¿Qué puedes hacer aquí?</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 marker:text-[#E33127]">
                    <li><strong>Recargas:</strong> Reporta tus pagos para acreditar saldo a tu billetera inmediatamente.</li>
                    <li><strong>Usuarios:</strong> Crea y administra cuentas para tus clientes o sub-distribuidores.</li>
                    <li><strong>Transacciones:</strong> Lleva un control detallado de todos tus movimientos financieros.</li>
                    <li><strong>Reportes:</strong> Visualiza tus utilidades y el rendimiento de tu red.</li>
                </ul>
                <p className="text-sm bg-slate-50 p-4 rounded-lg border border-slate-100 mt-4">
                    <strong>Nota Importante:</strong> Recuerda que todas las operaciones de recarga pueden tomar unos minutos en validarse. Si tienes algún inconveniente con una transacción, ten a la mano el ID de referencia.
                </p>
            </div>
        </div>

        {/* SECCIONES DE SOPORTE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tarjeta de Soporte Técnico */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4 transition-all hover:shadow-md">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <ChatBubbleLeftRightIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-blue-900 text-sm">Soporte Técnico</h3>
                    <p className="text-xs text-blue-700/80 mt-1 mb-3 leading-relaxed">
                        ¿Problemas con el sistema o errores en la plataforma? Contacta a nuestro equipo de desarrollo.
                    </p>
                    <button className="text-xs font-black text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2">
                        Contactar Soporte &rarr;
                    </button>
                </div>
            </div>

            {/* Tarjeta de Dudas Administrativas */}
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-start gap-4 transition-all hover:shadow-md">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <QuestionMarkCircleIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-emerald-900 text-sm">Pagos y Facturación</h3>
                    <p className="text-xs text-emerald-700/80 mt-1 mb-3 leading-relaxed">
                        Consultas sobre recargas pendientes, comisiones o facturación de servicios.
                    </p>
                    <button className="text-xs font-black text-emerald-600 hover:text-emerald-800 underline decoration-2 underline-offset-2">
                        Hablar con Administración &rarr;
                    </button>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}