type ProfileDataProps = {
  user: any; // Cambia `any` por un tipo específico si es posible
};

export default function ProfileData({ user }: ProfileDataProps) {
  return <div>{user.name}</div>;
}
