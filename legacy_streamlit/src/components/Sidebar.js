"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {

  const pathname = usePathname();

  const links = [
    {
      name: "Dashboard",
      path: "/"
    },
    {
      name: "Users",
      path: "/users"
    },
    {
      name: "Tenders",
      path: "/tenders"
    },
    {
      name: "Police Requests",
      path: "/police"
    }
  ];

  return (
    <div className="w-64 min-h-screen bg-zinc-950 border-r border-zinc-800 p-5">

      <h2 className="text-white text-2xl font-bold mb-10">
        CivicLens
      </h2>

      <div className="space-y-3">

        {links.map((link) => (

          <Link
            key={link.path}
            href={link.path}
          >
            <div
              className={`p-3 rounded-xl transition ${
                pathname === link.path
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              {link.name}
            </div>
          </Link>

        ))}

      </div>

    </div>
  );
}