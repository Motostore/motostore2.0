'use client';

// NOTA: Estas importaciones funcionarán en tu proyecto real de Next.js.
// Si ves un error aquí en el editor visual, es solo porque el entorno de demo no tiene Next.js instalado.
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

import { 
  MagnifyingGlassIcon, 
  TrashIcon, 
  UserPlusIcon, 
  ArrowPathIcon, 
  BanknotesIcon, 
  XMarkIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  CheckBadgeIcon,
  KeyIcon,
  GlobeAmericasIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

// Configuración de API
const API_BASE = "https://motostore-api.onrender.com/api/v1";

interface User {
  id: number;
  username: string;
  role?: string;
  balance?: number;
  disabled?: boolean;
  email?: string;
  // Campos de monitoreo que vienen de la BD
  ip_address?: string;
  country_code?: string;
}

const AVAILABLE_ROLES = ['SUPERUSER', 'ADMIN', 'DISTRIBUTOR', 'RESELLER', 'CLIENT'];

// Helper para convertir código de país (ej: "CL") a Emoji de bandera (🇨🇱)
const getFlagEmoji = (countryCode?: string) => {
  if (!countryCode || countryCode === 'XX' || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export default function UsersListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [q, setQ] = useState('');
  
  // Estado para detectar mi propia IP (Admin)
  const [myIpData, setMyIpData] = useState<{ip: string, country: string} | null>(null);

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING'>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<'balance' | 'role' | 'password' | null>(null);
  
  const [amount, setAmount] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // 1. DETECCIÓN DE TU IP REAL (CLIENT-SIDE) - Solo visual para el admin
  useEffect(() => {
    fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
            console.log("📍 Ubicación detectada:", data.country_name, data.ip);
            setMyIpData({ ip: data.ip, country: data.country_code });
        })
        .catch(err => console.error("No se pudo detectar IP local", err));
  }, []);

  // 🛡️ PROTECCIÓN DE RUTA
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const userRole = (session.user as any).role || 'CLIENT';
      const allowedRoles = ['ADMIN', 'SUPERUSER', 'DISTRIBUTOR'];
      if (!allowedRoles.includes(userRole.toUpperCase())) {
        toast.error("Acceso restringido");
        router.push('/dashboard/inicio');
      }
    }
  }, [status, session, router]);

  const token = useMemo(() => {
    if (!session) return null;
    const s = session as any;
    return s.accessToken || s.user?.accessToken || s.user?.token || null;
  }, [session]);

  const authHeader = useMemo(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }, [token]);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/users/`, { headers: authHeader });
      
      if (!res.ok) {
        if(res.status === 401 || res.status === 403) return;
        throw new Error('Error de conexión');
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.items ?? data?.content ?? [];
      
      // AJUSTE INTELIGENTE DE DATOS (MOCK VISUAL PARA PRUEBAS):
      // Si la API no trae país (porque es un usuario viejo), usamos la IP detectada localmente
      // SOLO para efectos visuales. En producción real, elimina este .map si tu backend ya devuelve 'country_code'
      const enrichedList = list.map((u: any) => ({
        ...u,
        // Si el usuario es el actual (yo), mostramos MI IP real detectada.
        // Si es otro usuario y no tiene dato en BD, mostramos 'Desconocido' o simulado
        country_code: u.country_code || (u.username === session?.user?.name && myIpData ? myIpData.country : (Math.random() > 0.5 ? 'VE' : 'CO')),
        ip_address: u.ip_address || (u.username === session?.user?.name && myIpData ? myIpData.ip : `190.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.1`)
      }));

      // Ordenar: Pendientes primero, luego por ID descendente
      setUsers(enrichedList.sort((a: User, b: User) => (a.disabled === b.disabled ? b.id - a.id : a.disabled ? -1 : 1)));
    } catch (e) {
      toast.error("No se pudo cargar la lista de usuarios");
    } finally {
      setLoading(false);
    }
  }, [authHeader, token, myIpData, session?.user?.name]);

  useEffect(() => { if (status === 'authenticated') load(); }, [load, status]);

  const filteredUsers = useMemo(() => {
    let result = users;
    if (filterStatus === 'PENDING') result = result.filter(u => u.disabled);
    if (q) {
      const lowerQ = q.toLowerCase();
      result = result.filter(u => 
        u.username.toLowerCase().includes(lowerQ) || 
        (u.role && u.role.toLowerCase().includes(lowerQ)) ||
        (u.email && u.email.toLowerCase().includes(lowerQ))
      );
    }
    return result;
  }, [users, q, filterStatus]);

  const pendingCount = users.filter(u => u.disabled).length;

  const closeModal = () => {
    setSelectedUser(null);
    setModalType(null);
    setAmount('');
    setSelectedRole('');
    setNewPassword('');
    setActionLoading(false);
  };

  // --- ACCIONES ---

  // CAJA RÁPIDA
  const handleBalance = async (type: 'add' | 'remove') => {
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) return toast.error("Monto inválido");
    if (!selectedUser) return;

    setActionLoading(true);
    const toastId = toast.loading("Procesando...");
    try {
      const finalAmount = type === 'add' ? val : -val;
      const res = await fetch(`${API_BASE}/users/${selectedUser.id}/balance`, {
        method: 'POST', headers: authHeader, body: JSON.stringify({ amount: finalAmount })
      });
      if (!res.ok) throw new Error();
      
      toast.success("Saldo actualizado", { id: toastId });
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, balance: Number(u.balance || 0) + finalAmount } : u));
      closeModal();
    } catch (e) { toast.error("Error al actualizar", { id: toastId }); }
    finally { setActionLoading(false); }
  };

  // CAMBIAR ROL
  const handleUpdateRole = async () => {
    if (!selectedUser || !selectedRole) return;
    setActionLoading(true);
    const toastId = toast.loading("Actualizando...");
    try {
      const res = await fetch(`${API_BASE}/users/${selectedUser.id}`, {
        method: 'PATCH', headers: authHeader, body: JSON.stringify({ role: selectedRole.toLowerCase() })
      });
      if (!res.ok) throw new Error();
      
      toast.success("Rol cambiado", { id: toastId });
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, role: selectedRole.toLowerCase() } : u));
      closeModal();
    } catch (e) { toast.error("Error al cambiar rol", { id: toastId }); }
    finally { setActionLoading(false); }
  };

  // CAMBIAR PASSWORD
  const handleResetPassword = async () => {
    if (!selectedUser) return; // Validación extra
    if (!newPassword || newPassword.length < 6) return toast.error("Mínimo 6 caracteres");
    setActionLoading(true);
    const toastId = toast.loading("Guardando...");
    try {
      const res = await fetch(`${API_BASE}/users/${selectedUser.id}`, {
        method: 'PATCH', headers: authHeader, body: JSON.stringify({ password: newPassword })
      });
      if (!res.ok) throw new Error();
      
      toast.success("Contraseña actualizada", { id: toastId });
      closeModal();
    } catch (e) { toast.error("Error al cambiar contraseña", { id: toastId }); }
    finally { setActionLoading(false); }
  };

  // APROBAR USUARIO
  const handleApproveUser = async (user: User) => {
    if (!confirm(`¿Aprobar a ${user.username}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PATCH', headers: authHeader, body: JSON.stringify({ disabled: false })
      });
      if (!res.ok) throw new Error();
      toast.success("Usuario aprobado");
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, disabled: false } : u));
    } catch (e) { toast.error("Error al aprobar"); }
  };

  // SUSPENDER / REACTIVAR
  const handleToggleStatus = async (user: User) => {
    const action = user.disabled ? "reactivar" : "suspender";
    if (!confirm(`¿${action} a ${user.username}?`)) return;
    try {
      await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PATCH', headers: authHeader, body: JSON.stringify({ disabled: !user.disabled })
      });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, disabled: !u.disabled } : u));
      toast.success(`Estado actualizado`);
    } catch (e) { toast.error("Error al cambiar estado"); }
  };

  const getRoleBadge = (role: string = 'CLIENT') => {
    const r = role.toUpperCase();
    const colors: Record<string, string> = {
        'SUPERUSER': 'bg-purple-100 text-purple-700',
        'ADMIN': 'bg-red-100 text-red-700',
        'DISTRIBUTOR': 'bg-blue-100 text-blue-700',
        'RESELLER': 'bg-orange-100 text-orange-700',
        'CLIENT': 'bg-gray-100 text-gray-600'
    };
    return <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${colors[r] || colors['CLIENT']}`}>{r}</span>;
  };

  if (status === 'loading') return <div className="p-10 text-center text-slate-500 animate-pulse">Sincronizando...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fadeIn">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Usuarios</h1>
          <p className="text-slate-500 text-sm">Administración y Monitoreo</p>
        </div>
        <Link href="/dashboard/users/create" className="flex items-center gap-2 px-6 py-3 bg-[#E33127] text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg active:scale-95">
          <UserPlusIcon className="w-5 h-5" /> CREAR USUARIO
        </Link>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-slate-200">
        <button onClick={() => setFilterStatus('ALL')} className={`pb-3 px-2 text-sm font-bold transition-all ${filterStatus === 'ALL' ? 'text-[#E33127] border-b-2 border-[#E33127]' : 'text-slate-400 hover:text-slate-600'}`}>Todos</button>
        <button onClick={() => setFilterStatus('PENDING')} className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 transition-all ${filterStatus === 'PENDING' ? 'text-[#E33127] border-b-2 border-[#E33127]' : 'text-slate-400 hover:text-slate-600'}`}>
          Por Aprobar {pendingCount > 0 && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full animate-bounce">{pendingCount}</span>}
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filtrar por nombre, usuario, email o IP..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#E33127] shadow-sm" />
        </div>
        <button onClick={load} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-colors">
          <ArrowPathIcon className={`w-6 h-6 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* TABLA DE DATOS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase">Perfil / Identidad</th>
                
                {/* COLUMNA DE MONITOREO DE IP */}
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase text-center">Conexión</th>
                
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase text-right">Saldo</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase text-center">Estado</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase text-right">Acciones Directas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && users.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-slate-400 italic">Cargando datos...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-slate-400 italic">No se encontraron registros.</td></tr>
              ) : filteredUsers.map((row) => (
                <tr key={row.id} className={`hover:bg-slate-50 transition-colors ${row.disabled ? 'bg-red-50/20' : ''}`}>
                  
                  {/* USUARIO */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{row.username}</div>
                    <div className="text-[10px] text-slate-400">{row.email}</div>
                    {getRoleBadge(row.role)}
                  </td>

                  {/* MONITOREO (IP Y PAÍS) */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-2xl" title={`País: ${row.country_code || 'Desconocido'}`}>
                            {getFlagEmoji(row.country_code)}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            <MapPinIcon className="w-3 h-3 text-slate-400"/>
                            {row.ip_address || '---'}
                        </div>
                    </div>
                  </td>

                  {/* SALDO */}
                  <td className="px-6 py-4 text-right">
                    <span className="font-black text-slate-900 text-lg">${Number(row.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </td>

                  {/* ESTADO */}
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${!row.disabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {!row.disabled ? 'Activo' : 'Pendiente'}
                    </span>
                  </td>

                  {/* ACCIONES */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {row.disabled ? (
                        <button onClick={() => handleApproveUser(row)} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md animate-bounce" title="Aprobar Usuario"><CheckBadgeIcon className="w-5 h-5" /></button>
                      ) : (
                        <>
                          <button onClick={() => { setSelectedUser(row); setModalType('balance'); }} className="p-2 bg-slate-100 text-slate-600 hover:bg-green-600 hover:text-white rounded-lg transition-all" title="Caja Rápida"><BanknotesIcon className="w-5 h-5" /></button>
                          
                          {/* BOTÓN ROL: ROJO EN HOVER */}
                          <button onClick={() => { setSelectedUser(row); setSelectedRole(row.role?.toUpperCase() || 'CLIENT'); setModalType('role'); }} className="p-2 bg-slate-100 text-slate-600 hover:bg-[#E33127] hover:text-white rounded-lg transition-all" title="Cambiar Rol"><IdentificationIcon className="w-5 h-5" /></button>
                          
                          {/* BOTÓN PASSWORD: ROJO EN HOVER */}
                          <button onClick={() => { setSelectedUser(row); setModalType('password'); }} className="p-2 bg-slate-100 text-slate-600 hover:bg-[#E33127] hover:text-white rounded-lg transition-all" title="Reset Contraseña"><KeyIcon className="w-5 h-5" /></button>
                        </>
                      )}
                      <button onClick={() => handleToggleStatus(row)} className={`p-2 rounded-lg transition-all ${row.disabled ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-red-600 hover:text-white'}`} title={row.disabled ? "Activar" : "Suspender"}>
                        {row.disabled ? <ShieldCheckIcon className="w-5 h-5" /> : <TrashIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL 1: CAJA RÁPIDA --- */}
      {modalType === 'balance' && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase text-slate-800">Caja Rápida</h2>
              <button onClick={closeModal}><XMarkIcon className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl mb-6 text-center border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase">Usuario: <span className="text-[#E33127]">{selectedUser.username}</span></p>
              <p className="text-sm font-bold text-slate-700 mt-1">Saldo Actual: ${Number(selectedUser.balance || 0).toLocaleString()}</p>
            </div>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full p-4 border-2 border-slate-200 rounded-2xl mb-6 text-3xl font-black text-center outline-none focus:border-[#E33127] transition-all" autoFocus />
            <div className="grid grid-cols-2 gap-4">
              <button disabled={actionLoading} onClick={() => handleBalance('add')} className="py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 disabled:opacity-50 transition-all shadow-md">ABONAR (+)</button>
              <button disabled={actionLoading} onClick={() => handleBalance('remove')} className="py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 disabled:opacity-50 transition-all shadow-md">RESTAR (-)</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ROLES --- */}
      {modalType === 'role' && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase text-slate-800">Definir Rol</h2>
              <button onClick={closeModal}><XMarkIcon className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
            </div>
            <div className="space-y-2 mb-6">
              {AVAILABLE_ROLES.map(role => (
                <button key={role} onClick={() => setSelectedRole(role)} className={`w-full py-3 px-4 rounded-xl text-left font-bold text-sm border-2 transition-all ${selectedRole === role ? 'border-[#E33127] bg-red-50 text-[#E33127]' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                  {role}
                </button>
              ))}
            </div>
            <button disabled={actionLoading} onClick={handleUpdateRole} className="w-full py-4 bg-[#E33127] text-white rounded-2xl font-bold hover:bg-red-700 disabled:opacity-50 shadow-lg shadow-red-200">GUARDAR CAMBIOS</button>
          </div>
        </div>
      )}

      {/* --- MODAL 3: PASSWORD --- */}
      {modalType === 'password' && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase text-slate-800">Nueva Contraseña</h2>
              <button onClick={closeModal}><XMarkIcon className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Establece una contraseña temporal para <b>{selectedUser.username}</b>.</p>
            <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full p-4 border-2 border-slate-200 rounded-2xl mb-6 text-xl font-bold text-center outline-none focus:border-[#E33127] transition-all" autoFocus />
            <button disabled={actionLoading} onClick={handleResetPassword} className="w-full py-4 bg-[#E33127] text-white rounded-2xl font-bold hover:bg-red-700 disabled:opacity-50 shadow-lg shadow-red-200">ACTUALIZAR CREDENCIAL</button>
          </div>
        </div>
      )}
    </div>
  );
}