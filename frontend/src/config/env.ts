const fallbackApiUrl = import.meta.env.DEV ? "http://localhost:4000" : "";

export const env = {
  apiUrl: import.meta.env.VITE_API_URL || fallbackApiUrl,
  azureTenantId: import.meta.env.VITE_AZURE_TENANT_ID || "",
  azureClientId: import.meta.env.VITE_AZURE_CLIENT_ID || "",
  azureRedirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin,
};
