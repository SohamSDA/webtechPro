const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

const DEFAULT_API_BASE_URL = "http://localhost:3000";

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
const rawSocketUrl = import.meta.env.VITE_SOCKET_URL || rawApiBaseUrl;

export const API_BASE_URL = trimTrailingSlash(rawApiBaseUrl);
export const SOCKET_URL = trimTrailingSlash(rawSocketUrl);

export const apiUrl = (path = "") => {
  if (!path) {
    return API_BASE_URL;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};
