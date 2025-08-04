// const links = [
//   {
//     name: 'Perfil',
//     href: '/dashboard/profile',
//     enableFor: ["ALL"]
//   },
//   {
//     name: 'Mis cuentas',
//     href: '/dashboard/accounts',
//     enableFor: ["CLIENT"]
//   },
//   {
//     name: 'Compras',
//     href: '/dashboard/purchases',
//     enableFor: ["ALL"]
//   },
//   {
//     name: 'Notificaciones',
//     href: '/dashboard/notifications',
//     enableFor: ["ALL"]
//   },
//   {
//     name: 'Configuración',
//     href: '/dashboard/settings',
//     enableFor: ["ADMIN", "SUPERUSER"]
//   },
// ]

import { WalletIcon, BanknotesIcon } from "@heroicons/react/24/outline";

export default function Wallet() {

  return (
    <BanknotesIcon className="w-6 h-8" title="Mi billetera"/>
  );
}
