"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { useLang } from "@/hooks/useLang";
import { Navigation } from "@/components/Navigation";
import { PlantInfoModal } from "@/components/PlantInfoModal";
import { PLANT_CATALOG } from "@/utils/plantCatalog";
import type { GardenBed, BedCell, Plant } from "@/utils/supabaseClient";

// Vynutí dynamické (server-time) renderování – zabrání selhání
// statického prerenderingu na buildu kvůli chybějícím env proměnným.
export const dynamic = "force-dynamic";


// ── Parsování buněk z DB ─────────────────────────────────────────────────────
function parseCells(raw: unknown): BedCell[] {
  if (!raw) return [];
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return []; }
  }
  if (Array.isArray(raw)) return raw as BedCell[];
  return [];
}

// ── Uložení do Supabase – bez created_at při update ─────────────────────────
async function saveBedToDb(bed: GardenBed, isNew: boolean): Promise<boolean> {
  if (isNew) {
    const { error } = await supabase.from("garden_beds").insert({
      id: bed.id,
      user_id: bed.user_id,
      name: bed.name,
      note: bed.note,
      year: bed.year,
      cols: bed.cols,
      rows: bed.rows,
      cells: bed.cells,
    });
    if (error) { console.error("INSERT error:", error.message, error.details); return false; }
  } else {
    const { error } = await supabase.from("garden_beds").update({
      name: bed.name,
      note: bed.note,
      year: bed.year,
      cols: bed.cols,
      rows: bed.rows,
      cells: bed.cells,
    }).eq("id", bed.id);
    if (error) { console.error("UPDATE error:", error.message, error.details); return false; }
  }
  return true;
}

// ── BedEditor ────────────────────────────────────────────────────────────────
function BedEditor({ bed, userPlants, onSave, onClose, isNew }: {
  bed: GardenBed;
  userPlants: Plant[];
  onSave: (b: GardenBed) => void;
  onClose: () => void;
  isNew: boolean;
}) {
  const { t, lang } = useLang();
  const [cells, setCells] = useState<BedCell[]>(bed.cells);
  const [cols, setCols] = useState(bed.cols);
  const [rows, setRows] = useState(bed.rows);
  const [editName, setEditName] = useState(bed.name);
  const [editNote, setEditNote] = useState(bed.note);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [infoPlantId, setInfoPlantId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [saveError, setSaveError] = useState("");

  const getCell = (r: number, c: number): BedCell =>
    cells.find(cl => cl.row === r && cl.col === c) ??
    { row: r, col: c, plant_id: null, plant_name: null, plant_emoji: null };

  const setCell = (r: number, c: number, plantId: string | null) => {
    const plant = plantId ? PLANT_CATALOG.find(p => p.id === plantId) : null;
    setCells(prev => {
      const next = prev.filter(cl => !(cl.row === r && cl.col === c));
      if (plantId && plant) {
        next.push({
          row: r, col: c,
          plant_id: plantId,
          plant_name: plant.names[lang] ?? plant.names["cs"],
          plant_emoji: plant.emoji,
        });
      }
      return next;
    });
    setSelectedCell(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    const updated: GardenBed = { ...bed, name: editName.trim() || bed.name, note: editNote.trim(), cols, rows, cells };
    const ok = await saveBedToDb(updated, isNew);
    setSaving(false);
    if (ok) {
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
      onSave(updated);
    } else {
      setSaveError(lang === "cs" ? "Ukládání selhalo – zkontrolujte připojení." :
                   lang === "en" ? "Save failed – check your connection." :
                   lang === "de" ? "Speichern fehlgeschlagen." : "Zapisywanie nie powiodło się.");
    }
  };

  const availablePlants = useMemo(() => {
    const ids = new Set(userPlants.map(p => p.plant_id));
    return PLANT_CATALOG.filter(p => ids.has(p.id));
  }, [userPlants]);

  const saveLabel = savedOk ? t("beds_saved") : saving ? t("beds_saving") : t("beds_save");

  return (
    <div className="fixed inset-0 z-40 bg-stone-50 dark:bg-gray-950 flex flex-col">
      {/* Hlavička */}
      <div
        className="bg-white dark:bg-gray-900 border-b border-stone-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
      >
        <button onClick={onClose}
          className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-gray-800 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors flex-shrink-0">
          ✕
        </button>
        <div className="flex-1 min-w-0">
          {saveError && <p className="text-xs text-red-500 mb-1">{saveError}</p>}
        </div>
        <button onClick={handleSave} disabled={saving}
          className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all flex-shrink-0 ${
            savedOk
              ? "bg-forest-100 text-forest-700 dark:bg-forest-900 dark:text-forest-300"
              : "bg-forest-600 hover:bg-forest-700 text-white shadow-md disabled:opacity-60"
          }`}>
          {saveLabel}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollable">
        {/* Editace názvu a poznámky */}
        <div className="card space-y-2">
          <input
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            placeholder={t("beds_name")}
            className="input-field font-semibold"
          />
          <input
            type="text"
            value={editNote}
            onChange={e => setEditNote(e.target.value)}
            placeholder={t("beds_note")}
            className="input-field text-sm"
          />
        </div>

        {/* Ovládání rozměrů */}
        <div className="flex gap-2 flex-wrap items-center">
          <button onClick={() => setRows(r => r + 1)} className="text-xs btn-secondary px-3 py-2">{t("beds_add_row")}</button>
          <button onClick={() => setCols(c => c + 1)} className="text-xs btn-secondary px-3 py-2">{t("beds_add_col")}</button>
          {rows > 1 && <button onClick={() => setRows(r => r - 1)} className="text-xs btn-secondary px-3 py-2 text-red-500">{t("beds_del_row")}</button>}
          {cols > 1 && <button onClick={() => setCols(c => c - 1)} className="text-xs btn-secondary px-3 py-2 text-red-500">{t("beds_del_col")}</button>}
          <span className="text-xs text-stone-400 dark:text-gray-500 ml-1">{cols}×{rows}</span>
        </div>

        {/* Mřížka záhonu */}
        <div className="card overflow-x-auto">
          <div
            className="inline-grid gap-1"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(52px, 52px))` }}
          >
            {Array.from({ length: rows }, (_, r) =>
              Array.from({ length: cols }, (_, c) => {
                const cell = getCell(r, c);
                const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => setSelectedCell(isSelected ? null : { r, c })}
                    className={`w-[52px] h-[52px] rounded-xl border-2 flex flex-col items-center justify-center transition-all gap-0.5
                      ${isSelected
                        ? "border-forest-500 bg-forest-50 dark:bg-forest-950 scale-105 shadow-md"
                        : cell.plant_id
                          ? "border-forest-200 dark:border-forest-800 bg-forest-50 dark:bg-forest-950 hover:scale-105"
                          : "border-dashed border-stone-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-forest-300"
                      }`}
                  >
                    {cell.plant_emoji ? (
                      <>
                        <span className="text-xl leading-none">{cell.plant_emoji}</span>
                        <span className="text-[8px] text-stone-500 dark:text-gray-400 w-full truncate text-center px-0.5">
                          {PLANT_CATALOG.find(p => p.id === cell.plant_id)?.names[lang] ?? cell.plant_name}
                        </span>
                      </>
                    ) : (
                      <span className="text-stone-300 dark:text-gray-600 text-xl">+</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Panel výběru rostliny */}
        {selectedCell && (
          <div className="card border-2 border-forest-200 dark:border-forest-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold dark:text-gray-100">
                {t("beds_cell")} [{selectedCell.r + 1}, {selectedCell.c + 1}]
              </p>
              {getCell(selectedCell.r, selectedCell.c).plant_id && (
                <button
                  onClick={() => setCell(selectedCell.r, selectedCell.c, null)}
                  className="text-xs text-red-500 border border-red-200 dark:border-red-800 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  {t("beds_clear_cell")}
                </button>
              )}
            </div>
            {availablePlants.length === 0 ? (
              <p className="text-xs text-stone-400">{t("beds_no_plants_hint")}</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availablePlants.map(plant => {
                  const name = plant.names[lang] ?? plant.names["cs"];
                  const isPlanted = getCell(selectedCell.r, selectedCell.c).plant_id === plant.id;
                  return (
                    <button key={plant.id}
                      onClick={() => setCell(selectedCell.r, selectedCell.c, plant.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all active:scale-95 ${
                        isPlanted
                          ? "border-forest-400 bg-forest-50 dark:bg-forest-950"
                          : "border-stone-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-forest-300 hover:bg-forest-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span className="text-2xl">{plant.emoji}</span>
                      <span className="text-[10px] text-center leading-tight text-bark-800 dark:text-gray-300">{name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Přehled rostlin v záhonu */}
        {cells.filter(c => c.plant_id).length > 0 && (
          <div className="card">
            <p className="text-xs font-semibold text-stone-400 dark:text-gray-500 uppercase tracking-wide mb-2">
              {t("beds_plants_in_bed")}
            </p>
            <div className="flex flex-wrap gap-2">
              {[...new Set(cells.filter(c => c.plant_id).map(c => c.plant_id!))].map(pid => {
                const p = PLANT_CATALOG.find(x => x.id === pid);
                if (!p) return null;
                return (
                  <button key={pid} onClick={() => setInfoPlantId(pid)}
                    className="flex items-center gap-1.5 bg-forest-50 dark:bg-forest-950 border border-forest-100 dark:border-forest-900 px-2 py-1 rounded-full text-xs text-forest-700 dark:text-forest-300 hover:bg-forest-100 transition-colors">
                    {p.emoji} {p.names[lang] ?? p.names["cs"]}
                    <span className="opacity-40 text-[9px]">ℹ</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {infoPlantId && <PlantInfoModal plantId={infoPlantId} onClose={() => setInfoPlantId(null)} />}
    </div>
  );
}

// ── BedCard ──────────────────────────────────────────────────────────────────
function BedCard({ bed, onEdit, onDelete }: {
  bed: GardenBed; onEdit: () => void; onDelete: () => void;
}) {
  const { t } = useLang();
  const plantedCells = bed.cells.filter(c => c.plant_id);
  const COLS = Math.min(bed.cols, 7);
  const ROWS = Math.min(bed.rows, 4);

  return (
    <div className="card hover:border-forest-200 dark:hover:border-forest-800 transition-colors p-3">
      {/* Celá mřížka záhonu – kliknutelná */}
      <button onClick={onEdit} className="w-full mb-2">
        <div
          className="grid gap-0.5 w-full"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const cell = bed.cells.find(cl => cl.row === r && cl.col === c);
              return (
                <div
                  key={`${r}-${c}`}
                  className={`aspect-square rounded border flex items-center justify-center text-[9px] ${
                    cell?.plant_emoji
                      ? "border-forest-200 dark:border-forest-800 bg-forest-50 dark:bg-forest-950"
                      : "border-dashed border-stone-200 dark:border-gray-700 bg-stone-50 dark:bg-gray-800"
                  }`}
                >
                  {cell?.plant_emoji ?? ""}
                </div>
              );
            })
          )}
        </div>
      </button>

      {/* Název + poznámka */}
      <button onClick={onEdit} className="text-left w-full mb-2">
        <p className="font-bold text-sm text-bark-900 dark:text-gray-100 truncate">{bed.name}</p>
        {bed.note && (
          <p className="text-[11px] text-stone-400 dark:text-gray-500 truncate mt-0.5">{bed.note}</p>
        )}
        <p className="text-[10px] text-stone-300 dark:text-gray-600 mt-0.5">
          {bed.cols}×{bed.rows} · {plantedCells.length} {t("beds_planted")}
        </p>
      </button>

      {/* Tlačítka – vodorovně */}
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 text-xs bg-forest-50 dark:bg-forest-950 text-forest-700 dark:text-forest-300 py-1.5 rounded-xl border border-forest-100 dark:border-forest-900 hover:bg-forest-100 transition-colors"
        >
          ✏️ {t("beds_edit")}
        </button>
        <button
          onClick={onDelete}
          className="flex-1 text-xs text-red-400 py-1.5 rounded-xl border border-red-100 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
        >
          🗑 {t("beds_delete")}
        </button>
      </div>
    </div>
  );
}

// ── CompareView ──────────────────────────────────────────────────────────────
function CompareView({ beds, onClose }: { beds: GardenBed[]; onClose: () => void }) {
  const { t, lang } = useLang();
  const [leftId, setLeftId] = useState(beds[0]?.id ?? "");
  const [rightId, setRightId] = useState(beds[1]?.id ?? beds[0]?.id ?? "");
  const left = beds.find(b => b.id === leftId);
  const right = beds.find(b => b.id === rightId);

  const MiniGrid = ({ bed }: { bed: GardenBed }) => (
    <div className="overflow-x-auto">
      <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${bed.cols}, minmax(28px, 1fr))` }}>
        {Array.from({ length: bed.rows }, (_, r) =>
          Array.from({ length: bed.cols }, (_, c) => {
            const cell = bed.cells.find(cl => cl.row === r && cl.col === c);
            return (
              <div key={`${r}-${c}`}
                className={`w-8 h-8 rounded border flex items-center justify-center text-sm ${
                  cell?.plant_emoji
                    ? "border-forest-200 dark:border-forest-800 bg-forest-50 dark:bg-forest-950"
                    : "border-dashed border-stone-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                }`}>
                {cell?.plant_emoji ?? ""}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 bg-stone-50 dark:bg-gray-950 flex flex-col">
      <div className="bg-white dark:bg-gray-900 border-b border-stone-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}>
        <button onClick={onClose} className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-gray-800 flex items-center justify-center">✕</button>
        <h2 className="font-display font-bold flex-1 dark:text-gray-100">{t("beds_compare")}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollable space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: lang === "cs" ? "Záhon A" : "Bed A", value: leftId,  set: setLeftId },
            { label: lang === "cs" ? "Záhon B" : "Bed B", value: rightId, set: setRightId },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-xs font-semibold text-stone-400 mb-1">{s.label}</p>
              <select value={s.value} onChange={e => s.set(e.target.value)} className="input-field text-sm py-2">
                {beds.map(b => <option key={b.id} value={b.id}>{b.name} ({b.year})</option>)}
              </select>
            </div>
          ))}
        </div>
        {left && right && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {[left, right].map((bed, i) => (
                <div key={i} className="card">
                  <p className="font-bold text-sm mb-0.5 dark:text-gray-100">{bed.name}</p>
                  <p className="text-xs text-stone-400 mb-2">{bed.year} · {bed.cols}×{bed.rows}</p>
                  <MiniGrid bed={bed} />
                </div>
              ))}
            </div>
            <div className="card">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
                {lang === "cs" ? "Rozdíl rostlin" : lang === "en" ? "Plant differences" : lang === "de" ? "Pflanzenunterschiede" : "Różnice roślin"}
              </p>
              {(() => {
                const lIds = new Set(left.cells.filter(c => c.plant_id).map(c => c.plant_id!));
                const rIds = new Set(right.cells.filter(c => c.plant_id).map(c => c.plant_id!));
                const both   = [...lIds].filter(id => rIds.has(id));
                const onlyL  = [...lIds].filter(id => !rIds.has(id));
                const onlyR  = [...rIds].filter(id => !lIds.has(id));
                const pName  = (id: string) => {
                  const p = PLANT_CATALOG.find(x => x.id === id);
                  return p ? `${p.emoji} ${p.names[lang] ?? p.names["cs"]}` : id;
                };
                return (
                  <div className="space-y-2 text-sm">
                    {both.length > 0  && <p><span className="text-forest-600 font-semibold">✓ {lang==="cs"?"Společné":"Common"}:</span> {both.map(pName).join(" · ")}</p>}
                    {onlyL.length > 0 && <p><span className="text-blue-600 font-semibold">← {lang==="cs"?"Jen v A":"Only in A"}:</span> {onlyL.map(pName).join(" · ")}</p>}
                    {onlyR.length > 0 && <p><span className="text-amber-600 font-semibold">→ {lang==="cs"?"Jen v B":"Only in B"}:</span> {onlyR.map(pName).join(" · ")}</p>}
                    {both.length === 0 && onlyL.length === 0 && onlyR.length === 0 && (
                      <p className="text-stone-400 text-xs">{lang==="cs"?"Oba záhony jsou prázdné.":"Both beds are empty."}</p>
                    )}
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Hlavní stránka záhonů ────────────────────────────────────────────────────
export default function BedsPage() {
  const router = useRouter();
  const { t } = useLang();
  const [beds, setBeds] = useState<GardenBed[]>([]);
  const [userPlants, setUserPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editBed, setEditBed] = useState<GardenBed | null>(null);
  const [isNewBed, setIsNewBed] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNote, setNewNote] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const [{ data: bedData }, { data: plantData }] = await Promise.all([
      supabase.from("garden_beds").select("*").eq("user_id", user.id)
        .order("year", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("plants").select("*").eq("user_id", user.id),
    ]);
    const parsed: GardenBed[] = (bedData ?? []).map((b) => ({
      id: b.id as string,
      user_id: b.user_id as string,
      name: b.name as string,
      note: (b.note as string) ?? "",
      year: b.year as number,
      cols: b.cols as number,
      rows: b.rows as number,
      created_at: b.created_at as string,
      cells: parseCells(b.cells),
    }));
    setBeds(parsed);
    setUserPlants(plantData ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const newBed: GardenBed = {
      id: crypto.randomUUID(),
      user_id: user.id,
      name: newName.trim(),
      note: newNote.trim(),
      year: new Date().getFullYear(),
      cols: 5, rows: 3,
      cells: [],
      created_at: new Date().toISOString(),
    };
    setNewName(""); setNewNote(""); setShowNewForm(false);
    setIsNewBed(true);
    setEditBed(newBed); // Editor se otevře a při Save provede INSERT
  };

  const handleSaveBed = (updated: GardenBed) => {
    setBeds(prev => {
      const exists = prev.find(b => b.id === updated.id);
      if (exists) return prev.map(b => b.id === updated.id ? updated : b);
      return [updated, ...prev];
    });
    setIsNewBed(false);
    // Nezavíráme editor – uživatel může dál upravovat
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("garden_beds").delete().eq("id", id);
    if (!error) setBeds(prev => prev.filter(b => b.id !== id));
    setDeleteConfirm(null);
  };

  const byYear = useMemo(() => {
    const map = new Map<number, GardenBed[]>();
    for (const b of beds) {
      if (!map.has(b.year)) map.set(b.year, []);
      map.get(b.year)!.push(b);
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [beds]);

  if (editBed) {
    return (
      <BedEditor
        bed={editBed}
        userPlants={userPlants}
        onSave={handleSaveBed}
        onClose={() => { setEditBed(null); setIsNewBed(false); }}
        isNew={isNewBed}
      />
    );
  }
  if (showCompare) return <CompareView beds={beds} onClose={() => setShowCompare(false)} />;

  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-gray-950">
      <main className="flex-1 scrollable pb-24 safe-top">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-bark-900 dark:text-gray-100">{t("beds_title")}</h1>
            {beds.length >= 2 && (
              <button onClick={() => setShowCompare(true)}
                className="text-xs text-forest-600 dark:text-forest-300 bg-forest-50 dark:bg-forest-950 border border-forest-100 dark:border-forest-900 px-3 py-1.5 rounded-xl hover:bg-forest-100 transition-colors">
                ⚖️ {t("beds_compare")}
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-stone-300 animate-pulse-soft text-4xl">🌱</div>
          ) : (<>
            {showNewForm ? (
              <div className="card border-2 border-forest-200 dark:border-forest-800 space-y-3">
                <h3 className="font-semibold dark:text-gray-100">{t("beds_add")}</h3>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder={t("beds_name")} className="input-field" autoFocus
                  onKeyDown={e => e.key === "Enter" && handleCreate()} />
                <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)}
                  placeholder={t("beds_note")} className="input-field" />
                <div className="flex gap-2">
                  <button onClick={() => setShowNewForm(false)} className="btn-secondary flex-1 py-2.5 text-sm">✕</button>
                  <button onClick={handleCreate} disabled={!newName.trim()} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">
                    {t("beds_create")}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowNewForm(true)} className="w-full btn-secondary border-dashed">
                <span className="text-lg">+</span> {t("beds_add")}
              </button>
            )}

            {byYear.length === 0 ? (
              <div className="text-center py-14">
                <div className="text-5xl mb-3">🪴</div>
                <p className="text-stone-400 dark:text-gray-500 text-sm">{t("beds_empty")}</p>
              </div>
            ) : (
              byYear.map(([year, yearBeds]) => (
                <div key={year}>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="font-display font-bold text-lg text-bark-900 dark:text-gray-100">
                      {t("beds_title")} {year}
                    </h2>
                    <span className="text-xs text-stone-400 bg-stone-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                      {yearBeds.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {yearBeds.map(bed => (
                      <BedCard key={bed.id} bed={bed}
                        onEdit={() => { setIsNewBed(false); setEditBed(bed); }}
                        onDelete={() => setDeleteConfirm(bed.id)} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </>)}
        </div>
      </main>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-xs w-full shadow-xl">
            <p className="text-center font-semibold mb-1 dark:text-gray-100">{t("beds_delete_confirm")}</p>
            <p className="text-center text-xs text-stone-400 mb-5">{t("beds_delete_warn")}</p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1 py-2.5 text-sm" onClick={() => setDeleteConfirm(null)}>{t("cancel")}</button>
              <button className="flex-1 py-2.5 rounded-2xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
                onClick={() => handleDelete(deleteConfirm)}>{t("beds_delete")}</button>
            </div>
          </div>
        </div>
      )}
      <Navigation />
    </div>
  );
}
