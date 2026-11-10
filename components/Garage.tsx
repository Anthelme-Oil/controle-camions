
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Building2,
  ChevronRight,
  Mail,
  MapPin,
  Search,
  Trash2,
  Pencil,
  Loader2,
  Check,
  ArrowLeft,
  ArrowRight,
  Users,
} from 'lucide-react'

import {
  GarageClientService,
  type GarageDTO,
} from '@/lib/client/garage.service'

import { GarageForm } from './forms/GarageForm'
import { DeleteGarageModal } from './modals/DeleteGarageModal'

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

/**
 * Convertit une valeur en tableau d'e-mails.
 * Accepte un tableau, une chaîne JSON ou un e-mail simple.
 */
function parseEmails(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((email): email is string => typeof email === 'string')
      .map((email) => email.trim())
      .filter(Boolean)
  }

  if (typeof value !== 'string' || !value.trim()) {
    return []
  }

  const raw = value.trim()

  try {
    const parsed: unknown = JSON.parse(raw)

    if (Array.isArray(parsed)) {
      return parsed
        .filter((email): email is string => typeof email === 'string')
        .map((email) => email.trim())
        .filter(Boolean)
    }

    if (typeof parsed === 'string' && parsed.trim()) {
      return [parsed.trim()]
    }

    return []
  } catch {
    // Accepte une adresse seule si la valeur n'est pas du JSON.
    return raw.includes('@') ? [raw] : []
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

export default function GarageCompo() {
  const [garages, setGarages] = useState<GarageDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingGarage, setEditingGarage] = useState<GarageDTO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GarageDTO | null>(null)
  const [notice, setNotice] = useState('')

  const garageScrollRef = useRef<HTMLDivElement>(null)

  /* ------------------------------- Notification ------------------------------ */

  const showNotice = useCallback((message: string) => {
    setNotice(message)
  }, [])

  useEffect(() => {
    if (!notice) return

    const timeoutId = window.setTimeout(() => {
      setNotice('')
    }, 3500)

    return () => window.clearTimeout(timeoutId)
  }, [notice])

  /* ------------------------------- Chargement -------------------------------- */

  const fetchGarages = useCallback(async () => {
    setLoading(true)

    try {
      const data = await GarageClientService.getAll()

      // Normalise les e-mails à la réception de l'API.
      const normalizedGarages = data.map((garage) => ({
        ...garage,
        emails: parseEmails(garage.emails),
      }))

      setGarages(normalizedGarages)
    } catch (error: unknown) {
      showNotice(
        error instanceof Error
          ? error.message
          : 'Erreur lors du chargement des garages.',
      )
    } finally {
      setLoading(false)
    }
  }, [showNotice])

  useEffect(() => {
    void fetchGarages()
  }, [fetchGarages])

  /* -------------------------------- Recherche -------------------------------- */

  const visibleGarages = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return garages

    return garages.filter((garage) => {
      const emails = parseEmails(garage.emails)

      return [
        garage.name ?? '',
        garage.location ?? '',
        ...emails,
      ].some((value) => value.toLowerCase().includes(query))
    })
  }, [garages, search])

  /* --------------------------- Navigation horizontale ------------------------ */

  const scrollGarages = (direction: 'left' | 'right') => {
    const container = garageScrollRef.current

    if (!container) return

    container.scrollBy({
      left: direction === 'left' ? -340 : 340,
      behavior: 'smooth',
    })
  }

  /* ------------------------------- Création / édition ------------------------ */

  const handleFormSubmit = async (
    data: {
      name?: string
      location?: string
      emails: string[]
    },
    id?: string,
  ) => {
    try {
      const payload = {
        ...data,
        emails: parseEmails(data.emails),
      }

      if (id) {
        await GarageClientService.update(id, payload)
        setEditingGarage(null)
        showNotice('Garage mis à jour avec succès.')
      } else {
        await GarageClientService.create(payload)
        showNotice('Garage créé avec succès.')
      }

      await fetchGarages()
    } catch (error: unknown) {
      showNotice(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue.',
      )
    }
  }

  /* -------------------------------- Suppression ------------------------------ */

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    try {
      await GarageClientService.delete(deleteTarget.id)

      setDeleteTarget(null)

      // Évite de conserver un formulaire d'édition sur le garage supprimé.
      if (editingGarage?.id === deleteTarget.id) {
        setEditingGarage(null)
      }

      showNotice('Garage supprimé avec succès.')

      await fetchGarages()
    } catch (error: unknown) {
      showNotice(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la suppression.',
      )
    }
  }

  /* ---------------------------------- Render --------------------------------- */

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-[#f6f8fb] text-slate-950">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">

        {/* En-tête */}
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span>Administration</span>
              <ChevronRight className="size-3" />
              <span className="text-orange-600">Garages</span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Gestion des garages
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Centralisez vos établissements et gérez les destinataires
              des rapports de contrôle Safe to Operate.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Building2 className="size-5" />
            </div>

            <div>
              <p className="text-xl font-black leading-none tabular-nums">
                {garages.length}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-slate-400">
                garages enregistrés
              </p>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <div className="grid min-w-0 grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">

          {/* Liste des garages */}
          <section className="min-w-0">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">
                  Liste des établissements
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Consultez et gérez les garages enregistrés.
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher un garage..."
                  aria-label="Rechercher un garage"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100/70"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="size-7 animate-spin text-orange-500" />
                  <p className="text-xs font-medium text-slate-400">
                    Chargement des établissements...
                  </p>
                </div>
              </div>
            ) : visibleGarages.length === 0 ? (
              <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  <Building2 className="size-5" />
                </div>

                <p className="text-sm font-bold text-slate-700">
                  Aucun garage trouvé
                </p>

                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                  {search.trim()
                    ? 'Essayez avec un autre nom, une localisation ou une adresse e-mail.'
                    : 'Les établissements enregistrés apparaîtront ici.'}
                </p>

                {search.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="mt-4 rounded-lg px-3 py-2 text-xs font-bold text-orange-600 transition hover:bg-orange-50"
                  >
                    Effacer la recherche
                  </button>
                )}
              </div>
            ) : (
              <div className="min-w-0">

                {/* Barre de navigation du carrousel */}
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users className="size-4 text-slate-400" />
                    <span>
                      <strong className="font-bold text-slate-800">
                        {visibleGarages.length}
                      </strong>{' '}
                      établissement{visibleGarages.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => scrollGarages('left')}
                      aria-label="Garages précédents"
                      className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 active:scale-95"
                    >
                      <ArrowLeft className="size-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollGarages('right')}
                      aria-label="Garages suivants"
                      className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 active:scale-95"
                    >
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Défilement horizontal */}
                <div
                  ref={garageScrollRef}
                  className="garage-horizontal-scroll flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4"
                >
                  {visibleGarages.map((garage) => {
                    const emails = parseEmails(garage.emails)

                    return (
                      <article
                        key={garage.id}
                        className="group flex w-[min(82vw,310px)] min-w-[min(82vw,310px)] snap-start flex-col self-stretch rounded-2xl border border-slate-200 bg-white p-5 transition-colors duration-200 hover:border-orange-200 sm:w-[310px] sm:min-w-[310px]"
                      >
                        {/* Identité et actions */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-sm font-black text-orange-600 transition-colors group-hover:bg-orange-100">
                            {(garage.name || 'G')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingGarage(garage)}
                              aria-label={`Modifier ${garage.name || 'le garage'}`}
                              className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-orange-50 hover:text-orange-600"
                            >
                              <Pencil className="size-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteTarget(garage)}
                              aria-label={`Supprimer ${garage.name || 'le garage'}`}
                              className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>

                        {/* Informations */}
                        <div className="mt-5 min-w-0">
                          <h3
                            title={garage.name || 'Garage sans nom'}
                            className="truncate text-base font-bold tracking-tight text-slate-900"
                          >
                            {garage.name || 'Garage sans nom'}
                          </h3>

                          <div className="mt-2 flex min-h-8 items-start gap-2">
                            <MapPin className="mt-0.5 size-4 shrink-0 text-orange-500" />

                            <p
                              title={garage.location || ''}
                              className="line-clamp-2 break-words text-xs leading-5 text-slate-500"
                            >
                              {garage.location || 'Localisation non renseignée'}
                            </p>
                          </div>
                        </div>

                        {/* Destinataires */}
                        <div className="my-4 border-t border-slate-100" />

                        <div className="flex-1">
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Destinataires
                            </p>

                            <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold tabular-nums text-slate-600">
                              {emails.length}
                            </span>
                          </div>

                          {emails.length > 0 ? (
                            <div className="flex flex-col gap-2">
                              {emails.map((mail, index) => (
                                <div
                                  key={`${mail}-${index}`}
                                  title={mail}
                                  className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 transition-colors group-hover:border-orange-100"
                                >
                                  <Mail className="size-3.5 shrink-0 text-orange-500" />

                                  <span className="min-w-0 truncate text-xs text-slate-600">
                                    {mail}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400">
                              Aucun destinataire configuré.
                            </p>
                          )}
                        </div>

                        {/* Pied de carte */}
                        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-3">
                          <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />

                          <span className="text-[10px] font-medium text-slate-400">
                            Établissement enregistré
                          </span>
                        </div>
                      </article>
                    )
                  })}
                </div>

                {/* Barre de défilement discrète */}
                <style jsx>{`
                  .garage-horizontal-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: #cbd5e1 transparent;
                    -webkit-overflow-scrolling: touch;
                  }

                  .garage-horizontal-scroll::-webkit-scrollbar {
                    height: 5px;
                  }

                  .garage-horizontal-scroll::-webkit-scrollbar-track {
                    background: transparent;
                  }

                  .garage-horizontal-scroll::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 999px;
                  }

                  .garage-horizontal-scroll::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                  }
                `}</style>
              </div>
            )}
          </section>

          {/* Formulaire de création / modification */}
          <aside className="w-full min-w-0">
            <GarageForm
              garageToEdit={editingGarage}
              onSubmitSuccess={handleFormSubmit}
              onCancelEdit={() => setEditingGarage(null)}
            />
          </aside>
        </div>

        {/* Modal de suppression */}
        <DeleteGarageModal
          garage={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />

        {/* Notification */}
        {notice && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2.5rem)] items-start gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white"
          >
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />

            <span className="break-words leading-5">{notice}</span>
          </div>
        )}
      </div>
    </main>
  )
}
