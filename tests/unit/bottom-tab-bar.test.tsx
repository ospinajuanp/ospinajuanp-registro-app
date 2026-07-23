import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BottomTabBar from "@/app/dashboard/BottomTabBar";

describe("BottomTabBar", () => {
  beforeEach(() => cleanup());

  it("renders 5 tabs (4 nav + 1 account)", () => {
    render(<BottomTabBar currentPath="/dashboard" onAccountClick={() => {}} />);
    const tabs = screen.getAllByRole("link");
    expect(tabs).toHaveLength(4);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
  });

  it("marks the active tab with aria-current=page", () => {
    render(<BottomTabBar currentPath="/dashboard/kids" onAccountClick={() => {}} />);
    const activeTab = screen.getByRole("link", { name: /niños/i });
    expect(activeTab).toHaveAttribute("aria-current", "page");
  });

  it("does not mark non-matching tabs as active", () => {
    render(<BottomTabBar currentPath="/dashboard/import" onAccountClick={() => {}} />);
    const kidsTab = screen.getByRole("link", { name: /niños/i });
    expect(kidsTab).not.toHaveAttribute("aria-current", "page");
  });

  it("fires onAccountClick when the Cuenta button is clicked", async () => {
    const onAccount = vi.fn();
    const user = userEvent.setup();
    render(<BottomTabBar currentPath="/dashboard" onAccountClick={onAccount} />);
    await user.click(screen.getByRole("button", { name: /cuenta/i }));
    expect(onAccount).toHaveBeenCalledTimes(1);
  });

  it("renders nav labels Resumen, Importar, Niños, Historial", () => {
    render(<BottomTabBar currentPath="/dashboard" onAccountClick={() => {}} />);
    expect(screen.getByText("Resumen")).toBeInTheDocument();
    expect(screen.getByText("Importar")).toBeInTheDocument();
    expect(screen.getByText("Niños")).toBeInTheDocument();
    expect(screen.getByText("Historial")).toBeInTheDocument();
  });

  it("links point to correct routes", () => {
    render(<BottomTabBar currentPath="/dashboard" onAccountClick={() => {}} />);
    expect(screen.getByRole("link", { name: /resumen/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /importar/i })).toHaveAttribute("href", "/dashboard/import");
    expect(screen.getByRole("link", { name: /niños/i })).toHaveAttribute("href", "/dashboard/kids");
    expect(screen.getByRole("link", { name: /historial/i })).toHaveAttribute("href", "/dashboard/manage");
  });
});