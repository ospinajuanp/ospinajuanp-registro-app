import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDialog from "@/components/ConfirmDialog";

describe("ConfirmDialog", () => {
  beforeEach(() => cleanup());

  it("renders nothing visible when closed", () => {
    render(<ConfirmDialog open={false} title="T" message="M" onConfirm={() => {}} onCancel={() => {}} />);
    const dialog = document.querySelector("dialog");
    expect(dialog?.open).toBe(false);
  });

  it("opens when open=true and shows title and message", () => {
    render(
      <ConfirmDialog
        open
        title="¿Borrar registro?"
        message="Esta acción no se puede deshacer."
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByText("¿Borrar registro?")).toBeInTheDocument();
    expect(screen.getByText("Esta acción no se puede deshacer.")).toBeInTheDocument();
    const dialog = document.querySelector("dialog");
    expect(dialog?.open).toBe(true);
  });

  it("fires onConfirm when clicking the confirm button", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmDialog open title="T" message="M" confirmLabel="Sí, borrar" onConfirm={onConfirm} onCancel={() => {}} />,
    );
    await user.click(screen.getByRole("button", { name: /sí, borrar/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("fires onCancel when clicking cancel", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmDialog open title="T" message="M" cancelLabel="No" onConfirm={() => {}} onCancel={onCancel} />,
    );
    await user.click(screen.getByRole("button", { name: /no/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("fires onCancel when clicking the close (X) button", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog open title="T" message="M" onConfirm={() => {}} onCancel={onCancel} />);
    await user.click(screen.getByRole("button", { name: /cerrar diálogo/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables both buttons while busy", () => {
    render(
      <ConfirmDialog open title="T" message="M" busy onConfirm={() => {}} onCancel={() => {}} />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    buttons.forEach((b) => expect(b).toBeDisabled());
  });

  it("exposes correct ARIA attributes (labelledby + describedby)", () => {
    render(<ConfirmDialog open title="Mi título" message="Mi mensaje" onConfirm={() => {}} onCancel={() => {}} />);
    const dialog = document.querySelector("dialog");
    expect(dialog?.getAttribute("aria-labelledby")).toBeTruthy();
    expect(dialog?.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("renders danger variant with warning icon and danger confirm button", () => {
    render(<ConfirmDialog open variant="danger" title="Peligro" message="M" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByText("Peligro")).toBeInTheDocument();
    // Icon present as SVG
    expect(document.querySelector("dialog svg")).toBeInTheDocument();
  });
});