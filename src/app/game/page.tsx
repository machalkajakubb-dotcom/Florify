"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { Navigation } from "@/components/Navigation";
import { useLang } from "@/hooks/useLang";

// ── Typy ─────────────────────────────────────────────────────────────────────

type PlantType = "radish" | "carrot" | "tomato" | "sunflower";
type SlotState = "empty" | "growing" | "ready" | "weed" | "snail" | "adela";

interface SlotData {
  slot_id: number;
  plant_type: PlantType | "adela" | "weed" | "snail";
  level: number;
  planted_at: string;
  grow_seconds: number;
  state: SlotState;
}

interface ShopItems {
  mole: boolean;          // Krtek – prodloužení offline na 8h
  adela_slot: number | null; // v jakém slotu sedí Adéla (-1 = nekoupena)
  pest_repellent_until: string | null; // timestamp dokdy platí odpuzovač
  last_wheel_spin: string | null; // timestamp posledního točení
  boost_income_until: string | null; // timestamp dokdy platí 2x příjem (Zlaté semínko)
}

interface GameState {
  currency: number;
  unlocked_slots: number;
  slots_data: SlotData[];
  last_active_at: string;
  shop: ShopItems;
  tutorial_done: boolean;
}

// ── Konfigurace rostlin ───────────────────────────────────────────────────────

const PLANTS: Record<PlantType, {
  emoji: string;
  names: Record<string, string>;
  seed_cost: number;
  grow_seconds: number;
  income_per_sec: number;
  harvest: number;
}> = {
  radish:    { emoji:"🧅", names:{cs:"Ředkvička",en:"Radish",   de:"Radieschen",  pl:"Rzodkiewka"},
               seed_cost:10,    grow_seconds:10,   income_per_sec:1,   harvest:25 },
  carrot:    { emoji:"🥕", names:{cs:"Mrkev",    en:"Carrot",   de:"Karotte",     pl:"Marchew"},
               seed_cost:150,   grow_seconds:120,  income_per_sec:8,   harvest:400 },
  tomato:    { emoji:"🍅", names:{cs:"Rajče",    en:"Tomato",   de:"Tomate",      pl:"Pomidor"},
               seed_cost:1200,  grow_seconds:900,  income_per_sec:50,  harvest:3500 },
  sunflower: { emoji:"🌻", names:{cs:"Slunečnice",en:"Sunflower",de:"Sonnenblume",pl:"Słonecznik"},
               seed_cost:8000,  grow_seconds:3600, income_per_sec:250, harvest:20000 },
};

const TOTAL_SLOTS = 9;
const SAVE_INTERVAL_MS = 30_000;
const OFFLINE_CAP_BASE = 2 * 3600;     // 2h bez krtka
const OFFLINE_CAP_MOLE = 8 * 3600;    // 8h s krtkem
const WEED_CHANCE = 0.15;              // 15% šance při každém dozrání
const WEED_COST = 50;                  // cena odstranění plevele
const SNAIL_COST = 120;

const WHEEL_PRIZES = [
  { id:"currency_small", label:{cs:"500 🍃",        en:"500 🍃",        de:"500 🍃",        pl:"500 🍃"},        weight:30 },
  { id:"currency_big",   label:{cs:"5 000 🍃",      en:"5 000 🍃",      de:"5 000 🍃",      pl:"5 000 🍃"},      weight:10 },
  { id:"currency_jack",  label:{cs:"💰 Jackpot!",   en:"💰 Jackpot!",   de:"💰 Jackpot!",   pl:"💰 Jackpot!"},   weight:2 },
  { id:"fertilizer",     label:{cs:"⚡ Super-hnojivo",en:"⚡ Fertilizer",de:"⚡ Superdünger",pl:"⚡ Super-nawóz"},weight:15 },
  { id:"repellent",      label:{cs:"🔕 Odpuzovač",  en:"🔕 Repellent",  de:"🔕 Abwehrmittel",pl:"🔕 Odpędzacz"}, weight:20 },
  { id:"golden_seed",    label:{cs:"🧬 Zlaté semínko",en:"🧬 Golden seed",de:"🧬 Goldener Samen",pl:"🧬 Złote nasionko"},weight:5 },
  { id:"nothing",        label:{cs:"😅 Nic tentokrát",en:"😅 Nothing",   de:"😅 Nichts",     pl:"😅 Nic tym razem"},weight:18 },
];

function spinWheel(): typeof WHEEL_PRIZES[0] {
  const total = WHEEL_PRIZES.reduce((a, p) => a + p.weight, 0);
  let r = Math.random() * total;
  for (const prize of WHEEL_PRIZES) { r -= prize.weight; if (r <= 0) return prize; }
  return WHEEL_PRIZES[0];
}

function unlockCost(n: number): number { return 100 * Math.pow(10, n - 2); }
function levelMult(l: number): number { return Math.pow(1.15, l - 1); }
function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return Math.floor(n).toString();
}
function formatTime(s: number): string {
  if (s <= 0) return "0s";
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

const DEFAULT_SHOP: ShopItems = { mole: false, adela_slot: null, pest_repellent_until: null, last_wheel_spin: null, boost_income_until: null };
const BOOST_DURATION_SEC = 30 * 60; // Zlaté semínko: 30 minut 2x příjmu
const DEFAULT_STATE: Omit<GameState, "last_active_at"> = {
  currency: 1000, unlocked_slots: 3, slots_data: [], shop: DEFAULT_SHOP, tutorial_done: false,
};

// ── Překlady ─────────────────────────────────────────────────────────────────

const TRANSLATIONS = {
  en: {
    back:"← Back", title:"FloraPlay", perSec:"/s",
    plant:"Plant", harvest:"Harvest!", locked:"Unlock", shop:"Shop",
    upgrade:"Upgrade", level:"Lv.", offlineTitle:"Welcome back!",
    offlineMsg:"Your helpers produced", offlineUnit:"🍃 Freshness while you were away!",
    ok:"Great!", saving:"Saving...", saved:"Saved ✓",
    seedModal:"Choose a seed", close:"Close", cost:"Cost",
    grow:"Grows in", income:"Income", harvestVal:"Harvest",
    upgradeTitle:"Upgrade plant", upgradeCost:"Upgrade cost",
    unlockFor:"Unlock for", weedTitle:"🌿 Weed appeared!",
    weedMsg:"A weed is blocking slot", weedRemove:"Remove for",
    snailTitle:"🐌 Snail attack!", snailRemove:"Chase away for",
    adelaAte:"🌺 Adéla devoured the pest!",
    shopTitle:"Shop & Upgrades",
    shopSeeds:"Seeds", shopUpgrades:"Upgrades",
    moleTitle:"🦔 Mole Gardener", moleSub:"Extends offline earnings to 8h",
    adelaTitle:"🌺 Carnivorous Adéla", adelaSub:"Auto-removes weeds & snails + bonus points",
    wheelTitle:"🎡 Wheel of Fortune", wheelSub:"Spin once per day for free!",
    wheelSpin:"Spin!", wheelFree:"Free spin available!",
    wheelNext:"Next free spin in:", wheelBuy:"Buy spin for 300 🍃",
    wheelResult:"You won:", wheelClose:"Claim prize",
    repellentActive:"🔕 Pest repellent active for:", boostActive:"⚡ 2x income boost active for:",
    tutTitle:"Welcome to FloriGarden! 🌱",
    tut1:"🌿 Plant seeds in the 3×3 grid",
    tut2:"⏱ Wait for plants to grow, then harvest for Freshness 🍃",
    tut3:"💰 Buy more slots and upgrades in the Shop",
    tut4:"🌿 Watch out for weeds and snails – remove them quickly!",
    tut5:"⬆️ Upgrade your plants to boost production",
    tutStart:"Let's grow! 🌱",
    replaceTitle:"Replace plant?", replaceSub:"This will remove the current plant.",
    replaceBtn:"Replace", replaceCancel:"Keep",
  },
  cs: {
    back:"← Zpět", title:"FloraPlay", perSec:"/s",
    plant:"Zasadit", harvest:"Sklidit!", locked:"Odemknout", shop:"Obchod",
    upgrade:"Vylepšit", level:"Úr.", offlineTitle:"Vítej zpět!",
    offlineMsg:"Tvoji pomocníci vyprodukovali", offlineUnit:"🍃 Svěžesti, zatímco jsi byl pryč!",
    ok:"Super!", saving:"Ukládám...", saved:"Uloženo ✓",
    seedModal:"Vyber semínko", close:"Zavřít", cost:"Cena",
    grow:"Dozrání", income:"Příjem", harvestVal:"Sklizeň",
    upgradeTitle:"Vylepšit rostlinu", upgradeCost:"Cena vylepšení",
    unlockFor:"Odemknout za", weedTitle:"🌿 Objevil se plevel!",
    weedMsg:"Plevel blokuje políčko", weedRemove:"Odstranit za",
    snailTitle:"🐌 Útok šneka!", snailRemove:"Odehnat za",
    adelaAte:"🌺 Adéla sežrala škůdce!",
    shopTitle:"Obchod & Vylepšení",
    shopSeeds:"Semínka", shopUpgrades:"Vylepšení",
    moleTitle:"🦔 Krtek zahradník", moleSub:"Prodloužení offline příjmů na 8 hodin",
    adelaTitle:"🌺 Masožravá Adéla", adelaSub:"Automaticky požírá plevele a šneky + bonus body",
    wheelTitle:"🎡 Kolo štěstí", wheelSub:"Jednou za den zdarma!",
    wheelSpin:"Točit!", wheelFree:"Zdarma k dispozici!",
    wheelNext:"Další točení zdarma za:", wheelBuy:"Koupit točení za 300 🍃",
    wheelResult:"Vyhráváš:", wheelClose:"Převzít cenu",
    repellentActive:"🔕 Odpuzovač škůdců aktivní ještě:", boostActive:"⚡ 2x příjem aktivní ještě:",
    tutTitle:"Vítej ve FloriGarden! 🌱",
    tut1:"🌿 Zasaď semínka do mřížky 3×3",
    tut2:"⏱ Počkej až rostlina dozraje, pak sklidíš Svěžest 🍃",
    tut3:"💰 V Obchodě nakupuj nová políčka a vylepšení",
    tut4:"🌿 Dávej pozor na plevele a šneky – odstraň je rychle!",
    tut5:"⬆️ Vylepšuj rostliny pro vyšší produkci",
    tutStart:"Jdeme na to! 🌱",
    replaceTitle:"Vyměnit rostlinu?", replaceSub:"Nynější rostlina bude odstraněna.",
    replaceBtn:"Vyměnit", replaceCancel:"Ponechat",
  },
  de: {
    back:"← Zurück", title:"FloraPlay", perSec:"/s",
    plant:"Pflanzen", harvest:"Ernten!", locked:"Freischalten", shop:"Shop",
    upgrade:"Verbessern", level:"Lv.", offlineTitle:"Willkommen zurück!",
    offlineMsg:"Deine Helfer haben produziert", offlineUnit:"🍃 Frische, während du weg warst!",
    ok:"Super!", saving:"Speichern...", saved:"Gespeichert ✓",
    seedModal:"Samen wählen", close:"Schließen", cost:"Preis",
    grow:"Reife in", income:"Ertrag", harvestVal:"Ernte",
    upgradeTitle:"Pflanze verbessern", upgradeCost:"Verbesserungskosten",
    unlockFor:"Freischalten für", weedTitle:"🌿 Unkraut erschienen!",
    weedMsg:"Unkraut blockiert Feld", weedRemove:"Entfernen für",
    snailTitle:"🐌 Schneckenangriff!", snailRemove:"Verjagen für",
    adelaAte:"🌺 Adéla fraß den Schädling!",
    shopTitle:"Shop & Verbesserungen",
    shopSeeds:"Samen", shopUpgrades:"Verbesserungen",
    moleTitle:"🦔 Maulwurf-Gärtner", moleSub:"Verlängert Offline-Einnahmen auf 8 Stunden",
    adelaTitle:"🌺 Fleischfressende Adéla", adelaSub:"Entfernt automatisch Unkraut & Schnecken",
    wheelTitle:"🎡 Glücksrad", wheelSub:"Einmal täglich kostenlos drehen!",
    wheelSpin:"Drehen!", wheelFree:"Kostenlose Drehung verfügbar!",
    wheelNext:"Nächste kostenlose Drehung in:", wheelBuy:"Drehung kaufen für 300 🍃",
    wheelResult:"Du hast gewonnen:", wheelClose:"Preis einfordern",
    repellentActive:"🔕 Schädlingsabwehr aktiv noch:", boostActive:"⚡ 2x Einkommen aktiv noch:",
    tutTitle:"Willkommen bei FloriGarden! 🌱",
    tut1:"🌿 Pflanze Samen in das 3×3-Gitter",
    tut2:"⏱ Warte bis die Pflanze reift, dann ernten für Frische 🍃",
    tut3:"💰 Kaufe mehr Felder und Verbesserungen im Shop",
    tut4:"🌿 Achte auf Unkraut und Schnecken – entferne sie schnell!",
    tut5:"⬆️ Verbessere Pflanzen für höhere Produktion",
    tutStart:"Los geht's! 🌱",
    replaceTitle:"Pflanze ersetzen?", replaceSub:"Die aktuelle Pflanze wird entfernt.",
    replaceBtn:"Ersetzen", replaceCancel:"Behalten",
  },
  pl: {
    back:"← Wróć", title:"FloraPlay", perSec:"/s",
    plant:"Sadź", harvest:"Zbierz!", locked:"Odblokuj", shop:"Sklep",
    upgrade:"Ulepsz", level:"Poz.", offlineTitle:"Witaj z powrotem!",
    offlineMsg:"Twoi pomocnicy wyprodukowali", offlineUnit:"🍃 Świeżości, gdy cię nie było!",
    ok:"Super!", saving:"Zapisuję...", saved:"Zapisano ✓",
    seedModal:"Wybierz nasionko", close:"Zamknij", cost:"Cena",
    grow:"Dojrzeje za", income:"Przychód", harvestVal:"Zbiór",
    upgradeTitle:"Ulepsz roślinę", upgradeCost:"Koszt ulepszenia",
    unlockFor:"Odblokuj za", weedTitle:"🌿 Pojawił się chwast!",
    weedMsg:"Chwast blokuje pole", weedRemove:"Usuń za",
    snailTitle:"🐌 Atak ślimaka!", snailRemove:"Przegon za",
    adelaAte:"🌺 Adéla zjadła szkodnika!",
    shopTitle:"Sklep & Ulepszenia",
    shopSeeds:"Nasiona", shopUpgrades:"Ulepszenia",
    moleTitle:"🦔 Kret-Ogrodnik", moleSub:"Przedłuża zarobki offline do 8 godzin",
    adelaTitle:"🌺 Mięsożerna Adéla", adelaSub:"Automatycznie usuwa chwasty i ślimaki + bonus",
    wheelTitle:"🎡 Koło Fortuny", wheelSub:"Raz dziennie za darmo!",
    wheelSpin:"Kręć!", wheelFree:"Darmowe kręcenie dostępne!",
    wheelNext:"Następne darmowe kręcenie za:", wheelBuy:"Kup kręcenie za 300 🍃",
    wheelResult:"Wygrałeś:", wheelClose:"Odbierz nagrodę",
    repellentActive:"🔕 Odpędzacz szkodników aktywny jeszcze:", boostActive:"⚡ 2x dochód aktywny jeszcze:",
    tutTitle:"Witaj w FloriGarden! 🌱",
    tut1:"🌿 Sadź nasionka w siatce 3×3",
    tut2:"⏱ Czekaj aż roślina dojrzeje, potem zbieraj Świeżość 🍃",
    tut3:"💰 W Sklepie kupuj nowe pola i ulepszenia",
    tut4:"🌿 Uważaj na chwasty i ślimaki – usuń je szybko!",
    tut5:"⬆️ Ulepszaj rośliny dla wyższej produkcji",
    tutStart:"Do dzieła! 🌱",
    replaceTitle:"Zastąpić roślinę?", replaceSub:"Obecna roślina zostanie usunięta.",
    replaceBtn:"Zastąp", replaceCancel:"Zachowaj",
  },
};

// ── Hlavní komponenta ─────────────────────────────────────────────────────────
export default function GamePage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] ?? TRANSLATIONS["en"];

  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved">("");
  const [offlineBonus, setOfflineBonus] = useState<number | null>(null);
  const [plantModal, setPlantModal] = useState<number | null>(null);
  const [replaceConfirm, setReplaceConfirm] = useState<{slotId:number; newType:PlantType} | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState<"seeds"|"upgrades">("upgrades");
  const [upgradeSlot, setUpgradeSlot] = useState<number | null>(null);
  const [weedAlert, setWeedAlert] = useState<{slotId:number; isSnail:boolean} | null>(null);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelPrize, setWheelPrize] = useState<typeof WHEEL_PRIZES[0] | null>(null);
  const [adelaToast, setAdelaToast] = useState(false);
  const [fertilizeSlot, setFertilizeSlot] = useState<number | null>(null); // zlaté semínko
  const [tick, setTick] = useState(0);

  const gameRef = useRef<GameState | null>(null);
  gameRef.current = game;
  const userIdRef = useRef<string | null>(null);

  // ── Celkový pasivní příjem ────────────────────────────────────────────────
  function boostActive(g: GameState): boolean {
    return g.shop.boost_income_until ? new Date(g.shop.boost_income_until).getTime() > Date.now() : false;
  }

  function totalIncome(g: GameState): number {
    const mult = boostActive(g) ? 2 : 1;
    return g.slots_data.reduce((acc, slot) => {
      if (slot.state === "weed" || slot.state === "snail" || slot.state === "adela") return acc;
      const p = PLANTS[slot.plant_type as PlantType];
      if (!p) return acc;
      const plantedAt = new Date(slot.planted_at).getTime();
      const matureAt = plantedAt + slot.grow_seconds * 1000;
      if (Date.now() < matureAt) return acc;
      return acc + p.income_per_sec * levelMult(slot.level);
    }, 0) * mult;
  }

  // ── Adéla – pokud je v mřížce a objeví se škůdce, sežere ho ─────────────
  function adelaCheck(g: GameState, infectedSlotId: number): GameState {
    const hasAdela = g.shop.adela_slot !== null;
    if (!hasAdela) return g;
    const bonus = 200;
    setAdelaToast(true);
    setTimeout(() => setAdelaToast(false), 2500);
    const slots = g.slots_data.filter(s => s.slot_id !== infectedSlotId);
    return { ...g, currency: g.currency + bonus, slots_data: slots };
  }

  // ── Načtení hry ───────────────────────────────────────────────────────────
  const loadGame = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    userIdRef.current = user.id;

    const { data } = await supabase.from("idle_game").select("*").eq("user_id", user.id).single();

    let state: GameState;
    if (data) {
      const shopData: ShopItems = { ...DEFAULT_SHOP, ...(data.shop ?? {}) };
      const slots: SlotData[] = (data.slots_data ?? []).map((s: Partial<SlotData>) => ({
        ...s, state: s.state ?? "growing",
      }));
      const lastActive = new Date(data.last_active_at).getTime();
      const secOffline = Math.max(0, (Date.now() - lastActive) / 1000);
      const cap = shopData.mole ? OFFLINE_CAP_MOLE : OFFLINE_CAP_BASE;
      const cappedSec = Math.min(secOffline, cap);
      const tempGame: GameState = { ...data, slots_data: slots, shop: shopData, tutorial_done: data.tutorial_done ?? false, last_active_at: new Date().toISOString() };
      const income = totalIncome(tempGame);
      const bonus = Math.floor(income * cappedSec);
      state = { ...tempGame, currency: data.currency + bonus };
      if (bonus > 0) setOfflineBonus(bonus);
    } else {
      state = { ...DEFAULT_STATE, last_active_at: new Date().toISOString() };
      await supabase.from("idle_game").insert({ user_id: user.id, ...state, shop: DEFAULT_SHOP });
    }
    setGame(state);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => { loadGame(); }, [loadGame]);

  // ── Sekundový tick – příjem + plevel ─────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setGame(prev => {
        if (!prev) return prev;
        let updated = { ...prev, currency: prev.currency + totalIncome(prev) };

        // Kontrola dozrání a šance na plevel/šneka
        const repellentActive = prev.shop.pest_repellent_until
          ? new Date(prev.shop.pest_repellent_until).getTime() > Date.now()
          : false;

        updated.slots_data = updated.slots_data.map(slot => {
          if (slot.state !== "growing") return slot;
          const plantedAt = new Date(slot.planted_at).getTime();
          const matureAt = plantedAt + slot.grow_seconds * 1000;
          if (Date.now() < matureAt) return slot;
          // Dozrálo → šance na škůdce
          if (!repellentActive && Math.random() < WEED_CHANCE) {
            const isSnail = Math.random() < 0.4;
            const newState: SlotState = isSnail ? "snail" : "weed";
            // Adéla to sežere
            if (prev.shop.adela_slot !== null) {
              setAdelaToast(true);
              setTimeout(() => setAdelaToast(false), 2500);
              return { ...slot, state: "ready" as SlotState }; // Adéla ochránila
            }
            setWeedAlert({ slotId: slot.slot_id, isSnail });
            return { ...slot, state: newState };
          }
          return { ...slot, state: "ready" as SlotState };
        });

        return updated;
      });
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Autosave ──────────────────────────────────────────────────────────────
  const saveGame = useCallback(async (g: GameState) => {
    if (!userIdRef.current) return;
    setSaveStatus("saving");
    await supabase.from("idle_game").update({
      currency: Math.floor(g.currency),
      unlocked_slots: g.unlocked_slots,
      slots_data: g.slots_data,
      last_active_at: new Date().toISOString(),
      shop: g.shop,
      tutorial_done: g.tutorial_done,
    }).eq("user_id", userIdRef.current);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus(""), 2000);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => { if (gameRef.current) saveGame(gameRef.current); }, SAVE_INTERVAL_MS);
    return () => { clearInterval(iv); if (gameRef.current) saveGame(gameRef.current); };
  }, [saveGame]);

  // ── Akce ──────────────────────────────────────────────────────────────────

  const doPlant = (slotId: number, type: PlantType) => {
    const p = PLANTS[type];
    setGame(prev => {
      if (!prev || prev.currency < p.seed_cost) return prev;
      const newSlot: SlotData = {
        slot_id: slotId, plant_type: type, level: 1,
        planted_at: new Date().toISOString(), grow_seconds: p.grow_seconds, state: "growing",
      };
      return { ...prev, currency: prev.currency - p.seed_cost,
        slots_data: [...prev.slots_data.filter(s => s.slot_id !== slotId), newSlot] };
    });
    setPlantModal(null); setReplaceConfirm(null);
  };

  const doHarvest = (slot: SlotData) => {
    const p = PLANTS[slot.plant_type as PlantType];
    if (!p) return;
    setGame(prev => {
      if (!prev) return prev;
      const val = Math.floor(p.harvest * levelMult(slot.level) * (boostActive(prev) ? 2 : 1));
      const newSlot: SlotData = { ...slot, planted_at: new Date().toISOString(), state: "growing" };
      return { ...prev, currency: prev.currency + val,
        slots_data: [...prev.slots_data.filter(s => s.slot_id !== slot.slot_id), newSlot] };
    });
  };

  const removeWeed = (slotId: number, isSnail: boolean) => {
    const cost = isSnail ? SNAIL_COST : WEED_COST;
    setGame(prev => {
      if (!prev || prev.currency < cost) return prev;
      return { ...prev, currency: prev.currency - cost,
        slots_data: prev.slots_data.filter(s => s.slot_id !== slotId) };
    });
    setWeedAlert(null);
  };

  const doUpgrade = (slot: SlotData) => {
    const p = PLANTS[slot.plant_type as PlantType];
    if (!p) return;
    const cost = Math.floor(p.seed_cost * 5 * Math.pow(1.5, slot.level));
    setGame(prev => {
      if (!prev || prev.currency < cost) return prev;
      return { ...prev, currency: prev.currency - cost,
        slots_data: prev.slots_data.map(s => s.slot_id === slot.slot_id ? { ...s, level: s.level + 1 } : s) };
    });
    setUpgradeSlot(null);
  };

  const buyMole = () => {
    setGame(prev => {
      if (!prev || prev.currency < 1500 || prev.shop.mole) return prev;
      return { ...prev, currency: prev.currency - 1500, shop: { ...prev.shop, mole: true } };
    });
    if (gameRef.current) saveGame({ ...gameRef.current });
  };

  const buyAdela = (slotId: number) => {
    setGame(prev => {
      if (!prev || prev.currency < 12000 || prev.shop.adela_slot !== null) return prev;
      const adelaSlot: SlotData = {
        slot_id: slotId, plant_type: "adela", level: 1,
        planted_at: new Date().toISOString(), grow_seconds: 0, state: "adela",
      };
      return { ...prev, currency: prev.currency - 12000,
        shop: { ...prev.shop, adela_slot: slotId },
        slots_data: [...prev.slots_data.filter(s => s.slot_id !== slotId), adelaSlot] };
    });
    if (gameRef.current) saveGame({ ...gameRef.current });
    setShopOpen(false);
  };

  const spinWheelAction = (paid: boolean) => {
    if (!game) return;
    if (paid && game.currency < 300) return;
    if (!paid) {
      const last = game.shop.last_wheel_spin ? new Date(game.shop.last_wheel_spin).getTime() : 0;
      if (Date.now() - last < 24 * 3600 * 1000) return;
    }
    setWheelSpinning(true);
    const prize = spinWheel();
    setTimeout(() => {
      setWheelSpinning(false);
      setWheelPrize(prize);
      setGame(prev => {
        if (!prev) return prev;
        let g = { ...prev, shop: { ...prev.shop, last_wheel_spin: new Date().toISOString() } };
        if (paid) g = { ...g, currency: g.currency - 300 };
        // Aplikuj výhru
        if (prize.id === "currency_small") g = { ...g, currency: g.currency + 500 };
        if (prize.id === "currency_big") g = { ...g, currency: g.currency + 5000 };
        if (prize.id === "currency_jack") g = { ...g, currency: g.currency + 50000 };
        if (prize.id === "repellent") {
          const until = new Date(Date.now() + 4 * 3600 * 1000).toISOString();
          g = { ...g, shop: { ...g.shop, pest_repellent_until: until } };
        }
        if (prize.id === "fertilizer" && g.slots_data.length > 0) {
          // Zkrátí čas první rostoucí rostliny na 0
          const idx = g.slots_data.findIndex(s => s.state === "growing");
          if (idx >= 0) {
            const slots = [...g.slots_data];
            slots[idx] = { ...slots[idx], planted_at: new Date(Date.now() - slots[idx].grow_seconds * 1000).toISOString() };
            g = { ...g, slots_data: slots };
          }
        }
        if (prize.id === "golden_seed") {
          const currentUntil = g.shop.boost_income_until ? new Date(g.shop.boost_income_until).getTime() : 0;
          const base = Math.max(currentUntil, Date.now());
          g = { ...g, shop: { ...g.shop, boost_income_until: new Date(base + BOOST_DURATION_SEC * 1000).toISOString() } };
        }
        return g;
      });
    }, 2000);
  };

  const unlockSlot = () => {
    setGame(prev => {
      if (!prev) return prev;
      const cost = unlockCost(prev.unlocked_slots);
      if (prev.currency < cost) return prev;
      return { ...prev, currency: prev.currency - cost, unlocked_slots: prev.unlocked_slots + 1 };
    });
    if (gameRef.current) setTimeout(() => { if (gameRef.current) saveGame(gameRef.current); }, 100);
  };

  const completeTutorial = () => {
    setGame(prev => prev ? { ...prev, tutorial_done: true } : prev);
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  if (loading || !game) return (
    <div className="h-screen flex items-center justify-center bg-stone-50 dark:bg-gray-950">
      <img src="/icons/loading-tomato.png" alt="" className="w-14 h-14 animate-bounce" />
    </div>
  );

  const income = totalIncome(game);
  const repellentActive = game.shop.pest_repellent_until
    ? new Date(game.shop.pest_repellent_until).getTime() > Date.now()
    : false;
  const repellentSec = repellentActive && game.shop.pest_repellent_until
    ? Math.max(0, (new Date(game.shop.pest_repellent_until).getTime() - Date.now()) / 1000)
    : 0;
  const lastSpin = game.shop.last_wheel_spin ? new Date(game.shop.last_wheel_spin).getTime() : 0;
  const wheelFree = Date.now() - lastSpin >= 24 * 3600 * 1000;
  const wheelNextSec = wheelFree ? 0 : Math.max(0, (lastSpin + 24 * 3600 * 1000 - Date.now()) / 1000);

  return (
    <div className="flex flex-col bg-stone-50 dark:bg-gray-950" style={{ minHeight: "100dvh" }}>

      {/* ── Tutorial ──────────────────────────────────────────────────── */}
      {!game.tutorial_done && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="font-display font-bold text-xl mb-4 dark:text-gray-100 text-center">{t.tutTitle}</h2>
            <div className="space-y-2.5 mb-6">
              {[t.tut1, t.tut2, t.tut3, t.tut4, t.tut5].map((step, i) => (
                <div key={i} className="flex gap-2 text-sm text-bark-800 dark:text-gray-300 bg-stone-50 dark:bg-gray-800 rounded-xl px-3 py-2">{step}</div>
              ))}
            </div>
            <button onClick={completeTutorial} className="btn-primary w-full text-base">{t.tutStart}</button>
          </div>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="bg-forest-700 dark:bg-forest-900 text-white px-4 flex items-center justify-between flex-shrink-0"
        style={{ paddingTop: "max(env(safe-area-inset-top), 14px)", paddingBottom: "14px" }}>
        <button onClick={() => router.back()} className="text-forest-200 text-sm">{t.back}</button>
        <div className="text-center">
          <p className="font-display font-bold text-sm leading-tight">{t.title}</p>
          {repellentActive && <p className="text-[10px] text-forest-300">{t.repellentActive} {formatTime(repellentSec)}</p>}
          {boostActive(game) && game.shop.boost_income_until && (
            <p className="text-[10px] text-amber-300 font-semibold">
              {t.boostActive} {formatTime(Math.max(0, (new Date(game.shop.boost_income_until).getTime() - Date.now()) / 1000))}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">{formatNum(game.currency)} 🍃</div>
          <div className="text-[11px] text-forest-300">+{formatNum(income)}{t.perSec}</div>
        </div>
      </header>

      {saveStatus && (
        <div className="text-center text-[11px] py-1 bg-forest-100 dark:bg-forest-950 text-forest-600 dark:text-forest-400">
          {saveStatus === "saving" ? t.saving : t.saved}
        </div>
      )}

      {/* Adéla toast */}
      {adelaToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-pink-100 dark:bg-pink-950 border border-pink-300 text-pink-800 dark:text-pink-200 px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg animate-fade-slide-up">
          {t.adelaAte}
        </div>
      )}

      {/* ── Mřížka ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 90px)", WebkitOverflowScrolling: "touch" }}>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
            const slotId = i + 1;
            const locked = slotId > game.unlocked_slots;
            const slot = game.slots_data.find(s => s.slot_id === slotId);

            // Zamčené
            if (locked) {
              const cost = unlockCost(game.unlocked_slots);
              const next = slotId === game.unlocked_slots + 1;
              const canAfford = game.currency >= cost && next;
              return (
                <button key={slotId} onClick={canAfford ? unlockSlot : undefined}
                  className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all ${
                    canAfford ? "border-amber-400 bg-amber-50 dark:bg-amber-950 hover:scale-105 active:scale-95"
                              : "border-stone-200 dark:border-gray-700 bg-stone-100 dark:bg-gray-800 opacity-50"
                  }`}>
                  <span className="text-2xl">🔒</span>
                  {next && <span className="text-[9px] text-amber-700 dark:text-amber-300 font-semibold text-center px-1 leading-tight">
                    {t.unlockFor}<br />{formatNum(unlockCost(game.unlocked_slots))} 🍃
                  </span>}
                </button>
              );
            }

            // Adéla
            if (slot?.state === "adela") return (
              <div key={slotId}
                className="aspect-square rounded-2xl border-2 border-pink-300 bg-pink-50 dark:bg-pink-950 flex flex-col items-center justify-center gap-1">
                <span className="text-3xl">🌺</span>
                <span className="text-[10px] font-bold text-pink-600 dark:text-pink-300">Adéla</span>
              </div>
            );

            // Plevel / Šnek
            if (slot?.state === "weed" || slot?.state === "snail") {
              const isSnail = slot.state === "snail";
              const cost = isSnail ? SNAIL_COST : WEED_COST;
              return (
                <button key={slotId} onClick={() => setWeedAlert({ slotId, isSnail })}
                  className="aspect-square rounded-2xl border-2 border-red-300 bg-red-50 dark:bg-red-950 flex flex-col items-center justify-center gap-1 animate-pulse-soft">
                  <span className="text-3xl">{isSnail ? "🐌" : "🌿"}</span>
                  <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">{formatNum(cost)} 🍃</span>
                </button>
              );
            }

            // Prázdné
            if (!slot) return (
              <button key={slotId} onClick={() => setPlantModal(slotId)}
                className="aspect-square rounded-2xl border-2 border-dashed border-forest-200 dark:border-forest-800 bg-forest-50 dark:bg-forest-950 flex flex-col items-center justify-center gap-1 hover:scale-105 active:scale-95 transition-all">
                <span className="text-3xl">➕</span>
                <span className="text-[11px] text-forest-500 font-medium">{t.plant}</span>
              </button>
            );

            // Osázené
            const p = PLANTS[slot.plant_type as PlantType];
            if (!p) return null;
            const plantedAt = new Date(slot.planted_at).getTime();
            const matureAt = plantedAt + slot.grow_seconds * 1000;
            const remaining = Math.max(0, (matureAt - Date.now()) / 1000);
            const progress = Math.min(1, (Date.now() - plantedAt) / (slot.grow_seconds * 1000));
            const mature = remaining === 0;

            return (
              <div key={slotId}
                onClick={() => mature ? doHarvest(slot) : setUpgradeSlot(slotId)}
                onContextMenu={(e) => {
                  e.preventDefault(); // Zabrání vyskočení systémového menu v mobilu i na PC
                  setPlantModal(slotId);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") (mature ? doHarvest(slot) : setUpgradeSlot(slotId)); }}
                className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 p-2 transition-all cursor-pointer select-none ${
                  mature ? "border-amber-400 bg-amber-50 dark:bg-amber-950 animate-pulse-soft"
                         : "border-forest-200 dark:border-forest-800 bg-white dark:bg-gray-900"
                }`}>
                <span className="text-2xl leading-none">{p.emoji}</span>
                <span className="text-[9px] font-bold text-forest-600 dark:text-forest-400">{t.level} {slot.level}</span>
                {mature ? (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{t.harvest}</span>
                ) : (
                  <>
                    <div className="w-full bg-stone-100 dark:bg-gray-800 rounded-full h-1">
                      <div className="bg-forest-500 h-1 rounded-full" style={{ width: `${progress * 100}%` }} />
                    </div>
                    <span className="text-[8px] text-stone-400">{formatTime(remaining)}</span>
                  </>
                )}
                {/* Tlačítko výměny */}
                <button onClick={e => { e.stopPropagation(); setPlantModal(slotId); }}
                  className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-stone-100 dark:bg-gray-800 text-[9px] text-stone-400 flex items-center justify-center hover:bg-stone-200 transition-colors">
                  🔄
                </button>
              </div>
            );
          })}
        </div>

        {/* Tlačítko obchod */}
        <button onClick={() => setShopOpen(true)}
          className="w-full py-3 rounded-2xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2">
          🛒 {t.shop} {wheelFree && <span className="bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">!</span>}
        </button>
      </div>

      {/* ── Offline bonus ─────────────────────────────────────────────── */}
      {offlineBonus !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="font-display font-bold text-lg mb-2 dark:text-gray-100">{t.offlineTitle}</h2>
            <p className="text-sm text-stone-500 dark:text-gray-400 mb-4">
              {t.offlineMsg} <span className="font-bold text-forest-600">{formatNum(offlineBonus)}</span> {t.offlineUnit}
            </p>
            <button onClick={() => setOfflineBonus(null)} className="btn-primary w-full">{t.ok}</button>
          </div>
        </div>
      )}

      {/* ── Výběr semínka ─────────────────────────────────────────────── */}
      {plantModal !== null && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPlantModal(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl px-4 pt-4"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 92px)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg dark:text-gray-100">{t.seedModal}</h3>
              <button onClick={() => setPlantModal(null)} className="text-stone-400 text-xl">✕</button>
            </div>
            {/* Pokud políčko obsazeno – upozornění */}
            {game.slots_data.find(s => s.slot_id === plantModal) && (
              <div className="mb-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                🔄 {t.replaceSub}
              </div>
            )}
            <div className="space-y-2 pb-2 overflow-y-auto" style={{ maxHeight: "55vh" }}>
              {(Object.entries(PLANTS) as [PlantType, typeof PLANTS[PlantType]][]).map(([type, p]) => {
                const canAfford = game.currency >= p.seed_cost;
                const existing = game.slots_data.find(s => s.slot_id === plantModal);
                return (
                  <button key={type} disabled={!canAfford}
                    onClick={() => {
                      if (existing && existing.plant_type !== type) {
                        setReplaceConfirm({ slotId: plantModal, newType: type });
                        setPlantModal(null);
                      } else {
                        doPlant(plantModal, type);
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      canAfford ? "border-forest-200 dark:border-forest-800 bg-forest-50 dark:bg-forest-950 hover:bg-forest-100 active:scale-95"
                                : "border-stone-100 dark:border-gray-800 bg-stone-50 dark:bg-gray-800 opacity-50"
                    }`}>
                    <span className="text-3xl">{p.emoji}</span>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm dark:text-gray-100">{p.names[lang] ?? p.names["en"]}</p>
                      <p className="text-[11px] text-stone-400">{t.cost}: {formatNum(p.seed_cost)} 🍃 · {t.income}: +{p.income_per_sec}/s</p>
                    </div>
                    <div className="text-right text-xs">
                      <span className="text-forest-600 dark:text-forest-400">{formatTime(p.grow_seconds)}</span><br />
                      <span className="text-amber-600">+{formatNum(p.harvest)} 🍃</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Potvrzení výměny ──────────────────────────────────────────── */}
      {replaceConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setReplaceConfirm(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-5 max-w-xs w-full shadow-2xl text-center">
            <p className="text-2xl mb-2">🔄</p>
            <h3 className="font-display font-bold text-base mb-1 dark:text-gray-100">{t.replaceTitle}</h3>
            <p className="text-xs text-stone-400 mb-4">{t.replaceSub}</p>
            <div className="flex gap-2">
              <button onClick={() => setReplaceConfirm(null)} className="btn-secondary flex-1 py-2 text-sm">{t.replaceCancel}</button>
              <button onClick={() => doPlant(replaceConfirm.slotId, replaceConfirm.newType)}
                className="btn-primary flex-1 py-2 text-sm">{t.replaceBtn}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Plevel / Šnek alert ───────────────────────────────────────── */}
      {weedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setWeedAlert(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-5 max-w-xs w-full shadow-2xl text-center">
            <p className="text-4xl mb-2">{weedAlert.isSnail ? "🐌" : "🌿"}</p>
            <h3 className="font-display font-bold text-base mb-1 dark:text-gray-100">
              {weedAlert.isSnail ? t.snailTitle : t.weedTitle}
            </h3>
            <p className="text-xs text-stone-400 mb-4">{weedAlert.isSnail ? t.weedMsg : t.weedMsg} #{weedAlert.slotId}</p>
            <div className="flex gap-2">
              <button onClick={() => setWeedAlert(null)} className="btn-secondary flex-1 py-2 text-sm">{t.close}</button>
              <button onClick={() => removeWeed(weedAlert.slotId, weedAlert.isSnail)}
                disabled={game.currency < (weedAlert.isSnail ? SNAIL_COST : WEED_COST)}
                className="btn-primary flex-1 py-2 text-sm disabled:opacity-40">
                {weedAlert.isSnail ? t.snailRemove : t.weedRemove} {weedAlert.isSnail ? SNAIL_COST : WEED_COST} 🍃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upgrade modal ─────────────────────────────────────────────── */}
      {upgradeSlot !== null && (() => {
        const slot = game.slots_data.find(s => s.slot_id === upgradeSlot);
        if (!slot || !PLANTS[slot.plant_type as PlantType]) { setUpgradeSlot(null); return null; }
        const p = PLANTS[slot.plant_type as PlantType];
        const cost = Math.floor(p.seed_cost * 5 * Math.pow(1.5, slot.level));
        const canAfford = game.currency >= cost;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setUpgradeSlot(null)} />
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-5 max-w-xs w-full shadow-2xl text-center">
              <span className="text-4xl">{p.emoji}</span>
              <h3 className="font-display font-bold text-lg mt-2 mb-1 dark:text-gray-100">{t.upgradeTitle}</h3>
              <p className="text-sm text-stone-400">{t.level} {slot.level} → {slot.level + 1}</p>
              <p className="text-xs text-forest-600 dark:text-forest-400 mt-2">
                +{(p.income_per_sec * levelMult(slot.level + 1)).toFixed(1)}/s · +{formatNum(p.harvest * levelMult(slot.level + 1))} 🍃
              </p>
              <p className={`text-sm font-bold mt-3 ${canAfford ? "text-amber-600" : "text-red-400"}`}>
                {t.upgradeCost}: {formatNum(cost)} 🍃
              </p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setUpgradeSlot(null)} className="btn-secondary flex-1 py-2 text-sm">{t.close}</button>
                <button onClick={() => doUpgrade(slot)} disabled={!canAfford} className="btn-primary flex-1 py-2 text-sm disabled:opacity-40">{t.upgrade}</button>
              </div>
              <button
                onClick={() => { setUpgradeSlot(null); setPlantModal(upgradeSlot); }}
                className="w-full mt-2 py-2 rounded-2xl border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm font-semibold hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors"
              >
                🔄 {t.replaceBtn}
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── Obchod ────────────────────────────────────────────────────── */}
      {shopOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShopOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl px-4 pt-4"
            style={{ maxHeight: "88vh", paddingBottom: "calc(env(safe-area-inset-bottom) + 92px)" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-lg dark:text-gray-100">🛒 {t.shopTitle}</h3>
              <button onClick={() => setShopOpen(false)} className="text-stone-400 text-xl">✕</button>
            </div>
            {/* Tabs */}
            <div className="flex bg-stone-100 dark:bg-gray-800 rounded-2xl p-1 mb-4">
              {(["upgrades","seeds"] as const).map(tab => (
                <button key={tab} onClick={() => setShopTab(tab)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                    shopTab === tab ? "bg-white dark:bg-gray-700 text-forest-700 dark:text-forest-300 shadow-sm"
                                   : "text-stone-500 dark:text-gray-400"
                  }`}>
                  {tab === "upgrades" ? t.shopUpgrades : t.shopSeeds}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: "60vh", WebkitOverflowScrolling: "touch" }}>
              {shopTab === "upgrades" && (
                <div className="space-y-3 pb-2">
                  {/* Kolo štěstí – PRVNÍ */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border border-purple-200 dark:border-purple-800 rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-bold text-sm dark:text-gray-100">{t.wheelTitle}</p>
                        <p className="text-[11px] text-stone-400 dark:text-gray-500 mt-0.5">{t.wheelSub}</p>
                        {wheelFree
                          ? <p className="text-xs font-semibold text-green-600 dark:text-green-400 mt-1">✅ {t.wheelFree}</p>
                          : <p className="text-xs text-stone-400 mt-1">{t.wheelNext} {formatTime(wheelNextSec)}</p>}
                      </div>
                      <button onClick={() => { setShopOpen(false); setWheelOpen(true); }}
                        className="btn-primary text-xs px-3 py-2 whitespace-nowrap">
                        🎡 {lang === "cs" ? "Točit" : "Spin"}
                      </button>
                    </div>
                  </div>

                  {/* Krtek */}
                  <div className={`border rounded-2xl p-4 ${game.shop.mole ? "border-stone-200 dark:border-gray-700 opacity-60" : "border-forest-200 dark:border-forest-800 bg-forest-50 dark:bg-forest-950"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-bold text-sm dark:text-gray-100">{t.moleTitle}</p>
                        <p className="text-[11px] text-stone-400 dark:text-gray-500 mt-0.5">{t.moleSub}</p>
                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">1 500 🍃</p>
                      </div>
                      <button onClick={buyMole} disabled={game.shop.mole || game.currency < 1500}
                        className={`text-xs px-3 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap ${
                          game.shop.mole ? "bg-stone-100 dark:bg-gray-800 text-stone-400"
                                         : "bg-forest-600 hover:bg-forest-700 text-white disabled:opacity-40"
                        }`}>
                        {game.shop.mole ? "✓" : lang === "cs" ? "Koupit" : "Buy"}
                      </button>
                    </div>
                  </div>

                  {/* Adéla */}
                  <div className={`border rounded-2xl p-4 ${game.shop.adela_slot !== null ? "border-stone-200 dark:border-gray-700 opacity-60" : "border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-950"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-bold text-sm dark:text-gray-100">{t.adelaTitle}</p>
                        <p className="text-[11px] text-stone-400 dark:text-gray-500 mt-0.5">{t.adelaSub}</p>
                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">12 000 🍃</p>
                      </div>
                      <button
                        onClick={() => {
                          const freeSlot = Array.from({length: game.unlocked_slots}, (_, i) => i + 1)
                            .find(id => !game.slots_data.find(s => s.slot_id === id));
                          if (freeSlot !== undefined) buyAdela(freeSlot);
                        }}
                        disabled={game.shop.adela_slot !== null || game.currency < 12000}
                        className={`text-xs px-3 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap ${
                          game.shop.adela_slot !== null ? "bg-stone-100 dark:bg-gray-800 text-stone-400"
                                                        : "bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-40"
                        }`}>
                        {game.shop.adela_slot !== null ? "✓" : lang === "cs" ? "Koupit" : "Buy"}
                      </button>
                    </div>
                  </div>

                  {/* Odemčení slotu */}
                  {game.unlocked_slots < TOTAL_SLOTS && (
                    <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 rounded-2xl p-4 flex items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm dark:text-gray-100">🔓 {lang==="cs"?"Odemknout políčko č.":"Unlock slot #"}{game.unlocked_slots + 1}</p>
                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">{formatNum(unlockCost(game.unlocked_slots))} 🍃</p>
                      </div>
                      <button onClick={() => { unlockSlot(); setShopOpen(false); }}
                        disabled={game.currency < unlockCost(game.unlocked_slots)}
                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-2 rounded-xl font-semibold disabled:opacity-40 whitespace-nowrap">
                        {t.locked}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {shopTab === "seeds" && (
                <div className="space-y-2 pb-2">
                  {(Object.entries(PLANTS) as [PlantType, typeof PLANTS[PlantType]][]).map(([type, p]) => (
                    <div key={type} className="flex items-center gap-3 bg-stone-50 dark:bg-gray-800 rounded-2xl p-3">
                      <span className="text-3xl">{p.emoji}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm dark:text-gray-100">{p.names[lang] ?? p.names["en"]}</p>
                        <p className="text-[11px] text-stone-400">{t.cost}: {formatNum(p.seed_cost)} 🍃</p>
                        <p className="text-[11px] text-stone-400">{t.income}: +{p.income_per_sec}/s · {t.harvestVal}: {formatNum(p.harvest)} 🍃</p>
                        <p className="text-[11px] text-stone-400">{t.grow}: {formatTime(p.grow_seconds)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Kolo štěstí ───────────────────────────────────────────────── */}
      {wheelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !wheelSpinning && setWheelOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-5 max-w-xs w-full shadow-2xl text-center">
            <h3 className="font-display font-bold text-xl mb-1 dark:text-gray-100">{t.wheelTitle}</h3>
            <p className="text-xs text-stone-400 mb-4">{t.wheelSub}</p>

            {/* Vizuál kola */}
            <div className={`w-40 h-40 mx-auto rounded-full border-4 border-purple-400 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 flex items-center justify-center mb-4 ${wheelSpinning ? "animate-spin" : ""}`}
              style={{ transition: wheelSpinning ? "none" : "transform 0.3s" }}>
              <span className="text-5xl">{wheelSpinning ? "🎡" : (wheelPrize ? "🎉" : "🎡")}</span>
            </div>

            {wheelPrize ? (
              <>
                <p className="text-sm font-semibold text-forest-600 dark:text-forest-300 mb-1">{t.wheelResult}</p>
                <p className="text-lg font-bold dark:text-gray-100 mb-4">{wheelPrize.label[lang as keyof typeof wheelPrize.label] ?? wheelPrize.label["en"]}</p>
                <button onClick={() => { setWheelPrize(null); setWheelOpen(false); }} className="btn-primary w-full">{t.wheelClose}</button>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <button onClick={() => spinWheelAction(false)} disabled={!wheelFree || wheelSpinning}
                    className="flex-1 py-2.5 rounded-2xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm disabled:opacity-40">
                    {wheelFree ? `🆓 ${t.wheelSpin}` : t.wheelNext}
                  </button>
                  <button onClick={() => spinWheelAction(true)} disabled={game.currency < 300 || wheelSpinning}
                    className="flex-1 py-2.5 rounded-2xl border border-amber-300 text-amber-700 dark:text-amber-300 font-semibold text-xs disabled:opacity-40 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors">
                    {t.wheelBuy}
                  </button>
                </div>
                {!wheelFree && <p className="text-xs text-stone-400 mt-2">{t.wheelNext} {formatTime(wheelNextSec)}</p>}
              </>
            )}
          </div>
        </div>
      )}

      <Navigation />
    </div>
  );
}
