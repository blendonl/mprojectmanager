const DEFAULT_API_BASE_URL = "http://localhost:3000";
const rawBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");
