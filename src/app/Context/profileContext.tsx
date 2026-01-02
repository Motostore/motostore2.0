'use client';
import { createContext, useContext, useState, ReactNode } from "react";
import { ProfileButtonsEnum } from "../lib/enums";

// Definir el tipo para el contexto
export type ProfileContextType = {
  option: ProfileButtonsEnum;
  setOption: React.Dispatch<React.SetStateAction<ProfileButtonsEnum>>;
};

// Crear el contexto con el tipo
export const ProfileContext = createContext<ProfileContextType | null>(null);

// Asegurar que ProfileProvider reciba `children` correctamente tipado
export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [option, setOption] = useState<ProfileButtonsEnum>(ProfileButtonsEnum.CANCEL);

  return (
    <ProfileContext.Provider value={{ option, setOption }}>
      {children}
    </ProfileContext.Provider>
  );
};

// Hook personalizado para usar el contexto en otros componentes
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile debe usarse dentro de ProfileProvider");
  }
  return context;
};
