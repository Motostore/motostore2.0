// src/app/types/user.interface.ts (CÓDIGO COMPLETO A REEMPLAZAR)

// Estos son los roles usados en el proyecto
export type Role = "ADMIN" | "DISTRIBUTOR" | "RESELLER" | "TAQUILLA" | "CLIENT" | "SUPERUSER";

export interface User {
    // Propiedades requeridas por NextAuth
    id: string | number;
    name?: string | null;
    email?: string | null;
    image?: string | null;

    // Propiedades requeridas por tu aplicación/Backend
    username?: string;
    role: Role; // Requerido por la lógica de permisos
    token: string; // Requerido por tus servicios (APIs)
    accessToken?: string; // Usado en NextAuth para el JWT
    
    // Otros campos específicos de tu backend o front-end
    balanceText?: string | null;
    backendData?: any;
    
    // 🛑 CORRECCIÓN: Quitamos 'null' para ser compatible con el tipo NextAuth User.
    phone?: string; 
    
    disabled?: boolean;
}