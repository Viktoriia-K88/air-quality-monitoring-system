import type { RefObject } from "react";
import { Cloud, Menu } from "lucide-react";

import "./MobileHeader.scss";

type MobileHeaderProps = {
  isMenuOpen: boolean;
  onMenuOpen: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
};

function MobileHeader({
  isMenuOpen,
  onMenuOpen,
  menuButtonRef,
}: MobileHeaderProps) {
  return (
    <header className="mobile-header">
      <div className="mobile-header__brand">
        <Cloud
          className="mobile-header__brand-icon"
          size={23}
          strokeWidth={1.9}
          aria-hidden="true"
        />

        <span>Air Quality</span>
      </div>

      <button
        ref={menuButtonRef}
        className="mobile-header__menu-button"
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={isMenuOpen}
        aria-controls="main-sidebar"
        onClick={onMenuOpen}
      >
        <Menu size={23} strokeWidth={1.8} aria-hidden="true" />
      </button>
    </header>
  );
}

export default MobileHeader;
