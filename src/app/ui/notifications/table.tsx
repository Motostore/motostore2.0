'use client'
import { useEffect, useState } from 'react';
import { fetchAllNotifications, markAsRead } from '@/app/lib/notifications';
import NotificationStatus from './status';
import { EyeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { formatDateToLocal } from '@/app/lib/utils';

export default function NotificationsTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  // CORRECCIÓN: Definimos el estado como un array de cualquier tipo (<any[]>)
  const [notifications, setNotifications] = useState<any[]>([]);


  useEffect(() => {
    getNotifications();
  }, []);
  
  async function getNotifications() {
    const response = await fetchAllNotifications();
    // Verificamos que sea un array antes de setearlo para evitar errores
    if (Array.isArray(response)) {
        setNotifications(response);
    }
  }

  // CORRECCIÓN: Agregamos el tipo ': any' al id
  async function readNotification(id: any) {
    const response = await markAsRead(id);
    getNotifications();
  }
  
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {
              notifications.length > 0
              ?
              notifications?.map((n) => (
                <div
                  key={n.id}
                  className="mb-2 w-full rounded-md bg-white p-4"
                >
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <div className="mb-2 flex items-center">
                        <p>{n.id}</p>
                      </div>
                      <p className="text-sm text-gray-500">{n.message}</p>
                    </div>
                    <NotificationStatus status={n.status} />
                  </div>
                  <div className="flex w-full items-center justify-between pt-4">
                    <div>
                      <p className="text-xl font-medium">
                        {n.sender}
                      </p>
                      <p>{formatDateToLocal(n.date) || '---'}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                    {
                        n.url != null ?
                        (<Link
                          href={n.url}
                          className="flex justify-center"
                          title='Ver'
                          onClick={() => readNotification(n.id)}
                        >
                          <EyeIcon className="w-6 text-orange-500" />
                        </Link>)
                        :
                        null
                      }
                    </div>
                  </div>
                </div>
              ))
              :
              <p>
                No hay notificaciones
              </p>
            }
            </div>
            {
            notifications.length > 0
            ?
            <table className="hidden min-w-full text-gray-900 md:table">
              <thead className="rounded-lg text-left text-sm font-normal">
                <tr>
                  <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                    Id
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Mensaje
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Cliente
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Fecha
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Estado
                  </th>
                  <th scope="col" className="relative py-3 pl-6 pr-3">
                    <span className="sr-only">Edit</span>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {
                notifications?.map((n) => (
                  <tr
                    key={n.id}
                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                  >
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <p>{n.id}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {n.message}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {n.sender}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {formatDateToLocal(n.date) || '---'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <NotificationStatus status={n.status} />
                    </td>
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      {
                        n.url != null ?
                        (<Link
                          href={n.url}
                          className="flex justify-center"
                          title='Ver'
                          onClick={() => readNotification(n.id)}
                        >
                          <EyeIcon className="w-10 bg-orange-500 text-white font-bold rounded-lg px-2 py-1" />
                        </Link>)
                        :
                        null
                      }
                    </td>
                  </tr>
                ))
              }
                
            </tbody>
            </table>
            :
            <p>No hay Notificaciones</p>
            }
        </div>
      </div>
    </div>
  );
}
