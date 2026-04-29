"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5071";

type Project = {
  id: string | number;
  title: string;
  description: string;
  score?: number;
};

export default function Dashboard() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [average, setAverage] = useState(0);
  const [views, setViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("@AgorApp:token");

        const res = await fetch(`${API_BASE}/api/projects/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        // 🔥 PROTEÇÃO CONTRA FORMATO DE API
        let list: Project[] = [];

        if (Array.isArray(data)) {
          list = data;
        } else if (Array.isArray(data?.projects)) {
          list = data.projects;
        } else if (Array.isArray(data?.data)) {
          list = data.data;
        } else {
          list = [];
        }

        setProjects(list);

        // 📊 MÉDIA SEGURA
        if (list.length > 0) {
          const sum = list.reduce((acc, p) => acc + (p.score || 0), 0);
          setAverage(sum / list.length);
        } else {
          setAverage(0);
        }

        // 👀 MOCK DE VIEWS (pode vir do backend depois)
        setViews(list.length * 12);

      } catch (err) {
        console.error(err);
        setError("Erro ao carregar dashboard");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-white flex">

      {/* SIDEBAR FIXA */}
      <Sidebar />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 ml-64 p-10">

        {/* HEADER */}
        <div className="mb-8">

          <h1 className="text-4xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="text-slate-500 mt-2">
            Bem-vindo de volta! Aqui está seu desempenho acadêmico.
          </p>

          <button
            onClick={() => router.push("/newproject")}
            className="mt-6 bg-gradient-to-r from-[#60B5FF] to-[#3A8DDB] text-white px-6 py-3 rounded-xl shadow-md hover:opacity-90 transition"
          >
            Criar Novo Projeto
          </button>

        </div>

        {/* ERRO */}
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* CARDS */}
        <div className="grid grid-cols-3 gap-6 mb-10">

          <div className="bg-slate-50 p-6 rounded-2xl shadow-sm">
            <p className="text-slate-500">Projetos</p>
            <h2 className="text-3xl font-bold text-[#3A8DDB]">
              {projects.length}
            </h2>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl shadow-sm">
            <p className="text-slate-500">Média Geral</p>
            <h2 className="text-3xl font-bold text-[#3A8DDB]">
              {average.toFixed(1)}
            </h2>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl shadow-sm">
            <p className="text-slate-500">Visualizações</p>
            <h2 className="text-3xl font-bold text-[#3A8DDB]">
              {views}
            </h2>
          </div>

        </div>

        {/* LISTA DE PROJETOS */}
        {loading ? (
          <p className="text-slate-500">Carregando dashboard...</p>
        ) : projects.length === 0 ? (
          <p className="text-slate-500">Nenhum projeto encontrado</p>
        ) : (
          <div className="space-y-4">

            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Seus Projetos Recentes
            </h2>

            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-slate-50 p-5 rounded-2xl shadow-sm hover:shadow-md transition"
              >

                <div className="flex justify-between">

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {p.title}
                    </h3>

                    <p className="text-slate-500">
                      {p.description}
                    </p>
                  </div>

                  <div className="text-[#3A8DDB] font-bold">
                    {p.score ?? 0}
                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </main>

    </div>
  );
}