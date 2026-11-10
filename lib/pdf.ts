import { jsPDF } from "jspdf";
import { LOGO_DATA_URL, LOGO_RATIO } from "./logo";
import { CheckCategory, CheckStatesMap, VehicleInfo } from "@/types";

// ---------- Mise en page (mm) ----------
const M = 8; // marge gauche/droite
const PAGE_W = 210;
const PAGE_H = 297;
const BOTTOM = 286; // limite basse du tableau
const LINE_H = 3.2; // interligne du texte du tableau
const MIN_ROW_H = 6;
const PAD = 1.5;

// Colonnes : Standard | Description | Evidence possible | OUI | NON | Evidence réelle
const X = [
  M,          // 0 Standard
  M + 11,     // 1 Description
  M + 102,    // 2 Evidence possible
  M + 145,    // 3 OUI
  M + 157,    // 4 NON
  M + 166,    // 5 Evidence réelle
  M + 194,    // 6 fin
];
const INK = "#222222";
const GRID = "#9a9a9a";
const TICK = "#102d56";

// ---------- Helpers de dessin ----------
function drawTick(pdf: jsPDF, cx: number, cy: number) {
  pdf.setDrawColor(TICK);
  pdf.setLineWidth(0.5);
  pdf.line(cx - 2, cy + 0.2, cx - 0.7, cy + 1.7);
  pdf.line(cx - 0.7, cy + 1.7, cx + 2.2, cy - 1.8);
  pdf.setLineWidth(0.2);
}

function drawPageHeader(pdf: jsPDF) {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6);
  pdf.setTextColor("#777777");
  pdf.text("RTGEP Vehicle standards Checklist", PAGE_W / 2, 6, {
    align: "center",
  });
  pdf.setTextColor(INK);
}

function drawTableHeader(pdf: jsPDF, y: number): number {
  const h1 = 4;
  const h2 = 4;
  pdf.setDrawColor(GRID);
  pdf.setLineWidth(0.2);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(INK);

  // cadres
  pdf.rect(X[0], y, X[1] - X[0], h1 + h2); // Standard
  pdf.rect(X[1], y, X[2] - X[1], h1 + h2); // Description
  pdf.rect(X[2], y, X[3] - X[2], h1 + h2); // Evidence possible
  pdf.rect(X[3], y, X[5] - X[3], h1);      // CONFORMITE
  pdf.rect(X[3], y + h1, X[4] - X[3], h2); // OUI
  pdf.rect(X[4], y + h1, X[5] - X[4], h2); // NON
  pdf.rect(X[5], y, X[6] - X[5], h1 + h2); // Evidence réelle

  pdf.text("Standard", X[0] + 1, y + 5);
  pdf.text("EVIDENCE POSSIBLE", X[2] + 1, y + 3);
  pdf.text("CONFORMITE", X[3] + 1, y + 3);
  pdf.text("OUI", (X[3] + X[4]) / 2, y + h1 + 2.9, { align: "center" });
  pdf.text("NON", (X[4] + X[5]) / 2, y + h1 + 2.9, { align: "center" });
  pdf.text("EVIDENCE REELLE", X[5] + 1, y + 3);
  return y + h1 + h2;
}

function drawRowGrid(pdf: jsPDF, y: number, h: number) {
  pdf.setDrawColor(GRID);
  pdf.setLineWidth(0.2);
  for (let i = 0; i < X.length - 1; i++) {
    pdf.rect(X[i], y, X[i + 1] - X[i], h);
  }
}

// ---------- Bloc titre + champs ----------
const HEAD_Y = 12;
const HEAD_H = 24;
const HEAD_X = [M, M + 30, M + 140, M + 194];

function drawHeaderBox(pdf: jsPDF) {
  pdf.setDrawColor("#333333");
  pdf.setLineWidth(0.4);
  pdf.rect(HEAD_X[0], HEAD_Y, HEAD_X[3] - HEAD_X[0], HEAD_H);
  pdf.line(HEAD_X[1], HEAD_Y, HEAD_X[1], HEAD_Y + HEAD_H);
  pdf.line(HEAD_X[2], HEAD_Y, HEAD_X[2], HEAD_Y + HEAD_H);
  pdf.setLineWidth(0.2);

  const pad = 1.5;
  const maxH = HEAD_H - pad * 2;
  const maxW = HEAD_X[1] - HEAD_X[0] - pad * 2;
  let lh = maxH;
  let lw = lh * LOGO_RATIO;
  if (lw > maxW) {
    lw = maxW;
    lh = lw / LOGO_RATIO;
  }
  const lx = HEAD_X[0] + (HEAD_X[1] - HEAD_X[0] - lw) / 2;
  const ly = HEAD_Y + (HEAD_H - lh) / 2;
  try {
    pdf.addImage(LOGO_DATA_URL, "JPEG", lx, ly, lw, lh);
  } catch {
    /* logo invalide : ignoré */
  }

  const cx2 = (HEAD_X[1] + HEAD_X[2]) / 2;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(INK);
  pdf.text("RTGEP / CHECKLIST DES STANDARDS", cx2, HEAD_Y + 10, {
    align: "center",
  });
  pdf.text("OBLIGATOIRES", cx2, HEAD_Y + 18, { align: "center" });

  const cx3 = (HEAD_X[2] + HEAD_X[3]) / 2;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.text("Référence : ILSEC08 TGLO 04", cx3, HEAD_Y + 8, { align: "center" });
  pdf.text("IR : 02", cx3, HEAD_Y + 13, { align: "center" });
  pdf.text("Date d'application : 03/06/2025", cx3, HEAD_Y + 18, {
    align: "center",
  });
}

function drawTitleBlock(pdf: jsPDF, info: VehicleInfo): number {
  drawHeaderBox(pdf);
  const fields: [string, string | undefined][] = [
    ["Garage :", info.garage?.name],
    ["Immatriculation du véhicule", info.registration],
    ["Nom de l'inspecteur", info.inspector],
    ["Date", info.date],
    ["Capacité de la citerne", info.capacity],
    ["Produit", info.product],
  ];

  if (info.manufacturer) {
    fields.push(["Constructeur", info.manufacturer]);
  }
  fields.push([
    "Date de première mise en service (Tracteur / Citerne)",
    info.serviceDate,
  ]);
  if (info.carrier) {
    fields.push(["Transporteur", info.carrier]);
  }
  if (info.driver) {
    fields.push(["Chauffeur", info.driver]);
  }

  let y = HEAD_Y + HEAD_H + 12;
  const lineEndX = 135;
  fields.forEach(([label, value]) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(INK);
    pdf.text(label, M + 8, y);
    const labelEnd = M + 8 + pdf.getTextWidth(label) + 2;
    pdf.setDrawColor("#555555");
    pdf.setLineWidth(0.2);
    pdf.line(labelEnd, y + 1, Math.max(lineEndX, labelEnd + 20), y + 1);
    if (value) {
      pdf.setFont("helvetica", "bolditalic");
      pdf.setFontSize(9);
      pdf.setTextColor("#1c2f8a");
      pdf.text(String(value), labelEnd + 2, y - 0.3);
    }
    y += 5.8;
  });

  const sig = (info as any).signature as string | undefined;
  if (sig) {
    try {
      pdf.addImage(sig, "PNG", PAGE_W - M - 50, HEAD_Y + HEAD_H + 6, 48, 30);
    } catch {
      /* image invalide : ignorée */
    }
  }
  pdf.setTextColor(INK);
  return y + 3;
}

// ---------- Gestion des URLs de photos ----------
function normalizeArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) return parsed;

      // Gère les chaînes JSON encodées plusieurs fois
      if (typeof parsed === "string") {
        return normalizeArray(parsed);
      }
    } catch {
      return [];
    }
  }

  return [];
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

function getAbsolutePhotoUrl(photoUrl: string | undefined): string | null {
  if (!photoUrl) return null;

  // 🆕 Les data URLs (base64) sont déjà exploitables telles quelles
  if (photoUrl.startsWith("data:")) return photoUrl;

  // Conserver les URL déjà absolues
  if (/^https?:\/\//i.test(photoUrl)) {
    return photoUrl;
  }

  if (!APP_URL) {
    throw new Error("APP_URL n'est pas configurée dans le .env");
  }

  // Transformer /uploads/photo.jpg en URL absolue
  return new URL(
    photoUrl.startsWith("/") ? photoUrl : `/${photoUrl}`,
    APP_URL
  ).href;
}

// 🆕 Télécharge une image et la convertit en data URL base64.
// jsPDF côté serveur (Node) ne sait PAS charger une URL : il lui faut du base64.
async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  if (url.startsWith("data:")) return url;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Image inaccessible (${res.status}) :`, url);
      return null;
    }
    const contentType =
      res.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    const bytes = new Uint8Array(await res.arrayBuffer());

    // Conversion base64 compatible Node ET navigateur
    let base64: string;
    if (typeof Buffer !== "undefined") {
      base64 = Buffer.from(bytes).toString("base64");
    } else {
      let bin = "";
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      base64 = btoa(bin);
    }
    return `data:${contentType};base64,${base64}`;
  } catch (e) {
    console.error("Impossible de charger l'image :", url, e);
    return null;
  }
}

// 🆕 À appeler (avec await) AVANT generateChecklistPDF, surtout côté serveur.
// Remplace toutes les URLs de photos de `states` par des data URLs base64.
export async function preloadStatesPhotos(states: CheckStatesMap): Promise<void> {
  await Promise.all(
    Object.values(states).map(async (state: any) => {
      const normalized = normalizeArray(state?.photoUrls);
      const source: string[] =
        normalized.length > 0 ? normalized : state?.photo ? [state.photo] : [];

      const resolved = await Promise.all(
        source.map(async (u) => {
          const abs = getAbsolutePhotoUrl(u) || u;
          // En cas d'échec, on garde l'URL d'origine (le navigateur pourra encore la charger)
          return (await fetchImageAsDataUrl(abs)) ?? abs;
        })
      );

      state.photoUrls = resolved;
      state.photo = "";
    })
  );
}

// 🆕 Détection du format à partir de la data URL
function detectImageFormat(src: string): "JPEG" | "PNG" | "WEBP" {
  const m = /^data:image\/(png|webp|jpe?g)/i.exec(src);
  if (!m) return "JPEG";
  const t = m[1].toLowerCase();
  if (t === "png") return "PNG";
  if (t === "webp") return "WEBP";
  return "JPEG";
}

// ---------- Ajout de la page Annexe / Grille de photos ----------
function appendPhotosPages(pdf: jsPDF, states: CheckStatesMap, categories: CheckCategory[]) {
  // Collecter toutes les photos associées à leur référence d'item
  const photoEntries: { reference: string; text: string; url: string }[] = [];

  categories.forEach((cat) => {
    cat.items.forEach((item) => {
      const state = states[item.id];
      // On récupère photoUrls (tableau) ou l'ancienne photo unique par rétrocompatibilité
      const normalizedUrls = normalizeArray(state?.photoUrls);

      const urls =
        normalizedUrls.length > 0
          ? normalizedUrls
          : state?.photo
            ? [state.photo]
            : [];

      urls.forEach((url) => {
        if (url) {
          photoEntries.push({
            reference: item.reference,
            text: item.text,
            url: getAbsolutePhotoUrl(url) || url, // data URL conservée telle quelle
          });
        }
      });
    });
  });

  if (photoEntries.length === 0) return;

  // Configuration de la grille (3 colonnes)
  const cols = 3;
  const cellWidth = 58;  // Largeur d'une case photo en mm
  const cellHeight = 65; // Hauteur d'une case photo en mm
  const startX = M;
  const startY = 22;
  const gapX = 8;
  const gapY = 10;
  const itemsPerPage = 6; // 2 lignes de 3 photos par page pour laisser de l'espace aux légendes

  let currentEntryIndex = 0;

  while (currentEntryIndex < photoEntries.length) {
    pdf.addPage();
    drawPageHeader(pdf);

    // Titre de la page d'annexe
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(INK);
    pdf.text("ANNEXE : ÉVIDENCES PHOTOGRAPHIQUES", M, 15);

    let pageItemCount = 0;

    while (pageItemCount < itemsPerPage && currentEntryIndex < photoEntries.length) {
      const entry = photoEntries[currentEntryIndex];
      const colIndex = pageItemCount % cols;
      const rowIndex = Math.floor(pageItemCount / cols);

      const x = startX + colIndex * (cellWidth + gapX);
      const y = startY + rowIndex * (cellHeight + gapY);

      // Cadre de la photo
      pdf.setDrawColor(GRID);
      pdf.setLineWidth(0.2);
      pdf.setFillColor("#f8fafc");
      pdf.rect(x, y, cellWidth, cellHeight - 12, "FD");

      // Insertion de l'image
      try {
        // ✏️ Format détecté dynamiquement au lieu de forcer "JPEG"
        pdf.addImage(
          entry.url,
          detectImageFormat(entry.url),
          x + 1,
          y + 1,
          cellWidth - 2,
          cellHeight - 14
        );
      } catch (e) {
        // ✏️ On log l'erreur réelle au lieu de l'avaler silencieusement
        console.error("addImage a échoué pour", entry.reference, e);
        pdf.setFontSize(6);
        pdf.setTextColor("#999999");
        pdf.text("Aperçu non disponible", x + cellWidth / 2, y + (cellHeight - 12) / 2, { align: "center" });
      }

      // Légende sous la photo (Référence + Libellé court)
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.5);
      pdf.setTextColor(TICK);
      pdf.text(`Réf : ${entry.reference}`, x, y + cellHeight - 8);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(5.5);
      pdf.setTextColor(INK);
      const shortText = pdf.splitTextToSize(entry.text, cellWidth);
      pdf.text(shortText.slice(0, 2), x, y + cellHeight - 4);

      currentEntryIndex++;
      pageItemCount++;
    }
  }
}

// ---------- Génération principale ----------
export function generateChecklistPDF(
  info: VehicleInfo,
  categories: CheckCategory[],
  states: CheckStatesMap,
  shouldSave: boolean = true
) {
  // const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  pdf.setLineWidth(0.2);
  drawPageHeader(pdf);
  let y = drawTitleBlock(pdf, info);
  y = drawTableHeader(pdf, y);

  const newPage = () => {
    pdf.addPage();
    drawPageHeader(pdf);
    y = drawTableHeader(pdf, 14);
  };

  const descW = X[2] - X[1] - PAD * 2;
  categories.forEach((category) => {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(7);
    const titleLines: string[] = pdf.splitTextToSize(category.title, descW);
    const titleH = Math.max(5.5, titleLines.length * LINE_H + PAD * 2);
    if (y + titleH > BOTTOM) newPage();
    drawRowGrid(pdf, y, titleH);
    pdf.setFont("helvetica", "bolditalic");
    pdf.setTextColor(INK);
    const catRef = (category as any).reference as string | undefined;
    if (catRef) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);
      pdf.text(catRef, X[0] + 1, y + PAD + 2);
      pdf.setFont("helvetica", "bolditalic");
    }
    pdf.setFontSize(7);
    pdf.text(titleLines, X[1] + PAD, y + PAD + 2);
    y += titleH;

    category.items.forEach((item) => {
      const state = states[item.id] || { ok: true, observation: "" };
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      const lines: string[] = pdf.splitTextToSize(item.text, descW);
      pdf.setFontSize(6.5);
      const obsLines: string[] =
        !state.ok && state.observation
          ? pdf.splitTextToSize(state.observation, X[6] - X[5] - PAD * 2)
          : [];
      const h = Math.max(
        MIN_ROW_H,
        lines.length * LINE_H + PAD * 2,
        obsLines.length * LINE_H + PAD * 2
      );
      if (y + h > BOTTOM) newPage();
      drawRowGrid(pdf, y, h);

      pdf.setTextColor(INK);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);
      pdf.text(item.reference, X[0] + 1, y + PAD + 2);

      pdf.setFontSize(7);
      pdf.text(lines, X[1] + PAD, y + PAD + 2);

      const cy = y + h / 2;
      if (state.ok) {
        drawTick(pdf, (X[3] + X[4]) / 2, cy);
      } else {
        pdf.setDrawColor("#dc2626");
        pdf.setLineWidth(0.5);
        const cx = (X[4] + X[5]) / 2;
        pdf.line(cx - 2, cy + 0.2, cx - 0.7, cy + 1.7);
        pdf.line(cx - 0.7, cy + 1.7, cx + 2.2, cy - 1.8);
        pdf.setLineWidth(0.2);
      }

      if (obsLines.length) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6.5);
        pdf.setTextColor(state.ok ? "#1c2f8a" : "#dc2626");
        pdf.text(obsLines, X[5] + PAD, y + PAD + 2);
        pdf.setTextColor(INK);
      }
      y += h;
    });
  });

  // ---------- Ajout des photos en grille sur les pages suivantes ----------
  appendPhotosPages(pdf, states, categories);

  // ---------- Pagination globale "1 / X" ----------
  const total = pdf.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    pdf.setPage(i);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(INK);
    pdf.text(`${i} / ${total}`, PAGE_W - M, PAGE_H - 8, { align: "right" });
  }

  if (shouldSave) {
    pdf.save(`RTGEP-${info.registration || "controle"}.pdf`);
  }
  return pdf;
}