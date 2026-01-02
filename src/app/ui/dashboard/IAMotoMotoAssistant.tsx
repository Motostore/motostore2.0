// src/app/ui/dashboard/IAMotoMotoAssistant.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react'; 
import { 
    SparklesIcon, 
    XMarkIcon, 
    ChatBubbleBottomCenterTextIcon, 
    UserCircleIcon, 
    MinusIcon,
    CpuChipIcon 
} from '@heroicons/react/24/outline';

// TASA REFERENCIAL (Idealmente vendría de una API)
const TASA_DIA = 65.85;

type Message = { sender: 'IA' | 'User'; text: string; isProcessing?: boolean; isCommand?: boolean };

// 🧠 CEREBRO DE LA IA: Base de Conocimiento
function getDataBaseResponse(trigger: string, role: string): string | null {
    const t = trigger.toLowerCase();
    
    // --- 1. TEMA: NETFLIX Y STREAMING ---
    if (t.includes('netflix') || t.includes('pantalla') || t.includes('pin')) {
        return `🎬 **Sobre Streaming:**
        
• **Pantallas:** Tienen garantía de 30 días. Si una falla, usa el botón "Reportar Fallo" en tus compras.
• **Pines:** Se entregan al instante y no tienen devolución una vez vistos.
• **Renovaciones:** Recuerda renovar 2 días antes para mantener el mismo perfil.`;
    }

    // --- 2. TEMA: PAGOS Y RECARGAS ---
    if (t.includes('pago') || t.includes('recarga') || t.includes('binance') || t.includes('zelle')) {
        return `💳 **Métodos de Pago y Recargas:**
        
• **Binance/Zelle:** Automático las 24/7. Reporta el ID de transacción exacto.
• **Pago Móvil:** Puede tardar 5-10 min en verificarse.
• **Mínimo de recarga:** $1.00 USD (o equivalente en Bs).
¿Necesitas reportar un pago? Ve a la pestaña **Compras > Reportar Pago**.`;
    }

    // --- 3. TEMA: SOPORTE TÉCNICO ---
    if (t.includes('fallo') || t.includes('error') || t.includes('no funciona') || t.includes('problema')) {
        return `🛠️ **Soporte Técnico:**
        
1. Revisa que tengas **saldo suficiente**.
2. Si es una pantalla, verifica que no hayan cambiado la clave.
3. Si el problema persiste, contacta a soporte humano vía WhatsApp (botón "Ayuda").
⚠️ **Importante:** Ten a la mano tu ID de Orden.`;
    }

    // --- 4. TEMA: DISTRIBUIDORES (Solo si pregunta sobre vender/ganar) ---
    if (t.includes('vender') || t.includes('distribuidor') || t.includes('ganancia')) {
        return `📈 **Para Distribuidores:**
        
Puedes crear sub-usuarios (Taquillas) y asignarles saldo.
• Tú ganas una comisión por cada venta que ellos hagan.
• Configura tus márgenes en **Configuración > Comisiones**.`;
    }

    return null; // Si no encuentra respuesta específica
}

// 🧠 PROCESADOR CENTRAL
function processCommand(input: string, role: string, name: string): string {
    const lowerInput = input.toLowerCase().trim();
    const isHighLevel = role === 'SUPERUSER' || role === 'ADMIN';

    // 1. Buscamos en la Base de Conocimiento experta
    const expertResponse = getDataBaseResponse(lowerInput, role);
    if (expertResponse) return expertResponse;

    // 2. Comandos Básicos
    if (lowerInput.includes('tasa') || lowerInput.includes('precio')) {
        return `La tasa actual del sistema es **${TASA_DIA} Bs/USD** para operaciones en moneda local.`;
    }
    
    if (lowerInput.includes('hola') || lowerInput.includes('buenos')) {
        return `¡Hola, **${name}**! 👋 Soy tu asistente virtual.
        
Puedo ayudarte con:
• Dudas de Netflix/Streaming.
• Cómo reportar pagos.
• Problemas técnicos.
• Información de tu rol (${role}).
        
¿Qué necesitas saber hoy?`;
    }
    
    // 3. Comandos de Rol / Sistema
    if (lowerInput.includes('saldo')) {
        if (isHighLevel) return `💰 **Admin:** El capital flotante es ilimitado. Usuarios activos: 154.`;
        return `Tu saldo actual se muestra en la barra superior (icono verde). Si necesitas recargar, ve a **Compras > Mi Billetera**.`;
    }

    // 4. Fallback (No entendió)
    return `🤔 No estoy seguro de cómo responder a eso. 
    
Prueba preguntando:
• *"Cómo reportar un pago"*
• *"Garantía de Netflix"*
• *"Cúal es la tasa"*
• *"Tengo un error"*.`;
}

// ---------------- COMPONENTE VISUAL -------------------------
export default function IAMotoMotoAssistant() {
    const { data: session } = useSession();
    const userRole = session?.user?.role?.toUpperCase() || 'CLIENT';
    const userName = session?.user?.name || 'Usuario';

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Saludo inicial
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                { 
                    sender: 'IA', 
                    text: `🤖 ¡Hola ${userName}! Soy la IA de Soporte. Pregúntame sobre **Pagos**, **Netflix**, **Fallos** o lo que necesites.` 
                }
            ]);
        }
    }, [isOpen]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text) return;

        setMessages(prev => [...prev, { sender: "User", text }]);
        setInput('');

        setMessages(prev => [...prev, { sender: "IA", text: "Analizando...", isProcessing: true }]);

        // Simulación de "pensando"
        setTimeout(() => {
            const result = processCommand(text, userRole, userName); 
            setMessages(prev => {
                const clean = prev.filter(m => !m.isProcessing); 
                return [...clean, { sender: 'IA', text: result, isCommand: true }];
            });
        }, 800);
    };

    return (
        // CONTENEDOR FLOTANTE INTELIGENTE (Se mueve en móvil para no tapar el menú)
        <div className="fixed z-[90] right-4 lg:right-6 bottom-24 lg:bottom-6 flex flex-col items-end gap-4 transition-all duration-300">
            
            {/* VENTANA DEL CHAT */}
            {isOpen && (
                <div className="
                    w-[90vw] max-w-[360px] h-[60vh] lg:h-[500px] 
                    bg-white/95 backdrop-blur-xl 
                    rounded-2xl lg:rounded-3xl 
                    shadow-2xl shadow-red-900/20 border border-red-100 
                    flex flex-col overflow-hidden 
                    animate-in slide-in-from-bottom-10 fade-in duration-300 
                    origin-bottom-right
                ">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-slate-50 to-white border-b border-red-100">
                        <div className="flex items-center gap-2">
                            <div className="bg-red-100 p-1.5 rounded-full">
                                <CpuChipIcon className="w-5 h-5 text-[#E33127]" />
                            </div>
                            <div>
                                <h3 className="text-sm lg:text-base font-black text-slate-800 leading-none">Soporte IA</h3>
                                <span className="text-[10px] text-emerald-600 font-bold">En línea • 24/7</span>
                            </div>
                        </div>

                        {/* Controles */}
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                title="Minimizar"
                            >
                                <MinusIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Cerrar"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`text-sm p-3 rounded-2xl max-w-[85%] shadow-sm ${
                                    msg.sender === 'User'
                                        ? "ml-auto bg-[#E33127] text-white rounded-br-sm"
                                        : "mr-auto bg-white text-slate-800 border border-slate-100 rounded-tl-sm"
                                }`}
                            >
                                {msg.isProcessing ? (
                                    <div className="flex gap-1 h-5 items-center px-1">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                                    </div>
                                ) : (
                                    // Renderizado seguro de HTML para negritas y saltos de línea
                                    <p dangerouslySetInnerHTML={{ 
                                        __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') 
                                    }} />
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Escribe tu duda..."
                                className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#E33127] focus:ring-1 focus:ring-[#E33127] text-sm outline-none transition-all placeholder:text-slate-400 text-slate-800"
                                disabled={messages.some(m => m.isProcessing)}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="absolute right-2 p-1.5 bg-[#E33127] text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:bg-slate-300 transition-colors shadow-md shadow-red-500/20"
                            >
                                <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* BOTÓN FLOTANTE (TRIGGER) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    group flex items-center justify-center
                    w-14 h-14 rounded-full 
                    bg-[#E33127] text-white 
                    shadow-lg shadow-red-600/30 
                    border-2 border-white 
                    hover:scale-110 hover:-translate-y-1 
                    active:scale-95 
                    transition-all duration-300
                    z-[91] relative
                `}
                title={isOpen ? "Minimizar Chat" : "Abrir Soporte IA"}
            >
                {isOpen ? (
                    <MinusIcon className="w-7 h-7" />
                ) : (
                    <SparklesIcon className="w-7 h-7 animate-[pulse_3s_ease-in-out_infinite]" />
                )}
                
                {/* Globo de notificación "Ayuda" si está cerrado */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-[#E33127]"></span>
                    </span>
                )}
            </button>
        </div>
    );
}
