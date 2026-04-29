"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5071";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);

        const token = localStorage.getItem("@AgorApp:token");

        const res = await fetch(`${API_BASE}/api/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  return (
    <div className="flex min-h-screen bg-white">

      <Sidebar />

      {/* CONTEÚDO PRINCIPAL (CORRIGIDO) */}
      <main className="flex-1 p-10">

        {/* CONTAINER CENTRAL (resolve o “torto”) */}
        <div className="max-w-4xl mx-auto">

          <h1 className="text-4xl font-bold text-slate-900">
            Perfil
          </h1>

          <p className="text-slate-500 mt-2 mb-8">
            Informações da sua conta
          </p>

          {loading ? (
            <p className="text-slate-500">Carregando perfil...</p>
          ) : !user ? (
            <p className="text-red-500">
              Erro ao carregar usuário
            </p>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-8 shadow-sm">

              {/* HEADER PERFIL */}
              <div className="flex items-center gap-5 mb-8">

                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#60B5FF] to-[#3A8DDB] flex items-center justify-center text-white text-2xl font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {user.name}
                  </h2>

                  <p className="text-slate-500">
                    {user.email}
                  </p>
                </div>

              </div>

              {/* GRID INFO (corrige desalinhamento) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="bg-white p-5 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-500">Curso</p>
                  <p className="text-slate-900 font-semibold">
                    {user.course || "Não informado"}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-500">Tipo</p>
                  <p className="text-slate-900 font-semibold">
                    {user.roleType || "Student"}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 md:col-span-2">
                  <p className="text-sm text-slate-500">Bio</p>
                  <p className="text-slate-900 font-semibold">
                    {user.bio || "Sem bio ainda"}
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}