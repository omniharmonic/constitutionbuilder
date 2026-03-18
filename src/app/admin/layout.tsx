import { Nav } from "@/components/shared/nav";
import { Footer } from "@/components/shared/footer";
import { SignOutButton } from "@/components/shared/sign-out-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav>
        <a href="/admin" className="text-sm text-stone-600 hover:text-stone-950">
          Dashboard
        </a>
        <a href="/admin/sessions/new" className="text-sm text-stone-600 hover:text-stone-950">
          New Session
        </a>
        <SignOutButton />
      </Nav>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
