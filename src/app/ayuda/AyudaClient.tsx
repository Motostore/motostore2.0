// src/app/ayuda/AyudaClient.tsx (EDICIÓN FINAL: PRO ORO +++)

'use client';

import { InformationCircleIcon, QuestionMarkCircleIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Tutorial from '../ui/common/tutorial'; 
import FAQAccordion from '../ui/common/FAQAccordion'; 

// Componente para el Título de la Pestaña (Icono + Texto)
const CustomTabTitle = ({ icon: Icon, title }: { icon: React.ElementType, title: string }) => (
    <div className="flex items-center justify-center gap-2 px-2 py-1 whitespace-nowrap">
        <Icon className="w-5 h-5" />
        <span>{title}</span>
    </div>
);

export default function AyudaClient() {
    const BRAND_RED = 'text-[#E33127]';

    return (
        <div className="bg-white text-slate-600 min-h-[600px]">
            
            {/* ENCABEZADO DE LA SECCIÓN */}
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                    Centro de Ayuda y <span className={BRAND_RED}>Soporte</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
                    Todo lo que necesitas saber para operar tu negocio digital con Moto Store LLC.
                </p>
            </div>

            <Tabs defaultIndex={0} className="w-full" selectedTabClassName="!border-b-2 !border-[#E33127] !text-[#E33127]">
                
                {/* 1. LISTA DE PESTAÑAS (DISEÑO MODERNO) */}
                <div className="flex justify-center mb-12">
                    <TabList className="flex flex-wrap justify-center gap-2 md:gap-8 border-b border-gray-100 w-full max-w-4xl pb-1">
                        
                        {/* Tab 1: Cómo funciona */}
                        <Tab className="cursor-pointer px-4 py-3 text-base font-semibold text-slate-500 outline-none transition-all hover:text-[#E33127] border-b-2 border-transparent">
                            <CustomTabTitle icon={InformationCircleIcon} title="¿Cómo funciona?" />
                        </Tab>
                        
                        {/* Tab 2: Preguntas Frecuentes */}
                        <Tab className="cursor-pointer px-4 py-3 text-base font-semibold text-slate-500 outline-none transition-all hover:text-[#E33127] border-b-2 border-transparent">
                            <CustomTabTitle icon={QuestionMarkCircleIcon} title="Preguntas Frecuentes" />
                        </Tab>
                        
                        {/* Tab 3: Qué puedo hacer */}
                        <Tab className="cursor-pointer px-4 py-3 text-base font-semibold text-slate-500 outline-none transition-all hover:text-[#E33127] border-b-2 border-transparent">
                            <CustomTabTitle icon={ListBulletIcon} title="Nuestros Servicios" />
                        </Tab>
                        
                    </TabList>
                </div>

                {/* 2. PANELES DE CONTENIDO (Clean Design) */}
                <div className="max-w-5xl mx-auto animate-fade-in-up">
                    
                    {/* PANEL 1: CÓMO FUNCIONA */}
                    <TabPanel>
                        <div className="space-y-8">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold text-slate-900 mb-4">Tu camino al éxito digital</h2>
                                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                    Nuestra plataforma está diseñada para ser intuitiva. En solo 4 pasos estarás operando.
                                </p>
                            </div>
                            
                            {/* Pasos Visuales (Grid) */}
                            <div className="grid md:grid-cols-2 gap-8 mb-12">
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                                    <span className="text-4xl font-black text-[#E33127]/20 mb-2 block">01</span>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Regístrate Gratis</h3>
                                    <p className="text-slate-600">Crea tu cuenta en segundos y accede a tu panel de control personalizado.</p>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                                    <span className="text-4xl font-black text-[#E33127]/20 mb-2 block">02</span>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Elige tu Solución</h3>
                                    <p className="text-slate-600">Selecciona entre recargas, licencias, marketing o servicios satelitales.</p>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                                    <span className="text-4xl font-black text-[#E33127]/20 mb-2 block">03</span>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Procesa al Instante</h3>
                                    <p className="text-slate-600">Sigue los pasos guiados. Nuestro sistema automatizado hace el trabajo duro.</p>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                                    <span className="text-4xl font-black text-[#E33127]/20 mb-2 block">04</span>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Crece sin Límites</h3>
                                    <p className="text-slate-600">Disfruta de los resultados y expande tu negocio con nuestras herramientas.</p>
                                </div>
                            </div>
                            
                            {/* Video Tutorial */}
                            <div className="bg-slate-900 rounded-3xl p-4 md:p-8 shadow-2xl">
                                <h3 className="text-white text-center font-bold text-xl mb-6">Video Tutorial Rápido</h3>
                                <Tutorial />
                            </div>
                        </div>
                    </TabPanel>

                    {/* PANEL 2: FAQ */}
                    <TabPanel>
                        <div className="max-w-3xl mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold text-slate-900 mb-4">Preguntas Frecuentes</h2>
                                <p className="text-lg text-slate-600">Resolvemos tus dudas más comunes al instante.</p>
                            </div>
                            <FAQAccordion /> 
                        </div>
                    </TabPanel>

                    {/* PANEL 3: QUÉ PUEDO HACER */}
                    <TabPanel>
                        <div className="grid md:grid-cols-2 gap-12 items-start">
                            <div>
                                <h2 className='text-3xl font-bold text-slate-900 mb-6'>
                                    Un Ecosistema Completo
                                </h2>
                                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                    En <strong>Moto Store LLC</strong> no solo vendemos servicios, creamos soluciones. 
                                    Hemos centralizado las herramientas digitales más importantes en un solo lugar.
                                </p>
                                
                                {/* Lista Estilizada */}
                                <ul className="space-y-6">
                                    <li className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-[#E33127]">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg">Recargas Globales</h4>
                                            <p className="text-sm text-slate-500">Saldo instantáneo para operadores en 5 países.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-[#E33127]">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg">Licencias Digitales</h4>
                                            <p className="text-sm text-slate-500">Software original y legal activado al momento.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-[#E33127]">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg">Servicios Premium</h4>
                                            <p className="text-sm text-slate-500">Gestión de Starlink, Marketing y Pagos Flexibles.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            
                            {/* Ilustración de la Derecha (Opcional, si no tienes SVG usa un contenedor de color) */}
                            <div className="hidden md:flex justify-center items-center h-full bg-gray-50 rounded-3xl p-8 border border-gray-100">
                                <div className="text-center">
                                    <span className="text-6xl mb-4 block">🚀</span>
                                    <h3 className="font-bold text-slate-400">Moto Store Solutions</h3>
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                </div>
            </Tabs>
        </div>
    );
}