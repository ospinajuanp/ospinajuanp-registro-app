import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination, { clampPage, DEFAULT_PAGE_SIZE_OPTIONS } from "@/components/Pagination";

describe("clampPage", () => {
  it("clamps below 1 to 1", () => {
    expect(clampPage(0, 10, 100)).toBe(1);
    expect(clampPage(-5, 10, 100)).toBe(1);
  });

  it("clamps above totalPages to totalPages", () => {
    expect(clampPage(999, 10, 100)).toBe(10);
  });

  it("returns 1 when totalItems is 0 (single empty page)", () => {
    expect(clampPage(5, 10, 0)).toBe(1);
  });

  it("passes through a valid page", () => {
    expect(clampPage(3, 10, 100)).toBe(3);
  });
});

describe("Pagination", () => {
  beforeEach(() => cleanup());

  it("renders showing range and total", () => {
    render(<Pagination currentPage={1} pageSize={10} totalItems={45} onPageChange={() => {}} />);
    expect(screen.getByText(/1-10/)).toBeInTheDocument();
    expect(screen.getByText(/45/)).toBeInTheDocument();
  });

  it("renders all default page size options", () => {
    render(<Pagination currentPage={1} pageSize={10} totalItems={45} onPageChange={() => {}} />);
    for (const size of DEFAULT_PAGE_SIZE_OPTIONS) {
      expect(screen.getByRole("option", { name: String(size) })).toBeInTheDocument();
    }
  });

  it("marks the current page with aria-current=page", () => {
    render(<Pagination currentPage={3} pageSize={10} totalItems={100} onPageChange={() => {}} />);
    const current = screen.getByRole("button", { name: "Ir a página 3" });
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("fires onPageChange with new page when clicking a page number", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination currentPage={1} pageSize={10} totalItems={100} onPageChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Ir a página 10" }));
    expect(onChange).toHaveBeenCalledWith(10, 10);
  });

  it("disables prev on first page and next on last page", () => {
    const { rerender } = render(
      <Pagination currentPage={1} pageSize={10} totalItems={100} onPageChange={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Página siguiente" })).not.toBeDisabled();

    rerender(<Pagination currentPage={10} pageSize={10} totalItems={100} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Página anterior" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Página siguiente" })).toBeDisabled();
  });

  it("fires onPageChange with clamped page when clicking prev/next", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination currentPage={3} pageSize={10} totalItems={100} onPageChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Página anterior" }));
    expect(onChange).toHaveBeenLastCalledWith(2, 10);

    await user.click(screen.getByRole("button", { name: "Página siguiente" }));
    expect(onChange).toHaveBeenLastCalledWith(4, 10);
  });

  it("fires onPageChange resetting to page 1 when page size changes", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination currentPage={7} pageSize={10} totalItems={200} onPageChange={onChange} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "50");

    expect(onChange).toHaveBeenCalledWith(1, 50);
  });

  it("inserts ellipsis when total pages > 7", () => {
    render(<Pagination currentPage={5} pageSize={10} totalItems={200} onPageChange={() => {}} />);
    const gaps = screen.getAllByText("…");
    expect(gaps.length).toBeGreaterThanOrEqual(1);
  });

  it("renders all page numbers when total pages <= 7 (no ellipsis)", () => {
    render(<Pagination currentPage={1} pageSize={10} totalItems={50} onPageChange={() => {}} />);
    expect(screen.queryByText("…")).not.toBeInTheDocument();
    for (let p = 1; p <= 5; p++) {
      expect(screen.getByRole("button", { name: `Ir a página ${p}` })).toBeInTheDocument();
    }
  });

  it("clamps currentPage when out of range (e.g. fewer items than before)", () => {
    render(<Pagination currentPage={10} pageSize={10} totalItems={20} onPageChange={() => {}} />);
    expect(screen.getByText((_, el) => el?.textContent === "Mostrando 11-20 de 20")).toBeInTheDocument();
  });

  it("renders zero state and disables navigation when totalItems is 0", () => {
    render(<Pagination currentPage={1} pageSize={10} totalItems={0} onPageChange={() => {}} />);
    expect(screen.getByText(/0-0/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Página siguiente" })).toBeDisabled();
    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
  });

  it("uses custom labels when provided", () => {
    render(
      <Pagination
        currentPage={1}
        pageSize={10}
        totalItems={20}
        onPageChange={() => {}}
        labels={{ showing: "Showing", prev: "Prev", next: "Next", pageSize: "Per page:" }}
      />,
    );
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Página anterior" })).toHaveTextContent(/Prev/);
    expect(screen.getByRole("button", { name: "Página siguiente" })).toHaveTextContent(/Next/);
    expect(screen.getByText(/Per page:/)).toBeInTheDocument();
  });
});