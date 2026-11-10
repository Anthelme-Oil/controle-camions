"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileText, ShieldCheck, Clock3, Search, Loader2, Building2 } from "lucide-react";
import { InspectionClientService, InspectionDTO } from "@/lib/client/inspection.service";
import { GarageClientService, GarageDTO } from "@/lib/client/garage.service";
import { EmailModal } from "@/components/EmailModal";
import { generateChecklistPDF } from "@/lib/pdf";
import catalog from "../../data/checks.json";

// Import des sous-composants modulaires
import { StatCard } from "./StatCard";
import { HistoryTable } from "./HistoryTable";
import { DetailModal } from "./DetailModal";
import { DeleteModal } from "./DeleteModal";
import { DraftConfirmModal } from "./DraftConfirmModal";
import { EditInspectionModal } from "./EditInspectionModal";
import { useAuth } from "@/context/AuthContext";

export function HistoryCompo() {
  const [inspections, setInspections] = useState<InspectionDTO[]>([]);
  const [garages, setGarages] = useState<GarageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres
  const [query, setQuery] = useState("");
  const [selectedGarageId, setSelectedGarageId] = useState<string>("Tous");
  const [filter, setFilter] = useState<"Tous" | "VALIDATED" | "DRAFT" | "ARCHIVED">("Tous");
  
  const { user } = useAuth();

  // Modals & Sélection
  const [selected, setSelected] = useState<InspectionDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InspectionDTO | null>(null);
  const [draftTarget, setDraftTarget] = useState<InspectionDTO | null>(null);
  const [editTarget, setEditTarget] = useState<InspectionDTO | null>(null);
  const [mailTarget, setMailTarget] = useState<InspectionDTO | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("Veuillez trouver ci-joint le rapport de contrôle du véhicule mis à jour.");
  const [editing, setEditing] = useState(false);

  const [toast, setToast] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inspectionsData, garagesData] = await Promise.all([
        InspectionClientService.getAll(),
        GarageClientService.getAll().catch(() => []),
      ]);
      setInspections(inspectionsData);
      setGarages(garagesData);
    } catch (err: any) {
      showToast(err.message || "Erreur lors du chargement de l'historique.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3000);
  };

  const visible = useMemo(() => {
    return inspections.filter((item: any) => {
      // 1. Filtre par statut
      const matchesStatus = filter === "Tous" || item.status === filter;

      // 2. Filtre par garage
      const matchesGarage = selectedGarageId === "Tous" || item.garageId === selectedGarageId;

      // 3. Filtre par recherche textuelle
      const garageName = item.garage?.name || item.region || "";
      const searchStr = `${item.registration} ${garageName} ${item.carrier || ""} ${item.driver || ""} ${item.product || ""} ${item.id}`.toLowerCase();
      const matchesQuery = searchStr.includes(query.toLowerCase());

      return matchesStatus && matchesGarage && matchesQuery;
    });
  }, [inspections, query, filter, selectedGarageId]);

  const handleArchive = async (item: InspectionDTO) => {
    try {
      await InspectionClientService.archive(item.id);
      showToast(`Le contrôle ${item.registration} a été archivé.`);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'archivage.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await InspectionClientService.delete(deleteTarget.id);
      showToast(`Le contrôle ${deleteTarget.registration} a été supprimé.`);
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Erreur lors de la suppression.");
    }
  };

  const handleMarkAsDraftConfirm = async () => {
    if (!draftTarget) return;
    try {
      await InspectionClientService.draft(draftTarget.id);
      showToast(`Le contrôle ${draftTarget.registration} est passé à « À revoir ».`);
      setDraftTarget(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Erreur lors du changement de statut.");
    }
  };

  const handleSaveEdit = async (updatedData: any) => {
    if (!editTarget) return;
    setEditing(true);
    try {
      await InspectionClientService.update(editTarget.id, updatedData);
      showToast(`Contrôle ${editTarget.registration} mis à jour et prêt à renvoyer !`);
      setEditTarget(null);
      setEditing(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Erreur lors de la mise à jour.");
      setEditing(false);
    }
  };

  const handleSendEmail = async () => {
    if (!user || !mailTarget || !user.email) return;
    try {
      await InspectionClientService.sendEmail(mailTarget.id, user.email, message);
      showToast("Rapport envoyé par e-mail avec succès !");
      setMailTarget(null);
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'envoi.");
      setMailTarget(null);
    }
  };

 const handleDownloadPDF = (item: InspectionDTO) => {
  const info = {
  region: item.region || "",
  garage: item.garage?.id
    ? {
        ...item.garage,
        id: item.garage.id,
      }
    : undefined,

  registration: item.registration,
  inspector: item.inspectorName || item.inspector?.name || "",
  date: item.createdAt
    ? new Date(item.createdAt).toISOString().slice(0, 10)
    : "",
  capacity: item.capacity || "",
  product: item.product || "",
  manufacturer: item.manufacturer || "",
  serviceDate: item.serviceDate || "",
  carrier: item.carrier || "",
  driver: item.driver || "",
};

  const statesMap: Record<
    string,
    { ok: boolean; observation: string; photo?: string, photoUrls?: string[] }
  > = {};

  if (item.checks) {
    item.checks.forEach((chk) => {
      statesMap[chk.reference] = {
        ok: chk.isOk,
        observation: chk.observation || "",
        photo: chk.photoUrl || undefined,
        photoUrls: chk.photoUrls || undefined,
      };
    });
  }

  generateChecklistPDF(info, catalog.categories, statesMap);
};

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <div className="mx-auto max-w-full px-5 py-8 lg:px-10">
        {/* En-tête de la page */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#2670bb]">
              Pilotage & traçabilité
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-[-.045em] text-[#102d56]">
              Historique des contrôles
            </h1>
            <p className="mt-2 max-w-2xl text-slate-500">
              Retrouvez, suivez et partagez chaque fiche Safe to Operate depuis votre espace.
            </p>
          </div>
          <Link
            href="/"
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#102d56] px-5 text-sm font-bold text-white shadow-lg shadow-blue-950/15 transition-all hover:bg-[#1a477f]"
          >
            <FileText className="size-4" /> Nouveau contrôle
          </Link>
        </div>

        {/* Cartes statistiques */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={FileText}
            label="Total des contrôles"
            value={String(inspections.length).padStart(2, "0")}
            detail="Données enregistrées"
          />
          <StatCard
            icon={ShieldCheck}
            label="Conformes"
            value={String(inspections.filter((i) => i.status === "VALIDATED").length).padStart(2, "0")}
            detail="Taux de conformité élevé"
            positive
          />
          <StatCard
            icon={Clock3}
            label="À revoir / Brouillons"
            value={String(inspections.filter((i) => i.status === "DRAFT").length).padStart(2, "0")}
            detail="Action requise"
            warning
          />
        </div>

        {/* Section Table & Filtres */}
        <section className="overflow-hidden rounded-0 border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            
            {/* Barre de recherche + Select de filtrage par Garage */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                <input
                  aria-label="Rechercher un contrôle"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Immatriculation, produit ..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-[#f8fafc] pl-10 pr-4 text-sm font-medium outline-none transition-all focus:border-[#2670bb] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* Sélecteur de Garages */}
              <div className="relative sm:w-64">
                <Building2 className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-orange-500" />
                <select
                  aria-label="Filtrer par garage"
                  value={selectedGarageId}
                  onChange={(e) => setSelectedGarageId(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-[#f8fafc] pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-[#2670bb] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="Tous">Tous les garages</option>
                  {garages.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name || "Garage sans nom"} {g.location ? `(${g.location})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtre par Statut */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: "Tous", label: "Tous" },
                { key: "VALIDATED", label: "Conformes" },
                { key: "DRAFT", label: "À revoir" },
                { key: "ARCHIVED", label: "Archivés" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                    filter === tab.key
                      ? "bg-[#102d56] text-white"
                      : "bg-[#f1f5f9] text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* État de chargement & Tableau */}
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="size-8 animate-spin text-[#2670bb]" />
              <p className="text-sm font-semibold">Chargement des données...</p>
            </div>
          ) : (
            <HistoryTable
              visible={visible}
              loading={loading}
              onView={(item) => setSelected(item)}
              onEdit={(item) => setEditTarget(item)}
              onMarkAsDraft={(item) => setDraftTarget(item)}
              onDownloadPDF={handleDownloadPDF}
              onMail={(item) => setMailTarget(item)}
              onArchive={handleArchive}
              onDelete={(item) => setDeleteTarget(item)}
            />
          )}

          {!loading && visible.length === 0 && (
            <div className="p-12 text-center text-sm font-medium text-slate-400">
              Aucune inspection enregistrée ne correspond à votre recherche.
            </div>
          )}
        </section>
      </div>

      {/* Modaux isolés */}
      <DetailModal selected={selected} onClose={() => setSelected(null)} onDownload={handleDownloadPDF} onMail={(i) => { setMailTarget(i); setSelected(null); }} />
      <DeleteModal deleteTarget={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      <DraftConfirmModal draftTarget={draftTarget} onClose={() => setDraftTarget(null)} onConfirm={handleMarkAsDraftConfirm} />
      <EditInspectionModal item={editTarget} onClose={() => setEditTarget(null)} onSave={handleSaveEdit} loading={editing} />
      
      {mailTarget && (
        <EmailModal
          isOpen={!!mailTarget}
          email={email}
          message={message}
          onClose={() => setMailTarget(null)}
          onEmailChange={setEmail}
          onMessageChange={setMessage}
          onSend={handleSendEmail}
        />
      )}

      {/* Notification Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#102d56] px-5 py-3 text-sm font-bold text-white shadow-xl transition-all">
          {toast}
        </div>
      )}
    </main>
  );
}