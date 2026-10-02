import { ConfidentialClientApplication, Configuration } from "@azure/msal-node";

const clientId = process.env.MICROSOFT_CLIENT_ID;
const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
const tenantId = process.env.MICROSOFT_TENANT_ID || "common";

export function isConfigured() {
  return Boolean(clientId && clientSecret);
}

export function getMsalClient() {
  if (!clientId || !clientSecret) {
    throw new Error("Microsoft OAuth is not configured");
  }
  const config: Configuration = {
    auth: {
      clientId,
      clientSecret,
      authority: `https://login.microsoftonline.com/${tenantId}`,
    },
  };
  return new ConfidentialClientApplication(config);
}

export function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/api/microsoft/callback`;
}

export function getAuthUrl(state: string) {
  const client = getMsalClient();
  return client.getAuthCodeUrl({
    redirectUri: getRedirectUri(),
    scopes: ["User.Read", "MailboxConfigItem.ReadWrite", "openid", "profile", "email", "offline_access"],
    state,
    prompt: "consent",
  });
}

export async function acquireTokenByCode(code: string) {
  const client = getMsalClient();
  const response = await client.acquireTokenByCode({
    code,
    redirectUri: getRedirectUri(),
    scopes: ["User.Read", "MailboxConfigItem.ReadWrite"],
  });
  return response;
}
