"use client";

import { useMemo } from "react";
import { useAuth, useLocale } from "@/context/AppContext";
import { getTasksForMonth } from "@/utils/garden";

const MONTH_NAMES: Record<string, string[]> = {
  cs: ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
  pl: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
};

export default function Calendar() {
  const { plants } = useAuth();
  const { locale, translate } = useLocale();

  const currentMonth = new Date().getMonth() + 1;
  const monthName = MONTH_NAMES[locale]?.[currentMonth - 1] ?? MONTH_NAMES.en[currentMonth - 1];

  const tasks = useMemo(() => {
    const plantIds = plants.map((p) => p.plant_id);
    return getTasksForMonth(plantIds, currentMonth);
  }, [plants, currentMonth]);

  return (
    <div className="card">
      <h2 className="section-title mb-1">{translate("calendar.title")}</h2>
      <p className="text-sm text-gray-500 mb-4">
        {translate("calendar.tasksFor")} {monthName}
      </p>

      {tasks.length === 0 ? (
        <p className="text-gray-500 text-center py-6">{translate("calendar.noTasks")}</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((taskKey) => (
            <li
              key={taskKey}
              className="flex items-start gap-3 p-3 bg-leaf-50 rounded-xl border border-leaf-100"
            >
              <span className="text-lg mt-0.5">✅</span>
              <span className="text-sm text-gray-700 leading-relaxed">
                {translate(`tasks.${taskKey}`)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
