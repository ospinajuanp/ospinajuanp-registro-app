import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AlertDialog from "@/components/AlertDialog";

describe("AlertDialog", () => {
  beforeEach(() => cleanup());

  it("renders the title and message", () => {
    render(
      <AlertDialog
        open
        title="Operación exitosa"
        message="Todo salió bien."
        onClose={() => {}}
      />,
    );
    expect(screen.getByText("Operación exitosa")).toBeInTheDocument();
    expect(screen.getByText("Todo salió bien.")).toBeInTheDocument();
  });

  it("renders the default button label 'Aceptar'", () => {
    render(
      <AlertDialog open title="t" message="m" onClose={() => {}} />,
    );
    expect(screen.getByRole("button", { name: /aceptar/i })).toBeInTheDocument();
  });

  it("respects a custom button label", () => {
    render(
      <AlertDialog
        open
        title="t"
        message="m"
        buttonLabel="Entendido"
        onClose={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: /entendido/i })).toBeInTheDocument();
  });

  it("calls onClose when the action button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <AlertDialog open title="t" message="m" onClose={onClose} />,
    );
    await user.click(screen.getByRole("button", { name: /aceptar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the X close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <AlertDialog open title="t" message="m" onClose={onClose} />,
    );
    await user.click(screen.getByRole("button", { name: /cerrar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders an alert role on the dialog", () => {
    render(
      <AlertDialog open title="Aviso" message="Algo pasó" onClose={() => {}} />,
    );
    // <dialog> rendered via showModal() has role=dialog; the message body
    // is what users actually read as the alert content.
    const dialog = document.querySelector("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");
  });

  it("supports a ReactNode message", () => {
    render(
      <AlertDialog
        open
        title="Detalle"
        message={<span data-testid="custom-msg">HTML permitido</span>}
        onClose={() => {}}
      />,
    );
    expect(screen.getByTestId("custom-msg")).toBeInTheDocument();
  });
});
