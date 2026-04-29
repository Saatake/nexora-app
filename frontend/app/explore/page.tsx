"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5071";

type Project = {
  id: string | number;
  title: string;
  description: string;
  area?: string;
  contributors?: string;
  score?: number;
};

export default function ExplorePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("@AgorApp:token");

        const res = await fetch(`${API_BASE}/api/projects`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        // 🔥 PROTEÇÃO REAL CONTRA ERRO (ESSA PARTE EVITA SEU BUG)
        let list: Project[] = [];

        if (Array.isArray(data)) {
          list = data;
        } else if (Array.isArray(data?.data)) {
          list = data.data;
        } else if (Array.isArray(data?.projects)) {
          list = data.projects;
        } else {
          console.warn("Formato inesperado da API:", data);
          list = [];
        }

        setProjects(list);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar projetos");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  const filteredProjects = Array.isArray(projects)
    ? projects.filter((p) =>
        p.title?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-white flex">

      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTEÚDO (CORRETO E NÃO QUEBRA LAYOUT) */}
      <main className="flex-1 ml-64 p-10">

        <h1 className="text-4xl font-bold text-slate-900">
          Explorar Projetos
        </h1>

        <p className="text-slate-500 mt-2 mb-6">
          Veja projetos da comunidade acadêmica
        </p>

        {/* SEARCH */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar projetos..."
          className="w-full mb-8 p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#60B5FF]"
        />

        {/* ERRO */}
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <p className="text-slate-500">Carregando projetos...</p>
        ) : filteredProjects.length === 0 ? (
          <p className="text-slate-500">Nenhum projeto encontrado</p>
        ) : (
          <div className="space-y-4">

            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
              >

                <div className="flex justify-between">

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {project.title}
                    </h2>

                    <p className="text-slate-500 mt-1">
                      {project.description}
                    </p>
                  </div>

                  <div className="text-[#3A8DDB] font-bold text-lg">
                    {project.score ?? 0}
                  </div>

                </div>

                <div className="mt-4 text-sm text-slate-500 flex gap-6">

                  <span>Área: {project.area || "N/A"}</span>
                  <span>Autores: {project.contributors || "N/A"}</span>

                </div>

              </div>
            ))}

          </div>
        )}

      </main>

    </div>
  );
}