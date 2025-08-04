import {
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function ButtonCreate({ link, text = "", iconSize = "w-8" }) {
  return (
    <Link
      href={link}
      className="flex gap-3 items-center bg-orange-500 w-fit hover:bg-orange-300 text-white text-sm rounded-lg px-2 py-2"
    >
      {text !== "" ? <span>{text}</span> : null}
      <PlusCircleIcon className={iconSize} />
    </Link>
  );
}

export function ButtonView({ link, text = "", iconSize = "w-6" }) {
  return (
    <Link
      href={link}
      className="flex gap-3 items-center bg-blue-500 w-fit hover:bg-blue-300 text-white text-sm rounded-lg px-2 py-2"
    >
      {text !== "" ? <span>{text}</span> : null}
      <EyeIcon className={iconSize} />
    </Link>
  );
}

export function ButtonEdit({ link, text = "", iconSize = "w-6" }) {
  return (
    <Link
      href={link}
      className={`flex gap-3 items-center font-medium bg-green-500 w-full md:w-fit hover:bg-green-300 text-white text-sm rounded-lg px-2 py-2`}
    >
      <div className="flex gap-4 mx-auto">
        {text !== "" ? <span>{text}</span> : null}
        <PencilIcon className={iconSize} />
        </div>
    </Link>
  );
}

export function ButtonDelete({ text = "", iconSize = "w-6", trigger }) {
  return (
    <button
      className="flex gap-3 items-center bg-red-500 w-fit hover:bg-red-300 text-white text-sm rounded-lg px-2 py-2"
      title="borrar"
      onClick={() => trigger()}
    >
      {text !== "" ? <span>{text}</span> : null}
      <TrashIcon className={iconSize} />
    </button>
  );
}

export function ButtonDropdown({children, title, titleIcon = null, options, mainLink, responsive=""}) {

  const [openDropdown, setOpenDropdown] = useState(false);
  const TitleIcon = titleIcon;
  const pathname = usePathname();
  const {data: session} = useSession();

  return (
    <div>
      <div className="flex justify-between w-full mb-1">
        <Link 
          href={mainLink}
          className={clsx("flex h-[48px]  justify-start text-gray-500 text-sm font-bold items-center gap-2 hover:bg-gray-300 cursor-pointer w-full p-3 md:p-2 md:px-3 bg-white rounded-tl-lg rounded-bl-lg", 
          {
            'bg-gray-200 text-gray-500': pathname === mainLink,
          }
          )}>
          {
            titleIcon ?
            <TitleIcon className="w-6" />
            : null
          }
          <span className={`${responsive} text-[15px] font-bold`}>{title}</span>
        </Link>
        <div
          onClick={() => setOpenDropdown(!openDropdown)}
          className={"flex h-[48px]  justify-center text-gray-500 text-sm font-bold items-center rotate-180 cursor-pointer hover:bg-gray-300 w-10 p-3 md:p-2 md:px-3 bg-white  rounded-tl-lg rounded-bl-lg"}
          id="arrow"
        >
          {
            openDropdown
            ? <ChevronDownIcon className="w-4" />
            : <ChevronUpIcon className="w-4" />
          }
        </div>
      </div>
      <div
        className={clsx(
          "text-left text-sm mt-2 w-full mx-auto text-gray-500 font-bold",
          {
            hidden: openDropdown === false,
            block: openDropdown === true,
          }
        )}
      >
        <div className="pl-0 md:pl-4 w-full bg-gray-200">
          {children}
        {options.map((link) => {
          return (
            (link.enableFor.includes(session?.user.role) || link.enableFor.includes("ALL")) &&
            <Link
              key={link.name}
              href={link.href}
              className={clsx("flex h-[48px] grow items-center justify-start gap-2 rounded-md p-3 text-gray-500 text-sm font-bold hover:bg-gray-300  md:flex-none md:justify-start md:p-2 md:px-3 bg-white pl-4 mb-1.5",
                {
                  'bg-gray-200 text-gray-500': pathname === link.href,
                },
              )}
            >
              <p>{link.name}</p>
            </Link>
          );
        })}
        </div>
        
      </div>
    </div>
  );
}
