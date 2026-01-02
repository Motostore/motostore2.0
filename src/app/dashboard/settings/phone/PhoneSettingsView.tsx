"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
    DevicePhoneMobileIcon, 
    ChatBubbleLeftRightIcon, 
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    PaperAirplaneIcon,
    CheckBadgeIcon,
    KeyIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

type FormStage = 'INPUT_PHONE' | 'WAITING_CODE' | 'SUCCESS';

export default function PhoneSettingsView() {
    const { data: session } = useSession();
    const currentPhone = session?.user?.phone || ''; 
    const isInitiallyVerified = !!currentPhone; 

    const [stage, setStage] = useState<FormStage>('INPUT_PHONE');
    const [countryCode, setCountryCode] = useState('+58');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [preference, setPreference] = useState<'WHATSAPP' | 'SMS'>('WHATSAPP');

    const fullNumber = `${countryCode} ${phoneNumber}`;

    const handleSendCode = async () => {
        if (!phoneNumber || phoneNumber.length < 7) {
            toast.error("Por favor, ingresa un número válido.");
            return;
        }
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        setStage('WAITING_CODE');
        toast.success(`Código enviado a ${fullNumber} vía ${preference}.`);
    };

    const handleVerifyCode = async () => {
        if (verificationCode !== '0000') {
            toast.error("Código incorrecto. Prueba con 0000.");
            return;
        }
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        setStage('SUCCESS');
        toast.success("✅ Número verificado exitosamente.");
    };

    const handleReset = () => {
        setStage('INPUT_PHONE');
        setPhoneNumber('');
        setVerificationCode('');
    };

    const renderStageContent = () => {
        switch (stage) {
            case 'INPUT_PHONE':
                return (
                    <div className="space-y-5 animate-in slide-in-from-left-4 duration-300">
                        <div className="grid grid-cols-4 gap-3">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">CÓDIGO</label>
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-center"
                                    disabled={loading}
                                >
                                    <option value="+58">🇻🇪 +58</option>
                                    <option value="+1">🇺🇸 +1</option>
                                    <option value="+57">🇨🇴 +57</option>
                                    <option value="+34">🇪🇸 +34</option>
                                    <option value="+507">🇵🇦 +507</option>
                                </select>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">NÚMERO MÓVIL</label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full p-3 pl-4 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-mono tracking-wide text-lg placeholder:text-slate-300"
                                    placeholder="412 000 0000"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleSendCode}
                            disabled={loading || phoneNumber.length < 7}
                            className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-[#E33127] text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-700 hover:shadow-red-600/30 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                            {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PaperAirplaneIcon className="w-5 h-5" />}
                            {loading ? "Enviando Código..." : "Enviar Código de Verificación"}
                        </button>
                    </div>
                );
            case 'WAITING_CODE':
                return (
                    <div className="space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm border border-blue-100 flex gap-3 items-start">
                            <ShieldCheckIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">Código enviado</p>
                                <p className="opacity-90">Hemos enviado un código de 4 dígitos al <strong>{fullNumber}</strong>.</p>
                            </div>
                        </div>
                        <div className="relative max-w-[200px] mx-auto">
                            <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.slice(0, 4))}
                                className="w-full p-3 pl-12 rounded-xl border-2 border-slate-300 text-slate-900 focus:border-[#E33127] outline-none transition-all font-mono tracking-[0.5em] text-center text-xl"
                                placeholder="0000"
                                maxLength={4}
                                disabled={loading}
                            />
                        </div>
                        <div className='flex gap-3'>
                            <button 
                                onClick={handleVerifyCode}
                                disabled={loading || verificationCode.length !== 4}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50"
                            >
                                {loading ? "Verificando..." : "Confirmar"}
                            </button>
                            <button 
                                onClick={() => setStage('INPUT_PHONE')}
                                className="px-5 py-3 text-slate-500 hover:text-slate-700 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                                disabled={loading}
                            >
                                Atrás
                            </button>
                        </div>
                    </div>
                );
            case 'SUCCESS':
                return (
                    <div className="text-center p-8 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4 animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckBadgeIcon className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-black text-emerald-800">¡Verificación Exitosa!</h3>
                        <p className="text-emerald-700 font-medium">Tu número <strong>{fullNumber}</strong> ha sido vinculado correctamente.</p>
                        <button 
                            onClick={handleReset}
                            className="mt-4 px-6 py-2 text-sm font-bold text-emerald-600 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-all shadow-sm"
                        >
                            Actualizar otro número
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in duration-500">
            <Toaster position="bottom-right" />
            <div className={`mb-8 p-4 rounded-xl border flex items-center gap-4 ${isInitiallyVerified || stage === 'SUCCESS' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                <div className={`p-2 rounded-full ${isInitiallyVerified || stage === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {isInitiallyVerified || stage === 'SUCCESS' ? <ShieldCheckIcon className="w-8 h-8" /> : <ExclamationTriangleIcon className="w-8 h-8" />}
                </div>
                <div>
                    <h3 className={`font-bold text-lg ${isInitiallyVerified || stage === 'SUCCESS' ? 'text-emerald-800' : 'text-amber-800'}`}>
                        {isInitiallyVerified || stage === 'SUCCESS' ? "Teléfono Verificado" : "Verificación Pendiente"}
                    </h3>
                    <p className={`text-sm ${isInitiallyVerified || stage === 'SUCCESS' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {isInitiallyVerified || stage === 'SUCCESS' ? "Tu cuenta está segura." : "Verifica tu número para aumentar la seguridad."}
                    </p>
                </div>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <DevicePhoneMobileIcon className="w-5 h-5 text-[#E33127]" />
                        {stage === 'SUCCESS' ? 'Estado' : 'Gestión de Número'}
                    </h2>
                    <div className="bg-white rounded-xl">
                        {renderStageContent()}
                    </div>
                </div>
                <div className={`space-y-6 transition-opacity duration-500 ${stage === 'SUCCESS' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-[#E33127]" />
                        Canal de Preferencia
                    </h2>
                    <div className="space-y-3">
                        <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${preference === 'WHATSAPP' ? 'border-green-500 bg-green-50/30 ring-1 ring-green-500' : 'border-slate-100 hover:border-slate-300'}`}>
                            <input 
                                type="radio" 
                                name="preference"
                                className="mt-1 w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300"
                                checked={preference === 'WHATSAPP'}
                                onChange={() => setPreference('WHATSAPP')}
                            />
                            <div>
                                <span className="font-bold text-slate-800 flex items-center gap-2">WhatsApp <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide">Recomendado</span></span>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Recibe códigos OTP y alertas al instante.</p>
                            </div>
                        </label>
                        <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${preference === 'SMS' ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500' : 'border-slate-100 hover:border-slate-300'}`}>
                            <input 
                                type="radio" 
                                name="preference"
                                className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                checked={preference === 'SMS'}
                                onChange={() => setPreference('SMS')}
                            />
                            <div>
                                <span className="font-bold text-slate-800">Mensaje de Texto (SMS)</span>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Método estándar.</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}