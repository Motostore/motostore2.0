// Archivo: src/ui/dashboard/SMMBalanceCard.tsx
import { CreditCardIcon } from "@heroicons/react/24/outline";

export default function SMMBalanceCard() {
  return (
    <div className="rounded-xl bg-gray-50 p-4 shadow-sm">
      <div className="flex p-4">
        <CreditCardIcon className="h-5 w-5 text-gray-700" />
        <h3 className="ml-2 text-sm font-medium text-gray-700">Balance SMM</h3>
      </div>
      <div className="truncate rounded-xl bg-white px-4 py-8 text-center text-2xl">
        {/* Aquí puedes conectar datos reales más tarde */}
        $0.00
      </div>
    </div>
  );
}