// src/app/dashboard/client-info/page.tsx
import Link from "next/link";

export default function ClientInfoPage() {
  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Bienvenido</h1>
      <p className="text-slate-700">
        Tu cuenta es de tipo <strong>CLIENTE</strong>. Para solicitar acceso a paneles
        o cambiar tu rango, por favor contacta al <strong>SUPERUSER</strong>.
        Él es el único autorizado para asignar o quitar rangos.
      </p>

      <div className="mt-6 space-x-3">
        <Link href="/support" className="btn-primary">Soporte</Link>
        <Link href="/login" className="btn-ghost">Cerrar sesión</Link>
      </div>
    </main>
  );
}
