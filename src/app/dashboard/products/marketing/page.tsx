'use client';

import { useEffect, useState, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image'; 
import Link from 'next/link';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  BellAlertIcon,
  MapPinIcon,
  TicketIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  StarIcon,
  ClockIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  ChevronLeftIcon // <--- USAMOS CHEVRON PARA EL BOTÓN VOLVER (ESTILO RECARGA)
} from '@heroicons/react/24/solid';

// --- ICONOS SVG (COLORES ORIGINALES) ---
const BRAND_ICONS: any = {
  all: <Bars3Icon className="w-6 h-6 text-slate-700"/>,
  popular: <StarIcon className="w-6 h-6 text-yellow-500"/>,
  facebook: (<svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-[#1877F2]"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>),
  youtube: (<svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-[#FF0000]"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>),
  instagram: (<svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-[#E4405F]"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>),
  tiktok: (<svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-[#000000]"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.14c0 3.48-2.32 6.66-5.79 7.42-3.46.75-7.16-.92-8.52-4.15-1.35-3.23.47-7.14 3.73-8.31v4.29c-1.28.38-1.95 1.83-1.48 3.12.48 1.28 1.95 1.95 3.24 1.48 1.28-.48 1.95-1.95 1.48-3.24V.02z"/></svg>),
  twitter: (<svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-black"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>),
  telegram: (<svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-[#26A5E4]"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>),
  spotify: (<svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-[#1DB954]"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.4-.12.6-.54.42-.18-.42-.18-1.139-.6-1.74-3.6-1.08-7.26-.54-9.9 1.14-.66.42-.66 1.32-.24 1.92.12.24.42.3.6.3.3 0 .66-.12.84-.42 2.1-1.38 5.16-1.8 8.22-1.02.72.24 1.44-.18 1.68-.84.24-.72-.18-1.44-.9-1.68zm1.5-3.84c-.3.48-1.02.66-1.5.36-3.3-2.04-8.34-2.64-12.24-1.44-.6.18-1.14-.18-1.32-.72-.18-.6.18-1.14.72-1.32 4.5-1.38 10.08-.72 13.92 1.68.54.3.66 1.02.42 1.44zm.12-3.96c-3.96-2.34-10.5-2.58-14.28-1.38-.66.18-1.38-.24-1.62-.84-.24-.66.24-1.38.84-1.62 4.44-1.32 11.7-1.08 16.26 1.62.6.36.78 1.14.42 1.74-.3.6-1.08.78-1.62.48z"/></svg>),
  twitch: (<svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-[#9146FF]"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>),
  kick: (<svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-[#53FC18]"><path d="M3 0h18a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3zm4.5 4.5v15h3.75v-5.25l3.75 5.25h4.5l-5.25-6.75 4.5-5.25H14.25l-3 3.75V4.5H7.5z"/></svg>),
  kwai: (<svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-[#FF5722]"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>),
  whatsapp: (<svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-[#25D366]"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.248-.57-.397m-5.473-2.515v.001M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8"/></svg>)
};

const PLATFORMS = [
  { id: 'all', name: 'Todo', label: 'Todo', icon: BRAND_ICONS.all }, 
  { id: 'popular', name: 'Populares', label: 'Populares', icon: BRAND_ICONS.popular },
  { id: 'facebook', name: 'Facebook', label: 'Facebook', icon: BRAND_ICONS.facebook },
  { id: 'youtube', name: 'YouTube', label: 'YouTube', icon: BRAND_ICONS.youtube },
  { id: 'instagram', name: 'Instagram', label: 'Instagram', icon: BRAND_ICONS.instagram },
  { id: 'tiktok', name: 'TikTok', label: 'TikTok', icon: BRAND_ICONS.tiktok },
  { id: 'telegram', name: 'Telegram', label: 'Telegram', icon: BRAND_ICONS.telegram },
  { id: 'spotify', name: 'Spotify', label: 'Spotify', icon: BRAND_ICONS.spotify },
  { id: 'twitter', name: 'Twitter', label: 'X / Twitter', icon: BRAND_ICONS.twitter },
  { id: 'twitch', name: 'Twitch', label: 'Twitch', icon: BRAND_ICONS.twitch },
  { id: 'kick', name: 'Kick', label: 'Kick', icon: BRAND_ICONS.kick },
  { id: 'whatsapp', name: 'WhatsApp', label: 'WhatsApp', icon: BRAND_ICONS.whatsapp },
  { id: 'kwai', name: 'Kwai', label: 'Kwai', icon: BRAND_ICONS.kwai },
];

export default function MarketingPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [buying, setBuying] = useState(false);

  // 1. CARGAR SERVICIOS
  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/social/services'); 
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.services || [];
        setServices(list);
      } catch (e) {
        toast.error("Error al cargar servicios");
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  // 2. LÓGICA DE FILTRADO
  const categories = useMemo(() => {
    if (!services.length) return [];
    
    let filtered = services;

    if (selectedPlatform === 'popular') {
       filtered = services.filter(s => 
         s.name.toLowerCase().includes('vip') || 
         s.name.toLowerCase().includes('real') ||
         s.category?.toLowerCase().includes('best')
       );
       if (filtered.length === 0) filtered = services.slice(0, 30); 
    } else if (selectedPlatform !== 'all') {
      filtered = services.filter(s => s.name.toLowerCase().includes(selectedPlatform));
    }

    if (searchTerm) {
      filtered = filtered.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return Array.from(new Set(filtered.map(s => s.category || "General"))).sort();
  }, [services, selectedPlatform, searchTerm]);

  const availableServices = useMemo(() => {
    if (!selectedCategory) return [];
    return services.filter(s => (s.category || "General") === selectedCategory);
  }, [selectedCategory, services]);

  const currentService = useMemo(() => {
    return services.find(s => (s.service_id || s.id) == selectedServiceId);
  }, [selectedServiceId, services]);

  const totalCharge = useMemo(() => {
    if (!currentService || !quantity) return 0;
    const price = parseFloat(currentService.rate || currentService.price);
    return (price * (Number(quantity) / 1000)).toFixed(2);
  }, [currentService, quantity]);


  // 3. PROCESAR ORDEN
  const handleOrder = async () => {
    if (!currentService || !link || !quantity) return toast.error("Complete todos los campos");
    
    const qty = Number(quantity);
    if (currentService.min && qty < currentService.min) return toast.error(`Mínimo: ${currentService.min}`);
    if (currentService.max && qty > currentService.max) return toast.error(`Máximo: ${currentService.max}`);

    setBuying(true);
    const t = toast.loading("Procesando...");

    try {
      const res = await fetch('/api/social/order', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          service_id: currentService.service_id || currentService.id,
          link: link,
          quantity: qty
        })
      });

      const result = await res.json();

      if (result.success || res.ok) {
        toast.success(`¡Orden Enviada!`, { id: t });
        setLink('');
        setQuantity('');
      } else {
        toast.error(result.message || "Error al procesar", { id: t });
      }
    } catch (e) {
      toast.error("Error de conexión", { id: t });
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-8 font-sans">
      <Toaster position="top-right" toastOptions={{ style: { background: '#fff', color: '#000', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } }} />

      {/* --- HEADER SUPERIOR --- */}
      <div className="max-w-7xl mx-auto mb-4">
        {/* BOTÓN VOLVER (ESTILO RECARGA) */}
        <Link href="/dashboard/products" className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:text-red-600 hover:border-red-200 transition-all shadow-sm mb-6">
           <ChevronLeftIcon className="w-4 h-4" />
           <span>Volver</span>
        </Link>

        {/* HEADER MOTOSTORE */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="flex items-center gap-5 relative z-10">
                <div className="w-16 h-16 relative drop-shadow-sm">
                    <Image 
                        src="/logos/motostore-logo.png" 
                        alt="Logo" 
                        fill 
                        className="object-contain" 
                    />
                </div>
                <div>
                    <h1 className="text-3xl font-black uppercase text-slate-900 tracking-tighter leading-none">
                    MotoStore <span className="text-red-600">Panel</span>
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                    Servicios Profesionales
                    </p>
                </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full border border-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
                <ShieldCheckIcon className="w-5 h-5"/>
                Plataforma Segura
            </div>
        </div>
      </div>

      {/* --- GRID DE ICONOS (VECTORES SVG - COLOR ORIGINAL) --- */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-13 gap-3">
          {PLATFORMS.map((plat) => (
            <button
              key={plat.id}
              onClick={() => { setSelectedPlatform(plat.id); setSelectedCategory(''); setSelectedServiceId(''); }}
              className={`
                h-14 flex flex-col items-center justify-center rounded-xl border transition-all duration-300 group relative overflow-hidden
                ${selectedPlatform === plat.id 
                  ? 'bg-white border-red-500 shadow-lg shadow-red-100 scale-105 z-10' 
                  : 'bg-white border-slate-200 hover:border-red-300 hover:shadow-md hover:-translate-y-1'}
              `}
              title={plat.label}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className={`scale-110 mb-1.5 relative z-10 transition-transform duration-300 group-hover:scale-125 ${selectedPlatform === plat.id ? 'drop-shadow-sm' : 'grayscale group-hover:grayscale-0'}`}>
                 {plat.icon}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider relative z-10 ${selectedPlatform === plat.id ? 'text-red-600' : 'text-slate-500 group-hover:text-slate-700'}`}>
                 {plat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- FORMULARIO IZQUIERDA (DISEÑO "TECH-CARD") --- */}
        <div className="lg:col-span-8 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6 relative">
          
          {/* BUSCADOR PREMIUM */}
          <div className="relative group">
             <MagnifyingGlassIcon className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors"/>
             <input 
                type="text"
                placeholder="Buscar servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-red-500 focus:bg-white focus:shadow-md outline-none transition-all placeholder-slate-400"
             />
          </div>

          {/* SELECTS ESTILIZADOS */}
          <div className="grid gap-6">
            {['Categoría', 'Servicio'].map((label, i) => (
            <div key={i} className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
                <div className="relative group">
                    <select 
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:border-red-500 focus:bg-white focus:shadow-md outline-none h-16 appearance-none transition-all cursor-pointer"
                        value={i === 0 ? selectedCategory : selectedServiceId}
                        onChange={(e) => { i === 0 ? (setSelectedCategory(e.target.value), setSelectedServiceId('')) : setSelectedServiceId(e.target.value) }}
                        disabled={i === 1 && !selectedCategory}
                    >
                        <option value="">Seleccione {label}</option>
                        {i === 0 
                            ? categories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                            : availableServices.map(srv => <option key={srv.service_id || srv.id} value={srv.service_id || srv.id}>{srv.name} | ${srv.rate}</option>)
                        }
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none group-hover:text-red-500 transition-colors">▼</div>
                </div>
            </div>
            ))}
          </div>

          {/* INPUTS LINK Y CANTIDAD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Enlace</label>
                <input 
                    type="text"
                    placeholder="https://..."
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:border-red-500 focus:bg-white focus:shadow-md outline-none h-16 transition-all placeholder-slate-400"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cantidad</label>
                    {currentService && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Min: {currentService.min} - Max: {currentService.max}</span>}
                </div>
                <input 
                    type="number"
                    placeholder="Ej: 1000"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:border-red-500 focus:bg-white focus:shadow-md outline-none h-16 transition-all placeholder-slate-400 font-mono"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                />
            </div>
          </div>

          {/* TOTAL & BOTÓN DE ACCIÓN */}
          <div className="pt-6 mt-2 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex flex-col items-start pl-2">
               <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Costo Total Estimado</span>
               <div className="flex items-start gap-1">
                <span className="text-lg font-bold text-red-600 mt-1">$</span>
                <span className="text-4xl font-black text-slate-900 tracking-tighter">{totalCharge || '0.00'}</span>
               </div>
             </div>

             <button 
                onClick={handleOrder}
                disabled={buying || !currentService}
                className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
             >
                {buying ? 'Procesando Pedido...' : 'CONFIRMAR ORDEN AHORA'}
             </button>
          </div>
        </div>

        {/* --- REGLAS DERECHA ("COMPLIANCE CARD") --- */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sticky top-8 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            {/* Acento superior rojo */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600"></div>

            <h3 className="font-black text-slate-900 uppercase text-sm mb-6 flex items-center gap-3">
                <InformationCircleIcon className="w-6 h-6 text-red-600"/> Información Importante
            </h3>
            
            <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100 mb-8">
                <p className="text-xs text-slate-700 font-bold leading-relaxed">
                   <span className="text-red-600">💡 Consejo Pro:</span> Si no sabes qué servicio elegir, realiza un pedido mínimo para probar la calidad antes de hacer una compra grande.
                </p>
            </div>
            
            <h4 className="text-[10px] font-black text-slate-400 uppercase mb-5 flex items-center gap-2 tracking-[0.2em] pb-3 border-b border-slate-100">
               <BellAlertIcon className="w-4 h-4 text-red-500"/> REGLAS DEL SERVICIO
            </h4>

            <ul className="space-y-4 text-xs text-slate-600 font-semibold leading-relaxed">
              <li className="flex gap-3 items-start">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0"/> 
                  <span>Su cuenta o perfil debe estar en modo <b>PÚBLICO</b>.</span>
              </li>
              <li className="flex gap-3 items-start">
                  <XCircleIcon className="w-5 h-5 text-slate-300 shrink-0"/> 
                  <span>No realice dos pedidos simultáneos al mismo enlace.</span>
              </li>
              <li className="flex gap-3 items-start">
                  <XCircleIcon className="w-5 h-5 text-slate-300 shrink-0"/> 
                  <span>Sin garantía para cuentas con más de 100k seguidores.</span>
              </li>
              <li className="flex gap-3 items-start">
                  <XCircleIcon className="w-5 h-5 text-slate-300 shrink-0"/> 
                  <span>No hay reembolso si el enlace proporcionado es incorrecto.</span>
              </li>
              <li className="flex gap-3 items-start">
                  <ClockIcon className="w-5 h-5 text-slate-300 shrink-0"/> 
                  <span>Los tiempos de entrega son aproximados, no exactos.</span>
              </li>
              <li className="flex gap-3 items-start">
                  <TicketIcon className="w-5 h-5 text-slate-300 shrink-0"/> 
                  <span>Para solicitar recarga (refill), abra un ticket de soporte.</span>
              </li>
              <li className="flex gap-3 items-start">
                  <MapPinIcon className="w-5 h-5 text-slate-300 shrink-0"/> 
                  <span>La recarga aplica solo si la caída es superior al 10%.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}