import "server-only";

interface SendEmailParams {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  text: string;
  pdfBuffer?: Buffer;
  filename?: string;
  senderEmailOverride?: string; // Pour utiliser l'email de l'utilisateur courant si besoin
}

/**
 * Récupère un jeton d'accès Azure AD via le Client Credentials Flow
 */
async function getAzureAccessToken(): Promise<string> {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Identifiants Azure AD manquants dans les variables d'environnement.");
  }

  const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("scope", "https://graph.microsoft.com/.default");
  params.append("grant_type", "client_credentials");

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("❌ Erreur authentification Azure AD :", data);
    throw new Error(data.error_description || "Échec d'obtention du token Azure AD");
  }

  return data.access_token;
}

/**
 * Envoie un e-mail via l'API Microsoft Graph avec support multi-destinataires et CC
 */
export async function sendEmailWithPdf({
  to,
  cc,
  subject,
  text,
  pdfBuffer,
  filename,
  senderEmailOverride,
}: SendEmailParams) {
  const senderEmail = senderEmailOverride || process.env.SENDER_EMAIL || process.env.SMTP_USER;

  if (!senderEmail) {
    throw new Error("L'adresse de l'expéditeur n'est pas configurée.");
  }

  // 1. Obtention du Token Azure AD
  const accessToken = await getAzureAccessToken();

  // 2. Formatage des destinataires 'to'
  // const toRecipients = (Array.isArray(to) ? to : [to]).map((address) => ({
  //   emailAddress: { address: address.trim() },
  // }));

  // 3. Formatage des destinataires 'cc' si présents
  // const ccRecipients = cc
  //   ? (Array.isArray(cc) ? cc : [cc]).map((address) => ({
  //       emailAddress: { address: address.trim() },
  //     }))
  //   : undefined;

    // Nettoyage et formatage correct des destinataires 'to'
  const rawTo = Array.isArray(to) ? to : [to];
  const toRecipients = rawTo
    .flatMap((item) => (typeof item === "string" ? item.split(",") : item)) // Gère les chaînes séparées par des virgules
    .map((address) => address.replace(/["'[\]]/g, "").trim()) // Nettoie les crochets, guillemets accidentels
    .filter((address) => address.includes("@")) // Garde uniquement les emails valides
    .map((address) => ({
      emailAddress: { address },
    }));

  // Même chose pour les 'cc' si présents
  const rawCc = cc ? (Array.isArray(cc) ? cc : [cc]) : [];
  const ccRecipients = rawCc
    .flatMap((item) => (typeof item === "string" ? item.split(",") : item))
    .map((address) => address.replace(/["'[\]]/g, "").trim())
    .filter((address) => address.includes("@"))
    .map((address) => ({
      emailAddress: { address },
    }));

  
  // 4. Préparation des pièces jointes si fournies
  const attachments = [];
  if (pdfBuffer && filename) {
    attachments.push({
      "@odata.type": "#microsoft.graph.fileAttachment",
      name: filename,
      contentType: "application/pdf",
      contentBytes: pdfBuffer.toString("base64"),
    });
  }

  // 5. Construction du corps de la requête Microsoft Graph
  const mailPayload = {
    message: {
      subject: subject,
      body: {
        contentType: "Text",
        content: text,
      },
      toRecipients: toRecipients,
      ccRecipients: ccRecipients && ccRecipients.length > 0 ? ccRecipients : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    },
    saveToSentItems: "true",
  };

  // 6. Envoi via l'API Microsoft Graph
  const graphEndpoint = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
    senderEmail
  )}/sendMail`;

  const response = await fetch(graphEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mailPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("❌ Erreur Microsoft Graph API :", errorData);
    throw new Error(
      errorData?.error?.message ||
        `Erreur envoi mail Microsoft Graph (${response.status})`
    );
  }

  return { success: true };
}