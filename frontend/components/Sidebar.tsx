"use client";

import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const baseBtn =
    "text-left px-4 py-2 rounded-lg transition w-full";
  const activeBtn = "bg-white text-[#3A8DDB] font-bold";
  const inactiveBtn = "hover:bg-white/20";

  return (
    <aside className="w-64 fixed top-0 left-0 h-screen bg-gradient-to-b from-[#60B5FF] to-[#3A8DDB] text-white p-6 z-50">

      <h1 className="text-2xl font-bold mb-10">
        Ágora
      </h1>

      <nav className="flex flex-col gap-3">

        <button
          onClick={() => router.push("/dashboard")}
          className={`${baseBtn} ${
            isActive("/dashboard") ? activeBtn : inactiveBtn
          }`}
        >
          Dashboard
        </button>

        <button
          onClick={() => router.push("/explore")}
          className={`${baseBtn} ${
            isActive("/explore") ? activeBtn : inactiveBtn
          }`}
        >
          Explorar Projetos
        </button>

        <button
          onClick={() => router.push("/profile")}
          className={`${baseBtn} ${
            isActive("/profile") ? activeBtn : inactiveBtn
          }`}
        >
          Perfil
        </button>

      </nav>

    </aside>
  );
}