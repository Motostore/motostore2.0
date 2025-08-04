'use client';
import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileButtonsEnum } from "../lib/enums";

export const ProfileContext = createContext(null);

export const ProfileProvider = ({children}) => {

  const router = useRouter();

  const [option, setOption] = useState(ProfileButtonsEnum.CANCEL);

  return (
    <ProfileContext.Provider
      value={{
        option,
        setOption
      }}>
      {children}
    </ProfileContext.Provider>
  );
}