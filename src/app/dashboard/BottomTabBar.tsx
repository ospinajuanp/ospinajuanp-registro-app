"use client";

import Link from "next/link";
import { Home, Upload, Database, FileText, User } from "lucide-react";

export interface TabItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
}

const NAV_TABS: ReadonlyArray<TabItem> = [
  { href: "/dashboard", label: "Resumen", icon: Home },
  { href: "/dashboard/import", label: "Importar", icon: Upload },
  { href: "/dashboard/kids", label: "Niños", icon: Database },
  { href: "/dashboard/manage", label: "Historial", icon: FileText },
];

export const ACCOUNT_TAB: TabItem = {
  href: "#account",
  label: "Cuenta",
  icon: User,
};

interface BottomTabBarProps {
  currentPath: string;
  onAccountClick: () => void;
}

/**
 * Mobile-only bottom navigation bar (iOS / Material pattern).
 * Thumb-reach zone: easier than top-left hamburger.
 *
 * - 4 nav tabs (one per primary section).
 * - 1 "Cuenta" tab that triggers an action (logout confirm).
 *
 * Hidden on desktop (>680px) via CSS — see dashboard.module.css.
 */
export default function BottomTabBar({ currentPath, onAccountClick }: BottomTabBarProps) {
  return (
    <nav className="bottom-tab-bar" aria-label="Navegación inferior">
      {NAV_TABS.map(({ href, label, icon: Icon }) => {
        const isActive = currentPath === href;
        return (
          <Link
            key={href}
            href={href}
            className={`bottom-tab ${isActive ? "bottom-tab-active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={22} aria-hidden />
            <span className="bottom-tab-label">{label}</span>
          </Link>
        );
      })}
      <button
        type="button"
        className="bottom-tab bottom-tab-button"
        onClick={onAccountClick}
        aria-label="Cuenta"
      >
        <User size={22} aria-hidden />
        <span className="bottom-tab-label">{ACCOUNT_TAB.label}</span>
      </button>
    </nav>
  );
}