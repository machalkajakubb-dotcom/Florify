"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/context/AppContext";

const navItems = [
  { href: "/", icon: "🏠", key: "nav.home" },
  { href: "/garden", icon: "🌱", key: "nav.garden" },
  { href: "/calendar", icon: "📅", key: "nav.calendar" },
  { href: "/chat", icon: "💬", key: "nav.chat" },
  { href: "/notifications", icon: "🔔", key: "nav.notifications" },
] as const;

export default function Navigation() {
  const pathname = usePathname();
  const { translate } = useLocale();

  if (pathname === "/login") return null;

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 md:bg-leaf-900 md:text-white md:p-6 md:z-40">
        <div className="flex items-center gap-3 mb-10">
          <span className="text-3xl">🍅</span>
          <div>
            <p className="font-bold text-lg leading-tight">Florify</p>
            <p className="text-leaf-200 text-xs">{translate("app.tagline")}</p>
          </div>
        </div>
        <ul className="space-y-2 flex-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    active
                      ? "bg-leaf-700 text-white font-semibold"
                      : "text-leaf-100 hover:bg-leaf-800"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{translate(item.key)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-leaf-100 safe-bottom">
        <ul className="flex justify-around items-center h-16 px-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg mx-0.5 transition-colors touch-manipulation ${
                    active ? "text-leaf-700" : "text-gray-400"
                  }`}
                >
                  <span className={`text-xl ${active ? "scale-110" : ""} transition-transform`}>
                    {item.icon}
                  </span>
                  <span className={`text-[10px] leading-none ${active ? "font-semibold" : ""}`}>
                    {translate(item.key)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
