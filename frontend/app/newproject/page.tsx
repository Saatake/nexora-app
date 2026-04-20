"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProject() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const newProject = {
      title,
      description
    };

    console.log(newProject);

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md overflow-hidden">

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <h1 className="text-3xl font-bold text-white">
            Criar Projeto
          </h1>
          <p className="text-indigo-100 mt-1">
            Compartilhe seu conhecimento com o mundo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">

          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Título
            </label>
            <input
              type="text"
              placeholder="Digite o título do projeto"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Descrição
            </label>
            <textarea
              placeholder="Descreva seu projeto"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 mt-4">

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex-1 py-3 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex-1 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition shadow-md"
            >
              Criar Projeto
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}