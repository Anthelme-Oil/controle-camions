
"use client";

import { Header } from "@/components/Header";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, History } from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    {
      label: "Contrôle",
      href: "/",
      icon: ClipboardCheck,
    },
    {
      label: "Historique",
      href: "/historique",
      icon: History,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <Header />

      <div className="mx-auto max-w-full px-4 py-6 sm:px-6 lg:px-10">
        {/* Navigation */}
        <nav
          aria-label="Navigation principale"
          className="mb-8 flex flex-wrap items-center gap-2 rounded-0 border border-slate-200/80 bg-white p-2 shadow-0"
        >
          {navLinks.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href ||
              pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon size={18} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Contenu de la page */}
        <section>{children}</section>
      </div>
    </main>
  );
}


