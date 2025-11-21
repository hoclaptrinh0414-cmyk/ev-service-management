// src/services/config.js
// Centralized configuration helpers for service-layer modules

const DEFAULT_REMOTE_API = "https://unprepared-kade-nonpossibly.ngrok-free.dev";
const DEFAULT_APP_URL = "http://localhost:3000";

const trimTrailingSlash = (value) =>
  value ? value.replace(/\/+$/, "") : "";

const ensureApiSuffix = (value) => {
  if (!value) return "/api";
  return value.endsWith("/api") ? value : `${value}/api`;
};

const pickValue = (value, fallback) => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return fallback;
};

export const API_BASE_URL = ensureApiSuffix(
  trimTrailingSlash(
    pickValue(process.env.REACT_APP_API_URL, DEFAULT_REMOTE_API)
  )
);

export const APP_BASE_URL = trimTrailingSlash(
  pickValue(process.env.REACT_APP_APP_URL, DEFAULT_APP_URL)
);

export const DEFAULT_API_HEADERS = Object.freeze({
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
});

export default {
  API_BASE_URL,
  APP_BASE_URL,
  DEFAULT_API_HEADERS,
};
