"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/hooks/useLang";
import { generateWeekTasks, type CalendarTask } from "@/utils/plantCatalog";

interface CalendarProps {
  plantIds: string[];
}

const TASK_STYLES: Record<CalendarTask["type"], { bg: string; border: string; icon: string }> = {
  water:     { bg:"bg-sky-50 dark:bg-sky-950",     border:"border-sky-200 dark:border-sky-800",     icon:"💧" },
  fertilize: { bg:"bg-amber-50 dark:bg-amber-950",  border:"border-amber-200 dark:border-amber-800",  icon:"🌿" },
  harvest:   { bg:"bg-forest-50 dark:bg-forest-950",border:"border-forest-200 dark:border-forest-800",icon:"🧺" },
  sow:       { bg:"bg-emerald-50 dark:bg-emerald-950",border:"border-emerald-200 dark:border-emerald-800",icon:"🌱" },
  prune:     { bg:"bg-purple-50 dark:bg-purple-950", border:"border-purple-200 dark:border-purple-800", icon:"✂️" },
};

const TASK_LABEL: Record<CalendarTask["type"], Record<string,string>> = {
  water:     { cs:"Zálivka",   en:"Watering",   de:"Gießen",     pl:"Podlewanie" },
  fertilize: { cs:"Hnojení",   en:"Fertilize",  de:"Düngen",     pl:"Nawożenie" },
  harvest:   { cs:"Sklizeň",   en:"Harvest",    de:"Ernte",      pl:"Zbiory" },
  sow:       { cs:"Setí",      en:"Sowing",     de:"Aussaat",    pl:"Siew" },
  prune:     { cs:"Řez",       en:"Pruning",    de:"Schnitt",    pl:"Cięcie" },
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

export function GardenCalendar({ plantIds }: CalendarProps) {
  const { lang } = useLang();
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const monday = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7);
    d.setHours(0,0,0,0);
    return d;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  const sunday = useMemo(() => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + 6);
    return d;
  }, [monday]);

  const tasks = useMemo(
    () => generateWeekTasks(plantIds, lang),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plantIds, lang, weekOffset]
  );

  const days = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    }), [monday]);

  const dayNames = DAY_NAMES[lang] ?? DAY_NAMES["cs"];
  const months = MONTH_NAMES[lang] ?? MONTH_NAMES["cs"];

  const formatDate = (d: Date) =>
    `${d.getDate()}. ${months[d.getMonth()]}`;

  const isToday = (d: Date) =>
    d.toDateString() === new Date().toDateString();

  const tasksForDay = (d: Date) =>
    tasks.filter(t => t.date.toDateString() === d.toDateString());

  const weekLabel = `${formatDate(monday)} – ${formatDate(sunday)}`;

  return (
    <div className="space-y-4">
      {/* Navigace týdnem */}
      <div className="card flex items-center justify-between">
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          className="w-9 h-9 rounded-xl bg-forest-50 dark:bg-gray-800 flex items-center justify-center text-forest-600 dark:text-forest-300 hover:bg-forest-100 dark:hover:bg-gray-700 transition-colors"
        >‹</button>
        <div className="text-center">
          <p className="text-xs text-forest-500 dark:text-gray-400 font-medium uppercase tracking-wide">
            {weekOffset === 0
              ? (lang === "cs" ? "Tento týden" : lang === "en" ? "This week" : lang === "de" ? "Diese Woche" : "Ten tydzień")
              : weekOffset > 0
                ? (lang === "cs" ? `+${weekOffset} týd.` : `+${weekOffset} wk`)
                : (lang === "cs" ? `${weekOffset} týd.` : `${weekOffset} wk`)}
          </p>
          <p className="text-sm font-bold text-bark-900 dark:text-gray-100">{weekLabel}</p>
        </div>
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="w-9 h-9 rounded-xl bg-forest-50 dark:bg-gray-800 flex items-center justify-center text-forest-600 dark:text-forest-300 hover:bg-forest-100 dark:hover:bg-gray-700 transition-colors"
        >›</button>
      </div>

      {/* Mini týdenní přehled */}
      <div className="card">
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            const count = tasksForDay(d).length;
            const active = isToday(d) && weekOffset === 0;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 font-medium">{dayNames[i]}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold
                  ${active ? "bg-forest-600 text-white" : "bg-gray-50 dark:bg-gray-800 text-bark-800 dark:text-gray-200"}`}>
                  {d.getDate()}
                </div>
                {count > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Úkoly */}
      {plantIds.length === 0 ? (
        <div className="card text-center py-10">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {lang === "cs" ? "Přidejte rostliny do zahrady a zobrazí se vám týdenní plán péče." :
             lang === "en" ? "Add plants to your garden to see your weekly care plan." :
             lang === "de" ? "Fügen Sie Pflanzen zu Ihrem Garten hinzu, um Ihren wöchentlichen Pflegeplan zu sehen." :
             "Dodaj rośliny do ogrodu, aby zobaczyć tygodniowy plan pielęgnacji."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {days.map((d, di) => {
            const dayTasks = tasksForDay(d);
            if (dayTasks.length === 0) return null;
            const active = isToday(d) && weekOffset === 0;
            return (
              <div key={di}>
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className={`text-xs font-bold ${active ? "text-forest-600 dark:text-forest-400" : "text-gray-400 dark:text-gray-500"}`}>
                    {dayNames[di]}, {d.getDate()}. {months[d.getMonth()]}
                    {active && <span className="ml-1 text-[10px] bg-forest-100 dark:bg-forest-900 text-forest-600 dark:text-forest-300 px-1.5 py-0.5 rounded-full">
                      {lang==="cs"?"Dnes":lang==="en"?"Today":lang==="de"?"Heute":"Dziś"}
                    </span>}
                  </span>
                </div>
                {dayTasks.map((task, ti) => {
                  const style = TASK_STYLES[task.type];
                  const label = TASK_LABEL[task.type][lang] ?? TASK_LABEL[task.type]["cs"];
                  return (
                    <div key={ti} className={`flex items-start gap-3 rounded-2xl border p-3 mb-2 ${style.bg} ${style.border}`}>
                      <span className="text-xl mt-0.5 flex-shrink-0">{style.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-bark-900 dark:text-gray-100">{label}</span>
                          <span className="text-base">{task.plantEmoji}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{task.plantName}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug">{task.description}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                          📅 {d.getDate()}. {months[d.getMonth()]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {tasks.length === 0 && (
            <div className="card text-center py-8 text-gray-400 text-sm">
              {lang==="cs"?"Tento týden nejsou naplánované žádné úkoly.":
               lang==="en"?"No tasks planned for this week.":
               lang==="de"?"Keine Aufgaben für diese Woche geplant.":
               "Brak zaplanowanych zadań na ten tydzień."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
