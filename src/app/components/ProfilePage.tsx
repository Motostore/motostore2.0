'use client';
import ProfileData from './ProfileData';
import ProfileForm from './ProfileForm';
import ProfileActions from './ProfileActions';
import { useContext } from 'react';
import { ProfileContext } from '../Context/profileContext';
import { useSession } from 'next-auth/react';
import { ProfileButtonsEnum } from '../lib/enums';

export default function ProfilePage() {

    const { option } = useContext(ProfileContext);
    const {data: session} = useSession();

    return (
        <>
        { option === ProfileButtonsEnum.EDIT ?
            <ProfileForm/>
            :
            <ProfileData user={session?.user}/>
        }
        <ProfileActions />
        </>
    );
}
