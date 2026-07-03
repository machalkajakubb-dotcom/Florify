"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { Navigation } from "@/components/Navigation";
import { useLang } from "@/hooks/useLang";

// ── Typy ─────────────────────────────────────────────────────────────────────

type PlantType = "radish" | "carrot" | "tomato";

interface SlotData {
  slot_id: number;
  plant_type: PlantType;
  level: number;
  planted_at: string;      // ISO timestamp
  grow_seconds: number;    // doba do dozrání v sekundách
}

interface GameState {
  currency: number;
  unlocked_slots: number;
  slots_data: SlotData[];
  last_active_at: string;
}

// ── Konfigurace rostlin ───────────────────────────────────────────────────────

const PLANTS: Record<PlantType, {
  emoji: string;
  name_cs: string; name_en: string; name_de: string; name_pl: string;
  seed_cost: number;
  grow_seconds: number;
  income_per_sec: number;
  harvest: number;
}> = {
  radish:  { emoji:"🧅", name_cs:"Ředkvička", name_en:"Radish",  name_de:"Radieschen", name_pl:"Rzodkiewka",
              seed_cost:10,   grow_seconds:10,   income_per_sec:1,  harvest:25 },
  carrot:  { emoji:"🥕", name_cs:"Mrkev",     name_en:"Carrot",  name_de:"Karotte",    name_pl:"Marchew",
              seed_cost:150,  grow_seconds:120,  income_per_sec:8,  harvest:400 },
  tomato:  { emoji:"🍅", name_cs:"Rajče",     name_en:"Tomato",  name_de:"Tomate",     name_pl:"Pomidor",
              seed_cost:1200, grow_seconds:900,  income_per_sec:50, harvest:3500 },
};

const TOTAL_SLOTS = 9;
const SAVE_INTERVAL_MS = 30_000;

// cena odemčení slotu: 100 * 10^(index-2) počínaje slotem 4 (index 3)
function unlockCost(unlockedCount: number): number {
  return 100 * Math.pow(10, unlockedCount - 2);
}

// Bonus za level: +15 % za každý level nad 1
function levelMultiplier(level: number): number {
  return Math.pow(1.15, level - 1);
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return Math.floor(n).toString();
}

function formatTime(sec: number): string {
  if (sec <= 0) return "0s";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ── Hlavní komponenta ─────────────────────────────────────────────────────────

export default function GamePage() {
  const router = useRouter();
  const { lang } = useLang();

  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved">("");
  const [offlineBonus, setOfflineBonus] = useState<number | null>(null);
  const [tick, setTick] = useState(0);           // sekundový tick pro UI
  const [plantModal, setPlantModal] = useState<number | null>(null); // slot_id
  const [shopOpen, setShopOpen] = useState(false);
  const [upgradeSlot, setUpgradeSlot] = useState<number | null>(null);

  const gameRef = useRef<GameState | null>(null);
  gameRef.current = game;

  const userIdRef = useRef<string | null>(null);

  // ── Překlady ────────────────────────────────────────────────────────────────
  const T = {
    cs: {
      title:"FloriGarden Idle", currency:"Svěžest", perSec:"/s",
      plant:"Zasadit", harvest:"Sklidit!", locked:"Odemknout",
      shop:"Obchod", upgrade:"Vylepšit", level:"Úr.",
      offlineTitle:"Vítej zpět!", offlineMsg:"Tvoji pomocníci vyprodukovali",
      offlineUnit:"🍃 Svěžesti, zatímco jsi byl pryč!",
      ok:"Super!", saving:"Ukládám...", saved:"Uloženo ✓",
      seedModal:"Vyber semínko", cost:"Cena",
      grow:"Dozrání", income:"Příjem", harvestVal:"Sklizeň",
      upgradeTitle:"Vylepšit rostlinu", upgradeLevel:"Cena vylepšení",
      unlockCost:"Odemknout za", close:"Zavřít",
      newBedBonus:"+1 000 🍃 za nový záhon!",
      back:"← Zpět",
    },
    en: {
      title:"FloriGarden Idle", currency:"Freshness", perSec:"/s",
      plant:"Plant", harvest:"Harvest!", locked:"Unlock",
      shop:"Shop", upgrade:"Upgrade", level:"Lv.",
      offlineTitle:"Welcome back!", offlineMsg:"Your helpers produced",
      offlineUnit:"🍃 Freshness while you were away!",
      ok:"Great!", saving:"Saving...", saved:"Saved ✓",
      seedModal:"Choose a seed", cost:"Cost",
      grow:"Grows in", income:"Income", harvestVal:"Harvest",
      upgradeTitle:"Upgrade plant", upgradeLevel:"Upgrade cost",
      unlockCost:"Unlock for", close:"Close",
      newBedBonus:"+1 000 🍃 for new bed!",
      back:"← Back",
    },
    de: {
      title:"FloriGarden Idle", currency:"Frische", perSec:"/s",
      plant:"Pflanzen", harvest:"Ernten!", locked:"Freischalten",
      shop:"Shop", upgrade:"Verbessern", level:"Lv.",
      offlineTitle:"Willkommen zurück!", offlineMsg:"Deine Helfer haben produziert",
      offlineUnit:"🍃 Frische, während du weg warst!",
      ok:"Super!", saving:"Speichern...", saved:"Gespeichert ✓",
      seedModal:"Samen wählen", cost:"Preis",
      grow:"Reife in", income:"Ertrag", harvestVal:"Ernte",
      upgradeTitle:"Pflanze verbessern", upgradeLevel:"Verbesserungskosten",
      unlockCost:"Freischalten für", close:"Schließen",
      newBedBonus:"+1 000 🍃 für neues Beet!",
      back:"← Zurück",
    },
    pl: {
      title:"FloriGarden Idle", currency:"Świeżość", perSec:"/s",
      plant:"Sadź", harvest:"Zbierz!", locked:"Odblokuj",
      shop:"Sklep", upgrade:"Ulepsz", level:"Poz.",
      offlineTitle:"Witaj z powrotem!", offlineMsg:"Twoi pomocnicy wyprodukowali",
      offlineUnit:"🍃 Świeżości, gdy cię nie było!",
      ok:"Super!", saving:"Zapisuję...", saved:"Zapisano ✓",
      seedModal:"Wybierz nasionko", cost:"Cena",
      grow:"Dojrzeje za", income:"Przychód", harvestVal:"Zbiór",
      upgradeTitle:"Ulepsz roślinę", upgradeLevel:"Koszt ulepszenia",
      unlockCost:"Odblokuj za", close:"Zamknij",
      newBedBonus:"+1 000 🍃 za nową grządkę!",
      back:"← Wróć",
    },
  };
  const t = T[lang as keyof typeof T] ?? T["en"];

  function plantName(type: PlantType): string {
    const p = PLANTS[type];
    const k = `name_${lang}` as keyof typeof p;
    return (p[k] as string) ?? p.name_en;
  }

  // ── Celkový pasivní příjem za sekundu ────────────────────────────────────────
  function totalIncomePerSec(g: GameState): number {
    return g.slots_data.reduce((acc, slot) => {
      const now = Date.now();
      const plantedAt = new Date(slot.planted_at).getTime();
      const matureAt = plantedAt + slot.grow_seconds * 1000;
      if (now < matureAt) return acc; // ještě nezdozrálo
      const p = PLANTS[slot.plant_type];
      return acc + p.income_per_sec * levelMultiplier(slot.level);
    }, 0);
  }

  // ── Načtení hry ze Supabase ───────────────────────────────────────────────
  const loadGame = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    userIdRef.current = user.id;

    const { data } = await supabase
      .from("idle_game")
      .select("*")
      .eq("user_id", user.id)
      .single();

    let state: GameState;

    if (data) {
      // Offline bonus
      const lastActive = new Date(data.last_active_at).getTime();
      const secOffline = Math.max(0, (Date.now() - lastActive) / 1000);
      const slots: SlotData[] = data.slots_data ?? [];
      const tempGame: GameState = { ...data, slots_data: slots };
      const income = totalIncomePerSec(tempGame);
      const bonus = Math.floor(income * secOffline);

      state = {
        currency: data.currency + bonus,
        unlocked_slots: data.unlocked_slots,
        slots_data: slots,
        last_active_at: new Date().toISOString(),
      };
      if (bonus > 0) setOfflineBonus(bonus);
    } else {
      // První spuštění
      state = { currency: 0, unlocked_slots: 3, slots_data: [], last_active_at: new Date().toISOString() };
      await supabase.from("idle_game").insert({ user_id: user.id, ...state });
    }

    setGame(state);
    setLoading(false);
  }, [router]);

  useEffect(() => { loadGame(); }, [loadGame]);

  // ── Pasivní příjem – sekundový tick ──────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setGame(prev => {
        if (!prev) return prev;
        const income = totalIncomePerSec(prev);
        return income > 0 ? { ...prev, currency: prev.currency + income } : prev;
      });
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Autosave každých 30 s ────────────────────────────────────────────────
  const saveGame = useCallback(async (g: GameState) => {
    if (!userIdRef.current) return;
    setSaveStatus("saving");
    await supabase.from("idle_game").update({
      currency: Math.floor(g.currency),
      unlocked_slots: g.unlocked_slots,
      slots_data: g.slots_data,
      last_active_at: new Date().toISOString(),
    }).eq("user_id", userIdRef.current);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus(""), 2000);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameRef.current) saveGame(gameRef.current);
    }, SAVE_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      if (gameRef.current) saveGame(gameRef.current);
    };
  }, [saveGame]);

  // ── Akce ─────────────────────────────────────────────────────────────────

  const plant = (slotId: number, type: PlantType) => {
    const p = PLANTS[type];
    setGame(prev => {
      if (!prev || prev.currency < p.seed_cost) return prev;
      const newSlot: SlotData = {
        slot_id: slotId,
        plant_type: type,
        level: 1,
        planted_at: new Date().toISOString(),
        grow_seconds: p.grow_seconds,
      };
      return {
        ...prev,
        currency: prev.currency - p.seed_cost,
        slots_data: [...prev.slots_data.filter(s => s.slot_id !== slotId), newSlot],
      };
    });
    setPlantModal(null);
  };

  const harvest = (slot: SlotData) => {
    const p = PLANTS[slot.plant_type];
    const val = Math.floor(p.harvest * levelMultiplier(slot.level));
    setGame(prev => {
      if (!prev) return prev;
      // Po sklizni automaticky zasadí znovu
      const newSlot: SlotData = {
        ...slot,
        planted_at: new Date().toISOString(),
        grow_seconds: p.grow_seconds,
      };
      return {
        ...prev,
        currency: prev.currency + val,
        slots_data: [...prev.slots_data.filter(s => s.slot_id !== slot.slot_id), newSlot],
      };
    });
  };

  const upgradeSlotAction = (slot: SlotData) => {
    const cost = Math.floor(PLANTS[slot.plant_type].seed_cost * 5 * Math.pow(1.5, slot.level));
    setGame(prev => {
      if (!prev || prev.currency < cost) return prev;
      return {
        ...prev,
        currency: prev.currency - cost,
        slots_data: prev.slots_data.map(s =>
          s.slot_id === slot.slot_id ? { ...s, level: s.level + 1 } : s
        ),
      };
    });
    setUpgradeSlot(null);
  };

  const unlockSlot = () => {
    setGame(prev => {
      if (!prev) return prev;
      const cost = unlockCost(prev.unlocked_slots);
      if (prev.currency < cost) return prev;
      return { ...prev, currency: prev.currency - cost, unlocked_slots: prev.unlocked_slots + 1 };
    });
    // Uložíme hned po velké transakci
    if (gameRef.current) saveGame(gameRef.current);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading || !game) return (
    <div className="h-screen flex items-center justify-center bg-stone-50 dark:bg-gray-950">
      <div className="text-5xl animate-bounce">🌱</div>
    </div>
  );

  const income = totalIncomePerSec(game);

  return (
    <div className="flex flex-col bg-stone-50 dark:bg-gray-950"
      style={{ minHeight: "100dvh" }}>

      {/* ── Hlavička ───────────────────────────────────────────────────── */}
      <header className="bg-forest-700 dark:bg-forest-900 text-white px-4 flex items-center justify-between flex-shrink-0"
        style={{ paddingTop: "max(env(safe-area-inset-top), 12px)", paddingBottom: "14px" }}>
        <button onClick={() => router.back()} className="text-forest-200 text-sm mr-3">{t.back}</button>
        <div className="text-center flex-1">
          <p className="font-display font-bold text-base leading-tight">{t.title}</p>
          <p className="text-xs text-forest-200 opacity-80">🌱 Florify</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold animate-pulse-soft">
            {formatNum(game.currency)} 🍃
          </div>
          <div className="text-[11px] text-forest-300">+{formatNum(income)}{t.perSec}</div>
        </div>
      </header>

      {/* Indikátor uložení */}
      {saveStatus && (
        <div className="text-center text-[11px] py-1 bg-forest-100 dark:bg-forest-950 text-forest-600 dark:text-forest-400">
          {saveStatus === "saving" ? t.saving : t.saved}
        </div>
      )}

      {/* ── Obsah ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 90px)", WebkitOverflowScrolling: "touch" }}>

        {/* Mřížka 3×3 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
            const slotId = i + 1;
            const locked = slotId > game.unlocked_slots;
            const slot = game.slots_data.find(s => s.slot_id === slotId);

            if (locked) {
              const cost = unlockCost(game.unlocked_slots);
              const canAfford = game.currency >= cost && slotId === game.unlocked_slots + 1;
              return (
                <button key={slotId} onClick={canAfford ? unlockSlot : undefined}
                  className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all ${
                    canAfford
                      ? "border-amber-400 bg-amber-50 dark:bg-amber-950 hover:scale-105 active:scale-95"
                      : "border-stone-200 dark:border-gray-700 bg-stone-100 dark:bg-gray-800 opacity-50"
                  }`}>
                  <span className="text-2xl">🔒</span>
                  {canAfford && (
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold text-center leading-tight">
                      {t.unlockCost}<br />{formatNum(cost)} 🍃
                    </span>
                  )}
                </button>
              );
            }

            if (!slot) {
              return (
                <button key={slotId} onClick={() => setPlantModal(slotId)}
                  className="aspect-square rounded-2xl border-2 border-dashed border-forest-200 dark:border-forest-800 bg-forest-50 dark:bg-forest-950 flex flex-col items-center justify-center gap-1 hover:scale-105 active:scale-95 transition-all">
                  <span className="text-3xl">➕</span>
                  <span className="text-[11px] text-forest-500 font-medium">{t.plant}</span>
                </button>
              );
            }

            // Osázené políčko
            const p = PLANTS[slot.plant_type];
            const plantedAt = new Date(slot.planted_at).getTime();
            const maturesAt = plantedAt + slot.grow_seconds * 1000;
            const now = Date.now();
            const remaining = Math.max(0, (maturesAt - now) / 1000);
            const progress = Math.min(1, (now - plantedAt) / (slot.grow_seconds * 1000));
            const mature = remaining === 0;

            return (
              <button key={slotId}
                onClick={() => mature ? harvest(slot) : setUpgradeSlot(slotId)}
                className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 p-2 transition-all ${
                  mature
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-950 animate-pulse-soft"
                    : "border-forest-200 dark:border-forest-800 bg-white dark:bg-gray-900"
                }`}>
                <span className="text-3xl leading-none">{p.emoji}</span>
                <span className="text-[10px] font-bold text-forest-600 dark:text-forest-400">
                  {t.level} {slot.level}
                </span>
                {mature ? (
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{t.harvest}</span>
                ) : (
                  <>
                    {/* Progress bar */}
                    <div className="w-full bg-stone-100 dark:bg-gray-800 rounded-full h-1.5">
                      <div className="bg-forest-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${progress * 100}%` }} />
                    </div>
                    <span className="text-[9px] text-stone-400">{formatTime(remaining)}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Tlačítko Obchod */}
        <button onClick={() => setShopOpen(true)}
          className="w-full py-3 rounded-2xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm shadow-md shadow-forest-200 dark:shadow-forest-900 flex items-center justify-center gap-2">
          🛒 {t.shop}
        </button>
      </div>

      {/* ── Offline bonus modal ─────────────────────────────────────────── */}
      {offlineBonus !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="font-display font-bold text-lg mb-2 dark:text-gray-100">{t.offlineTitle}</h2>
            <p className="text-sm text-stone-500 dark:text-gray-400 mb-4">
              {t.offlineMsg} <span className="font-bold text-forest-600 dark:text-forest-400">{formatNum(offlineBonus)}</span> {t.offlineUnit}
            </p>
            <button onClick={() => setOfflineBonus(null)}
              className="btn-primary w-full">{t.ok}</button>
          </div>
        </div>
      )}

      {/* ── Modal výběr semínka ─────────────────────────────────────────── */}
      {plantModal !== null && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPlantModal(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl px-4 pt-4"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 80px)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg dark:text-gray-100">{t.seedModal}</h3>
              <button onClick={() => setPlantModal(null)} className="text-stone-400 text-xl">✕</button>
            </div>
            <div className="space-y-2 pb-2">
              {(Object.entries(PLANTS) as [PlantType, typeof PLANTS[PlantType]][]).map(([type, p]) => {
                const canAfford = game.currency >= p.seed_cost;
                return (
                  <button key={type} onClick={() => canAfford && plant(plantModal, type)} disabled={!canAfford}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      canAfford
                        ? "border-forest-200 dark:border-forest-800 bg-forest-50 dark:bg-forest-950 hover:bg-forest-100 active:scale-95"
                        : "border-stone-100 dark:border-gray-800 bg-stone-50 dark:bg-gray-800 opacity-50"
                    }`}>
                    <span className="text-3xl">{p.emoji}</span>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm dark:text-gray-100">{plantName(type)}</p>
                      <p className="text-[11px] text-stone-400 dark:text-gray-500">
                        {t.cost}: {formatNum(p.seed_cost)} 🍃 · {t.income}: +{p.income_per_sec}/s
                      </p>
                    </div>
                    <div className="text-right text-xs text-forest-600 dark:text-forest-400 font-medium">
                      {formatTime(p.grow_seconds)}<br/>
                      <span className="text-amber-600">+{formatNum(p.harvest)} 🍃</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Upgrade modal ──────────────────────────────────────────────── */}
      {upgradeSlot !== null && (() => {
        const slot = game.slots_data.find(s => s.slot_id === upgradeSlot);
        if (!slot) { setUpgradeSlot(null); return null; }
        const p = PLANTS[slot.plant_type];
        const cost = Math.floor(p.seed_cost * 5 * Math.pow(1.5, slot.level));
        const canAfford = game.currency >= cost;
        const newIncome = p.income_per_sec * levelMultiplier(slot.level + 1);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setUpgradeSlot(null)} />
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-5 max-w-xs w-full shadow-2xl text-center">
              <span className="text-5xl">{p.emoji}</span>
              <h3 className="font-display font-bold text-lg mt-2 dark:text-gray-100">{t.upgradeTitle}</h3>
              <p className="text-sm text-stone-400 dark:text-gray-500 mt-1">
                {t.level} {slot.level} → {slot.level + 1}
              </p>
              <p className="text-xs text-forest-600 dark:text-forest-400 mt-2">
                {t.income}: +{newIncome.toFixed(1)}/s · {t.harvestVal}: +{formatNum(p.harvest * levelMultiplier(slot.level + 1))} 🍃
              </p>
              <p className={`text-sm font-bold mt-3 ${canAfford ? "text-amber-600" : "text-red-400"}`}>
                {t.upgradeLevel}: {formatNum(cost)} 🍃
              </p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setUpgradeSlot(null)} className="btn-secondary flex-1 py-2 text-sm">{t.close}</button>
                <button onClick={() => upgradeSlotAction(slot)} disabled={!canAfford}
                  className="btn-primary flex-1 py-2 text-sm disabled:opacity-40">{t.upgrade}</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Shop modal ─────────────────────────────────────────────────── */}
      {shopOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShopOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl px-4 pt-4"
            style={{ maxHeight: "80vh", paddingBottom: "calc(env(safe-area-inset-bottom) + 80px)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg dark:text-gray-100">🛒 {t.shop}</h3>
              <button onClick={() => setShopOpen(false)} className="text-stone-400 text-xl">✕</button>
            </div>
            <div className="overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
              {/* Přehled rostlin */}
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Semínka & přehled</p>
              {(Object.entries(PLANTS) as [PlantType, typeof PLANTS[PlantType]][]).map(([type, p]) => (
                <div key={type} className="flex items-center gap-3 bg-stone-50 dark:bg-gray-800 rounded-2xl p-3 mb-2">
                  <span className="text-3xl">{p.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm dark:text-gray-100">{plantName(type)}</p>
                    <p className="text-[11px] text-stone-400 dark:text-gray-500">
                      Semínko: {formatNum(p.seed_cost)} 🍃 · Příjem: +{p.income_per_sec}/s
                    </p>
                    <p className="text-[11px] text-stone-400 dark:text-gray-500">
                      Dozrání: {formatTime(p.grow_seconds)} · Sklizeň: {formatNum(p.harvest)} 🍃
                    </p>
                  </div>
                </div>
              ))}
              {/* Odemčení slotů */}
              {game.unlocked_slots < TOTAL_SLOTS && (
                <>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mt-4 mb-3">Rozšíření</p>
                  <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-3">
                    <div>
                      <p className="font-semibold text-sm dark:text-gray-100">🔓 Odemknout políčko č.{game.unlocked_slots + 1}</p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400">{formatNum(unlockCost(game.unlocked_slots))} 🍃</p>
                    </div>
                    <button onClick={() => { unlockSlot(); setShopOpen(false); }}
                      disabled={game.currency < unlockCost(game.unlocked_slots)}
                      className="btn-primary text-xs px-3 py-2 disabled:opacity-40">
                      {t.locked}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  );
}
