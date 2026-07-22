import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { REQUIRED_KID_COLUMNS } from "@/lib/types/kid";

vi.mock("xlsx", () => {
  return {
    utils: {
      aoa_to_sheet: vi.fn((rows: unknown[][]) => ({ __sheet: rows })),
      book_new: vi.fn(() => ({ __book: true })),
      book_append_sheet: vi.fn(),
    },
    writeFile: vi.fn(),
  };
});

import * as XLSX from "xlsx";
import TemplateDownloadButton from "@/app/dashboard/import/TemplateDownloadButton";

const mockedXLSX = XLSX as unknown as {
  utils: {
    aoa_to_sheet: ReturnType<typeof vi.fn>;
    book_new: ReturnType<typeof vi.fn>;
    book_append_sheet: ReturnType<typeof vi.fn>;
  };
  writeFile: ReturnType<typeof vi.fn>;
};

describe("TemplateDownloadButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders a button with the expected accessible label and visible text", () => {
    render(<TemplateDownloadButton />);
    const button = screen.getByRole("button", { name: /descargar plantilla/i });
    expect(button).toBeInTheDocument();
    expect(button.textContent).toMatch(/plantilla.*xlsx/i);
  });

  it("triggers XLSX.writeFile exactly once on click", async () => {
    const user = userEvent.setup();
    render(<TemplateDownloadButton />);

    await user.click(screen.getByRole("button", { name: /descargar plantilla/i }));

    expect(mockedXLSX.writeFile).toHaveBeenCalledTimes(1);
  });

  it("builds the workbook with all required headers in row 0, in order", async () => {
    const user = userEvent.setup();
    render(<TemplateDownloadButton />);

    await user.click(screen.getByRole("button", { name: /descargar plantilla/i }));

    expect(mockedXLSX.utils.aoa_to_sheet).toHaveBeenCalledTimes(1);
    const rows = mockedXLSX.utils.aoa_to_sheet.mock.calls[0]?.[0] as string[][];
    expect(rows[0]).toEqual([...REQUIRED_KID_COLUMNS]);
  });

  it("includes a non-empty example row with 'Si' for Recibe paquete", async () => {
    const user = userEvent.setup();
    render(<TemplateDownloadButton />);

    await user.click(screen.getByRole("button", { name: /descargar plantilla/i }));

    const rows = mockedXLSX.utils.aoa_to_sheet.mock.calls[0]?.[0] as string[][];
    expect(rows).toHaveLength(2);
    const example = rows[1];
    expect(example).toHaveLength(REQUIRED_KID_COLUMNS.length);
    expect(example.every((v) => typeof v === "string" && v.length > 0)).toBe(true);
    expect(example[REQUIRED_KID_COLUMNS.indexOf("Recibe paquete")]).toBe("Si");
  });

  it("downloads the file with the canonical Spanish filename", async () => {
    const user = userEvent.setup();
    render(<TemplateDownloadButton />);

    await user.click(screen.getByRole("button", { name: /descargar plantilla/i }));

    expect(mockedXLSX.writeFile).toHaveBeenCalledWith(
      expect.anything(),
      "plantilla_importar_ninos.xlsx",
    );
  });

  it("attaches the worksheet to a new workbook under 'Plantilla' sheet", async () => {
    const user = userEvent.setup();
    render(<TemplateDownloadButton />);

    await user.click(screen.getByRole("button", { name: /descargar plantilla/i }));

    expect(mockedXLSX.utils.book_new).toHaveBeenCalledTimes(1);
    expect(mockedXLSX.utils.book_append_sheet).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ __sheet: expect.any(Array) }),
      "Plantilla",
    );
  });
});