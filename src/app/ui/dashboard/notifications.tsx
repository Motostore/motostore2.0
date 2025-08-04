'use client';
import { fetchNotifications, markAsRead } from "@/app/lib/notifications";
import { BellIcon, ExclamationTriangleIcon} from "@heroicons/react/24/outline";
import clsx from "clsx";
import Link from "next/link";

import { useEffect, useState } from "react";

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getNotifications();
  }, []);

  async function readNotification(id) {
    const response = await markAsRead(id);
    getNotifications();
  }

  async function getNotifications() {
    const response = await fetchNotifications();
    setNotifications(response);
  }

  return (
    <div className="relative">
      <div 
      className="relative cursor-pointer"
      onClick={() => setOpen(!open)}
      >
        {
          notifications.length > 0 &&
          <span className="absolute py-0.5 px-1.5 -top-2 -right-2 text-white font-bold text-xs bg-red-600 rounded-full">{notifications.length}</span>
        }
        <BellIcon className="w-6 h-8" />
      </div>
      <div 
        className={clsx(
          'absolute overflow-auto right-0 w-96 max-h-96 bg-white border-2 rounded-lg py-2 px-3 shadow z-10',
          {
            'hidden': open === false,
            'block': open === true,
          },
        )}
      >
        <div className="flex justify-between items-center pb-2 border-b-2 ">
          <h5 className="text-gray-600 px-2">Notificaciones</h5>
          <span className="font-bold cursor-pointer" onClick={() => setOpen(!open)}>x</span>
        </div>
        {
          notifications.length > 0 
          ?
          <ul className="mt-1">
            {
              notifications.map((n) => (
                
                // <li className="hover:bg-gray-100 rounded-md px-2 py-1">Notificacion 1</li>
                <Link
                  key={n.id}
                  href={n.url}
                  className="flex grow items-center justify-center gap-2 rounded-md p-2 text-gray-500 text-sm hover:bg-gray-300  md:flex-none md:justify-start md:p-2 md:px-3 bg-white"
                  onClick={() => readNotification(n.id)}
                >
                  <ExclamationTriangleIcon className="w-10 text-white bg-yellow-400 p-1 font-bold rounded-full"/>
                  <p className="font-medium">{n.message}</p>
                </Link>
              ))
            }
          </ul>
          :
          <p className="hover:bg-gray-100 rounded-lg p-2">No hay notificaciones pendientes por leer</p>
        }
      </div>
    </div>
  );
}
