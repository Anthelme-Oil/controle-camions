"use client";

import { useState } from "react";
import { Loader2, Mail, Send, X, Building2, ShieldCheck } from "lucide-react";

interface EmailModalProps {
  isOpen: boolean;
  email: string;
  message: string;
  onClose: () => void;
  onEmailChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onSend: () => Promise<void>;
}

export function EmailModal({
  isOpen,
  email,
  message,
  onClose,
  onEmailChange,
  onMessageChange,
  onSend,
}: EmailModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSend();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102d56]/40 p-4 backdrop-blur-sm transition-all">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white p-7 shadow-2xl">
        {/* Header du Modal */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-orange-50 text-[#ef8c56]">
              <Mail className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#102d56]">
                Envoyer le rapport
              </h2>
              <p className="text-xs text-slate-500">
                Le rapport PDF et les pièces jointes seront envoyés au garage.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Info sur le routage automatique par Garage & CC */}
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#102d56]">
            <Building2 className="size-4 text-orange-500" />
            <span>Routage intelligent des e-mails</span>
          </div>
          <p>
            Le mail sera transmis aux destinataires configurés du <strong>garage sélectionné</strong> ainsi qu&apos;aux adresses en <strong>copie (CC)</strong> globales.
          </p>
        </div>

        {/* Formulaire d'envoi */}
        <form onSubmit={handleSend} className="mt-5 flex flex-col gap-4">
          {/* <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Destinataire additionnel (Optionnel)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="autre.destinataire@entreprise.com"
              className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium outline-none transition-all focus:border-[#2670bb] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div> */}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Message personnalisé
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Saisissez un message..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm font-medium outline-none transition-all focus:border-[#2670bb] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-12 rounded-xl px-5 text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#102d56] px-6 text-sm font-bold text-white shadow-md transition-all hover:bg-[#183f75] disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="size-4" /> Envoyer avec le PDF
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}