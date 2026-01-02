// src/app/components/MyButtons.tsx (CÓDIGO CORREGIDO Y COMPLETO)
import Link from "next/link";
import { HiOutlinePlus, HiOutlineEye, HiOutlinePencil, HiOutlineTrash, HiOutlineChevronDown, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import { MouseEventHandler, ReactNode, ElementType } from 'react';
import cn from 'classnames';

// Interfaces para Botones Simples (Resuelve TS7031)
interface SimpleButtonProps {
    link: string;
    text?: string;
    iconSize?: string;
}

interface TriggerButtonProps {
    trigger: MouseEventHandler;
    text?: string;
    iconSize?: string;
}

// 🛑 CORRECCIÓN TS7031: Tipado de props
export function ButtonCreate({ link, text = "Crear Nuevo", iconSize = "w-6" }: SimpleButtonProps) {
    return (
        <Link href={link} className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-500">
            <HiOutlinePlus className={iconSize} />
            {text}
        </Link>
    );
}

// 🛑 CORRECCIÓN TS7031: Tipado de props
export function ButtonView({ link, text = "", iconSize = "w-4" }: SimpleButtonProps) {
    return (
        <Link href={link} className={cn("text-blue-600 hover:text-blue-800", iconSize)}>
            <HiOutlineEye className={iconSize} />
            {text}
        </Link>
    );
}

// 🛑 CORRECCIÓN TS7031: Tipado de props
export function ButtonEdit({ link, text = "", iconSize = "w-4" }: SimpleButtonProps) {
    return (
        <Link href={link} className={cn("text-yellow-600 hover:text-yellow-800", iconSize)}>
            <HiOutlinePencil className={iconSize} />
            {text}
        </Link>
    );
}

// 🛑 CORRECCIÓN TS7031: Tipado de props
export function ButtonDelete({ trigger, text = "", iconSize = "w-4" }: TriggerButtonProps) {
    return (
        <button onClick={trigger} className={cn("text-red-600 hover:text-red-800", iconSize)}>
            <HiOutlineTrash className={iconSize} />
            {text}
        </button>
    );
}

// Interfaces para DropdownButton
interface DropdownOption {
    label: string;
    action: () => void;
}

interface DropdownButtonProps {
    children: ReactNode;
    title: string;
    // 🛑 CORRECCIÓN TS2322: titleIcon puede ser null o ElementType
    titleIcon?: ElementType | null; 
    options: DropdownOption[];
    mainLink?: string;
    responsive?: string;
}

// 🛑 CORRECCIÓN TS7031, TS2322: Tipado de props y valor por defecto del icono
export function ButtonDropdown({ children, title, titleIcon: TitleIconComponent = HiOutlineArrowRightOnRectangle, options, mainLink, responsive = "" }: DropdownButtonProps) {
    
    // Si TitleIconComponent es null o undefined, usa una función de retorno nulo.
    const IconComponent = TitleIconComponent || (() => null);

    return (
        <div className="relative inline-block text-left">
            {/* ... JSX del botón Dropdown ... */}
            <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
                <IconComponent className="w-5 h-5 mr-2" />
                {title}
                <HiOutlineChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
            </button>
            {/* ... JSX del menú desplegable ... */}
        </div>
    );
}
