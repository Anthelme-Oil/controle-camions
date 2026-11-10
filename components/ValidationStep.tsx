import { Check, FileDown, Loader2, Mail, ShieldCheck } from "lucide-react";

interface ValidationStepProps {
  validated: boolean;
  saving: boolean;
  onValidate: () => void;
  onDownloadPdf: () => void;
  onOpenMailModal: () => void;
}

export function ValidationStep({
  validated,
  saving,
  onValidate,
  onDownloadPdf,
  onOpenMailModal,
}: ValidationStepProps) {
  return (
    <div className="rounded-3xl bg-[#f8fafc] p-8 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#dff5ed] text-[#16866e]">
        <ShieldCheck className="size-8" />
      </div>

      <h2 className="mt-4 text-xl font-black text-[#102d56]">
        {validated
          ? "Le contrôle est officiellement enregistré."
          : "Prêt à valider le contrôle ?"}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        {validated
          ? "La fiche RTGEP est enregistrée dans la base de données. Vous pouvez télécharger la fiche ou l'envoyer par email."
          : "En validant, le contrôle sera définitivement sauvegardé dans l'historique."}
      </p>

      {!validated ? (
        <button
          type="button"
          onClick={onValidate}
          disabled={saving}
          className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#102d56] px-6 font-bold text-white shadow-md transition-all hover:bg-[#183f75] disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Enregistrement...
            </>
          ) : (
            <>
              <Check className="size-4" /> Confirmer et Sauvegarder
            </>
          )}
        </button>
      ) : (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onDownloadPdf}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 font-bold text-[#102d56] shadow-sm hover:bg-slate-50 transition-colors"
          >
            <FileDown className="size-4" /> Télécharger le PDF
          </button>
          <button
            type="button"
            onClick={onOpenMailModal}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#ef8c56] px-5 font-bold text-white shadow-sm hover:bg-[#e07b45] transition-colors"
          >
            <Mail className="size-4" /> Envoyer par email
          </button>
        </div>
      )}
    </div>
  );
}