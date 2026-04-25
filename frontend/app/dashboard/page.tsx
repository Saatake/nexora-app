"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [projects, setProjects] = useState(0);
  const [average, setAverage] = useState(0);
  const [views, setViews] = useState(0);
  const [inReview, setInReview] = useState(0);

  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    // Buscar BACKEND no futuro
  }, []);

  return (
    <div className="h-screen w-full flex bg-white">

      <div className="w-64 bg-gradient-to-b from-[#60B5FF] to-[#3A8DDB] text-white p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Menu</h2>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-left px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
          >
            Dashboard
          </button>
        </div>
      </div>

      <div className="flex-1 p-10 overflow-y-auto">

        <div className="mb-6">
          <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-2 mb-6">
            Bem-vindo de volta! Aqui está um resumo das suas atividades.
          </p>

          <button
            onClick={() => router.push("/newproject")}
            className="bg-gradient-to-r from-[#60B5FF] to-[#3A8DDB] text-white px-8 py-3 rounded-xl shadow-md hover:opacity-90 transition w-full text-center"
          >
            Criar Novo Projeto
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">

          <div className="bg-[#F8FAFC] rounded-2xl p-6 shadow-sm">
            <p className="text-slate-500">Projetos Publicados</p>
            <h2 className="text-3xl font-bold text-[#3A8DDB] mt-2">{projects}</h2>
          </div>

          <div className="bg-[#F8FAFC] rounded-2xl p-6 shadow-sm">
            <p className="text-slate-500">Média Geral</p>
            <h2 className="text-3xl font-bold text-[#3A8DDB] mt-2">{average}</h2>
          </div>

          <div className="bg-[#F8FAFC] rounded-2xl p-6 shadow-sm">
            <p className="text-slate-500">Visualizações</p>
            <h2 className="text-3xl font-bold text-[#3A8DDB] mt-2">{views}</h2>
          </div>

        </div>

        <div className="bg-[#F8FAFC] rounded-2xl p-6 shadow-sm mb-10">
          <h2 className="text-xl font-bold text-slate-800 mb-6">
            Projetos Recentes
          </h2>

          <div className="space-y-4">

            {recentProjects.length === 0 ? (
              <p className="text-slate-500 text-center">
                Nenhum projeto encontrado.
              </p>
            ) : (
              recentProjects.map((project, index) => (
                <div key={index} className="flex justify-between items-center p-4 rounded-xl bg-white hover:bg-slate-50 transition">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {project.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      {project.description}
                    </p>
                  </div>
                  <span className="text-[#3A8DDB] font-bold">
                    {project.score}
                  </span>
                </div>
              ))
            )}

          </div>
        </div>

      </div>
    </div>
  );
}