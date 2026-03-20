"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Contacts" },
  { href: "/companies", label: "Companies" },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl gap-6 px-4">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                active
                  ? "border-prytania-green text-prytania-green"
                  : "border-transparent text-prytania-dark/50 hover:border-prytania-dark/20 hover:text-prytania-dark/70"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
