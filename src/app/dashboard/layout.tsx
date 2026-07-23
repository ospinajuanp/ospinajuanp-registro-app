"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Upload, Database, FileText, LogOut, Menu, X } from "lucide-react";
import styles from "./dashboard.module.css";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { href: "/dashboard", label: "Resumen", icon: Home },
  { href: "/dashboard/import", label: "Importar Datos", icon: Upload },
  { href: "/dashboard/kids", label: "Base de Datos Niños", icon: Database },
  { href: "/dashboard/manage", label: "Historial de Consultas", icon: FileText },
];

const DRAWER_STORAGE_KEY = "dashboard:drawer-open";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(DRAWER_STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "true") setDrawerOpen(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        sessionStorage.setItem(DRAWER_STORAGE_KEY, String(next));
      }
      return next;
    });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className={styles.dashboardLayout}>
      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={toggleDrawer}
        className={styles.hamburgerBtn}
        aria-label={drawerOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={drawerOpen}
        aria-controls="dashboard-drawer"
      >
        {drawerOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
      </button>

      {/* Mobile drawer + backdrop */}
      <div
        className={`${styles.backdrop} ${drawerOpen ? styles.backdropVisible : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <aside
        id="dashboard-drawer"
        className={`${styles.sidebar} ${styles.mobileDrawer} ${drawerOpen ? styles.drawerOpen : ""}`}
        aria-label="Navegación principal"
      >
        <div className={styles.brand}>ospinajuanp-admin</div>
        <NavLinks items={NAV_ITEMS} currentPath={pathname} />
        <div className={styles.sidebarFooter}>
          <button
            type="button"
            onClick={handleLogout}
            className={styles.btnLogout}
          >
            <LogOut size={18} aria-hidden />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Desktop sidebar (same content, different CSS) */}
      <aside
        className={`${styles.sidebar} ${styles.desktopSidebar}`}
        aria-label="Navegación principal"
      >
        <div className={styles.brand}>ospinajuanp-admin</div>
        <NavLinks items={NAV_ITEMS} currentPath={pathname} />
        <div className={styles.sidebarFooter}>
          <button
            type="button"
            onClick={handleLogout}
            className={styles.btnLogout}
          >
            <LogOut size={18} aria-hidden />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}

function NavLinks({ items, currentPath }: { items: ReadonlyArray<NavItem>; currentPath: string }) {
  return (
    <nav className={styles.navLinks}>
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = currentPath === href;
        return (
          <Link
            key={href}
            href={href}
            className={`${styles.navLink} ${isActive ? styles.active : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={20} aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}