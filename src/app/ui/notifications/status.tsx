import { HiCheck, HiMinus } from "react-icons/hi";

import clsx from 'clsx';

export default function NotificationStatus({ status }: { status: boolean }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        {
          'inline-flex items-center justify-between px-2.5 py-2 text-sm font-medium text-center text-gray-700 bg-gray-200 rounded-lg w-28': status === true,
          'inline-flex items-center justify-between px-2.5 py-2 text-sm font-medium text-center text-white bg-green-400 rounded-lg w-28': status === false,
        },
      )}
    >
      {status === true ? (
        <>
          No leído
          <span className="inline-flex items-center justify-center w-4 h-4 ms-2 text-xs font-semibold text-gray-800 bg-gray-300 rounded-full">
            <HiMinus />
          </span>
        </>
      ) : null}
      {status === false ? (
        <>
          Leído
          <span className="inline-flex items-center justify-center w-4 h-4 ms-2 text-xs font-semibold text-white rounded-full">
            <HiCheck />
          </span>
        </>
      ) : null}
    </span>
  );
}
