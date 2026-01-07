import { Dropdown } from "flowbite-react";

export default function TableHead() {
  return (
    <tr className="bg-slate-50 border-b border-slate-100">
      <th className="px-5 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
        Usuario
      </th>
      <th className="px-5 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
        Nombre
      </th>
      <th className="px-5 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
        Correo
      </th>
      <th className="px-5 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
        Teléfono
      </th>
      <th className="px-5 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
        Rol
      </th>
      <th className="px-5 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
        Estatus
      </th>
      <th className="px-5 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
        Acciones
      </th>
    </tr>
  );
}