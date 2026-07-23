import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MobileKidsCard from "@/app/dashboard/kids/MobileKidsCard";
import type { Kid } from "@/lib/types/kid";

const baseKid: Kid = {
  "Tipo de documento del niño": "CC",
  "Número de documento del niño": "1234567890",
  "Nombre completo del niño": "Ana López",
  "Sede": "Sede Norte",
  "Tipo de paquete": "Mensual",
  "Recibe paquete": "Si",
  "fecha": "2024-01-15",
  "hora": "08:30",
};

describe("MobileKidsCard", () => {
  beforeEach(() => cleanup());

  it("renders the name in the header", () => {
    render(
      <MobileKidsCard
        kid={baseKid}
        isSelected={false}
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(screen.getByText("Ana López")).toBeInTheDocument();
  });

  it("does not render the body fields until expanded", () => {
    render(
      <MobileKidsCard
        kid={baseKid}
        isSelected={false}
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(screen.queryByText("Sede Norte")).not.toBeInTheDocument();
    expect(screen.queryByText("Mensual")).not.toBeInTheDocument();
  });

  it("expands the body when the toggle is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MobileKidsCard
        kid={baseKid}
        isSelected={false}
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    const toggle = screen.getByRole("button", { name: /expandir detalles/i });
    await user.click(toggle);

    expect(screen.getByText("Sede Norte")).toBeInTheDocument();
    expect(screen.getByText("Mensual")).toBeInTheDocument();
    expect(screen.getByText(/Recibe/i)).toBeInTheDocument();
  });

  it("fires onEdit when clicking the name button", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(
      <MobileKidsCard
        kid={baseKid}
        isSelected={false}
        onSelect={() => {}}
        onEdit={onEdit}
        onDelete={() => {}}
      />,
    );
    // The name button and the pencil icon both have the same aria-label.
    // Use the first match — the name button is rendered before the icons.
    const editButtons = screen.getAllByRole("button", { name: /editar registro de ana lópez/i });
    await user.click(editButtons[0]!);
    expect(onEdit).toHaveBeenCalled();
  });

  it("fires onDelete when clicking the trash icon", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <MobileKidsCard
        kid={baseKid}
        isSelected={false}
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={onDelete}
      />,
    );
    await user.click(screen.getByRole("button", { name: /eliminar registro de ana lópez/i }));
    expect(onDelete).toHaveBeenCalledWith("1234567890");
  });

  it("fires onSelect when clicking the checkbox", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <MobileKidsCard
        kid={baseKid}
        isSelected={false}
        onSelect={onSelect}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: /seleccionar ana lópez/i }));
    expect(onSelect).toHaveBeenCalledWith("1234567890");
  });

  it("reflects the isSelected state in the checkbox", () => {
    render(
      <MobileKidsCard
        kid={baseKid}
        isSelected={true}
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(screen.getByRole("checkbox", { name: /seleccionar ana lópez/i })).toBeChecked();
  });

  it("updates aria-expanded when toggled", async () => {
    const user = userEvent.setup();
    render(
      <MobileKidsCard
        kid={baseKid}
        isSelected={false}
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );
    const toggle = screen.getByRole("button", { name: /expandir detalles/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAccessibleName(/contraer detalles/i);
  });

  it("renders the Recibe badge based on the kid's Recibe paquete value", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <MobileKidsCard
        kid={{ ...baseKid, "Recibe paquete": "Si" }}
        isSelected={false}
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );
    // Expand to reveal the badge.
    await user.click(screen.getByRole("button", { name: /expandir detalles/i }));
    expect(document.body.textContent).toContain("Si");

    rerender(
      <MobileKidsCard
        kid={{ ...baseKid, "Recibe paquete": "No" }}
        isSelected={false}
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(document.body.textContent).toContain("No");
  });
});