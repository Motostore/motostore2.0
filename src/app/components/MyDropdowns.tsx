import { Dropdown } from "flowbite-react";
import Link from "next/link";

export function DropdownActions({title = 'Acciones', user, current, setUserSelected, setOpenModal, setOpenUpgradeModal, setOpenRemoveModal, setOpenEditModal}) {
  return (
    <Dropdown inline label={title}>
      <Dropdown.Item>
        <a
          href="#"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
          onClick={() => {
            setOpenModal(true);
            setUserSelected(user);
          }}
        >
          Ver
        </a>
      </Dropdown.Item>
      <Dropdown.Item>
        <a
          href="#"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
          onClick={() => {
            setOpenEditModal(true);
            setUserSelected(user);
          }}
        >
          Editar
        </a>
      </Dropdown.Item>
      {["ADMIN", "SUPERUSER"].includes(current?.role as string) &&
        (user.role as string) === "CLIENT" && (
          <Dropdown.Item>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-green-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={() => {
                setOpenUpgradeModal(true);
                setUserSelected(user);
              }}
            >
              Promover
            </a>
          </Dropdown.Item>
        )}
      <Dropdown.Item>
        <a
          href="#"
          className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
          onClick={() => {
            setOpenRemoveModal(true);
            setUserSelected(user);
          }}
        >
          Borrar
        </a>
      </Dropdown.Item>
    </Dropdown>
  );
}
export function DropdownBaseActions({title = 'Acciones', data}) {

  // const item1 = {
  //   text:'1',
  //   color:'text-red-700',
  //   func: () => console.log('Hey!')
  // }
  // const item2 = {
  //   text:'2',
  //   color:'text-blue-700',
  //   func: () => console.log('Hey 2!')
  // }
  // const item3 = {
  //   text:'3',
  //   color:'text-yellow-700',
  //   func: () => console.log('Hey 3!')
  // }
  // const data = [
  //   item1,
  //   item2,
  //   item3,
  // ]

  return (
    <Dropdown inline label={title}>
      {
        data.map((item, i) => (
        <Dropdown.Item key={i}>
          <Link
            href='#'
            className={`block px-4 py-2 text-sm ${item.color ?? 'text-gray-700'} text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white`}
            onClick={() => item.execute()}

          >
            <p>{item.text}</p>
          </Link>
        </Dropdown.Item>
        ))
      }
    </Dropdown>
  );
}

export function DropdownExport() {
  return (
    <Dropdown label="Exportar" className='py-1 w-full md:w-auto' dismissOnClick={false}>
      <Dropdown.Item>TXT</Dropdown.Item>
      <Dropdown.Item>PDF</Dropdown.Item>
    </Dropdown>
  );
}
