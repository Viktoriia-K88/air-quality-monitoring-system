import { useEffect, useRef, useState } from "react";

import {
  BellRing,
  Check,
  ChevronDown,
  Monitor,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";

import { districts, type DistrictKey } from "../../constants/districts";

import type { ThemeMode } from "../../context/ThemeContext";
import { useDistrict } from "../../context/useDistrict";
import { useTheme } from "../../context/useTheme";

import {
  getWebPushStatus,
  isWebPushSupported,
  subscribeToWebPush,
  syncWebPushPreferences,
  unsubscribeFromWebPush,
} from "../../services/webPushService";

import "./Settings.scss";

type ThemeOption = {
  value: ThemeMode;
  title: string;
  icon: LucideIcon;
};

type NotificationState =
  | "checking"
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "denied"
  | "unsupported";

const NOTIFICATION_THRESHOLD_KEY = "air-quality-notification-threshold";

const WATCHED_DISTRICTS_KEY = "air-quality-watched-districts";

const notificationThresholds = [60, 70, 80, 90, 100];

const districtKeys = Object.keys(districts) as DistrictKey[];

const themeOptions: ThemeOption[] = [
  {
    value: "system",
    title: "System",
    icon: Monitor,
  },
  {
    value: "light",
    title: "Light",
    icon: Sun,
  },
  {
    value: "dark",
    title: "Dark",
    icon: Moon,
  },
];

function getSavedThreshold() {
  const savedThreshold = Number(
    localStorage.getItem(NOTIFICATION_THRESHOLD_KEY),
  );

  if (notificationThresholds.includes(savedThreshold)) {
    return savedThreshold;
  }

  return 80;
}

function getSavedWatchedDistricts(): DistrictKey[] {
  const savedValue = localStorage.getItem(WATCHED_DISTRICTS_KEY);

  if (!savedValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(savedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (district): district is DistrictKey =>
        typeof district === "string" &&
        districtKeys.includes(district as DistrictKey),
    );
  } catch {
    return [];
  }
}

function saveWatchedDistricts(watchedDistricts: DistrictKey[]) {
  localStorage.setItem(WATCHED_DISTRICTS_KEY, JSON.stringify(watchedDistricts));
}

function getDistrictKeyFromBackendName(
  backendDistrict: string,
): DistrictKey | null {
  const entry = (Object.entries(districts) as [DistrictKey, string][]).find(
    ([, value]) => value === backendDistrict,
  );

  return entry?.[0] ?? null;
}

function Settings() {
  const { theme, setTheme } = useTheme();

  const { selectedDistrict } = useDistrict();

  const thresholdDropdownRef = useRef<HTMLDivElement>(null);

  const thresholdTriggerRef = useRef<HTMLButtonElement>(null);

  const [notificationState, setNotificationState] =
    useState<NotificationState>("checking");

  const [notificationThreshold, setNotificationThreshold] =
    useState(getSavedThreshold);

  const [watchedDistricts, setWatchedDistricts] = useState<DistrictKey[]>(
    getSavedWatchedDistricts,
  );

  const [isThresholdSaving, setIsThresholdSaving] = useState(false);

  const [isWatchedDistrictsSaving, setIsWatchedDistrictsSaving] =
    useState(false);

  const [isThresholdOpen, setIsThresholdOpen] = useState(false);

  // check web push status

  useEffect(() => {
    let isMounted = true;

    async function loadNotificationStatus() {
      if (!isWebPushSupported()) {
        if (isMounted) {
          setNotificationState("unsupported");
        }

        return;
      }

      if (Notification.permission === "denied") {
        if (isMounted) {
          setNotificationState("denied");
        }

        return;
      }

      try {
        const status = await getWebPushStatus();

        if (!isMounted) {
          return;
        }

        if (status.subscribed && status.notificationsEnabled) {
          setNotificationThreshold(status.threshold);

          localStorage.setItem(
            NOTIFICATION_THRESHOLD_KEY,
            String(status.threshold),
          );

          const savedWatchDistricts = status.watchDistricts
            .map(getDistrictKeyFromBackendName)
            .filter((district): district is DistrictKey => district !== null);

          setWatchedDistricts(savedWatchDistricts);

          saveWatchedDistricts(savedWatchDistricts);

          setNotificationState("success");

          return;
        }

        setNotificationState("idle");
      } catch (error) {
        console.error("Failed to load Web Push status:", error);

        if (isMounted) {
          setNotificationState("error");
        }
      }
    }

    loadNotificationStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  // close threshold dropdown

  useEffect(() => {
    if (!isThresholdOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        thresholdDropdownRef.current &&
        !thresholdDropdownRef.current.contains(event.target as Node)
      ) {
        setIsThresholdOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsThresholdOpen(false);

        thresholdTriggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);

      window.removeEventListener("keydown", handleEscape);
    };
  }, [isThresholdOpen]);

  const activeWatchedDistricts = watchedDistricts.filter(
    (district) => district !== selectedDistrict,
  );

  const availableWatchedDistricts = districtKeys.filter(
    (district) => district !== selectedDistrict,
  );

  // enable web push

  async function handleEnableNotifications() {
    if (!isWebPushSupported()) {
      setNotificationState("unsupported");

      return;
    }

    setNotificationState("loading");

    try {
      await subscribeToWebPush({
        primaryDistrict: districts[selectedDistrict],

        watchDistricts: activeWatchedDistricts.map(
          (district) => districts[district],
        ),

        threshold: notificationThreshold,

        notificationsEnabled: true,
      });

      setNotificationState("success");
    } catch (error) {
      console.error("Failed to enable Web Push notifications:", error);

      if (Notification.permission === "denied") {
        setNotificationState("denied");

        return;
      }

      setNotificationState("error");
    }
  }

  // disable web push

  async function handleDisableNotifications() {
    setNotificationState("loading");

    try {
      await unsubscribeFromWebPush();

      setNotificationState("idle");
    } catch (error) {
      console.error("Failed to disable Web Push notifications:", error);

      setNotificationState("error");
    }
  }

  async function handleNotificationToggle() {
    if (notificationState === "success") {
      await handleDisableNotifications();

      return;
    }

    await handleEnableNotifications();
  }

  // change alert threshold

  async function handleThresholdChange(nextThreshold: number) {
    setIsThresholdOpen(false);

    thresholdTriggerRef.current?.focus();

    if (nextThreshold === notificationThreshold) {
      return;
    }

    const previousThreshold = notificationThreshold;

    setNotificationThreshold(nextThreshold);

    localStorage.setItem(NOTIFICATION_THRESHOLD_KEY, String(nextThreshold));

    if (notificationState !== "success") {
      return;
    }

    setIsThresholdSaving(true);

    try {
      await syncWebPushPreferences({
        threshold: nextThreshold,
      });
    } catch (error) {
      console.error("Failed to update notification threshold:", error);

      setNotificationThreshold(previousThreshold);

      localStorage.setItem(
        NOTIFICATION_THRESHOLD_KEY,
        String(previousThreshold),
      );
    } finally {
      setIsThresholdSaving(false);
    }
  }

  // change watched districts

  async function handleWatchedDistrictToggle(district: DistrictKey) {
    const previousDistricts = watchedDistricts;

    const nextDistricts = watchedDistricts.includes(district)
      ? watchedDistricts.filter((item) => item !== district)
      : [...watchedDistricts, district];

    setWatchedDistricts(nextDistricts);

    saveWatchedDistricts(nextDistricts);

    if (notificationState !== "success") {
      return;
    }

    const nextActiveDistricts = nextDistricts.filter(
      (item) => item !== selectedDistrict,
    );

    setIsWatchedDistrictsSaving(true);

    try {
      await syncWebPushPreferences({
        watchDistricts: nextActiveDistricts.map((item) => districts[item]),
      });
    } catch (error) {
      console.error("Failed to update watched districts:", error);

      setWatchedDistricts(previousDistricts);

      saveWatchedDistricts(previousDistricts);
    } finally {
      setIsWatchedDistrictsSaving(false);
    }
  }

  const notificationsEnabled = notificationState === "success";

  const notificationToggleDisabled =
    notificationState === "checking" ||
    notificationState === "loading" ||
    notificationState === "denied" ||
    notificationState === "unsupported";

  const notificationStatus = (() => {
    if (notificationState === "checking") {
      return "Checking notification status";
    }

    if (notificationState === "loading") {
      return "Updating notifications";
    }

    if (notificationState === "success") {
      return "Notifications enabled";
    }

    if (notificationState === "denied") {
      return "Notifications blocked";
    }

    if (notificationState === "unsupported") {
      return "Notifications unavailable";
    }

    if (notificationState === "error") {
      return "Unable to update notifications";
    }

    return "Notifications disabled";
  })();

  const notificationStatusClass = (() => {
    if (notificationState === "success") {
      return "success";
    }

    if (
      notificationState === "error" ||
      notificationState === "denied" ||
      notificationState === "unsupported"
    ) {
      return "error";
    }

    return "default";
  })();

  return (
    <section className="settings">
      <header className="settings__header">
        <h1 className="settings__title">Settings</h1>
      </header>

      <section className="settings__section">
        <div className="settings__section-heading">
          <h2>Appearance</h2>
        </div>

        <div className="settings__appearance-card">
          <div className="settings__appearance-header">
            <h3>Theme</h3>

            <p>Choose your preferred dashboard theme.</p>
          </div>

          <div className="settings__theme-options">
            {themeOptions.map(({ value, title, icon: Icon }) => {
              const isActive = theme === value;

              return (
                <button
                  className={`settings__theme-option ${
                    isActive ? "settings__theme-option--active" : ""
                  }`}
                  type="button"
                  aria-pressed={isActive}
                  key={value}
                  onClick={() => setTheme(value)}
                >
                  <Icon
                    className="settings__theme-icon"
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  <span className="settings__theme-label">{title}</span>

                  <span className="settings__theme-check" aria-hidden="true">
                    {isActive && <Check size={12} strokeWidth={2.6} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="settings__section settings__section--notifications">
        <div className="settings__section-heading">
          <h2>Notifications</h2>
        </div>

        <div className="settings__notification-card">
          <div className="settings__notification-main">
            <div className="settings__notification-icon" aria-hidden="true">
              <BellRing size={21} strokeWidth={1.8} />
            </div>

            <div className="settings__notification-content">
              <h3>Air quality alerts</h3>

              <p>
                Manage alerts about worsening air quality in selected districts.
              </p>

              <span
                className={`settings__notification-status settings__notification-status--${notificationStatusClass}`}
                role="status"
              >
                {notificationStatus}
              </span>
            </div>
          </div>

          <button
            className={`settings__notification-toggle ${
              notificationsEnabled
                ? "settings__notification-toggle--active"
                : ""
            }`}
            type="button"
            role="switch"
            aria-checked={notificationsEnabled}
            aria-label={
              notificationsEnabled
                ? "Disable notifications"
                : "Enable notifications"
            }
            disabled={notificationToggleDisabled}
            onClick={handleNotificationToggle}
          >
            <span
              className="settings__notification-toggle-thumb"
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="settings__threshold-card">
          <div className="settings__threshold-content">
            <h3>Alert threshold</h3>

            <p>Choose when an air quality alert is triggered.</p>
          </div>

          <div
            className="settings__threshold-dropdown"
            ref={thresholdDropdownRef}
          >
            <button
              ref={thresholdTriggerRef}
              className={`settings__threshold-trigger ${
                isThresholdOpen ? "settings__threshold-trigger--open" : ""
              }`}
              type="button"
              aria-label={`Alert threshold AQI ${notificationThreshold}`}
              aria-expanded={isThresholdOpen}
              aria-controls="threshold-options"
              disabled={isThresholdSaving}
              onClick={() => setIsThresholdOpen((current) => !current)}
            >
              <span className="settings__threshold-prefix">AQI</span>

              <strong>{notificationThreshold}</strong>

              <ChevronDown
                className="settings__threshold-chevron"
                size={15}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </button>

            {isThresholdOpen && (
              <div id="threshold-options" className="settings__threshold-menu">
                {notificationThresholds.map((threshold) => {
                  const isSelected = threshold === notificationThreshold;

                  return (
                    <button
                      className={`settings__threshold-option ${
                        isSelected ? "settings__threshold-option--selected" : ""
                      }`}
                      type="button"
                      aria-pressed={isSelected}
                      key={threshold}
                      onClick={() => handleThresholdChange(threshold)}
                    >
                      <span>{threshold}</span>

                      {isSelected && (
                        <Check size={14} strokeWidth={2.2} aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="settings__watched-card">
          <div className="settings__watched-content">
            <h3>Watched districts</h3>

            <p>Choose additional districts to monitor.</p>
          </div>

          <div className="settings__watched-options">
            {availableWatchedDistricts.map((district) => {
              const isSelected = activeWatchedDistricts.includes(district);

              return (
                <button
                  className={`settings__watched-option ${
                    isSelected ? "settings__watched-option--selected" : ""
                  }`}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={isWatchedDistrictsSaving}
                  key={district}
                  onClick={() => handleWatchedDistrictToggle(district)}
                >
                  {isSelected && (
                    <Check size={13} strokeWidth={2.3} aria-hidden="true" />
                  )}

                  <span>{district}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </section>
  );
}

export default Settings;
