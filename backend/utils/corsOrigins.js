const DEFAULT_ORIGINS = "http://localhost:5173";

const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

const normalizeOrigin = (origin = "") =>
  trimTrailingSlash(origin.trim().toLowerCase());

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const wildcardToRegex = (pattern = "") => {
  const escaped = escapeRegex(pattern);
  return new RegExp(`^${escaped.replace(/\\\*/g, "[^.]+")}$`, "i");
};

const configuredOrigins =
  process.env.CLIENT_URLS || process.env.CLIENT_URL || DEFAULT_ORIGINS;

const rawOrigins = configuredOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const exactOrigins = new Set();
const wildcardOriginMatchers = [];

rawOrigins.forEach((origin) => {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return;

  if (normalized.includes("*")) {
    wildcardOriginMatchers.push(wildcardToRegex(normalized));
    return;
  }

  exactOrigins.add(normalized);
});

export const allowedOrigins = Array.from(exactOrigins);

export const getAllowedOriginsText = () => rawOrigins.join(", ");

export const isAllowedOrigin = (origin) => {
  // Requests from curl/Postman or same-origin can arrive without Origin header.
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);
  if (exactOrigins.has(normalizedOrigin)) {
    return true;
  }

  return wildcardOriginMatchers.some((matcher) =>
    matcher.test(normalizedOrigin),
  );
};
