import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router";

import { districts } from "../../constants/districts";
import { useDistrict } from "../../context/useDistrict";
import { syncWebPushDistrict } from "../../services/webPushService";

import MobileHeader from "../MobileHeader/MobileHeader";
import Sidebar from "../Sidebar/Sidebar";

import "./AppLayout.scss";

function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const { selectedDistrict } = useDistrict();

  // sync web push district

  useEffect(() => {
    async function syncNotificationDistrict() {
      try {
        await syncWebPushDistrict(districts[selectedDistrict]);
      } catch (error) {
        console.error("Failed to sync Web Push district:", error);
      }
    }

    syncNotificationDistrict();
  }, [selectedDistrict]);

  // close mobile menu with escape

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);

        menuButtonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  // prevent page scroll when drawer is open

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = "";

      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // close drawer when leaving mobile width

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function closeMenu() {
    setIsMenuOpen(false);

    menuButtonRef.current?.focus();
  }

  return (
    <div className="app-layout">
      <MobileHeader
        isMenuOpen={isMenuOpen}
        onMenuOpen={() => setIsMenuOpen(true)}
        menuButtonRef={menuButtonRef}
      />

      <Sidebar
        isOpen={isMenuOpen}
        onClose={closeMenu}
        onNavigate={() => setIsMenuOpen(false)}
      />

      {isMenuOpen && (
        <button
          className="app-layout__overlay"
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenu}
        />
      )}

      <main className="app-layout__content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
