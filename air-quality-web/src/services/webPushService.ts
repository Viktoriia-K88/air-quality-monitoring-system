const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface WebPushPreferences {
  primaryDistrict: string;
  watchDistricts?: string[];
  threshold?: number;
  notificationsEnabled?: boolean;
}

export type WebPushPreferenceUpdates = Partial<WebPushPreferences>;

export type WebPushStatus =
  | {
      subscribed: false;
    }
  | {
      subscribed: true;
      primaryDistrict: string;
      watchDistricts: string[];
      threshold: number;
      notificationsEnabled: boolean;
    };

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);

  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

export function isWebPushSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

async function getVapidPublicKey(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/web-push/public-key`);

  if (!response.ok) {
    throw new Error("Unable to get the Web Push public key.");
  }

  const data = (await response.json()) as {
    publicKey: string;
  };

  return data.publicKey;
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
  });

  return navigator.serviceWorker.ready;
}

export async function getExistingWebPushSubscription(): Promise<PushSubscription | null> {
  if (!isWebPushSupported()) {
    return null;
  }

  const registration = await navigator.serviceWorker.getRegistration("/");

  if (!registration) {
    return null;
  }

  return registration.pushManager.getSubscription();
}

async function getOrCreatePushSubscription(
  registration: ServiceWorkerRegistration,
): Promise<PushSubscription> {
  const existingSubscription = await registration.pushManager.getSubscription();

  if (existingSubscription) {
    return existingSubscription;
  }

  const publicKey = await getVapidPublicKey();

  return registration.pushManager.subscribe({
    userVisibleOnly: true,

    applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
  });
}

async function saveSubscriptionOnServer(
  subscription: PushSubscription,
  preferences: WebPushPreferences,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/web-push/subscribe`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      subscription: subscription.toJSON(),

      primaryDistrict: preferences.primaryDistrict,

      watchDistricts: preferences.watchDistricts ?? [],

      threshold: preferences.threshold ?? 80,

      notificationsEnabled: preferences.notificationsEnabled ?? true,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to save the Web Push subscription.");
  }
}

async function updatePreferencesOnServer(
  subscription: PushSubscription,
  updates: WebPushPreferenceUpdates,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/web-push/preferences`, {
    method: "PATCH",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      endpoint: subscription.endpoint,

      ...updates,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to update Web Push preferences.");
  }
}

async function getWebPushStatusForSubscription(
  subscription: PushSubscription,
): Promise<WebPushStatus> {
  const response = await fetch(`${API_BASE_URL}/web-push/status`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      endpoint: subscription.endpoint,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to get Web Push status.");
  }

  return response.json() as Promise<WebPushStatus>;
}

export async function getWebPushStatus(): Promise<WebPushStatus> {
  const subscription = await getExistingWebPushSubscription();

  if (!subscription) {
    return {
      subscribed: false,
    };
  }

  return getWebPushStatusForSubscription(subscription);
}

export async function subscribeToWebPush(
  preferences: WebPushPreferences,
): Promise<PushSubscription> {
  if (!isWebPushSupported()) {
    throw new Error("Web Push is not supported in this browser.");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration = await registerServiceWorker();

  const subscription = await getOrCreatePushSubscription(registration);

  await saveSubscriptionOnServer(subscription, preferences);

  return subscription;
}

export async function syncWebPushPreferences(
  updates: WebPushPreferenceUpdates,
): Promise<boolean> {
  if (!isWebPushSupported() || Notification.permission !== "granted") {
    return false;
  }

  const subscription = await getExistingWebPushSubscription();

  if (!subscription) {
    return false;
  }

  await updatePreferencesOnServer(subscription, updates);

  return true;
}

export async function syncWebPushDistrict(
  primaryDistrict: string,
): Promise<boolean> {
  if (!isWebPushSupported() || Notification.permission !== "granted") {
    return false;
  }

  const subscription = await getExistingWebPushSubscription();

  if (!subscription) {
    return false;
  }

  const status = await getWebPushStatusForSubscription(subscription);

  if (!status.subscribed || !status.notificationsEnabled) {
    return false;
  }

  const nextWatchDistricts = status.watchDistricts.filter(
    (district) => district !== primaryDistrict,
  );

  await updatePreferencesOnServer(subscription, {
    primaryDistrict,
    watchDistricts: nextWatchDistricts,
  });

  return true;
}

export async function unsubscribeFromWebPush(): Promise<void> {
  if (!isWebPushSupported()) {
    throw new Error("Web Push is not supported in this browser.");
  }

  const subscription = await getExistingWebPushSubscription();

  if (!subscription) {
    return;
  }

  const response = await fetch(`${API_BASE_URL}/web-push/unsubscribe`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      endpoint: subscription.endpoint,
    }),
  });

  if (!response.ok) {
    throw new Error(
      "Unable to remove the Web Push subscription from the server.",
    );
  }

  const unsubscribed = await subscription.unsubscribe();

  if (!unsubscribed) {
    throw new Error("Unable to unsubscribe from Web Push.");
  }
}
