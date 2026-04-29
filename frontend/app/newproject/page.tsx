"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function NewProject() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [contributors, setContributors] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const newProject = {
      id: Date.now(),
      title,
      contributors,
      area,
      description,
      pdfName: pdf?.name || "",
      image: image ? URL.createObjectURL(image) : "",
      score: 0,
    };

    const stored = localStorage.getItem("projects");
    const projects = stored ? JSON.parse(stored) : [];

    projects.push(newProject);
    localStorage.setItem("projects", JSON.stringify(projects));

    router.push("/dashboard");
  };

  return (
    <div className="flex h-screen w-full bg-[#F1F5F9]">

      <Sidebar />

      {/* CONTEÚDO */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">

        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-[#60B5FF] to-[#3A8DDB] p-6">
            <h1 className="text-3xl font-bold text-white">
              Criar Projeto
            </h1>
            <p className="text-blue-100">
              Publique seu trabalho acadêmico
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">

            {/* TITLE */}
            <input
              type="text"
              placeholder="Título do projeto"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#60B5FF]"
              required
            />

            {/* CONTRIBUTORS */}
            <input
              type="text"
              placeholder="Contribuintes (@usuario, @outro)"
              value={contributors}
              onChange={(e) => setContributors(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#60B5FF]"
            />

            {/* AREA */}
            <input
              type="text"
              placeholder="Área do conhecimento"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#60B5FF]"
            />

            {/* DESCRIPTION */}
            <textarea
              placeholder="Descrição do projeto"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-500 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-[#60B5FF]"
            />

            {/* IMAGE */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Imagem de capa
              </label>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-[#60B5FF] transition cursor-pointer">

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="hidden"
                  id="imageUpload"
                />

                <label htmlFor="imageUpload" className="cursor-pointer">

                  {image ? (
                    <img
                      src={URL.createObjectURL(image)}
                      className="mx-auto h-40 object-cover rounded-lg"
                    />
                  ) : (
                    <p className="text-slate-500 font-medium">
                      Clique para enviar imagem
                    </p>
                  )}

                </label>
              </div>
            </div>

            {/* PDF */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Arquivo PDF
              </label>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-[#60B5FF] transition cursor-pointer">

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdf(e.target.files?.[0] || null)}
                  className="hidden"
                  id="pdfUpload"
                />

                <label htmlFor="pdfUpload" className="cursor-pointer">

                  {pdf ? (
                    <p className="text-[#3A8DDB] font-semibold">
                      📄 {pdf.name}
                    </p>
                  ) : (
                    <p className="text-slate-500 font-medium">
                      Clique para enviar PDF
                    </p>
                  )}

                </label>
              </div>
            </div>

            {/* BUTTONS */}
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
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-[#60B5FF] to-[#3A8DDB] text-white hover:opacity-90 transition"
              >
                Criar Projeto
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}