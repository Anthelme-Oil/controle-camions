import { useState } from "react";
import { X, ArrowRight, ArrowLeft, Check, Send } from "lucide-react";
import { InspectionDTO } from "@/lib/client/inspection.service";
import catalog from "../../data/checks.json";

export function EditInspectionModal({
  item,
  onClose,
  onSave,
  loading=false,
}: {
  item: InspectionDTO | null;
  onClose: () => void;
  onSave: (updatedData: any) => void;
  loading: boolean;
}) {
  if (!item) return null;

  const [step, setStep] = useState<"form" | "summary">("form");
  const [formData, setFormData] = useState({
    registration: item.registration || "",
    carrier: item.carrier || "",
    driver: item.driver || "",
    product: item.product || "",
    capacity: item.capacity || "",
  });

  // Gestion des états de la check-list Safe to Operate
  const initialChecks: Record<string, { ok: boolean; observation: string }> = {};
  if (item.checks) {
    item.checks.forEach((c) => {
      initialChecks[c.reference] = { ok: c.isOk, observation: c.observation || "" };
    });
  }
  const [checks, setChecks] = useState(initialChecks);

  const handleCheckChange = (ref: string, ok: boolean) => {
    setChecks((prev) => ({
      ...prev,
      [ref]: { ...prev[ref], ok, observation: ok ? "" : prev[ref]?.observation || "" },
    }));
  };

  const handleObsChange = (ref: string, observation: string) => {
    setChecks((prev) => ({
      ...prev,
      [ref]: { ...prev[ref], observation },
    }));
  };

  const handleSubmitFinal = () => {
    onSave({
      ...formData,
      checks: Object.entries(checks).map(([ref, val]) => ({
        reference: ref,
        isOk: val.ok,
        observation: val.observation,
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102d56]/50 p-4 backdrop-blur-sm">
      <div className="flex flex-col max-h-[90vh] w-full max-w-4xl rounded-0 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.15em] text-[#2670bb]">
              Modification Safe to Operate
            </p>
            <h2 className="text-xl font-black text-[#102d56]">{formData.registration}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
            <X className="size-5" />
          </button>
        </div>

        {/* Corps modulaire : Formulaire des étapes ou Summary de relecture */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "form" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600">Immatriculation</label>
                  <input
                    value={formData.registration}
                    onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Produit</label>
                  <input
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold"
                  />
                </div>
              </div>

              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Check-list des standards</h3>
              <div className="space-y-4">
                {catalog.categories.map((cat, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-100 p-4 bg-slate-50/50">
                    <h4 className="font-bold text-[#102d56] text-sm">{cat.title}</h4>
                    <div className="mt-3 space-y-3">
                      {cat.items.map((itemCheck) => {
                        const current = checks[itemCheck.reference] || { ok: true, observation: "" };
                        return (
                          <div key={itemCheck.reference} className="flex flex-col gap-2 rounded-xl bg-white p-3 border border-slate-100">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-700">{itemCheck.text}</span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleCheckChange(itemCheck.reference , true)}
                                  className={`px-3 py-1 text-xs font-bold rounded-lg ${current.ok ? "bg-[#16745e] text-white" : "bg-slate-100 text-slate-600"}`}
                                >
                                  Conforme
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCheckChange(itemCheck.reference, false)}
                                  className={`px-3 py-1 text-xs font-bold rounded-lg ${!current.ok ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600"}`}
                                >
                                  Non conforme
                                </button>
                              </div>
                            </div>
                            {!current.ok && (
                              <input
                                placeholder="Observation obligatoire..."
                                value={current.observation}
                                onChange={(e) => handleObsChange(itemCheck.reference, e.target.value)}
                                className="h-10 w-full rounded-lg border border-rose-200 bg-rose-50/30 px-3 text-xs font-medium"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-[#102d56]">Summary & Relecture finale</h3>
              <div className="rounded-2xl bg-slate-50 p-4 space-y-3 text-sm">
                <p><strong>Véhicule :</strong> {formData.registration}</p>
                <p><strong>Produit :</strong> {formData.product}</p>
                <p><strong>Éléments non conformes :</strong> {Object.values(checks).filter((c) => !c.ok).length}</p>
              </div>
              <p className="text-xs text-slate-500">Vérifiez les informations avant de valider et de renvoyer le message / rapport mis à jour.</p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50">
          {step === "summary" ? (
            <button
              type="button"
              onClick={() => setStep("form")}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200"
            >
              <ArrowLeft className="size-4" /> Retour aux étapes
            </button>
          ) : <div />}

          {step === "form" ? (
            <button
              type="button"
              onClick={() => setStep("summary")}
              className="flex items-center gap-2 rounded-xl bg-[#102d56] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#183f75]"
            >
              Suivant (Revoir) <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitFinal}
              className="flex items-center gap-2 rounded-xl bg-[#16745e] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#125c4b]"
            >
              <Send className="size-4" />
              {loading ? "Envoi en cours..." : "Valider & Renvoyer"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}