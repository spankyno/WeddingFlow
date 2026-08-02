import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const NAV = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/eventos", label: "Mis eventos" },
  { href: "/organizaciones", label: "Organizaciones" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-parchment">
      <aside className="hidden w-64 flex-col border-r border-ink/10 px-6 py-8 md:flex">
        <span className="font-display text-2xl">WeddingFlow</span>
        <nav className="mt-12 flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 font-body text-sm text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <span className="font-display text-lg md:hidden">WeddingFlow</span>
          <div className="ml-auto">
            <UserButton />
          </div>
        </header>
        <main className="px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
