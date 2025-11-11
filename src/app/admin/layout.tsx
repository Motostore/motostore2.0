// src/app/(public)/layout.tsx
import Header from "../ui/header";
import Navigation from "../ui/navigation";

export const metadata = {
  title: "Motostore",
  description: "Sitio público",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <Header />
      <Navigation />
      <main>{children}</main>
    </section>
  );
}




