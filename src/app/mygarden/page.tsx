"use client";
export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { useLang } from "@/hooks/useLang";

const T = {
  en: { title:"My Garden", plants:"My Plants", plantsDesc:"Manage what you grow", beds:"My Beds", bedsDesc:"Plan your garden layout", harvest:"Harvest Log", harvestDesc:"Track your seasonal harvest" },
  cs: { title:"Moje Zahrada", plants:"Moje Rostliny", plantsDesc:"Co právě pěstuješ", beds:"Moje Záhony", bedsDesc:"Naplánuj rozložení záhonů", harvest:"Sklizeň", harvestDesc:"Záznam sezónní úrody" },
  de: { title:"Mein Garten", plants:"Meine Pflanzen", plantsDesc:"Was du anbaust", beds:"Meine Beete", bedsDesc:"Beetplanung", harvest:"Ernte-Log", harvestDesc:"Saisonale Ernte verfolgen" },
  pl: { title:"Mój Ogród", plants:"Moje Rośliny", plantsDesc:"Co uprawiasz", beds:"Moje Grządki", bedsDesc:"Zaplanuj układ grządek", harvest:"Dziennik Zbiorów", harvestDesc:"Śledź sezonowe zbiory" },
};

export default function MyGardenPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = T[lang as keyof typeof T] ?? T["en"];

  const items = [
    { icon:"🌿", label:t.plants, desc:t.plantsDesc, href:"/garden", color:"from-forest-400 to-forest-600" },
    { icon:"🪴", label:t.beds, desc:t.bedsDesc, href:"/beds", color:"from-soil-400 to-soil-600" },
    { icon:"🧺", label:t.harvest, desc:t.harvestDesc, href:"/harvest", color:"from-amber-400 to-amber-600" },
  ];

  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-gray-950">
      <main className="flex-1 overflow-y-auto"
        style={{ paddingTop:"calc(env(safe-area-inset-top) + 20px)", paddingBottom:"calc(env(safe-area-inset-bottom) + 92px)" }}>
        <div className="max-w-lg mx-auto px-4 space-y-4">
          <h1 className="font-display text-2xl font-bold text-bark-900 dark:text-gray-100 mb-6">{t.title}</h1>
          {items.map(item => (
            <button key={item.href} onClick={() => router.push(item.href)}
              className="w-full flex items-center gap-4 bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-stone-100 dark:border-gray-800 hover:border-forest-200 dark:hover:border-forest-800 active:scale-[0.98] transition-all text-left">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
                {item.icon}
              </div>
              <div>
                <p className="font-display font-bold text-lg text-bark-900 dark:text-gray-100">{item.label}</p>
                <p className="text-sm text-stone-400 dark:text-gray-500 mt-0.5">{item.desc}</p>
              </div>
              <span className="ml-auto text-stone-300 dark:text-gray-600 text-xl">›</span>
            </button>
          ))}
        </div>
      </main>
      <Navigation />
    </div>
  );
}
