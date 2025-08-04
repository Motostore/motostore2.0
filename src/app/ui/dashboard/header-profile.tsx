'use client';
import { useSession } from "next-auth/react";
import Notifications from "./notifications";
import AvatarDropdown from "@/app/components/AvatarDropdown";
import Wallet from "@/app/components/MyWallet";

export default function HeaderProfile() {
    return (
        <UserLogged />
    )
}

function UserLogged() {
    const {data: session} = useSession();
    return (
        <>
        <div className="flex items-center justify-center gap-2">
            {
            session?.user
            ?
            <>
                <p>Bienvenido, {session?.user.name}</p>
                <Notifications />
                <AvatarDropdown user={session?.user} />
                <Wallet />
            </> 
            : null
            }
        </div>
        {/* Elimina esta línea, ya que currentDate() ya está en el Header */}
        {/* <p>{currentDate()}</p> */}
        </>
    )
}
