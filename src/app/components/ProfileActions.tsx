'use client';
import { useContext, useState } from "react"
import { ProfileContext } from "../Context/profileContext";
import { ProfileButtonsEnum } from "../lib/enums";

export default function ProfileActions() {

    const { option, setOption } = useContext(ProfileContext);

    const onClicked = (value: ProfileButtonsEnum) => {
        setOption(value);
    }

    return (
        <div className="py-3 flex flex-col md:flex-row w-full md:justify-end gap-4">
            {
                (option === ProfileButtonsEnum.EDIT) ?
                <>
                    <button onClick={ () =>  onClicked(ProfileButtonsEnum.CANCEL)} type="submit" className="w-full md:w-56 rounded-md bg-gradient-to-r from-red-700 to-red-300 hover:to-red-400 px-10 py-2 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">Cancelar</button>
                    <button onClick={ () =>  onClicked(ProfileButtonsEnum.UPDATE)} type="submit" className="w-full md:w-56 rounded-md bg-gradient-to-r from-green-700 to-green-300 hover:to-green-400 px-10 py-2 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600">Actualizar</button>
                </> :
                    <button onClick={ () =>  onClicked(ProfileButtonsEnum.EDIT)} type="submit" className="w-full md:w-56 rounded-md bg-gradient-to-r from-blue-700 to-blue-300 hover:to-blue-400 px-10 py-2 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Editar</button>

            }
        </div>
  )
}
