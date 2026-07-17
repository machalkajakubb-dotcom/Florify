"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/hooks/useLang";

// Navigace s ikonami a popisky (6 sekcí)
const NAV_ITEMS = [
  { href: "/",         icon: HomeIcon,     match: ["/"],                                    labelKey: "nav_home" },
  { href: "/mygarden", icon: GardenIcon,   match: ["/mygarden", "/garden", "/beds", "/harvest", "/products"], labelKey: "nav_garden" },
  { href: "/calendar", icon: CalIcon,      match: ["/calendar"],                            labelKey: "nav_calendar" },
  { href: "/chat",     icon: ChatIcon,     match: ["/chat"],                                 labelKey: "nav_chat" },
  { href: "/game",     icon: GameIcon,     match: ["/game"],                                 labelKey: "nav_game" },
  { href: "/settings", icon: SettingsIcon, match: ["/settings"],                              labelKey: "nav_settings" },
] as const;

export function Navigation() {
  const pathname = usePathname();
  const { t } = useLang();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-stone-100 dark:border-gray-800 grid grid-cols-6"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {NAV_ITEMS.map(({ href, icon: Icon, match, labelKey }) => {
        const active = match.some(m => pathname === m || (m !== "/" && pathname.startsWith(m)));
        return (
          <Link key={href} href={href}
            className={`flex flex-col items-center justify-center gap-0.5 py-2.5 transition-all duration-150 ${
              active ? "text-forest-600 dark:text-forest-400" : "text-stone-400 dark:text-gray-600 hover:text-forest-600 dark:hover:text-forest-400"
            }`}>
            <Icon active={active} className={`w-6 h-6 transition-transform ${active ? "scale-110" : ""}`} />
            <span className={`text-[10px] leading-none ${active ? "font-semibold" : "font-medium"}`}>{t(labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function HomeIcon({ active, className }: { active: boolean; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill={active?"currentColor":"none"} stroke="currentColor" strokeWidth={active?0:1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" /></svg>;
}
function GardenIcon({ active, className }: { active: boolean; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill={active?"currentColor":"none"} stroke="currentColor" strokeWidth={active?0:1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 017.92 12.446c-.399.398-.86.652-1.32.956-1.077.696-2.192 1.337-3.3 1.99-.7.41-1.4.82-2.1 1.23a.75.75 0 01-.786 0c-.7-.41-1.4-.82-2.1-1.23-1.108-.653-2.223-1.294-3.3-1.99-.46-.304-.921-.558-1.32-.956A7.5 7.5 0 0112 3z" /></svg>;
}
function CalIcon({ active, className }: { active: boolean; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill={active?"currentColor":"none"} stroke="currentColor" strokeWidth={active?0:1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>;
}
function ChatIcon({ active, className }: { active: boolean; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill={active?"currentColor":"none"} stroke="currentColor" strokeWidth={active?0:1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>;
}
function GameIcon({ active, className }: { active: boolean; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill={active?"currentColor":"none"} stroke="currentColor" strokeWidth={active?0:1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>;
}
function SettingsIcon({ active, className }: { active: boolean; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill={active?"currentColor":"none"} stroke="currentColor" strokeWidth={active?0:1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}
