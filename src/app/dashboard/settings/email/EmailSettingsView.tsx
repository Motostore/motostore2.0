// src/app/dashboard/settings/email/EmailSettingsView.tsx (CORREGIDO)
"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
    EnvelopeIcon, 
    ArrowRightIcon, 
    CheckCircleIcon,
    ShieldCheckIcon,
    PaperAirplaneIcon,
    ArrowPathIcon,
    ExclamationCircleIcon,
    KeyIcon // 💎 FIX: Agregado el import faltante
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

// --- Estados del Formulario ---
type FormStage = 'INPUT_EMAIL' | 'WAITING_CODE' | 'SUCCESS';

// --- Componente Principal ---
export default function EmailSettingsView() {
    const { data: session } = useSession();
    const currentEmail = session?.user?.email || 'usuario@motostore.com';

    const [stage, setStage] = useState<FormStage>('INPUT_EMAIL');
    const [newEmail, setNewEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const ICON_CLASS = "pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E33127]";
    const INPUT_CLASS = "w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-[#E33127] focus:ring-2 focus:ring-red-500/10 outline-none transition-all";

    const handleSendCode = () => {
        setError('');
        if (!newEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail.trim())) {
            setError("Por favor, introduce una dirección de correo válida.");
            toast.error("Correo inválido.");
            return;
        }

        setLoading(true);
        // Simulación de envío de código de verificación
        setTimeout(() => {
            setLoading(false);
            setStage('WAITING_CODE');
            toast.success(`Código enviado a ${newEmail}. Revisa tu bandeja de entrada.`);
        }, 1500);
    };

    const handleVerifyCode = () => {
        setError('');
        if (verificationCode !== '123456') { // Simulación de código correcto
            setError("Código incorrecto. Inténtalo de nuevo.");
            toast.error("Verificación fallida.");
            return;
        }

        setLoading(true);
        // Simulación de verificación y actualización en el backend
        setTimeout(() => {
            setLoading(false);
            setStage('SUCCESS');
            toast.success("✅ Correo actualizado exitosamente.");
        }, 1500);
    };

    const renderForm = () => {
        switch (stage) {
            case 'INPUT_EMAIL':
                return (
                    <>
                        <div className="relative group">
                            <EnvelopeIcon className={ICON_CLASS} />
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className={`${INPUT_CLASS} pl-10`}
                                placeholder="Nuevo correo electrónico"
                                disabled={loading}
                            />
                        </div>
                        <button 
                            onClick={handleSendCode}
                            disabled={loading || !newEmail}
                            className="flex items-center gap-2 px-5 py-3 bg-[#E33127] text-white rounded-xl font-bold shadow-md shadow-red-500/20 hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                            {loading ? "Enviando Código..." : "Enviar Código de Verificación"}
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </>
                );

            case 'WAITING_CODE':
                return (
                    <>
                        <div className="text-sm p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 flex items-center gap-2">
                            <ShieldCheckIcon className="w-5 h-5 flex-shrink-0" />
                            Se envió un código de 6 dígitos a **{newEmail}**. Por favor, revísalo y confírmalo aquí.
                        </div>

                        <div className="relative group">
                            <KeyIcon className={ICON_CLASS} />
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                                className={`${INPUT_CLASS} pl-10 text-center tracking-widest text-lg`}
                                placeholder="000000"
                                maxLength={6}
                                disabled={loading}
                            />
                        </div>

                        <div className='flex gap-3'>
                            <button 
                                onClick={handleVerifyCode}
                                disabled={loading || verificationCode.length !== 6}
                                className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-md shadow-slate-500/20 hover:bg-slate-700 transition-all disabled:opacity-50 flex-1"
                            >
                                {loading ? "Verificando..." : "Verificar Código"}
                                <ShieldCheckIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => setStage('INPUT_EMAIL')}
                                className="px-5 py-3 text-slate-600 rounded-xl hover:bg-slate-100 font-medium transition-colors"
                                disabled={loading}
                            >
                                Cambiar Correo
                            </button>
                        </div>
                    </>
                );

            case 'SUCCESS':
                return (
                    <div className="text-center p-6 bg-emerald-50 rounded-xl border border-emerald-200 shadow-lg space-y-4">
                        <CheckCircleIcon className="w-12 h-12 mx-auto text-emerald-500" />
                        <h3 className="text-2xl font-bold text-emerald-700">¡Actualizado!</h3>
                        <p className="text-emerald-700">Tu nuevo correo **{newEmail}** ha sido verificado y guardado.</p>
                        <button 
                            onClick={() => {setStage('INPUT_EMAIL'); setNewEmail('');}}
                            className="flex items-center gap-2 mx-auto mt-4 px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
                        >
                            <ArrowPathIcon className="w-5 h-5" />
                            Listo
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6 max-w-lg mx-auto">
            <Toaster />

            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <EnvelopeIcon className="w-5 h-5 text-[#E33127]" />
                Cambiar Correo Electrónico
            </h2>
            
            <div className="text-sm p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="font-medium text-slate-700">Correo Actual:</span> 
                <span className="font-bold text-slate-900 ml-2">{currentEmail}</span>
            </div>

            {error && (
                <div className="text-sm p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-center gap-2">
                    <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            <div className='space-y-4'>
                {renderForm()}
            </div>
        </div>
    );
}