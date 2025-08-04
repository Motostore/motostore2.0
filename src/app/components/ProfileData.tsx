'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useContext } from 'react';
import { ProfileContext } from '../Context/profileContext';

export default function ProfileData({user}) {

    // const context = useContext(ProfileContext);
    // const profile = context ? context.profile : null;

    return (
    <div className="bg-white text-gray-700 overflow-hidden shadow rounded-lg px-0 md:px-4">
        <div className="flex flex-col items-center pb-2">
            <Image
            alt="Bonnie image"
            height="120"
            src="/profile.png"
            width="120"
            className="my-3 rounded-full shadow-lg"
            />
        </div>
        {
           user
           ?
           <>
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-700">
                    {user.username ? user.username : 'guest'}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-700">
                {user.description ? user.description : 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Maxime minus iure temporibus omnis! Similique harum fuga animi molestiae facilis nam, quo saepe vero quos necessitatibus accusamus nobis pariatur voluptates? Sunt.'}
                </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-700">
                            Nombre completo
                        </dt>
                        <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                            {user.name}
                        </dd>
                    </div>
                    <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-700">
                            Cédula
                        </dt>
                        <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                            {user.identificationCard}
                        </dd>
                    </div>
                    <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-700">
                            Correo electrónico
                        </dt>
                        <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                            {user.email}
                        </dd>
                    </div>
                    <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-700">
                            Número de teléfono
                        </dt>
                        <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                            {user.phone}
                        </dd>
                    </div>
                    <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-700">
                            Dirección
                        </dt>
                        <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                            {user.address}
                        </dd>
                    </div>
                </dl>
            </div>
           </>
           :
           <h2>
            No hay datos
           </h2>
        }
    </div>
  );
}
