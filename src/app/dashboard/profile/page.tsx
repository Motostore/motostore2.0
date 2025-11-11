// src/app/dashboard/profile/page.tsx
'use client';

import { ProfileProvider } from '../../Context/profileContext';
import ProfilePage from '../../components/ProfilePage';

export default function Page() {
  return (
    <ProfileProvider>
      <ProfilePage />
    </ProfileProvider>
  );
}
