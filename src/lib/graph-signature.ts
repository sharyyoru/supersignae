const GRAPH_BETA = "https://graph.microsoft.com/beta";

async function graphFetch(path: string, token: string, init: RequestInit = {}) {
  const response = await fetch(`${GRAPH_BETA}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (response.status === 204) return null;
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Graph API error ${response.status}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

function signatureStructuredData(html: string) {
  return [
    {
      keyEntry: { type: "string", values: ["signaturehtml"] },
      valueEntry: { type: "string", values: [html] },
    },
  ];
}

export async function setOwaSignature(token: string, html: string) {
  const configPath = "/me/mailFolders/root/userConfigurations/OWA.UserOptions";
  try {
    // Try to update the existing configuration object
    await graphFetch(configPath, token, {
      method: "PATCH",
      body: JSON.stringify({
        structuredData: signatureStructuredData(html),
      }),
    });
    return { success: true, method: "PATCH" };
  } catch (err) {
    // If it doesn't exist, create it
    if (err instanceof Error && err.message?.includes("404")) {
      await graphFetch("/me/mailFolders/root/userConfigurations", token, {
        method: "POST",
        body: JSON.stringify({
          id: "OWA.UserOptions",
          structuredData: signatureStructuredData(html),
        }),
      });
      return { success: true, method: "POST" };
    }
    throw err;
  }
}

export async function getMe(token: string) {
  return graphFetch("/me?$select=id,displayName,mail,userPrincipalName", token, { method: "GET" });
}
