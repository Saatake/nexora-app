"use client";

import { useState, useEffect } from "react";

export default function Dashboard() {
  const [projects, setProjects] = useState(0);
  const [average, setAverage] = useState(0);
  const [views, setViews] = useState(0);
  const [inReview, setInReview] = useState(0);

  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    // Buscar BACKEND no futuro -------------------------------------------------------------------------------------------
  }, []);

  return (
    <div className="h-screen w-full flex bg-slate-100">

      <div className="w-64 bg-indigo-600 text-white p-6">
        <h2 className="text-2xl font-bold">Menu</h2>
        <p className="text-indigo-200 mt-2">Sidebar futura</p>
      </div>

      <div className="flex-1 p-10 overflow-y-auto">

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-2">
            Bem-vindo de volta! Aqui está um resumo das suas atividades.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-10">

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <p className="text-slate-500">Projetos Publicados</p>
            <h2 className="text-3xl font-bold text-indigo-600 mt-2">{projects}</h2>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <p className="text-slate-500">Média Geral</p>
            <h2 className="text-3xl font-bold text-indigo-600 mt-2">{average}</h2>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <p className="text-slate-500">Visualizações</p>
            <h2 className="text-3xl font-bold text-indigo-600 mt-2">{views}</h2>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <p className="text-slate-500">Em Avaliação</p>
            <h2 className="text-3xl font-bold text-indigo-600 mt-2">{inReview}</h2>
          </div>

        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md mb-10">
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
                <div key={index} className="flex justify-between items-center p-4 rounded-xl bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {project.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      {project.description}
                    </p>
                  </div>
                  <span className="text-indigo-600 font-bold">
                    {project.score}
                  </span>
                </div>
              ))
            )}

          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">

          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-2">Criar Novo Projeto</h2>
            <p className="text-indigo-100">
              Publique um novo trabalho acadêmico na plataforma
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}