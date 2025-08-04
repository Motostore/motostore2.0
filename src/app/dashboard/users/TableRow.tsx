import { DropdownActions } from "@/app/components/MyDropdowns";
import { Dropdown } from "flowbite-react";
import Image from "next/image";

export default function TableRow({user, current, setUserSelected, setOpenModal, setOpenUpgradeModal, setOpenRemoveModal, setOpenEditModal}) {
  return (
  <tr className="group">
    <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm group-hover:bg-gray-100 cursor-pointer">
      <div className="flex items-center">
        <div className="ml-3">
          <p className="text-gray-900 whitespace-no-wrap">
            {user.username}
          </p>
        </div>
      </div>
    </td>
    <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm group-hover:bg-gray-100 cursor-pointer">
      <p className="text-gray-900 whitespace-no-wrap">{user.name}</p>
    </td>
    <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm group-hover:bg-gray-100 cursor-pointer">
      <p className="text-gray-900 whitespace-no-wrap">
        {user.email}
      </p>
    </td>
    <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm group-hover:bg-gray-100 cursor-pointer">
      <p className="text-gray-900 whitespace-no-wrap">
        {user.phone ?? '--'}
      </p>
    </td>
    <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm group-hover:bg-gray-100 cursor-pointer">
      <p className="text-gray-900 whitespace-no-wrap">
        {user.role ?? '--'}
      </p>
    </td>
    <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm group-hover:bg-gray-100 cursor-pointer">
      {
        !user.disabled 
        ?
        (
          <span
            className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
            <span aria-hidden
                className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
            <span className="relative">Activo</span>
          </span>
        )
        :
        (
          <span
            className="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
            <span aria-hidden
                className="absolute inset-0 bg-red-200 opacity-50 rounded-full"></span>
            <span className="relative">Inactivo</span>
          </span>
        )
      }
    </td>
    <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm group-hover:bg-gray-100 cursor-pointer">
      <div className="flex justify-end px-4">
        <DropdownActions 
          current={current} 
          setOpenEditModal={setOpenEditModal} 
          setOpenModal={setOpenModal} 
          setOpenRemoveModal={setOpenRemoveModal} 
          setOpenUpgradeModal={setOpenUpgradeModal}
          setUserSelected={setUserSelected}
          user={user} />
      </div>
    </td>
  </tr>
  )
}