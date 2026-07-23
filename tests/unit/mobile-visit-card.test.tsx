import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MobileVisitCard from "@/app/dashboard/manage/MobileVisitCard";
import type { VisitLog } from "@/lib/types/visit";

const baseVisit: VisitLog = {
  id: "1234567890",
  uniqueId: "uuid-1",
  timestamp: "2024-01-15T08:30:00.000Z",
  device: "Mozilla/5.0 (iPhone)",
  name: "Ana López",
};

describe("MobileVisitCard", () => {
  beforeEach(() => cleanup());

  it("renders the searched id as a chip", () => {
    render(<MobileVisitCard visit={baseVisit} />);
    expect(screen.getByText("1234567890")).toBeInTheDocument();
  });

  it("renders the visit name in the header", () => {
    render(<MobileVisitCard visit={baseVisit} />);
    expect(screen.getByText("Ana López")).toBeInTheDocument();
  });

  it("renders N/A placeholder when name is missing", () => {
    render(<MobileVisitCard visit={{ ...baseVisit, name: undefined }} />);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("does not render the body fields until expanded", () => {
    render(<MobileVisitCard visit={baseVisit} />);
    expect(screen.queryByText("Mozilla/5.0")).not.toBeInTheDocument();
    expect(screen.queryByText(/Fecha/i)).not.toBeInTheDocument();
  });

  it("expands the body when the toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<MobileVisitCard visit={baseVisit} />);

    const toggle = screen.getByRole("button", { name: /expandir detalles/i });
    await user.click(toggle);

    expect(screen.getByText("Mozilla/5.0 (iPhone)")).toBeInTheDocument();
    // Timestamp formatted via toLocaleString — match by partial content
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it("updates aria-expanded when toggled", async () => {
    const user = userEvent.setup();
    render(<MobileVisitCard visit={baseVisit} />);

    const toggle = screen.getByRole("button", { name: /expandir detalles/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAccessibleName(/contraer detalles/i);
  });
});