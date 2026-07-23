"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Upload, Database, FileText, LogOut } from "lucide-react";
import BottomTabBar from "./BottomTabBar";
import ConfirmDialog from "@/components/ConfirmDialog";
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      setLoggingOut(false);
      setLogoutDialogOpen(false);
    }
  };

  return (
    <div className={styles.dashboardLayout}>
      <aside
        className={styles.sidebar}
        aria-label="Navegación principal"
      >
        <div className={styles.brand}>ospinajuanp-admin</div>
        <nav className={styles.navLinks}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
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
        <div className={styles.sidebarFooter}>
          <button
            type="button"
            onClick={() => setLogoutDialogOpen(true)}
            className={styles.btnLogout}
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} aria-hidden />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>{children}</main>

      {/* Mobile bottom tab bar — replaces the top-left hamburger for nav. */}
      <BottomTabBar
        currentPath={pathname}
        onAccountClick={() => setLogoutDialogOpen(true)}
      />

      <ConfirmDialog
        open={logoutDialogOpen}
        title="¿Cerrar sesión?"
        message="Vas a salir del panel de administración. Tendrás que volver a iniciar sesión para entrar."
        confirmLabel="Cerrar Sesión"
        cancelLabel="Cancelar"
        variant="danger"
        busy={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => {
          if (!loggingOut) setLogoutDialogOpen(false);
        }}
      />
    </div>
  );
}