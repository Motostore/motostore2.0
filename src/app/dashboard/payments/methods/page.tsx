// src/app/dashboard/payments/methods/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import PaymentMethodCard from './PaymentMethodCard';
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc, query, Firestore
} from 'firebase/firestore';
import { getAuth, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';

/* ===========================
   Datos de prueba (offline)
=========================== */
const DUMMY_PAYMENTS = [
  // Venezuela
  { id: 've1', name: 'Bancamiga', bankName: 'Bancamiga', type: 'BANK_TRANSFER' },
  { id: 've2', name: 'Mercantil', bankName: 'Mercantil', type: 'BANK_TRANSFER' },
  { id: 've3', name: 'Pago Móvil', bankName: 'Mercantil', bankCode: '0105', idNumber: '12345678', ownerPhone: '04241234567', type: 'MOBILE_PAYMENT' },
  // Colombia
  { id: 'co1', name: 'Bancolombia', bankName: 'Bancolombia', type: 'BANK_TRANSFER' },
  { id: 'co2', name: 'Transfiya', type: 'MOBILE_PAYMENT' },
  { id: 'co3', name: 'Nequi', type: 'MOBILE_PAYMENT' },
  { id: 'co4', name: 'Bre-B', bankName: 'Bre-B', type: 'BANK_TRANSFER' },
  // USA (Zelle)
  { id: 'us1', name: 'Zelle', type: 'ZELLE_PAYMENT', ownerEmail: 'zelle@email.com' },
  { id: 'us2', name: 'Majority', type: 'ZELLE_PAYMENT', ownerEmail: 'majority@email.com' },
  { id: 'us3', name: 'Común', type: 'ZELLE_PAYMENT', ownerEmail: 'comun@example.com' },
  { id: 'us4', name: 'Panas', type: 'ZELLE_PAYMENT', ownerEmail: 'panas@example.com' },
  // Billeteras
  { id: 'wa1', name: 'Binance Pay', type: 'BINANCE_PAYMENT' },
  { id: 'wa2', name: 'PayPal', type: 'PAYPAL_PAYMENT' },
  { id: 'wa3', name: 'Zinli', type: 'ZINLI_PAYMENT' },
  { id: 'wa4', name: 'Wally', type: 'WALLY_PAYMENT' },
];

/* ===========================
   Tipos y utilidades
=========================== */
type PaymentType =
  | 'BANK_TRANSFER'
  | 'MOBILE_PAYMENT'
  | 'ZELLE_PAYMENT'
  | 'BINANCE_PAYMENT'
  | 'PAYPAL_PAYMENT'
  | 'ZINLI_PAYMENT'
  | 'WALLY_PAYMENT';

type PM = {
  id?: string;
  name?: string | null;
  bankName?: string | null;
  // Pago Móvil
  bankCode?: string | null; // 0105
  idNumber?: string | null; // cédula
  ownerPhone?: string | null; // teléfono
  // Zelle
  ownerEmail?: string | null;

  type?: PaymentType | null;
};

const as = (s?: string | null) => (s ?? '').toLowerCase();

function groupPayments(items: PM[]) {
  const out: Record<'ve' | 'co' | 'us' | 'wallet', PM[]> = { ve: [], co: [], us: [], wallet: [] };

  for (const m of items) {
    const name = as(m.name);
    const bank = as(m.bankName);
    const phone = as(m.ownerPhone);
    const t = (m.type ?? '').toUpperCase() as PaymentType | string;

    // Billeteras globales
    if (
      ['BINANCE_PAYMENT', 'ZINLI_PAYMENT', 'WALLY_PAYMENT', 'PAYPAL_PAYMENT'].includes(t) ||
      ['paypal', 'binance', 'zinli', 'wally'].some((k) => name.includes(k))
    ) { out.wallet.push(m); continue; }

    // Colombia
    if (['nequi', 'transfiya'].some((k) => name.includes(k))) { out.co.push(m); continue; }
    if (t === 'BANK_TRANSFER' && (bank.includes('bancolombia') || bank.includes('bre-b') || name.includes('bancolombia') || name.includes('bre-b'))) {
      out.co.push(m); continue;
    }

    // Venezuela
    if (t === 'MOBILE_PAYMENT' || phone.startsWith('+58') || phone.startsWith('041') || phone.startsWith('042') || phone.startsWith('043')) {
      out.ve.push(m); continue;
    }
    if (t === 'BANK_TRANSFER' && (bank.includes('bancamiga') || bank.includes('mercantil') || name.includes('bancamiga') || name.includes('mercantil'))) {
      out.ve.push(m); continue;
    }

    // USA (Zelle)
    if (t === 'ZELLE_PAYMENT' || ['zelle', 'majority', 'común', 'comun', 'panas'].some((k) => name.includes(k))) {
      out.us.push(m); continue;
    }
  }
  return out;
}

const LABELS: Record<string, string> = {
  BANK_TRANSFER: 'Transferencia',
  MOBILE_PAYMENT: 'Pago Móvil',
  ZELLE_PAYMENT: 'Zelle',
  BINANCE_PAYMENT: 'Binance Pay',
  PAYPAL_PAYMENT: 'PayPal',
  ZINLI_PAYMENT: 'Zinli',
  WALLY_PAYMENT: 'Wally',
};

/* ===========================
   Página
=========================== */
export default function Page() {
  const [payments, setPayments] = useState<PM[]>([]);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [newPayment, setNewPayment] = useState<PM>({
    name: '',
    bankName: '',
    bankCode: '',
    idNumber: '',
    ownerPhone: '',
    type: 'MOBILE_PAYMENT',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<Firestore | null>(null);

  // Estado conexión/datos
  const [usingDummy, setUsingDummy] = useState<boolean>(false);
  const [docCount, setDocCount] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string>('');

  // Admin
  const [showAdmin, setShowAdmin] = useState(false);
  const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234';

  // Ruta Firestore
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'TU_PROJECT_ID';
  const PATH = `artifacts/${projectId}/public/data/payments`;

  const openAdmin = () => {
    const pin = typeof window !== 'undefined' ? window.prompt('Ingresa el PIN de admin') : null;
    if (pin !== ADMIN_PIN) return alert('PIN incorrecto');
    setIsSuperUser(true);
    setShowAdmin(true);
  };
  const closeAdmin = () => setShowAdmin(false);

  // -------- Firebase: lectura SIEMPRE (auth opcional) --------
  useEffect(() => {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      // Sin claves => modo local
      setUsingDummy(true);
      setPayments(DUMMY_PAYMENTS);
      setDocCount(DUMMY_PAYMENTS.length);
      setLoading(false);
      return;
    }

    const app = initializeApp(firebaseConfig);
    const firestoreDb = getFirestore(app);
    setDb(firestoreDb);

    // Opcional: si algún día usas token, quedas como superuser
    const auth = getAuth(app);
    onAuthStateChanged(auth, (u) => { if (u) setIsSuperUser(true); });
    const token = null; // si lo tienes, colócalo
    if (token) signInWithCustomToken(auth, token).catch(console.error);

    // Suscripción a datos
    const q = query(collection(firestoreDb, PATH));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: PM[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<PM, 'id'>) }));
        setPayments(list);
        setDocCount(snap.size);
        setUsingDummy(false);
        setLoading(false);
        setLastError('');
      },
      (err) => {
        console.error('onSnapshot error:', err);
        setLastError(err?.message || String(err));
        setUsingDummy(true);
        setPayments(DUMMY_PAYMENTS);
        setDocCount(DUMMY_PAYMENTS.length);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [PATH]);

  // -------- Sembrar datos (¡sin entrar a la consola!) --------
  const [seeding, setSeeding] = useState(false);
  const seedPayments = async () => {
    if (!db) return alert('No hay conexión con Firebase (revisa .env.local).');
    try {
      setSeeding(true);
      const examples: PM[] = [
        { name: 'Pago Móvil', type: 'MOBILE_PAYMENT', bankName: 'Mercantil', bankCode: '0105', idNumber: '12345678', ownerPhone: '04241234567' },
        { name: 'Bancamiga', type: 'BANK_TRANSFER', bankName: 'Bancamiga' },
        { name: 'Zelle', type: 'ZELLE_PAYMENT', ownerEmail: 'zelle@ejemplo.com' },
      ];
      const colRef = collection(db, PATH);
      await Promise.all(examples.map((p) => addDoc(colRef, p)));
      alert('¡Listo! Se crearon 3 métodos en Firestore.');
    } catch (e: any) {
      console.error(e);
      alert('No pude crear los datos. Si ves "PERMISSION_DENIED", activa reglas de prueba en Firestore.');
    } finally {
      setSeeding(false);
    }
  };

  // -------- Agrupado + orden --------
  const grouped = useMemo(() => {
    const g = groupPayments(payments);
    const by = (a: PM, b: PM) =>
      (a.type ?? '').localeCompare(b.type ?? '') || (a.name ?? '').localeCompare(b.name ?? '');
    return { ve: g.ve.sort(by), co: g.co.sort(by), us: g.us.sort(by), wallet: g.wallet.sort(by) };
  }, [payments]);

  // -------- Validación --------
  const requireFieldsByType = (p: PM) => {
    const t = p.type;
    if (!p.name) return 'Falta el nombre';
    if (t === 'MOBILE_PAYMENT') {
      if (!p.bankName) return 'Falta el banco (Pago Móvil)';
      if (!p.bankCode) return 'Falta el código del banco (0105)';
      if (!p.idNumber) return 'Falta la cédula';
      if (!p.ownerPhone) return 'Falta el teléfono';
    }
    if (t === 'ZELLE_PAYMENT' && !p.ownerEmail) return 'Falta el email para Zelle';
    if (t === 'BANK_TRANSFER' && !p.bankName) return 'Falta nombre del banco';
    return null;
  };

  const resetForm = () =>
    setNewPayment({
      name: '',
      bankName: '',
      bankCode: '',
      idNumber: '',
      ownerPhone: '',
      ownerEmail: '',
      type: 'MOBILE_PAYMENT',
    });

  // -------- Crear / editar / eliminar --------
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperUser) return alert('No autorizado para guardar.');
    const { id: _id, ...payload } = newPayment;
    const err = requireFieldsByType(payload);
    if (err) return alert(err);

    if (usingDummy || !db) {
      setPayments((prev) => {
        if (editingId) return prev.map((p) => (p.id === editingId ? { ...p, ...payload } : p));
        return [...prev, { id: 'local_' + Date.now(), ...payload }];
      });
      setEditingId(null);
      resetForm();
      return;
    }

    try {
      if (editingId) { await updateDoc(doc(db, PATH, editingId), payload); setEditingId(null); }
      else { await addDoc(collection(db, PATH), payload); }
      resetForm();
    } catch (e: any) {
      console.error('Error al guardar:', e);
      alert('Ocurrió un error al guardar en Firebase: ' + (e?.message || String(e)));
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!isSuperUser) return alert('No autorizado para eliminar.');
    if (!confirm('¿Eliminar este método de pago?')) return;

    if (usingDummy || !db) { setPayments((prev) => prev.filter((p) => p.id !== id)); return; }

    try { await deleteDoc(doc(db, PATH, id)); }
    catch (e: any) {
      console.error('Error al eliminar:', e);
      alert('Ocurrió un error al eliminar en Firebase: ' + (e?.message || String(e)));
    }
  };

  const handleEditClick = (payment: PM) => {
    setNewPayment(payment);
    setEditingId(payment.id || null);
    setShowAdmin(true);
  };

  const onTypeChange = (t: PaymentType) => {
    setNewPayment((prev) => {
      if (t === 'MOBILE_PAYMENT') {
        return { name: prev.name ?? '', bankName: prev.bankName ?? '', bankCode: prev.bankCode ?? '', idNumber: prev.idNumber ?? '', ownerPhone: prev.ownerPhone ?? '', type: t };
      }
      if (t === 'ZELLE_PAYMENT') return { name: prev.name ?? '', ownerEmail: prev.ownerEmail ?? '', type: t };
      if (t === 'BANK_TRANSFER') return { name: prev.name ?? '', bankName: prev.bankName ?? '', type: t };
      return { name: prev.name ?? '', type: t };
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen p-8 flex justify-center items-center bg-gray-50 text-gray-800">
        <p>Cargando métodos de pago...</p>
      </main>
    );
  }

  /* ===========================
     UI
  =========================== */
  return (
    <main className="min-h-screen p-8 bg-app text-gray-800">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Métodos de Pago</h1>
        <p className="text-gray-600 mb-4">
          Aquí se muestra una lista de métodos de pago agrupados por país y tipo, gestionados desde Firestore.
        </p>

        {/* Diagnóstico + botón de sembrar (solo admin) */}
        {isSuperUser && (
          <div className="mb-6 p-3 rounded border border-amber-300 bg-amber-50 text-amber-900 text-sm">
            <div><strong>Diagnóstico</strong></div>
            <div>Project ID: <code className="px-1 bg-white border rounded">{process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'SIN_CONFIG'}</code></div>
            <div>Ruta usada: <code className="px-1 bg-white border rounded">{PATH}</code></div>
            <div>Documentos leídos: <code className="px-1 bg-white border rounded">{docCount ?? '-'}</code></div>
            {lastError && <div className="mt-1">Error: <code className="px-1 bg-white border rounded">{lastError}</code></div>}

            {docCount === 0 && !usingDummy && (
              <button
                onClick={seedPayments}
                disabled={seeding}
                className="btn btn-primary mt-3"
              >
                {seeding ? 'Creando…' : 'Crear colección y cargar ejemplos'}
              </button>
            )}

            {usingDummy && (
              <div className="mt-2">Estás viendo datos locales (dummy) porque no hay conexión a Firebase.</div>
            )}
          </div>
        )}

        {/* Formulario (solo Admin) */}
        {isSuperUser && (
          <div className="form-card">
            <h2 className="form-title">
              {editingId ? 'Editar Método de Pago' : 'Añadir Nuevo Método de Pago'}
            </h2>

            <form onSubmit={handleFormSubmit} className="form-grid">
              {/* Nombre */}
              <input
                type="text"
                value={newPayment.name ?? ''}
                onChange={(e) => setNewPayment({ ...newPayment, name: e.target.value })}
                placeholder="Nombre (ej. Pago Móvil / Zelle / Bancamiga)"
                className="input"
                required
              />

              {/* Por tipo */}
              {newPayment.type === 'BANK_TRANSFER' && (
                <input
                  type="text"
                  value={newPayment.bankName ?? ''}
                  onChange={(e) => setNewPayment({ ...newPayment, bankName: e.target.value })}
                  placeholder="Banco (ej. Bancamiga)"
                  className="input"
                  required
                />
              )}

              {newPayment.type === 'MOBILE_PAYMENT' && (
                <>
                  <input
                    className="input"
                    placeholder="Banco (ej. Mercantil)"
                    value={newPayment.bankName ?? ''}
                    onChange={(e) => setNewPayment({ ...newPayment, bankName: e.target.value })}
                    required
                  />
                  <input
                    className="input"
                    placeholder="Código del banco (ej. 0105)"
                    value={newPayment.bankCode ?? ''}
                    onChange={(e) => setNewPayment({ ...newPayment, bankCode: e.target.value })}
                    required
                  />
                  <input
                    className="input"
                    placeholder="Cédula (sólo números)"
                    value={newPayment.idNumber ?? ''}
                    onChange={(e) => setNewPayment({ ...newPayment, idNumber: e.target.value })}
                    required
                  />
                  <input
                    className="input"
                    placeholder="Teléfono (ej. 04241234567)"
                    value={newPayment.ownerPhone ?? ''}
                    onChange={(e) => setNewPayment({ ...newPayment, ownerPhone: e.target.value })}
                    required
                  />
                </>
              )}

              {newPayment.type === 'ZELLE_PAYMENT' && (
                <input
                  type="email"
                  value={newPayment.ownerEmail ?? ''}
                  onChange={(e) => setNewPayment({ ...newPayment, ownerEmail: e.target.value })}
                  placeholder="Email de Zelle"
                  className="input"
                  required
                />
              )}

              {/* Selector de tipo */}
              <select
                value={newPayment.type ?? 'MOBILE_PAYMENT'}
                onChange={(e) => onTypeChange(e.target.value as any)}
                className="select"
              >
                <option value="BANK_TRANSFER">Transferencia Bancaria</option>
                <option value="MOBILE_PAYMENT">Pago Móvil</option>
                <option value="ZELLE_PAYMENT">Zelle</option>
                <option value="BINANCE_PAYMENT">Binance</option>
                <option value="PAYPAL_PAYMENT">PayPal</option>
                <option value="ZINLI_PAYMENT">Zinli</option>
                <option value="WALLY_PAYMENT">Wally</option>
              </select>

              {/* Botones */}
              <button
                type="submit"
                className="btn btn-primary col-span-1 md:col-span-2 lg:col-span-3"
              >
                {editingId ? 'Guardar Cambios' : 'Añadir Método'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); resetForm(); }}
                  className="btn btn-ghost col-span-1 md:col-span-2 lg:col-span-3"
                >
                  Cancelar Edición
                </button>
              )}
            </form>

            <p className="form-help">
              Los campos obligatorios cambian según el tipo seleccionado.
            </p>
          </div>
        )}

        {/* Venezuela */}
        {grouped.ve.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center gap-2"><span>Venezuela</span><span className="text-xl">🇻🇪</span></h2>
            <div className="grid gap-4">
              {grouped.ve.map((pm) => (
                <div key={pm.id} className="relative">
                  <PaymentMethodCard m={{ ...pm, label: pm.type ? LABELS[pm.type] : '' } as any} />
                  {isSuperUser && (
                    <>
                      <button onClick={() => handleEditClick(pm)} className="absolute top-2 right-10 bg-blue-500 text-white text-xs p-1 rounded-full hover:bg-blue-600">✏️</button>
                      <button onClick={() => handleDeletePayment(pm.id as string)} className="absolute top-2 right-2 bg-red-500 text-white text-xs p-1 rounded-full hover:bg-red-600">X</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Colombia */}
        {grouped.co.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center gap-2"><span>Colombia</span><span className="text-xl">🇨🇴</span></h2>
            <div className="grid gap-4">
              {grouped.co.map((pm) => (
                <div key={pm.id} className="relative">
                  <PaymentMethodCard m={{ ...pm, label: pm.type ? LABELS[pm.type] : '' } as any} />
                  {isSuperUser && (
                    <>
                      <button onClick={() => handleEditClick(pm)} className="absolute top-2 right-10 bg-blue-500 text-white text-xs p-1 rounded-full hover:bg-blue-600">✏️</button>
                      <button onClick={() => handleDeletePayment(pm.id as string)} className="absolute top-2 right-2 bg-red-500 text-white text-xs p-1 rounded-full hover:bg-red-600">X</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* USA */}
        {grouped.us.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center gap-2"><span>Estados Unidos</span><span className="text-xl">🇺🇸</span></h2>
            <div className="grid gap-4">
              {grouped.us.map((pm) => (
                <div key={pm.id} className="relative">
                  <PaymentMethodCard m={{ ...pm, label: pm.type ? LABELS[pm.type] : '' } as any} />
                  {isSuperUser && (
                    <>
                      <button onClick={() => handleEditClick(pm)} className="absolute top-2 right-10 bg-blue-500 text-white text-xs p-1 rounded-full hover:bg-blue-600">✏️</button>
                      <button onClick={() => handleDeletePayment(pm.id as string)} className="absolute top-2 right-2 bg-red-500 text-white text-xs p-1 rounded-full hover:bg-red-600">X</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Billeteras */}
        {grouped.wallet.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center gap-2"><span>Billeteras</span><span className="text-xl">💳</span></h2>
            <div className="grid gap-4">
              {grouped.wallet.map((pm) => (
                <div key={pm.id} className="relative">
                  <PaymentMethodCard m={{ ...pm, label: pm.type ? LABELS[pm.type] : '' } as any} />
                  {isSuperUser && (
                    <>
                      <button onClick={() => handleEditClick(pm)} className="absolute top-2 right-10 bg-blue-500 text-white text-xs p-1 rounded-full hover:bg-blue-600">✏️</button>
                      <button onClick={() => handleDeletePayment(pm.id as string)} className="absolute top-2 right-2 bg-red-500 text-white text-xs p-1 rounded-full hover:bg-red-600">X</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Botón flotante Admin (TEXTO CAMBIADO A MAYÚSCULAS) */}
      <button
        onClick={openAdmin}
        className="fixed bottom-4 right-4 h-12 px-4 rounded-full bg-black text-white shadow-lg hover:opacity-90 active:scale-95"
        aria-label="Abrir panel admin"
        title="Abrir panel admin"
      >
        ⚙️ ADMIN
      </button>

      {/* Drawer Admin */}
      {showAdmin && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={closeAdmin} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Panel Admin</h3>
              <button onClick={closeAdmin} className="text-gray-500 hover:text-gray-700">✖</button>
            </div>

            <SearchAndPick
              items={payments}
              onPick={(pm) => handleEditClick(pm)}
              onDuplicate={(pm) => {
                const { id: _id, ...copy } = pm;
                setEditingId(null);
                setNewPayment({ ...copy, name: `${pm.name ?? ''} (copia)` });
              }}
              onDelete={(pm) => pm.id && handleDeletePayment(pm.id)}
              canEdit={isSuperUser}
            />

            <hr className="my-4" />

            <h4 className="font-semibold mb-2">{editingId ? 'Editar Método' : 'Añadir Método'}</h4>
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 gap-3">
              <input
                type="text"
                value={newPayment.name ?? ''}
                onChange={(e) => setNewPayment({ ...newPayment, name: e.target.value })}
                placeholder="Nombre (ej. Pago Móvil / Zelle / Bancamiga)"
                className="input"
                required
              />

              {newPayment.type === 'BANK_TRANSFER' && (
                <input
                  type="text"
                  value={newPayment.bankName ?? ''}
                  onChange={(e) => setNewPayment({ ...newPayment, bankName: e.target.value })}
                  placeholder="Nombre del Banco"
                  className="input"
                  required
                />
              )}

              {newPayment.type === 'MOBILE_PAYMENT' && (
                <>
                  <input
                    className="input"
                    placeholder="Banco (ej. Mercantil)"
                    value={newPayment.bankName ?? ''}
                    onChange={(e) => setNewPayment({ ...newPayment, bankName: e.target.value })}
                    required
                  />
                  <input
                    className="input"
                    placeholder="Código del banco (ej. 0105)"
                    value={newPayment.bankCode ?? ''}
                    onChange={(e) => setNewPayment({ ...newPayment, bankCode: e.target.value })}
                    required
                  />
                  <input
                    className="input"
                    placeholder="Cédula (sólo números)"
                    value={newPayment.idNumber ?? ''}
                    onChange={(e) => setNewPayment({ ...newPayment, idNumber: e.target.value })}
                    required
                  />
                  <input
                    className="input"
                    placeholder="Teléfono (ej. 04241234567)"
                    value={newPayment.ownerPhone ?? ''}
                    onChange={(e) => setNewPayment({ ...newPayment, ownerPhone: e.target.value })}
                    required
                  />
                </>
              )}

              {newPayment.type === 'ZELLE_PAYMENT' && (
                <input
                  type="email"
                  value={newPayment.ownerEmail ?? ''}
                  onChange={(e) => setNewPayment({ ...newPayment, ownerEmail: e.target.value })}
                  placeholder="Email de Zelle"
                  className="input"
                  required
                />
              )}

              <select
                value={newPayment.type ?? 'MOBILE_PAYMENT'}
                onChange={(e) => onTypeChange(e.target.value as any)}
                className="select"
              >
                <option value="BANK_TRANSFER">Transferencia Bancaria</option>
                <option value="MOBILE_PAYMENT">Pago Móvil</option>
                <option value="ZELLE_PAYMENT">Zelle</option>
                <option value="BINANCE_PAYMENT">Binance</option>
                <option value="PAYPAL_PAYMENT">PayPal</option>
                <option value="ZINLI_PAYMENT">Zinli</option>
                <option value="WALLY_PAYMENT">Wally</option>
              </select>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!isSuperUser}
                  className={`btn ${isSuperUser ? 'btn-primary' : 'bg-gray-400 text-white cursor-not-allowed'}`}
                >
                  {editingId ? 'Guardar cambios' : 'Añadir método'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => { setEditingId(null); resetForm(); }}
                    className="btn btn-ghost"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/* ========= componente de búsqueda/selección dentro del Panel Admin ========= */
function SearchAndPick({
  items, onPick, onDuplicate, onDelete, canEdit,
}: { items: PM[]; onPick: (pm: PM) => void; onDuplicate: (pm: PM) => void; onDelete: (pm: PM) => void; canEdit: boolean; }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = (q || '').toLowerCase().trim();
    if (!s) return items;
    return items.filter((i) => {
      const hay = [i.name ?? '', i.bankName ?? '', i.bankCode ?? '', i.idNumber ?? '', i.ownerEmail ?? '', i.ownerPhone ?? '', i.type ?? ''].join(' ').toLowerCase();
      return hay.includes(s);
    });
  }, [q, items]);

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, banco, código, cédula, email o teléfono" className="input" />
        <button type="button" onClick={() => setQ('')} className="btn btn-ghost">Limpiar</button>
      </div>
      <ul className="space-y-2 max-h-64 overflow-auto pr-1">
        {filtered.map((pm) => (
          <li key={pm.id ?? pm.name} className="glass-card p-2 flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium">{pm.name}</div>
              <div className="text-gray-600">
                {pm.type}
                {pm.bankName ? ` • Banco: ${pm.bankName}` : ''}
                {pm.bankCode ? ` • Código: ${pm.bankCode}` : ''}
                {pm.idNumber ? ` • Cédula: ${pm.idNumber}` : ''}
                {pm.ownerEmail ? ` • ${pm.ownerEmail}` : ''}
                {pm.ownerPhone ? ` • ${pm.ownerPhone}` : ''}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => onPick(pm)} className="btn btn-primary text-white">Editar</button>
              <button type="button" onClick={() => onDuplicate(pm)} className="btn btn-ghost">Duplicar</button>
              <button
                type="button"
                onClick={() => onDelete(pm)}
                disabled={!canEdit}
                className={`btn ${canEdit ? 'btn-danger' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
        {filtered.length === 0 && <li className="text-sm text-gray-500">No hay resultados.</li>}
      </ul>
    </div>
  );
}





















