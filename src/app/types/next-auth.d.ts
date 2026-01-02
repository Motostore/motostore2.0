// src/app/types/next-auth.d.ts
import { User } from "./user.interface"; 
import { DefaultSession } from "next-auth"; 

// Extiende el módulo "next-auth"
declare module "next-auth" {
    
    interface Session extends DefaultSession {
        user: User; // Usa el tipo 'User' de tu proyecto
    }

    // Extiende la interfaz User para asegurar que todas las propiedades requeridas
    // (id, role, token) estén explícitamente definidas,
    // ya que son necesarias en la lógica de tus servicios (API calls) y el token.
    interface User {
        id: string | number; 
        role: string;
        token: string; // 🛑 CORRECCIÓN: Hace que 'token' sea obligatorio para NextAuth
        username?: string; // Campos opcionales que se usan en tu código (ej. users/TableRow.tsx)
        phone?: string; 
        // ... incluye cualquier otro campo que leas directamente de session.user
    }
}