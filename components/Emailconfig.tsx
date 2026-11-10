"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Mail, Plus, X, Check, Save, Loader2, ShieldAlert, ArrowRight } from "lucide-react";
import { GarageClientService } from "@/lib/client/garage.service";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2670bb] focus:bg-white focus:ring-4 focus:ring-blue-500/10";

export default function EmailConfigCompo() {
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Charger la configuration existante au montage
  useEffect(() => {
    fetchConfig();
  }, []);


function normalizeEmails(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((email): email is string => typeof email === "string")
      .map((email) => email.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) return [];

    try {
      const parsed: unknown = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return normalizeEmails(parsed);
      }
    } catch {
      // La valeur est probablement une liste d'e-mails séparés.
    }

    return trimmed
      .split(/[;,]/)
      .map((email) => email.trim())
      .filter(Boolean);
  }

  return [];
}


  const fetchConfig = async () => {
    setLoading(true);
    try {
      const config = await GarageClientService.getEmailConfig();
    
      setCcEmails(normalizeEmails(config?.ccEmails || []));
    } catch (err: any) {
      showToast("error", err.message || "Erreur lors du chargement de la configuration.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3500);
  };

  const addEmail = () => {
    const value = emailInput.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value) return;

    if (!emailPattern.test(value)) {
      showToast("error", "Veuillez saisir une adresse e-mail valide.");
      return;
    }

    if (ccEmails.includes(value)) {
      showToast("error", "Cette adresse e-mail est déjà dans la liste.");
      return;
    }

    setCcEmails((current) => [...current, value]);
    setEmailInput("");
  };

  const removeEmail = (emailToRemove: string) => {
    setCcEmails((current) => current.filter((email) => email !== emailToRemove));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await GarageClientService.updateEmailConfig(ccEmails);
      showToast("success", "Configuration des e-mails en copie enregistrée avec succès !");
    } catch (err: any) {
      showToast("error", err.message || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };


 return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <div className="mx-auto max-w-4xl px-5 py-8 lg:px-10">
        
        {/* En-tête */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#2670bb]">
              Administration & Paramètres
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-.045em] text-[#102d56] sm:text-4xl">
              E-mails en copie (CC) globaux
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Ces adresses recevront automatiquement une copie (CC) de tous les rapports d'inspection validés.
            </p>
          </div>
        </div>

        {/* Carte principale de configuration */}
        <div className="overflow-hidden rounded-0 border border-slate-200/80 bg-white shadow-sm">
          
          <div className="border-b border-slate-100 bg-slate-50/50 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2670bb]">
                <Mail className="size-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Gestion des destinataires en copie</h2>
                <p className="text-xs text-slate-500">Ajoutez ou retirez les adresses de supervision globale.</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="size-8 animate-spin text-[#2670bb]" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
              
              {/* Ajout d'un e-mail */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Ajouter une adresse e-mail
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addEmail();
                      }
                    }}
                    placeholder="supervision@entreprise.com"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={addEmail}
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#102d56] px-5 text-sm font-bold text-white transition hover:bg-[#1a477f]"
                  >
                    <Plus className="size-4" /> Ajouter
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Appuyez sur Entrée ou cliquez sur Ajouter pour insérer l'adresse.</p>
              </div>

              {/* Liste des e-mails actuels */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Destinataires enregistrés ({ccEmails.length})
                </label>

                {ccEmails.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    {ccEmails.map((email,key) => (
                      <span
                        key={key}
                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm"
                      >
                        <Mail className="size-3.5 text-[#2670bb]" />
                        <span>{email}</span>
                        <button
                          type="button"
                          onClick={() => removeEmail(email)}
                          aria-label={`Retirer ${email}`}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <X className="size-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center">
                    <ShieldAlert className="size-8 text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">Aucun e-mail en copie configuré</p>
                    <p className="text-xs text-slate-400 mt-0.5">Les e-mails de contrôle seront uniquement envoyés aux garages concernés.</p>
                  </div>
                )}
              </div>

              {/* Bouton de sauvegarde globale */}
              <div className="flex items-center justify-end border-t border-slate-100 pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#16745e] px-7 text-sm font-bold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-[#125c4b] disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" /> Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Notification Toast */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold text-white shadow-2xl transition-all ${
              toast.type === "success" ? "bg-[#16745e]" : "bg-rose-600"
            }`}
          >
            {toast.type === "success" ? <Check className="size-5" /> : <ShieldAlert className="size-5" />}
            <span>{toast.message}</span>
          </div>
        )}

      </div>
    </main>
  );
}