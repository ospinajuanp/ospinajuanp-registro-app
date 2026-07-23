"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { getKids, addKid, updateKid, deleteKid, deleteAllKids, deleteMultipleKids } from "../../actions/kids";
import dash from "../dashboard.module.css";
import s from "./kids.module.css";
import type { Kid } from "@/lib/types/kid";
import Pagination from "@/components/Pagination";
import { kidMatchesSearch } from "@/lib/utils/kidSearch";
import MobileKidsCard from "./MobileKidsCard";
import AlertDialog, { type AlertVariant } from "@/components/AlertDialog";
import ConfirmDialog from "@/components/ConfirmDialog";

const defaultKid: Kid = {
  "Tipo de documento del niño": "RC",
  "Número de documento del niño": "",
  "Nombre completo del niño": "",
  "Sede": "",
  "Tipo de paquete": "",
  "Recibe paquete": "Si",
  "fecha": "",
  "hora": ""
};

export default function KidsManager() {
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Kid>(defaultKid);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKids, setSelectedKids] = useState<string[]>([]);
  const [deleteStep, setDeleteStep] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pendingDelete, setPendingDelete] = useState<
    { kind: "one"; docId: string } | { kind: "selected" } | null
  >(null);
  const [alert, setAlert] = useState<
    { title: string; message: string; variant: AlertVariant } | null
  >(null);

  const loadKids = async () => {
    setLoading(true);
    const data = await getKids();
    setKids(data);
    setSelectedKids([]);
    setLoading(false);
  };

  useEffect(() => { loadKids(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const handleOpenAdd = () => {
    setEditingDocId(null);
    setFormData(defaultKid);
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (kid: Kid) => {
    setEditingDocId(kid["Número de documento del niño"]);
    setFormData(kid);
    setError(null);
    setModalOpen(true);
  };

  const handleDelete = (docId: string) => {
    setPendingDelete({ kind: "one", docId });
  };

  const handleDeleteAllStep = async () => {
    if (deleteStep < 2) {
      setDeleteStep(deleteStep + 1);
    } else {
      setLoading(true);
      const res = await deleteAllKids();
      if (res.success) {
        await loadKids();
        setDeleteStep(0);
        setAlert({
          title: "Base de datos limpiada",
          message: "Todos los registros han sido eliminados.",
          variant: "success",
        });
      } else {
        setLoading(false);
        setAlert({
          title: "Error al eliminar",
          message: "No se pudo completar la limpieza.",
          variant: "error",
        });
      }
    }
  };

  const getDeleteConfig = () => {
    const configs = [
      { text: "Limpiar Base de Datos", background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" },
      { text: "¿Estás seguro?", background: "rgba(249,115,22,0.2)", color: "#fdba74", border: "1px solid rgba(249,115,22,0.3)" },
      { text: `CONFIRMAR: Borrar ${kids.length} registros`, background: "rgba(220,38,38,0.4)", color: "#f87171", border: "1px solid rgba(220,38,38,0.6)" },
    ];
    return configs[deleteStep] || configs[0];
  };

  const handleDeleteSelected = () => {
    if (selectedKids.length === 0) return;
    setPendingDelete({ kind: "selected" });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const action = pendingDelete;
    setPendingDelete(null);
    setLoading(true);

    let res: { success: boolean; error?: string };
    if (action.kind === "one") {
      res = await deleteKid(action.docId);
    } else {
      res = await deleteMultipleKids(selectedKids);
    }

    if (res.success) {
      await loadKids();
      setAlert({
        title:
          action.kind === "one"
            ? "Registro eliminado"
            : `${selectedKids.length} registros eliminados`,
        message: "La operación se completó correctamente.",
        variant: "success",
      });
    } else {
      setLoading(false);
      setAlert({
        title: "Error al eliminar",
        message: res.error ?? "No se pudo completar la eliminación.",
        variant: "error",
      });
    }
  };

  const handleDownloadExcel = async () => {
    if (kids.length === 0) {
      setAlert({
        title: "Sin datos",
        message: "No hay registros para descargar.",
        variant: "info",
      });
      return;
    }

    // Lazy-load XLSX (~700 KB) only when the user actually exports.
    const XLSX = await import("xlsx");

    // 1. Crear la hoja y el libro
    const ws = XLSX.utils.json_to_sheet(kids);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BaseDatosNinos");

    // 2. Generar el contenido del archivo en memoria (Buffer)
    // Usamos 'write' en lugar de 'writeFile' para evitar errores de sistema de archivos
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // 3. Crear un Blob con los datos
    const data = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // 4. Crear un enlace temporal y simular el clic para descargar
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BaseDatosNinos_${new Date().toLocaleDateString()}.xlsx`;
    document.body.appendChild(link);
    link.click();

    // 5. Limpieza
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = editingDocId ? await updateKid(editingDocId, formData) : await addKid(formData);
    if (res.success) {
      setModalOpen(false);
      await loadKids();
    } else {
      setError(res.error || "Ocurrió un error");
      setLoading(false);
    }
  };

  const filteredKids = kids.filter(k => kidMatchesSearch(k, searchTerm));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredKids.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedKids = filteredKids.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const toggleSelectAll = () => {
    setSelectedKids(selectedKids.length === paginatedKids.length && paginatedKids.length > 0
      ? []
      : paginatedKids.map(k => k["Número de documento del niño"]).filter(Boolean)
    );
  };

  const toggleSelect = (docId: string) => {
    if (!docId) return;
    setSelectedKids(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const dc = getDeleteConfig();

  return (
    <div className={s.pageWrapper}>
      {/* Header */}
      <div className={dash.header} style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1 className={dash.headerTitle}>Base de Datos: Niños</h1>
          <p className={dash.headerSubtitle}>Gestión individual de registros · Total: {kids.length}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className={s.toolbar}>
        <button className={dash.btnPrimary} style={{ fontSize: "0.9rem" }} onClick={handleOpenAdd}>
          + Agregar Niñ@
        </button>

        <button className={s.btnDownload} onClick={handleDownloadExcel}>
          ⬇ Descargar Excel
        </button>

        <div className={s.deleteGroup}>
          <button
            className={s.btnDeleteStep}
            onClick={handleDeleteAllStep}
            disabled={kids.length === 0}
            style={{ background: dc.background, color: dc.color, border: dc.border, opacity: kids.length === 0 ? 0.5 : 1 }}
          >
            {dc.text}
          </button>
          {deleteStep > 0 && (
            <button className={s.btnCancelDelete} onClick={() => setDeleteStep(0)}>Cancelar</button>
          )}
        </div>
      </div>

      {/* Search + bulk delete */}
      <div className={s.searchRow}>
        <input
          className={s.searchInput}
          type="text"
          placeholder="Buscar por nombre o documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {selectedKids.length > 0 && (
          <button className={s.btnDeleteSelected} onClick={handleDeleteSelected}>
            Eliminar Seleccionados ({selectedKids.length})
          </button>
        )}
      </div>

      {/* Pagination (top) */}
      {!loading && filteredKids.length > 0 && (
        <Pagination
          currentPage={safePage}
          pageSize={pageSize}
          totalItems={filteredKids.length}
          onPageChange={handlePageChange}
        />
      )}

      {/* Table */}
      {loading && !modalOpen ? (
        <div className={s.loadingBox}>
          <span className={dash.spinner}></span> Cargando datos...
        </div>
      ) : (
        <div className={s.tableContainer}>
          <table className={s.table}>
            <thead className={s.tableThead}>
              <tr>
                <th className={`${s.tableTh} ${s.checkCol}`} scope="col">
                  <input
                    type="checkbox"
                    checked={paginatedKids.length > 0 && selectedKids.length === paginatedKids.length}
                    onChange={toggleSelectAll}
                    style={{ width: 18, height: 18, cursor: "pointer" }}
                    aria-label="Seleccionar todos"
                  />
                </th>
                <th className={s.tableTh} scope="col">Documento</th>
                <th className={s.tableTh} scope="col">Nombre Completo</th>
                <th className={`${s.tableTh} ${s.hideMobile}`} scope="col">Sede</th>
                <th className={`${s.tableTh} ${s.hideMobile}`} scope="col">Paquete</th>
                <th className={s.tableTh} scope="col">Recibe</th>
                <th className={s.tableTh} scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedKids.map((kid, i) => {
                const docId = kid["Número de documento del niño"];
                const isSelected = selectedKids.includes(docId);
                return (
                  <tr key={docId || i} className={`${s.tableTr} ${isSelected ? s.selected : ""}`}>
                    <td className={s.tableTd}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(docId)} style={{ width: 18, height: 18, cursor: "pointer" }} aria-label={`Seleccionar ${kid["Nombre completo del niño"]}`} />
                    </td>
                    <td className={s.tableTd}>{kid["Tipo de documento del niño"]} {docId}</td>
                    <td className={`${s.tableTd} ${s.bold}`}>{kid["Nombre completo del niño"]}</td>
                    <td className={`${s.tableTd} ${s.hideMobile}`}>{kid["Sede"]}</td>
                    <td className={`${s.tableTd} ${s.hideMobile}`}>{kid["Tipo de paquete"]}</td>
                    <td className={s.tableTd}>
                      <span className={kid["Recibe paquete"]?.toLowerCase() === "si" ? s.badgeYes : s.badgeNo}>
                        {kid["Recibe paquete"]}
                      </span>
                    </td>
                    <td className={`${s.tableTd} ${s.actions}`}>
                      <button className={s.btnEdit} onClick={() => handleOpenEdit(kid)} aria-label={`Editar registro de ${kid["Nombre completo del niño"]}`}>
                        <Pencil size={14} aria-hidden />
                        <span className={s.btnText}>Editar</span>
                      </button>
                      <button className={s.btnDelete} onClick={() => handleDelete(docId)} aria-label={`Eliminar registro de ${kid["Nombre completo del niño"]}`}>
                        <Trash2 size={14} aria-hidden />
                        <span className={s.btnText}>Borrar</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredKids.length === 0 && (
                <tr>
                  <td colSpan={7} className={s.emptyState}>
                    <svg className={s.emptyIcon} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>{kids.length === 0 ? "No hay niños registrados en la base de datos." : "No se encontraron niños con esa búsqueda."}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards list — hidden on desktop via CSS */}
      {!loading && !modalOpen && (
        <div className={s.mobileList}>
          {paginatedKids.length === 0 ? (
            <div className={s.emptyState}>
              <svg className={s.emptyIcon} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>{kids.length === 0 ? "No hay niños registrados en la base de datos." : "No se encontraron niños con esa búsqueda."}</p>
            </div>
          ) : (
            paginatedKids.map((kid, i) => {
              const docId = String(kid["Número de documento del niño"] ?? "");
              return (
                <MobileKidsCard
                  key={docId || i}
                  kid={kid}
                  isSelected={selectedKids.includes(docId)}
                  onSelect={toggleSelect}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                />
              );
            })
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className={s.modalOverlay}>
          <div className={s.modalBox}>
            <h2 className={s.modalTitle}>{editingDocId ? "Editar Registro" : "Nuevo Registro"}</h2>

            {error && <div className={dash.errorMessage}>{error}</div>}

            <form className={s.form} onSubmit={handleSubmit}>
              <div className={s.formRow}>
                <div className={s.formGroup} style={{ flex: 1 }}>
                  <label className={s.formLabel}>Tipo Doc</label>
                  <input required className={s.formInput} type="text" value={formData["Tipo de documento del niño"] || ""} onChange={(e) => setFormData({ ...formData, "Tipo de documento del niño": e.target.value })} />
                </div>
                <div className={s.formGroup} style={{ flex: 2 }}>
                  <label className={s.formLabel}>Número de Documento</label>
                  <input required className={s.formInput} type="text" disabled={!!editingDocId} value={formData["Número de documento del niño"]} onChange={(e) => setFormData({ ...formData, "Número de documento del niño": e.target.value })} />
                </div>
              </div>

              <div className={s.formGroup}>
                <label className={s.formLabel}>Nombre Completo</label>
                <input required className={s.formInput} type="text" value={formData["Nombre completo del niño"]} onChange={(e) => setFormData({ ...formData, "Nombre completo del niño": e.target.value })} />
              </div>

              <div className={s.formRow}>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Sede</label>
                  <input className={s.formInput} type="text" value={formData["Sede"] || ""} onChange={(e) => setFormData({ ...formData, "Sede": e.target.value })} />
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Recibe Paquete</label>
                  <select className={s.formSelect} value={formData["Recibe paquete"]} onChange={(e) => setFormData({ ...formData, "Recibe paquete": e.target.value })}>
                    <option value="Si">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className={s.formGroup}>
                <label className={s.formLabel}>Tipo de Paquete</label>
                <input className={s.formInput} type="text" value={formData["Tipo de paquete"] || ""} onChange={(e) => setFormData({ ...formData, "Tipo de paquete": e.target.value })} />
              </div>

              <div className={s.formRow}>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Fecha</label>
                  <input className={s.formInput} type="date" value={formData["fecha"] || ""} onChange={(e) => setFormData({ ...formData, "fecha": e.target.value })} />
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Hora</label>
                  <input className={s.formInput} type="time" value={formData["hora"] || ""} onChange={(e) => setFormData({ ...formData, "hora": e.target.value })} />
                </div>
              </div>

              <div className={s.formActions}>
                <button type="button" className={s.btnCancel} onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className={s.btnSubmit} disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={
          pendingDelete?.kind === "selected"
            ? `Eliminar ${selectedKids.length} registros`
            : "Eliminar registro"
        }
        message={
          pendingDelete?.kind === "selected"
            ? `Vas a eliminar ${selectedKids.length} registros seleccionados. Esta acción no se puede deshacer.`
            : "Vas a eliminar este registro. Esta acción no se puede deshacer."
        }
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <AlertDialog
        open={alert !== null}
        title={alert?.title ?? ""}
        message={alert?.message ?? ""}
        variant={alert?.variant ?? "info"}
        onClose={() => setAlert(null)}
      />
    </div>
  );
}
