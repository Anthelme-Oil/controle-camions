"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, LogOut, UserRound ,CarFront, Mail} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link"
export function Header() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm transition-all">
      <div className="mx-auto flex h-20 max-w-full items-center justify-between px-5 lg:px-10">
        {/* Coin gauche : Logo & Nom de la plateforme */}
        <div className="flex items-center gap-3">
          <div className="relative flex size-11 items-center justify-center overflow-hidden  p-1">
            <Image
              src="/bg-rm.png"
              alt="SafeRoute Logo"
              width={44}
              height={44}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div>
            <b className="text-lg font-black leading-none text-[#102d56]">
              SafeRoute
            </b>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[.18em] text-slate-400">
              Contrôle logistique
            </p>
          </div>
        </div>

        {/* Coin droit : Utilisateur & Dropdown */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-2xl p-1.5 transition-colors hover:bg-slate-100 focus:outline-none"
            >
              <div className="hidden text-right sm:block">
                <b className="block text-sm font-bold leading-tight text-slate-900">
                  {user.name}
                </b>
                <p className="text-xs text-slate-400">{user.role}</p>
              </div>

              <div className="flex size-10 items-center justify-center rounded-full bg-[#dfeeff] text-[#1d5ca5] shadow-inner">
                <UserRound className="size-5" />
              </div>

              <ChevronDown
                className={`size-4 text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-0 border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5">
                <div className="border-b border-slate-100 px-3 py-2 sm:hidden">
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.role}</p>
                </div>

                  <div className="py-1 text-black">
                  <Link
                    href="/garage"
                   
                    className="flex w-full text-black items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold  transition-colors hover:bg-emerald-50"
                  >
                    <CarFront className="size-4" />
                    Ajouter un garage
                  </Link>
                </div>

                 <div className="py-1 text-black">
                  <Link
                    href="/cc-mails"
                   
                    className="flex w-full text-black items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold  transition-colors hover:bg-emerald-50"
                  >
                    <Mail className="size-4" />
                    Mails en copie
                  </Link>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    <LogOut className="size-4" />
                    Se déconnecter
                  </button>
                </div>

               
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs font-semibold text-slate-400">Non connecté</div>
        )}
      </div>
    </header>
  );
}