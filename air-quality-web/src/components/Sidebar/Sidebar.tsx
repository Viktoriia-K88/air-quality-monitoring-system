import {
  Cloud,
  History,
  Info,
  LayoutDashboard,
  Map as MapIcon,
  Settings,
  X,
} from "lucide-react";
import { NavLink } from "react-router";

import "./Sidebar.scss";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: () => void;
};

function Sidebar({ isOpen, onClose, onNavigate }: SidebarProps) {
  const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `sidebar__link ${isActive ? "sidebar__link--active" : ""}`;

  return (
    <aside
      id="main-sidebar"
      className={`sidebar ${isOpen ? "sidebar--open" : ""}`}
    >
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <Cloud
            className="sidebar__brand-icon"
            size={24}
            strokeWidth={1.9}
            aria-hidden="true"
          />

          <span className="sidebar__brand-text">Air Quality</span>
        </div>

        <button
          className="sidebar__close-button"
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
        >
          <X size={21} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        <NavLink
          className={getLinkClassName}
          to="/"
          end
          aria-label="Dashboard"
          title="Dashboard"
          onClick={onNavigate}
        >
          <LayoutDashboard size={19} strokeWidth={1.8} aria-hidden="true" />

          <span className="sidebar__link-text">Dashboard</span>
        </NavLink>

        <NavLink
          className={getLinkClassName}
          to="/history"
          aria-label="History"
          title="History"
          onClick={onNavigate}
        >
          <History size={19} strokeWidth={1.8} aria-hidden="true" />

          <span className="sidebar__link-text">History</span>
        </NavLink>

        <NavLink
          className={getLinkClassName}
          to="/map"
          aria-label="Map"
          title="Map"
          onClick={onNavigate}
        >
          <MapIcon size={19} strokeWidth={1.8} aria-hidden="true" />

          <span className="sidebar__link-text">Map</span>
        </NavLink>

        <NavLink
          className={getLinkClassName}
          to="/about-aqi"
          aria-label="About AQI"
          title="About AQI"
          onClick={onNavigate}
        >
          <Info size={19} strokeWidth={1.8} aria-hidden="true" />

          <span className="sidebar__link-text">About AQI</span>
        </NavLink>
      </nav>

      <NavLink
        className={({ isActive }) =>
          `sidebar__link sidebar__settings ${
            isActive ? "sidebar__link--active" : ""
          }`
        }
        to="/settings"
        aria-label="Settings"
        title="Settings"
        onClick={onNavigate}
      >
        <Settings size={19} strokeWidth={1.8} aria-hidden="true" />

        <span className="sidebar__link-text">Settings</span>
      </NavLink>
    </aside>
  );
}

export default Sidebar;
