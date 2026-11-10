"use client";

import { useEffect, useMemo, useState } from "react";
import catalog from "@/data/checks.json";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { CheckCategory, CheckStatesMap, VehicleInfo } from "@/types";
import { Panel } from "@/components/Panel";
import { VehicleInfoForm } from "@/components/forms/VehicleInfoForm";
import { SafeToOperateStep } from "@/components/SafeToOperateStep";
import { SummaryStep } from "@/components/SummaryStep";
import { ValidationStep } from "@/components/ValidationStep";
import { EmailModal } from "@/components/EmailModal";
import { generateChecklistPDF } from "@/lib/pdf";
import { useAuth } from "@/context/AuthContext";
import { InspectionClientService } from "@/lib/client/inspection.service";
import AppLayout from "@/components/layouts/app.layout";

const categories: CheckCategory[] = catalog.categories;
const allItems = categories.flatMap((cat) => cat.items);

const initialInfo: VehicleInfo = {
  region: "",
  registration: "",
  inspector: "",
  date: new Date().toISOString().slice(0, 10),
  capacity: "",
  product: "",
  manufacturer: "",
  serviceDate: "",
  carrier: "",
  driver: "",
  garageId: "",
  garage: {
    id: "",
    emails: [],
    name: "",
    location: "",
  },
};

// Adaptation de l'état initial pour supporter un tableau de photos (photos: string[])
const initialStates: CheckStatesMap = Object.fromEntries(
  allItems.map((item) => [
    item.id,
    {
      ok: true,
      observation: "",
      photoUrls: [],
    },
  ]),
);

const STEP_LABELS = [
  "Informations",
  "Safe to Operate",
  "Récapitulatif",
  "Validation",
];

export default function Page() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState<VehicleInfo>({
    ...initialInfo,
    inspector: user?.name || "",
  });

  useEffect(() => {
    if (user?.name) {
      setInfo((current) => ({
        ...current,
        inspector: user.name,
      }));
    }
  }, [user?.name]);

  const [states, setStates] = useState<CheckStatesMap>(initialStates);
  const [validated, setValidated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inspectionId, setInspectionId] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string[]>>(
    {},
  );
  const [photoFiles, setPhotoFiles] = useState<Record<string, File[]>>({});

  // Modals & Notifications
  const [mailOpen, setMailOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    "Veuillez trouver ci-joint le rapport de contrôle du véhicule.",
  );

  const [statusFeedback, setStatusFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setStatusFeedback({ type, message });
    window.setTimeout(() => setStatusFeedback(null), 6000);
  };

  const conformCount = useMemo(
    () => allItems.filter((item) => states[item.id]?.ok).length,
    [states],
  );

  const updateInfo = (key: keyof VehicleInfo, value: string) => {
    setInfo((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    if (!inspectionId) return;
    let cancelled = false;

    const getInspection = async () => {
      try {
        const inspection = await InspectionClientService.getById(inspectionId);
        if (cancelled || !inspection) return;

        const garage = inspection.garage;
        setInfo((current) => ({
          ...current,
          garageId: garage?.id ?? current.garageId ?? "",
          garage: garage?.id
            ? {
                id: garage.id,
                name: garage.name ?? "",
                location: garage.location ?? "",
                emails: garage.emails ?? [],
              }
            : current.garage,
        }));

        setStates((current) => {
          const updatedStates: CheckStatesMap = { ...current };
          inspection.checks?.forEach((chk) => {
            updatedStates[chk.reference] = {
              ok: chk.isOk,
              observation: chk.observation || "",
              photoUrls: chk.photoUrls || [],
            };
          });
          return updatedStates;
        } 
      )
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Erreur lors de la récupération de l'inspection :",
            error,
          );
        }
      }
    };

    getInspection();
    return () => {
      cancelled = true;
    };
  }, [inspectionId]);


  

  const toggleCheck = (id: string) =>
    setStates((current) => ({
      ...current,
      [id]: { ...current[id], ok: !current[id].ok },
    }));

  const updateObservation = (id: string, value: string) =>
    setStates((current) => ({
      ...current,
      [id]: { ...current[id], observation: value },
    }));

  // Gestion de la sélection multiple de photos (en convertissant chaque fichier en Base64 ou URL locale temporaire avant envoi global)

  // const handlePhotosUpload = (id: string, files: FileList | null) => {
  //   if (!files?.length) return;

  //   const selectedFiles = Array.from(files);

  //   setPhotoFiles((current) => ({
  //     ...current,
  //     [id]: [...(current[id] ?? []), ...selectedFiles],
  //   }));
  // };

  const handlePhotosUpload = (id: string, files: FileList | null) => {
    if (!files?.length) return;

    const selectedFiles = Array.from(files);
    const previews = selectedFiles.map((file) => URL.createObjectURL(file));

    setPhotoFiles((current) => ({
      ...current,
      [id]: [...(current[id] ?? []), ...selectedFiles],
    }));

    setPhotoPreviews((current) => ({
      ...current,
      [id]: [...(current[id] ?? []), ...previews],
    }));
  };

  const handleSaveAndValidate = async () => {
    if (!user) {
      showFeedback(
        "error",
        "Vous devez être connecté pour valider ce contrôle.",
      );
      return;
    }
    setSaving(true);

    try {
      const created = await InspectionClientService.create(
        {
          info: { ...info, inspector: user.name },
          states,
          categories,
          userId: user.id,
          status: "VALIDATED",
          garageId: info.garageId,
        },
        photoFiles,
      );

      setInspectionId(created.id);
      setValidated(true);
      showFeedback(
        "success",
        "Le contrôle a été enregistré avec succès en base de données !",
      );
    } catch (error: any) {
      showFeedback(
        "error",
        error.message || "Erreur lors de la sauvegarde du contrôle.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmail = async () => {
    if (!inspectionId) {
      showFeedback(
        "error",
        "Veuillez d'abord valider le contrôle avant d'envoyer l'e-mail.",
      );
      return;
    }
    if (!user?.email) {
      showFeedback("error", "Utilisateur non authentifié ou e-mail manquant.");
      return;
    }

    try {
      await InspectionClientService.sendEmail(
        inspectionId,
        user.email,
        message,
      );
      showFeedback(
        "success",
        "Rapport envoyé avec succès aux destinataires du garage et en copie !",
      );
      setMailOpen(false);
    } catch (err: any) {
      showFeedback(
        "error",
        err.message || "Échec de l'envoi de l'e-mail via Microsoft Graph.",
      );
    }
  };

  // const handleRemovePendingPhoto = (id: string, index: number) => {
  //   setPhotoFiles((current) => ({
  //     ...current,
  //     [id]: (current[id] ?? []).filter((_, i) => i !== index),
  //   }));
  // };

  const handleRemovePendingPhoto = (id: string, index: number) => {
    const preview = photoPreviews[id]?.[index];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPhotoFiles((current) => ({
      ...current,
      [id]: (current[id] ?? []).filter((_, i) => i !== index),
    }));

    setPhotoPreviews((current) => ({
      ...current,
      [id]: (current[id] ?? []).filter((_, i) => i !== index),
    }));
  };

  const handleRemovePhoto = (id: string, photoIndex: number) => {
    setStates((current) => {
      const existingPhotos = current[id]?.photoUrls || [];
      const updatedPhotos = existingPhotos.filter(
        (_, index) => index !== photoIndex,
      );

      return {
        ...current,
        [id]: {
          ...current[id],
          photos: updatedPhotos,
        },
      };
    });
  };


  const handleDownloadPdf = async() => {
    generateChecklistPDF(info, categories, states);
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10">
        {statusFeedback && (
          <div
            className={`mb-6 flex items-center justify-between rounded-2xl border p-4 shadow-sm transition-all ${
              statusFeedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-rose-200 bg-rose-50 text-rose-900"
            }`}
          >
            <div className="flex items-center gap-3">
              {statusFeedback.type === "success" ? (
                <CheckCircle2 className="size-5 text-emerald-600" />
              ) : (
                <AlertCircle className="size-5 text-rose-600" />
              )}
              <p className="text-sm font-bold">{statusFeedback.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setStatusFeedback(null)}
              className="rounded-lg p-1 text-slate-400 hover:bg-black/5"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#2670bb]">
            Nouveau contrôle
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[-.04em] text-[#102d56]">
            Arrivée d&apos;un camion
          </h1>
        </div>

        {/* Stepper Header */}
        <div className="mb-8 grid grid-cols-4 gap-2">
          {STEP_LABELS.map((label, index) => (
            <div
              key={label}
              className={`rounded-xl p-3 text-center text-xs font-bold transition-colors ${
                index === step
                  ? "bg-[#102d56] text-white"
                  : index < step
                    ? "bg-[#dff5ed] text-[#16866e]"
                    : "bg-white text-slate-400"
              }`}
            >
              {index < step ? "✓ " : `${index + 1}. `}
              {label}
            </div>
          ))}
        </div>

        {/* Étapes */}
        {step === 0 && (
          <Panel
            title="Informations du véhicule"
            subtitle="Renseignez les données du véhicule."
          >
            <VehicleInfoForm info={info} onChange={updateInfo} />
          </Panel>
        )}

        {step === 1 && (
          <Panel
            title="Safe to Operate"
            subtitle="Vérifiez les points de contrôle et joignez vos photos."
          >
            <SafeToOperateStep
              categories={categories}
              states={states}
              conformCount={conformCount}
              totalChecks={allItems.length}
              photoFiles={photoFiles}
              onPendingPhotosChange={(id, files) =>
                setPhotoFiles((current) => ({
                  ...current,
                  [id]: files,
                }))
              }
              onRemovePendingPhoto={handleRemovePendingPhoto}
              onToggle={toggleCheck}
              onObservationChange={updateObservation}
              onPhotosUpload={handlePhotosUpload}
              onRemovePhoto={handleRemovePhoto}
            />
          </Panel>
        )}

        {step === 2 && (
          <Panel
            title="Récapitulatif"
            subtitle="Aperçu des éléments du contrôle."
          >
            <SummaryStep
              info={info}
              categories={categories}
              states={states}
              photoPreviews={photoPreviews}
              photoFiles={photoFiles}
            />
          </Panel>
        )}

        {step === 3 && (
          <Panel
            title={validated ? "Contrôle validé" : "Validation finale"}
            subtitle="Validation"
          >
            <ValidationStep
              validated={validated}
              saving={saving}
              onValidate={handleSaveAndValidate}
              onDownloadPdf={handleDownloadPdf}
              onOpenMailModal={() => setMailOpen(true)}
            />
          </Panel>
        )}

        {/* Boutons de navigation */}
        <div className="mx-auto mt-6 flex max-w-[1010px] justify-between">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
            className="flex h-12 items-center gap-2 rounded-xl px-4 font-bold text-slate-500 disabled:invisible"
          >
            <ArrowLeft className="size-4" /> Retour
          </button>

          {step < 3 && (
            <button
              type="button"
              onClick={() => setStep((current) => current + 1)}
              className="flex h-12 items-center gap-2 rounded-xl bg-[#102d56] px-5 font-bold text-white shadow-md hover:bg-[#183f75]"
            >
              {step === 2 ? "Passer à la validation" : "Continuer"}
              <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </div>

      <EmailModal
        isOpen={mailOpen}
        email={email}
        message={message}
        onClose={() => setMailOpen(false)}
        onEmailChange={setEmail}
        onMessageChange={setMessage}
        onSend={handleSendEmail}
      />
    </AppLayout>
  );
}
