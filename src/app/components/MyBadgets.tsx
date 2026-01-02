// src/app/components/MyBadgets.tsx (CÓDIGO CORREGIDO Y COMPLETO)
import cn from "classnames";
import { HiCheck, HiXMark } from "react-icons/hi2"; // Asumo estos iconos

interface BadgeItemsProps {
    items: string[];
}
// 🛑 CORRECCIÓN TS7031, TS7006: Tipado de props, item, e index
export function BadgeItems({ items }: BadgeItemsProps) {
    return (
        <div className="flex flex-wrap gap-1">
            {items.map((item: string, i: number) => (
                <span
                    key={i}
                    className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                >
                    {item}
                </span>
            ))}
        </div>
    );
}

interface BadgeStatusProps {
    status: boolean | string;
}
// 🛑 CORRECCIÓN TS7031: Tipado de props
export function BadgeStatus({ status }: BadgeStatusProps) {
    const isActive = status === true || status === 'ACTIVE'; 
    const text = isActive ? 'Activo' : 'Inactivo';
    const className = isActive
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        
    return (
        <span
            className={cn(
                "text-xs font-medium me-2 px-2.5 py-0.5 rounded-full capitalize",
                className
            )}
        >
            {text}
        </span>
    );
}