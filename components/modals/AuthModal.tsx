"use client";

import { useState } from "react";
import Image from "next/image";
import { ShieldCheck, Lock, Mail, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { UserClientService, UserDTO } from "@/lib/client/user.service";

interface AuthModalProps {
  isOpen: boolean;
  onSuccess?: (user: UserDTO) => void;
}

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Conformité RTGEP",
    description: "Inspection standardisée et conforme aux exigences de sécurité.",
  },
  {
    icon: FileText,
    title: "Rapports Instantanés",
    description: "Génération automatique de PDF et envoi direct aux destinataires.",
  },
  {
    icon: CheckCircle2,
    title: "Traçabilité & Historique",
    description: "Conservation complète des données et suivi de l'état des camions.",
  },
];

export function AuthModal({ isOpen, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await UserClientService.login({ email, password });
      if (onSuccess) {
        onSuccess(user);
      }
    } catch (err: any) {
        console.log("Erreur lors de la connexion :", err);
      setError(err.message || "Identifiants incorrects ou session expirée.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102d56]/40 p-4 backdrop-blur-md">
      <div className="w-full max-w-3xl overflow-hidden rounded-0 bg-white p-8 shadow-2xl transition-all">
        {/* En-tête : Logo & Titre */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex size-14 items-center justify-center overflow-hidden  p-1 ">
            <Image
              src="/bg-rm.png"
              alt="SafeRoute Logo"
              width={56}
              height={56}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-[#102d56]">
            Session expirée
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Veuillez vous reconnecter pour poursuivre le contrôle logistique.
          </p>
        </div>

        {/* Présentation SafeRoute : Cartes alignées horizontalement (sans background/bordure) */}
        <div className="my-8 grid grid-cols-1 gap-6 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {FEATURES.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center px-3 pt-4 sm:pt-0"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-[#dfeeff] text-[#1d5ca5] shadow-inner">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-800">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire de Connexion */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Adresse e-mail
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="inspecteur@entreprise.com"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-sm font-medium outline-none transition-all focus:border-[#2670bb] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Mot de passe
            </label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-sm font-medium outline-none transition-all focus:border-[#2670bb] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#102d56] font-bold text-white shadow-md transition-all hover:bg-[#183f75] disabled:opacity-50"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}