const mapboxPublicToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

if (!mapboxPublicToken) {
  throw new Error("Missing EXPO_PUBLIC_MAPBOX_TOKEN.");
}

export const MAPBOX_PUBLIC_TOKEN = mapboxPublicToken;
