"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/hooks/useLang";
import { PLANT_CATALOG, generateWeekTasks, type CalendarTask } from "@/utils/plantCatalog";

interface CalendarProps { plantIds: string[]; }

const TASK_STYLES: Record<CalendarTask["type"], { bg: string; border: string; icon: string }> = {
  water:     { bg: "bg-sky-50 dark:bg-sky-950",      border: "border-sky-200 dark:border-sky-800",     icon: "💧" },
  fertilize: { bg: "bg-amber-50 dark:bg-amber-950",   border: "border-amber-200 dark:border-amber-800",  icon: "🌿" },
  harvest:   { bg: "bg-forest-50 dark:bg-forest-950", border: "border-forest-200 dark:border-forest-800",icon: "🧺" },
  sow:       { bg: "bg-emerald-50 dark:bg-emerald-950",border: "border-emerald-200 dark:border-emerald-800",icon: "🌱" },
  prune:     { bg: "bg-purple-50 dark:bg-purple-950",  border: "border-purple-200 dark:border-purple-800", icon: "✂️" },
};

const TASK_LABEL: Record<CalendarTask["type"], Record<string, string>> = {
  water:     { cs: "Zálivka",  en: "Watering",   de: "Gießen",  pl: "Podlewanie" },
  fertilize: { cs: "Hnojení",  en: "Fertilize",  de: "Düngen",  pl: "Nawożenie" },
  harvest:   { cs: "Sklizeň",  en: "Harvest",    de: "Ernte",   pl: "Zbiory" },
  sow:       { cs: "Setí",     en: "Sowing",     de: "Aussaat", pl: "Siew" },
  prune:     { cs: "Řez",      en: "Pruning",    de: "Schnitt", pl: "Cięcie" },
};

const DAY_NAMES: Record<string, string[]> = {
  cs: ["Po","Út","St","Čt","Pá","So","Ne"],
  en: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
  de: ["Mo","Di","Mi","Do","Fr","Sa","So"],
  pl: ["Pon","Wt","Śr","Czw","Pt","Sob","Nd"],
};

const MONTH_NAMES: Record<string, string[]> = {
  cs: ["ledna","února","března","dubna","května","června","července","srpna","září","října","listopadu","prosince"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  de: ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],
  pl: ["stycznia","lutego","marca","kwietnia","maja","czerwca","lipca","sierpnia","września","października","listopada","grudnia"],
};

// Skupinový řádek: jeden typ úkolu → seznam rostlin v jedné buňce
interface TaskGroup {
  type: CalendarTask["type"];
  date: Date;
  plants: { emoji: string; name: string }[];
  description: string;
}

function groupTasksByDayAndType(tasks: CalendarTask[]): TaskGroup[] {
  const map = new Map<string, TaskGroup>();
  for (const task of tasks) {
    const key = `${task.date.toDateString()}-${task.type}`;
    if (!map.has(key)) {
      map.set(key, { type: task.type, date: task.date, plants: [], description: task.description });
    }
    map.get(key)!.plants.push({ emoji: task.plantEmoji, name: task.plantName });
  }
  return [...map.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Expandovatelný řádek skupiny úkolů
function TaskGroupRow({ group, lang, dayName, monthName }: {
  group: TaskGroup; lang: string; dayName: string; monthName: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const style = TASK_STYLES[group.type];
  const label = TASK_LABEL[group.type][lang] ?? TASK_LABEL[group.type]["cs"];
  const d = group.date;

  return (
    <div className={`rounded-2xl border ${style.bg} ${style.border} overflow-hidden`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
      >
        <span className="text-xl flex-shrink-0">{style.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-bark-900 dark:text-gray-100">{label}</span>
            {/* Emojis rostlin */}
            <span className="text-sm">
              {group.plants.map(p => p.emoji).join(" ")}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-gray-400 mt-0.5">
            {dayName}, {d.getDate()}. {monthName}
          </p>
        </div>
        <span className="text-stone-400 text-xs flex-shrink-0 transition-transform"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
      </button>

      {/* Expandovaný obsah – seznam rostlin */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-current/10 pt-2 space-y-1.5">
          <p className="text-xs text-stone-500 dark:text-gray-400 mb-2">{group.description}</p>
          {group.plants.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="text-base">{p.emoji}</span>
              <span className="text-bark-800 dark:text-gray-200">{p.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GardenCalendar({ plantIds }: CalendarProps) {
  const { lang } = useLang();
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const monday = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  const sunday = useMemo(() => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + 6);
    return d;
  }, [monday]);

  const rawTasks = useMemo(
    () => generateWeekTasks(plantIds, lang),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plantIds, lang, weekOffset]
  );

  const taskGroups = useMemo(() => groupTasksByDayAndType(rawTasks), [rawTasks]);

  const days = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    }), [monday]);

  const dayNames = DAY_NAMES[lang] ?? DAY_NAMES["cs"];
  const months = MONTH_NAMES[lang] ?? MONTH_NAMES["cs"];
  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();

  const formatDateRange = () => {
    const m = months[monday.getMonth()];
    const sm = months[sunday.getMonth()];
    if (monday.getMonth() === sunday.getMonth()) {
      return `${monday.getDate()}. – ${sunday.getDate()}. ${m}`;
    }
    return `${monday.getDate()}. ${m} – ${sunday.getDate()}. ${sm}`;
  };

  const weekLabel = weekOffset === 0
    ? (lang === "cs" ? "Tento týden" : lang === "en" ? "This week" : lang === "de" ? "Diese Woche" : "Ten tydzień")
    : weekOffset > 0
      ? `+${weekOffset} ${lang === "cs" ? "týd." : "wk"}`
      : `${weekOffset} ${lang === "cs" ? "týd." : "wk"}`;

  // Seskupení skupin dle dne pro přehled
  const groupsByDay = useMemo(() => {
    return days.map(d => ({
      day: d,
      groups: taskGroups.filter(g => g.date.toDateString() === d.toDateString()),
    }));
  }, [days, taskGroups]);

  return (
    <div className="space-y-4">
      {/* Navigace týdnem */}
      <div className="card flex items-center justify-between">
        <button onClick={() => setWeekOffset(w => w - 1)}
          className="w-9 h-9 rounded-xl bg-forest-50 dark:bg-gray-800 flex items-center justify-center text-forest-600 dark:text-forest-300 hover:bg-forest-100 transition-colors text-lg font-bold">‹</button>
        <div className="text-center">
          <p className="text-xs text-forest-500 dark:text-gray-400 font-medium">{weekLabel}</p>
          <p className="text-sm font-bold text-bark-900 dark:text-gray-100">{formatDateRange()}</p>
        </div>
        <button onClick={() => setWeekOffset(w => w + 1)}
          className="w-9 h-9 rounded-xl bg-forest-50 dark:bg-gray-800 flex items-center justify-center text-forest-600 dark:text-forest-300 hover:bg-forest-100 transition-colors text-lg font-bold">›</button>
      </div>

      {/* Mini týdenní přehled */}
      <div className="card">
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            const hasGroups = groupsByDay[i].groups.length > 0;
            const active = isToday(d) && weekOffset === 0;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-stone-400 font-medium">{dayNames[i]}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
                  active ? "bg-forest-600 text-white" : "bg-stone-50 dark:bg-gray-800 text-bark-800 dark:text-gray-200"
                }`}>
                  {d.getDate()}
                </div>
                {hasGroups && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Úkoly seskupené po dnech */}
      {plantIds.length === 0 ? (
        <div className="card text-center py-10">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-sm text-stone-400 dark:text-gray-500">
            {lang === "cs" ? "Přidejte rostliny do zahrady a zobrazí se vám týdenní plán péče."
              : lang === "en" ? "Add plants to your garden to see your weekly care plan."
              : lang === "de" ? "Fügen Sie Pflanzen hinzu, um Ihren wöchentlichen Pflegeplan zu sehen."
              : "Dodaj rośliny do ogrodu, aby zobaczyć tygodniowy plan pielęgnacji."}
          </p>
        </div>
      ) : taskGroups.length === 0 ? (
        <div className="card text-center py-8 text-stone-400 dark:text-gray-500 text-sm">
          {lang === "cs" ? "Tento týden nejsou naplánované žádné úkoly."
            : lang === "en" ? "No tasks planned for this week."
            : lang === "de" ? "Keine Aufgaben für diese Woche geplant."
            : "Brak zadań na ten tydzień."}
        </div>
      ) : (
        <div className="space-y-4">
          {groupsByDay.map(({ day, groups }, di) => {
            if (groups.length === 0) return null;
            const active = isToday(day) && weekOffset === 0;
            return (
              <div key={di}>
                <p className={`text-xs font-bold px-1 mb-1.5 ${
                  active ? "text-forest-600 dark:text-forest-400" : "text-stone-400 dark:text-gray-500"
                }`}>
                  {dayNames[di]}, {day.getDate()}. {months[day.getMonth()]}
                  {active && (
                    <span className="ml-2 bg-forest-100 dark:bg-forest-900 text-forest-600 dark:text-forest-300 px-1.5 py-0.5 rounded-full text-[10px]">
                      {lang === "cs" ? "Dnes" : lang === "en" ? "Today" : lang === "de" ? "Heute" : "Dziś"}
                    </span>
                  )}
                </p>
                <div className="space-y-2">
                  {groups.map((group, gi) => (
                    <TaskGroupRow
                      key={gi}
                      group={group}
                      lang={lang}
                      dayName={dayNames[di]}
                      monthName={months[day.getMonth()]}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
