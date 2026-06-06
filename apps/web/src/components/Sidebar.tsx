"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    href: "/jobs",
    label: "Jobs",
  },
  {
    href: "/contracts",
    label: "Contracts",
  },
  {
    href: "/escrow",
    label: "Escrow",
  },
  {
    href: "/messages",
    label: "Messages",
  },
  {
    href: "/passport",
    label: "Trust Passport",
  },
  {
    href: "/admin/live",
    label: "Admin Live",
  },
  {
    href: "/admin/escrow",
    label: "Admin Escrow",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="
        w-64
        min-h-screen
        bg-black
        text-white
        border-r
        border-zinc-800
        p-6
      "
    >
      <div className="mb-10">
        <h1 className="text-2xl font-bold">
          Veritas
        </h1>

        <p className="text-sm text-zinc-400">
          Trust Ledger
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const active =
            pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                px-4
                py-3
                rounded-lg
                transition
                ${
                  active
                    ? "bg-white text-black"
                    : "hover:bg-zinc-900 text-zinc-300"
                }
              `}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
